//server/src/routes/api.ts

import { Router } from 'express';
import { optionalAuthentication, authenticateRequest, loadCurrentUser, canEditRequest } from '../middlewares/auth.middleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import * as requestController from '../controllers/request.controller.js';
import { createInvoice, getInvoices, getInvoiceById } from '../controllers/invoice.controller.js';
import { createPayment, getPayments, getPaymentById } from '../controllers/payment.controller.js';
import { getDepartments } from '../controllers/department.controller.js';
import { getAllUsers, updateUserRole } from '../controllers/user.controller.js';

const router = Router();

// File upload storage config
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadDir),
	filename: (_req, file, cb) => {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		cb(null, unique + path.extname(file.originalname));
	},
});
const upload = multer({ storage });

router.get('/requests', authenticateRequest, loadCurrentUser, requestController.getRequests);
router.get('/departments', optionalAuthentication, getDepartments);
router.get('/requests/:id', optionalAuthentication, requestController.getRequestById);
router.post('/requests', authenticateRequest, loadCurrentUser, requestController.createRequest);
router.put('/requests/:id', authenticateRequest, loadCurrentUser, canEditRequest, requestController.updateRequest);

// Approval endpoints
router.get('/approvals', authenticateRequest, loadCurrentUser, requestController.getPendingApprovals);
router.post('/requests/:id/approve', authenticateRequest, loadCurrentUser, requestController.approveRequest);
router.post('/requests/:id/reject', authenticateRequest, loadCurrentUser, requestController.rejectRequest);
router.post('/requests/:id/revision', authenticateRequest, loadCurrentUser, requestController.requestRevision);
router.post('/requests/:id/fulfill', authenticateRequest, loadCurrentUser, requestController.fulfillRequest);
router.post('/requests/:id/attachments', authenticateRequest, loadCurrentUser, upload.single('file'), async (req: any, res) => {
	try {
		const user = req.user;
		if (!user) return res.status(401).json({ message: 'Unauthorized' });
		const { id } = req.params;
		const found = await prisma.serviceRequest.findUnique({ where: { id } });
		if (!found) return res.status(404).json({ message: 'Request not found' });
		const file = req.file;
		if (!file) return res.status(400).json({ message: 'No file uploaded' });
		const attachment = await prisma.attachment.create({ data: { fileName: file.originalname, url: `/uploads/${file.filename}`, uploadedById: user.id, requestId: id } });
		res.status(201).json(attachment);
	} catch (e) {
		console.error('upload attachment error', e);
		res.status(500).json({ message: 'Failed to upload' });
	}
});

// Invoices
router.get('/invoices', optionalAuthentication, getInvoices);
router.get('/invoices/:id', optionalAuthentication, getInvoiceById);
router.post('/invoices', authenticateRequest, loadCurrentUser, createInvoice);

// Payments
router.get('/payments', authenticateRequest, loadCurrentUser, getPayments);
router.get('/payments/:id', authenticateRequest, loadCurrentUser, getPaymentById);
router.post('/payments', authenticateRequest, loadCurrentUser, createPayment);

// User management (Finance Officer only)
router.get('/users', authenticateRequest, loadCurrentUser, getAllUsers);
router.patch('/users/:userId/role', authenticateRequest, loadCurrentUser, updateUserRole);

export default router;
