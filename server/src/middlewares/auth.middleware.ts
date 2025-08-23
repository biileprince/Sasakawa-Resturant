//server/src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ClerkExpressWithAuth, clerkClient } from '@clerk/clerk-sdk-node';
import { PrismaClient } from '@prisma/client';
import { ensureUserInDb } from '../utils/user.util.js';

const prisma = new PrismaClient();

export const authenticateRequest = ClerkExpressWithAuth();

// After authenticateRequest, attach full user from DB if present
export const loadCurrentUser = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { userId } = (req as any).auth || {};
    if (userId) {
      // Ensure user exists / upsert on every authenticated request (first login scenario)
      (req as any).user = await ensureUserInDb(userId);
    }
  } catch (e) {
    console.warn('loadCurrentUser error', (e as any)?.code, (e as any)?.meta, e);
  } finally {
    next();
  }
};

export const authorizeRoles = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = (req as any).auth || {};
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      const user = await prisma.user.findFirst({ where: { clerkId: userId } });
      if (!user) return res.status(401).json({ message: 'User not found' });
      if (!allowedRoles.includes(user.role)) return res.status(403).json({ message: 'Insufficient permissions' });
      (req as any).user = user;
      next();
    } catch (err) {
      console.error('Authorization error', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

export const optionalAuthentication = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { userId } = (req as any).auth || {};
    if (userId) {
      (req as any).user = await ensureUserInDb(userId);
    }
  } catch (e) {
    console.warn('Optional auth error', e);
  } finally {
    next();
  }
};

// Middleware enforcing that requester can edit only when status allows
export function canEditRequest(prismaClient: PrismaClient) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: 'Unauthorized' });
      const { id } = req.params;
      const existing = await prismaClient.request.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ message: 'Not found' });
      if (existing.requesterId !== user.id) return res.status(403).json({ message: 'Forbidden' });
      if (!['SUBMITTED', 'NEEDS_REVISION'].includes(existing.status)) {
        return res.status(409).json({ message: 'Request cannot be edited in its current status' });
      }
      (req as any).requestRecord = existing;
      next();
    } catch (e) {
      console.error('canEditRequest error', e);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}
