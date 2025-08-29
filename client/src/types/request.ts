export interface ServiceRequest {
  id: string;
  requestNo: string;
  
  // Event Information
  eventName: string;
  eventDate: string;
  venue: string;
  estimateAmount: number;
  attendees: number;
  
  // Service Details
  serviceType: string;
  description?: string;
  
  // Financial Information
  fundingSource: string;
  
  // Contact Information
  contactPhone?: string;
  
  // Status and Workflow
  status: RequestStatus;
  rejectionReason?: string;
  approvalDate?: string;
  
  // Relationships
  departmentId: string;
  department?: { id: string; name: string; code: string };
  requesterId: string;
  requester?: { id: string; name: string; email: string };
  approverId?: string;
  approver?: { id: string; name: string; email: string };
  
  // Associated data
  invoices?: Invoice[];
  attachments?: Attachment[];
  
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequestInput {
  // Event Information
  eventName: string;
  eventDate: string;
  venue: string;
  estimateAmount: number;
  attendees: number;
  
  // Service Details
  serviceType: string;
  description?: string;
  
  // Financial Information
  fundingSource: string;
  
  // Contact Information
  contactPhone?: string;
  
  // Department
  departmentId?: string;
  departmentName?: string;
  
  // User phone (if needed)
  phone?: string;
}

export interface UpdateServiceRequestInput {
  eventName?: string;
  eventDate?: string;
  venue?: string;
  estimateAmount?: number;
  attendees?: number;
  serviceType?: string;
  description?: string;
  fundingSource?: string;
  contactPhone?: string;
  departmentId?: string;
  status?: RequestStatus;
  rejectionReason?: string;
}

export type RequestStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'NEEDS_REVISION'
  | 'REJECTED'
  | 'FULFILLED'
  | 'CLOSED';

export interface Invoice {
  id: string;
  invoiceNo: string;
  requestId: string;
  invoiceDate: string;
  dueDate: string;
  grossAmount: number;
  taxAmount: number;
  netAmount: number;
  status: InvoiceStatus;
  createdById: string;
  payments?: Payment[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'APPROVED_FOR_PAYMENT'
  | 'DISPUTED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CLOSED';

export interface Payment {
  id: string;
  paymentNo: string;
  method: PaymentMethod;
  reference?: string;
  paymentDate: string;
  amount: number;
  status: PaymentStatus;
  invoiceId: string;
  createdById: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'CHEQUE' | 'TRANSFER' | 'MOBILE_MONEY';

export type PaymentStatus = 
  | 'DRAFT'
  | 'PROCESSED'
  | 'CLEARED'
  | 'CANCELLED'
  | 'FAILED';

export interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedById: string;
  requestId?: string;
  invoiceId?: string;
  paymentId?: string;
  uploadedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  costCentre?: string;
  approverId?: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy type for backward compatibility
export interface RequestRecord extends ServiceRequest {}
export interface CreateRequestInput extends CreateServiceRequestInput {}
