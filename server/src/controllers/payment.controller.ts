import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Generate unique payment number
const generatePaymentNo = () => {
  const year = new Date().getFullYear();
  const random = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `PAY-${year}-${random}`;
};

export const getPayments = async (_req: Request, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        invoice: {
          include: {
            request: {
              include: {
                requester: { select: { id: true, name: true, email: true } },
                department: { select: { id: true, name: true, code: true } },
              },
            },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payments);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!['FINANCE_OFFICER'].includes(user.role)) {
      return res.status(403).json({ message: 'Only Finance Officers can create payments' });
    }

    const schema = z.object({
      invoiceId: z.string().uuid('Invoice ID must be a valid UUID'),
      method: z.enum(['CHEQUE', 'TRANSFER', 'MOBILE_MONEY'], {
        errorMap: () => ({ message: 'Payment method must be CHEQUE, TRANSFER, or MOBILE_MONEY' }),
      }),
      reference: z.string().min(1, 'Payment reference is required').optional(),
      paymentDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid payment date'),
      amount: z.number().positive('Payment amount must be positive'),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', issues: parsed.error.issues });
    }

    const { invoiceId, method, reference, paymentDate, amount } = parsed.data;

    // Verify the invoice exists and can be paid
    const invoice = await prisma.invoice.findUnique({ 
      where: { id: invoiceId },
      include: { payments: true },
    });
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    if (!['APPROVED_FOR_PAYMENT', 'PARTIALLY_PAID'].includes(invoice.status)) {
      return res.status(400).json({ message: 'Invoice must be approved for payment' });
    }

    // Calculate total paid amount
    const totalPaid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const remainingAmount = Number(invoice.netAmount) - totalPaid;

    if (amount > remainingAmount) {
      return res.status(400).json({ 
        message: `Payment amount (${amount}) exceeds remaining balance (${remainingAmount})` 
      });
    }

    const payment = await prisma.payment.create({
      data: {
        paymentNo: generatePaymentNo(),
        invoiceId,
        method,
        reference,
        paymentDate: new Date(paymentDate),
        amount,
        status: 'PROCESSED',
        createdById: user.id,
      },
      include: {
        invoice: {
          include: {
            request: {
              include: {
                requester: { select: { id: true, name: true, email: true } },
                department: { select: { id: true, name: true, code: true } },
              },
            },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Update invoice status based on payment
    const newTotalPaid = totalPaid + amount;
    let newInvoiceStatus = invoice.status;
    
    if (newTotalPaid >= Number(invoice.netAmount)) {
      newInvoiceStatus = 'PAID';
    } else if (newTotalPaid > 0) {
      newInvoiceStatus = 'PARTIALLY_PAID';
    }

    if (newInvoiceStatus !== invoice.status) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: newInvoiceStatus },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_PAYMENT',
        details: `Created payment ${payment.paymentNo} for invoice ${invoice.invoiceNo}`,
        entityType: 'Payment',
        entityId: payment.id,
      },
    });

    res.status(201).json(payment);
  } catch (e) {
    console.error('createPayment error', e);
    res.status(500).json({ message: 'Failed to create payment' });
  }
};

export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            request: {
              include: {
                requester: { select: { id: true, name: true, email: true } },
                department: { select: { id: true, name: true, code: true } },
              },
            },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch payment' });
  }
};

export const updatePayment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!['FINANCE_OFFICER'].includes(user.role)) {
      return res.status(403).json({ message: 'Only Finance Officers can update payments' });
    }

    const { id } = req.params;
    const schema = z.object({
      method: z.enum(['CHEQUE', 'TRANSFER', 'MOBILE_MONEY']).optional(),
      reference: z.string().min(1).optional(),
      paymentDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid payment date').optional(),
      amount: z.number().positive().optional(),
      status: z.enum(['DRAFT', 'PROCESSED', 'CLEARED', 'CANCELLED', 'FAILED']).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', issues: parsed.error.issues });
    }

    const updateData = parsed.data;
    if (updateData.paymentDate) {
      (updateData as any).paymentDate = new Date(updateData.paymentDate);
    }

    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Payment not found' });

    const updated = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        invoice: {
          include: {
            request: {
              include: {
                requester: { select: { id: true, name: true, email: true } },
                department: { select: { id: true, name: true, code: true } },
              },
            },
          },
        },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_PAYMENT',
        details: `Updated payment ${updated.paymentNo}`,
        entityType: 'Payment',
        entityId: updated.id,
      },
    });

    res.json(updated);
  } catch (e) {
    console.error('updatePayment error', e);
    res.status(500).json({ message: 'Failed to update payment' });
  }
};
