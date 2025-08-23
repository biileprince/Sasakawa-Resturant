import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

export const getRequests = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // From auth middleware
    
    let whereClause: any = {};
    
    // Role-based filtering
    if (user) {
      // If user is a regular REQUESTER, show only their own requests
      if (user.role === 'REQUESTER') {
        whereClause.requesterId = user.id;
      }
      // FINANCE_OFFICER and APPROVER can see all requests
      // No additional filtering needed for these roles
    }
    
    const requests = await prisma.serviceRequest.findMany({
      where: whereClause,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true, code: true } },
        invoices: true,
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (e) {
    console.error('getRequests error', e);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
};

// Generate unique request number
const generateRequestNo = () => {
  const year = new Date().getFullYear();
  const random = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `REQ-${year}-${random}`;
};

export const createRequest = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // set by auth middleware
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    
    const schema = z.object({
      // Event Information
      eventName: z.string().min(3, 'Event name must be at least 3 characters'),
      eventDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid event date'),
      venue: z.string().min(2, 'Venue is required'),
      estimateAmount: z.number().positive('Estimate amount must be positive'),
      attendees: z.number().positive('Number of attendees must be positive'),
      
      // Service Details
      serviceType: z.string().min(2, 'Service type is required'),
      description: z.string().optional(),
      
      // Financial Information
      fundingSource: z.string().min(2, 'Funding source is required'),
      
      // Contact Information
      contactPhone: z.string().min(7).optional(),
      
      // Department
      departmentId: z.string().uuid({ message: 'departmentId must be a valid UUID' }).optional(),
      departmentName: z.string().min(2).max(100).optional(),
      
      // Optional phone update for user
      phone: z.string().min(7).max(30).optional(),
    }).refine(v => !!v.departmentId || !!v.departmentName, {
      message: 'Either departmentId or departmentName is required',
      path: ['departmentId'],
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Validation failed', issues: parsed.error.issues });
    }

    const { 
      eventName, eventDate, venue, estimateAmount, attendees,
      serviceType, description, fundingSource, contactPhone,
      departmentId, departmentName, phone 
    } = parsed.data;

    // If user has no phone, require one in payload
    if (!user.phone && !phone) {
      return res.status(400).json({ message: 'Phone contact required', field: 'phone' });
    }

    if (!user.phone && phone) {
      // update user with provided phone
      await prisma.user.update({ where: { id: user.id }, data: { phone } });
    }

    let finalDepartmentId = departmentId || null;
    if (!finalDepartmentId && departmentName) {
      // Try to find existing by exact name first, fallback to create.
      const existingDept = await prisma.department.findFirst({ 
        where: { name: departmentName } 
      });
      if (existingDept) {
        finalDepartmentId = existingDept.id;
      } else {
        // Generate department code from name
        const code = departmentName.substring(0, 3).toUpperCase();
        const createdDept = await prisma.department.create({ 
          data: { 
            name: departmentName, 
            code: `${code}${Date.now().toString().slice(-3)}` // Ensure uniqueness
          } 
        });
        finalDepartmentId = createdDept.id;
      }
    }
    if (!finalDepartmentId) return res.status(400).json({ message: 'Department could not be resolved' });

    const created = await prisma.serviceRequest.create({
      data: {
        requestNo: generateRequestNo(),
        eventName,
        eventDate: new Date(eventDate),
        venue,
        estimateAmount,
        attendees,
        serviceType,
        description: description || '',
        fundingSource,
        contactPhone: contactPhone || '',
        requesterId: user.id,
        departmentId: finalDepartmentId,
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_REQUEST',
        details: `Created service request: ${eventName}`,
        entityType: 'ServiceRequest',
        entityId: created.id,
        requestId: created.id,
      },
    });

    res.status(201).json(created);
  } catch (e) {
    console.error('createRequest error', e);
    res.status(500).json({ message: 'Failed to create request' });
  }
};



export const getRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true, code: true } },
        invoices: {
          include: {
            payments: true,
          },
        },
        attachments: true,
      },
    });
    if (!record) return res.status(404).json({ message: 'Not found' });
    res.json(record);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch request' });
  }
};

export const updateRequest = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const { id } = req.params;
    
    console.log('updateRequest - received data:', JSON.stringify(req.body, null, 2));
    
    const schema = z.object({
      eventName: z.string().min(3).optional(),
      eventDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid event date').optional(),
      venue: z.string().min(2).optional(),
      estimateAmount: z.union([z.number(), z.string().transform((val) => parseFloat(val))]).refine((val) => val > 0, 'Estimate amount must be positive').optional(),
      attendees: z.number().positive().optional(),
      serviceType: z.string().optional(),
      description: z.string().optional(),
      fundingSource: z.string().min(2).optional(),
      contactPhone: z.string().optional(),
      departmentId: z.string().uuid().optional(),
      status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'NEEDS_REVISION', 'REJECTED', 'FULFILLED', 'CLOSED']).optional(),
      rejectionReason: z.string().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      console.log('updateRequest - validation failed:', parsed.error.issues);
      return res.status(400).json({ message: 'Validation failed', issues: parsed.error.issues });
    }

    const updateData = parsed.data;
    if (updateData.eventDate) {
      (updateData as any).eventDate = new Date(updateData.eventDate);
    }
    // Handle null departmentId by converting to undefined
    if (updateData.departmentId === null) {
      delete (updateData as any).departmentId;
    }

    const existing = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: updateData,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'UPDATE_REQUEST',
        details: `Updated service request: ${updated.eventName}`,
        entityType: 'ServiceRequest',
        entityId: updated.id,
      },
    });

    res.json(updated);
  } catch (e) {
    console.error('updateRequest error', e);
    res.status(500).json({ message: 'Failed to update request' });
  }
};

// Approval workflow endpoints
async function transitionStatus(res: Response, id: string, newStatus: string, approverId?: string, rejectionReason?: string) {
  try {
    const updateData: any = { 
      status: newStatus as any, 
      approverId: approverId || undefined 
    };
    
    if (newStatus === 'APPROVED') {
      updateData.approvalDate = new Date();
    }
    
    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: updateData,
      include: { 
        requester: { select: { id: true, name: true, email: true } }, 
        approver: { select: { id: true, name: true } } 
      },
    });

    // Create audit log
    if (approverId) {
      await prisma.auditLog.create({
        data: {
          userId: approverId,
          action: `${newStatus}_REQUEST`,
          details: `Request status changed to ${newStatus}`,
          entityType: 'ServiceRequest',
          entityId: id,
        },
      });
    }

    return res.json(updated);
  } catch (e) {
    console.error('transitionStatus error', e);
    return res.status(500).json({ message: 'Failed to transition status' });
  }
};

// Get requests that need approval (for approvers)
export const getPendingApprovals = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (!['APPROVER', 'FINANCE_OFFICER'].includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
    }
    
    // Get requests that are in states requiring approval action
    const requests = await prisma.serviceRequest.findMany({
      where: {
        status: {
          in: ['SUBMITTED', 'NEEDS_REVISION']
        }
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true, code: true } },
        approver: { select: { id: true, name: true, email: true } },
        attachments: true,
      },
      orderBy: { createdAt: 'asc' }, // Oldest first for fairness
    });
    
    res.json(requests);
  } catch (e) {
    console.error('getPendingApprovals error', e);
    res.status(500).json({ message: 'Failed to fetch pending approvals' });
  }
};

export const approveRequest = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  if (!['APPROVER', 'FINANCE_OFFICER'].includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
  
  const { id } = req.params;
  const { reason } = req.body; // Optional approval comments
  const existing = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  if (!['SUBMITTED', 'NEEDS_REVISION'].includes(existing.status)) return res.status(409).json({ message: 'Cannot approve in current status' });
  
  return transitionStatus(res, id, 'APPROVED', user.id, reason);
};

export const rejectRequest = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  if (!['APPROVER', 'FINANCE_OFFICER'].includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
  
  const { id } = req.params;
  const { rejectionReason } = req.body;
  
  const existing = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  if (!['SUBMITTED', 'NEEDS_REVISION'].includes(existing.status)) return res.status(409).json({ message: 'Cannot reject in current status' });
  
  return transitionStatus(res, id, 'REJECTED', user.id, rejectionReason);
};

export const requestRevision = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  if (!['APPROVER', 'FINANCE_OFFICER'].includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
  
  const { id } = req.params;
  const { revisionNotes } = req.body; // Optional revision notes
  const existing = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  if (existing.status !== 'SUBMITTED') return res.status(409).json({ message: 'Only SUBMITTED can be moved to NEEDS_REVISION' });
  
  return transitionStatus(res, id, 'NEEDS_REVISION', user.id, revisionNotes);
};

export const fulfillRequest = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  if (!['FINANCE_OFFICER'].includes(user.role)) return res.status(403).json({ message: 'Forbidden' });
  
  const { id } = req.params;
  const existing = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: 'Not found' });
  if (existing.status !== 'APPROVED') return res.status(409).json({ message: 'Only APPROVED can be FULFILLED' });
  
  return transitionStatus(res, id, 'FULFILLED', user.id);
};
