//server/src/routes/api.ts

import { Router } from 'express';
import { optionalAuthentication, authenticateRequest, loadCurrentUser, canEditRequest } from '../middlewares/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import * as requestController from '../controllers/request.controller';
import { createInvoice, getInvoices, getInvoiceById, updateInvoice, approveInvoiceForPayment, exportInvoices } from '../controllers/invoice.controller';
import { createPayment, getPayments, getPaymentById, updatePayment, deletePayment, exportPayments } from '../controllers/payment.controller';
import { getDepartments } from '../controllers/department.controller';
import { getAllUsers, updateUserRole } from '../controllers/user.controller';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadCount } from '../controllers/notification.controller';
import { testEmailSending, testEmailTemplate } from '../controllers/email.controller';
import { uploadToCloudinary } from '../utils/cloudinary.util';

const router = Router();

// File upload storage config
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Choose storage based on environment
const isProduction = process.env.NODE_ENV === 'production';

const storage = isProduction 
  ? multer.memoryStorage() // Use memory storage for Cloudinary
  : multer.diskStorage({   // Use disk storage for local development
      destination: (_req, _file, cb) => cb(null, uploadDir),
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
      },
    });

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Only images and documents are allowed!'));
    }
  }
});

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
router.delete('/requests/:id', authenticateRequest, loadCurrentUser, requestController.deleteRequest);
router.post('/requests/:id/attachments', authenticateRequest, loadCurrentUser, upload.single('file'), async (req: any, res) => {
	try {
		const user = req.user;
		if (!user) return res.status(401).json({ message: 'Unauthorized' });
		const { id } = req.params;
		const found = await prisma.serviceRequest.findUnique({ where: { id } });
		if (!found) return res.status(404).json({ message: 'Request not found' });
		const file = req.file;
		if (!file) return res.status(400).json({ message: 'No file uploaded' });
		
		let fileUrl: string;
		
		if (isProduction) {
			// Upload to Cloudinary in production
			const cloudinaryResult = await uploadToCloudinary(
				file.buffer, 
				file.originalname, 
				'sasakawa-requests'
			);
			fileUrl = cloudinaryResult.secure_url;
		} else {
			// Use local file path in development
			fileUrl = `/uploads/${file.filename}`;
		}
		
		const attachment = await prisma.attachment.create({ data: { 
			fileName: file.originalname, 
			fileType: file.mimetype || 'application/octet-stream',
			fileSize: file.size,
			fileUrl, 
			uploadedById: user.id, 
			requestId: id 
		} });
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
router.put('/invoices/:id', authenticateRequest, loadCurrentUser, updateInvoice);
router.post('/invoices/:id/approve', authenticateRequest, loadCurrentUser, approveInvoiceForPayment);
router.get('/invoices/export/excel', authenticateRequest, loadCurrentUser, exportInvoices);
router.post('/invoices/:id/attachments', authenticateRequest, loadCurrentUser, upload.single('file'), async (req: any, res) => {
	try {
		const user = req.user;
		if (!user) return res.status(401).json({ message: 'Unauthorized' });
		const { id } = req.params;
		const found = await prisma.invoice.findUnique({ where: { id } });
		if (!found) return res.status(404).json({ message: 'Invoice not found' });
		const file = req.file;
		if (!file) return res.status(400).json({ message: 'No file uploaded' });
		const attachment = await prisma.attachment.create({ 
			data: { 
				fileName: file.originalname, 
				fileType: file.mimetype || 'application/octet-stream',
				fileSize: file.size,
				fileUrl: `/uploads/${file.filename}`, 
				uploadedById: user.id, 
				invoiceId: id 
			} 
		});
		res.status(201).json(attachment);
	} catch (e) {
		console.error('upload invoice attachment error', e);
		res.status(500).json({ message: 'Failed to upload attachment' });
	}
});

// Payments
router.get('/payments', authenticateRequest, loadCurrentUser, getPayments);
router.get('/payments/:id', authenticateRequest, loadCurrentUser, getPaymentById);
router.post('/payments', authenticateRequest, loadCurrentUser, createPayment);
router.put('/payments/:id', authenticateRequest, loadCurrentUser, updatePayment);
router.delete('/payments/:id', authenticateRequest, loadCurrentUser, deletePayment);
router.get('/payments/export/excel', authenticateRequest, loadCurrentUser, exportPayments);
router.post('/payments/:id/attachments', authenticateRequest, loadCurrentUser, upload.single('file'), async (req: any, res) => {
	try {
		const user = req.user;
		if (!user) return res.status(401).json({ message: 'Unauthorized' });
		const { id } = req.params;
		const found = await prisma.payment.findUnique({ where: { id } });
		if (!found) return res.status(404).json({ message: 'Payment not found' });
		const file = req.file;
		if (!file) return res.status(400).json({ message: 'No file uploaded' });
		
		let fileUrl: string;
		
		if (isProduction) {
			// Upload to Cloudinary in production
			const cloudinaryResult = await uploadToCloudinary(
				file.buffer, 
				file.originalname, 
				'sasakawa-payments'
			);
			fileUrl = cloudinaryResult.secure_url;
		} else {
			// Use local file path in development
			fileUrl = `/uploads/${file.filename}`;
		}
		
		const attachment = await prisma.attachment.create({ 
			data: { 
				fileName: file.originalname, 
				fileType: file.mimetype || 'application/octet-stream',
				fileSize: file.size,
				fileUrl, 
				uploadedById: user.id, 
				paymentId: id 
			} 
		});
		res.status(201).json(attachment);
	} catch (e) {
		console.error('upload payment attachment error', e);
		res.status(500).json({ message: 'Failed to upload attachment' });
	}
});

// User management (Finance Officer only)
router.get('/users', authenticateRequest, loadCurrentUser, getAllUsers);
router.patch('/users/:userId/role', authenticateRequest, loadCurrentUser, updateUserRole);

// Notifications
router.get('/notifications', authenticateRequest, loadCurrentUser, getUserNotifications);
router.get('/notifications/unread-count', authenticateRequest, loadCurrentUser, getUnreadCount);
router.patch('/notifications/:id/read', authenticateRequest, loadCurrentUser, markNotificationAsRead);
router.patch('/notifications/mark-all-read', authenticateRequest, loadCurrentUser, markAllNotificationsAsRead);

// Email testing routes (for debugging)
router.post('/test-email', testEmailSending);
router.post('/test-email-template', testEmailTemplate);

export default router;
