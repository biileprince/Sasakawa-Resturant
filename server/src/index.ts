//server/src/index.ts

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient, Role } from '@prisma/client';
import { authenticateRequest, loadCurrentUser } from './middlewares/auth.middleware';
import { computeCapabilities } from './utils/user.util';
import path from 'path';
import fs from 'fs';
import { Webhook } from 'svix';
import api from './routes/api';

const app = express();
const prisma = new PrismaClient();
const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:5174,https://').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: (origin, cb) => {
  if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
  return cb(new Error('Not allowed by CORS'));
}, credentials: true }));

// Raw body capture must precede any body parsing for webhook route only
app.post('/api/webhooks/clerk', express.raw({ type: '*/*' }));
// Standard JSON parser for all other routes
app.use(express.json());

app.use('/api', api);
// Static files (uploads)
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(path.resolve(uploadDir)));

app.get('/api/me', authenticateRequest, loadCurrentUser, (req: any, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const capabilities = computeCapabilities(req.user.role);
  res.json({ id: req.user.id, email: req.user.email, name: req.user.name, phone: req.user.phone, role: req.user.role, capabilities });
});

// Clerk webhook for user creation (and updates)
app.post('/api/webhooks/clerk', async (req: any, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ message: 'Webhook secret not configured' });
  const svixHeaders = {
    'svix-id': req.header('svix-id'),
    'svix-timestamp': req.header('svix-timestamp'),
    'svix-signature': req.header('svix-signature'),
  } as Record<string,string>;
  if (!svixHeaders['svix-id'] || !svixHeaders['svix-timestamp'] || !svixHeaders['svix-signature']) {
    return res.status(400).json({ message: 'Missing svix headers' });
  }
  try {
    const wh = new Webhook(secret);
  const payloadString = (req.body instanceof Buffer) ? req.body.toString('utf8') : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
  const evt = wh.verify(payloadString, svixHeaders) as any;
    const { type, data } = evt;
    if (type === 'user.created' || type === 'user.updated') {
      const clerkId = data.id;
      const email = data.email_addresses?.[0]?.email_address || `user-${clerkId}@example.com`;
      const first = data.first_name || '';
      const last = data.last_name || '';
      const name = `${first} ${last}`.trim() || 'New User';
      const phone = data.phone_numbers?.[0]?.phone_number || null;
      // Role assignment logic: if email domain matches finance example, assign FINANCE_OFFICER else REQUESTER
      let role: Role = 'REQUESTER';
      const domain = email.split('@')[1] || '';
      if (['finance.example.com','accounts.example.com'].includes(domain)) role = 'FINANCE_OFFICER';
      // Upsert with defensive handling of potential email uniqueness conflicts
      let existing = await prisma.user.findFirst({ where: { clerkId } });
      if (!existing) {
        // Maybe user existed by email (e.g., provisional account) -> attach clerkId
        existing = await prisma.user.findFirst({ where: { email } });
        if (existing && existing.clerkId !== clerkId) {
          try {
            await prisma.user.update({ where: { id: existing.id }, data: { clerkId, name, role, phone: existing.phone || phone } });
          } catch (e) {
            console.warn('Webhook reconcile update failed', e);
          }
        } else if (!existing) {
          try {
            await prisma.user.create({ data: { clerkId, email, name, role, phone } });
          } catch (e: any) {
            if (e?.code === 'P2002') {
              // Race: fetch again
              existing = await prisma.user.findFirst({ where: { clerkId } }) || await prisma.user.findFirst({ where: { email } });
            } else {
              throw e;
            }
          }
        }
      } else {
        // Update (do not overwrite phone if already present)
        await prisma.user.update({ where: { id: existing.id }, data: { email, name, role, phone: existing.phone || phone } });
      }
    }
    res.json({ received: true });
  } catch (e) {
    console.error('Webhook verification error', e);
    return res.status(400).json({ message: 'Invalid signature' });
  }
});

// Manual debug endpoint to trigger ensure user creation from a given Clerk user id (admin only usage recommended)
app.post('/api/debug/ensure-user', async (req, res) => {
  const { clerkUserId } = req.body || {};
  if (!clerkUserId) return res.status(400).json({ message: 'clerkUserId required' });
  try {
    const existing = await prisma.user.findFirst({ where: { clerkId: clerkUserId } });
    if (existing) return res.json({ status: 'exists', user: existing });
    // Fetch via Clerk and create
    const clerkResp = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, { headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` } });
    if (!clerkResp.ok) return res.status(404).json({ message: 'Clerk user not found' });
    const data = await clerkResp.json();
    const email = data.email_addresses?.[0]?.email_address || `user-${clerkUserId}@example.com`;
    const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'New User';
    const created = await prisma.user.create({ data: { clerkId: clerkUserId, email, name, role: 'REQUESTER' } });
    res.json({ status: 'created', user: created });
  } catch (e) {
    console.error('debug ensure-user error', e);
    res.status(500).json({ message: 'Failed' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
