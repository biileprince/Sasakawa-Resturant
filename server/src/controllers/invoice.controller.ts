import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { exportInvoicesToExcel } from '../utils/excel.util';
import { sendHtmlMail, emailTemplates } from '../utils/mail.util';
import { NotificationHelpers } from '../utils/notification.util';

const prisma = new PrismaClient();

// Generate unique invoice number
const generateInvoiceNo = () => {
  const year = new Date().getFullYear();
  const random = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `INV-${year}-${random}`;
};

export const getInvoices = async (_req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        request: {
          include: {
            requester: { select: { id: true, name: true, email: true } },
            department: { select: { id: true, name: true, code: true } },
          },
        },
        payments: true,
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
};

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!['FINANCE_OFFICER'].includes(user.role)) {
      return res.status(403).json({ message: 'Only Finance Officers can create invoices' });
    }

    const schema = z.object({
      requestId: z.string().uuid('Request ID must be a valid UUID'),
      invoiceDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid invoice date'),
      dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid due date'),
      grossAmount: z.number().positive('Gross amount must be positive'),
      taxAmount: z.number().min(0, 'Tax amount cannot be negative'),
      netAmount: z.number().positive('Net amount must be positive'),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', issues: parsed.error.issues });
    }

    const { requestId, invoiceDate, dueDate, grossAmount, taxAmount, netAmount } = parsed.data;

    // Verify the request exists and is approved (but not fulfilled)
    const request = await prisma.serviceRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      return res.status(404).json({ message: 'Service request not found' });
    }
    if (request.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Can only create invoices for approved requests (not fulfilled)' });
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo: generateInvoiceNo(),
        requestId,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        grossAmount,
        taxAmount,
        netAmount,
        status: 'SUBMITTED',
        createdById: user.id,
      },
      include: {
        request: {
          include: {
            requester: { select: { id: true, name: true, email: true } },
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_INVOICE',
        details: `Created invoice ${invoice.invoiceNo} for request ${request.requestNo}`,
        entityType: 'Invoice',
        entityId: invoice.id,
      },
    });

    // Send email notification to requester about invoice creation
    try {
      const emailTemplate = emailTemplates.invoiceCreated(invoice);
      await sendHtmlMail(
        invoice.request.requester.email,
        emailTemplate.subject,
        emailTemplate.html
      );
      
      console.log(`Invoice creation notification sent to ${invoice.request.requester.email}`);
      
      // Create in-app notification
      await NotificationHelpers.notifyInvoiceCreated(invoice);
    } catch (emailError) {
      console.error('Error sending invoice creation notification:', emailError);
      // Don't fail invoice creation if email fails
    }

    res.status(201).json(invoice);
  } catch (e) {
    console.error('createInvoice error', e);
    res.status(500).json({ message: 'Failed to create invoice' });
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        request: {
          include: {
            requester: { select: { id: true, name: true, email: true } },
            department: { select: { id: true, name: true, code: true } },
          },
        },
        payments: true,
        attachments: true,
      },
    });
    
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch invoice' });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!['FINANCE_OFFICER'].includes(user.role)) {
      return res.status(403).json({ message: 'Only Finance Officers can update invoices' });
    }

    const { id } = req.params;
    const schema = z.object({
      invoiceDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid invoice date').optional(),
      dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid due date').optional(),
      grossAmount: z.number().positive().optional(),
      taxAmount: z.number().min(0).optional(),
      netAmount: z.number().positive().optional(),
      status: z.enum(['DRAFT', 'SUBMITTED', 'VERIFIED', 'APPROVED_FOR_PAYMENT', 'DISPUTED', 'PARTIALLY_PAID', 'PAID', 'CLOSED']).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', issues: parsed.error.issues });
    }

    const updateData = parsed.data;
    if (updateData.invoiceDate) {
      (updateData as any).invoiceDate = new Date(updateData.invoiceDate);
    }
    if (updateData.dueDate) {
      (updateData as any).dueDate = new Date(updateData.dueDate);
    }

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Invoice not found' });

    const updated = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        request: {
          include: {
            requester: { select: { id: true, name: true, email: true } },
            department: { select: { id: true, name: true, code: true } },
          },
        },
        payments: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_INVOICE',
        details: `Updated invoice ${updated.invoiceNo}`,
        entityType: 'Invoice',
        entityId: updated.id,
      },
    });

    res.json(updated);
  } catch (e) {
    console.error('updateInvoice error', e);
    res.status(500).json({ message: 'Failed to update invoice' });
  }
};

export const approveInvoiceForPayment = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  if (!['FINANCE_OFFICER'].includes(user.role)) {
    return res.status(403).json({ message: 'Only Finance Officers can approve invoices for payment' });
  }

  const { id } = req.params;
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Invoice not found' });
  if (!['SUBMITTED', 'VERIFIED'].includes(existing.status)) {
    return res.status(409).json({ message: 'Can only approve SUBMITTED or VERIFIED invoices for payment' });
  }

  try {
    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: 'APPROVED_FOR_PAYMENT' },
      include: {
        request: {
          include: {
            requester: { select: { id: true, name: true, email: true } },
            department: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'APPROVE_INVOICE_FOR_PAYMENT',
        details: `Approved invoice ${updated.invoiceNo} for payment`,
        entityType: 'Invoice',
        entityId: updated.id,
      },
    });

    res.json(updated);
  } catch (e) {
    console.error('approveInvoiceForPayment error', e);
    res.status(500).json({ message: 'Failed to approve invoice for payment' });
  }
};

export const exportInvoices = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (user.role !== 'FINANCE_OFFICER') {
      return res.status(403).json({ message: 'Only Finance Officers can export invoices' });
    }

    const { dateFrom, dateTo, status } = req.query;

    const excelBuffer = await exportInvoicesToExcel({
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      status: status as string
    });

    const filename = `invoices_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', excelBuffer.length);

    res.send(excelBuffer);
  } catch (e) {
    console.error('exportInvoices error', e);
    res.status(500).json({ message: 'Failed to export invoices' });
  }
};
