export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  
  // Relationships
  requestId?: string;
  invoiceId?: string;
  paymentId?: string;
}

export enum NotificationType {
  REQUEST_CREATED = 'REQUEST_CREATED',
  REQUEST_SUBMITTED = 'REQUEST_SUBMITTED',
  REQUEST_APPROVED = 'REQUEST_APPROVED',
  REQUEST_REJECTED = 'REQUEST_REJECTED',
  REQUEST_REVISION = 'REQUEST_REVISION',
  INVOICE_CREATED = 'INVOICE_CREATED',
  INVOICE_UPDATED = 'INVOICE_UPDATED',
  PAYMENT_RECORDED = 'PAYMENT_RECORDED',
  PAYMENT_UPDATED = 'PAYMENT_UPDATED',
  STATUS_UPDATE = 'STATUS_UPDATE'
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}
