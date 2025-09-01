import { PrismaClient } from '@prisma/client';
import { sendHtmlMail, emailTemplates } from './mail.util';

const prisma = new PrismaClient();

export interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  requestId?: string;
  invoiceId?: string;
  paymentId?: string;
  metadata?: any;
}

export class NotificationService {
  /**
   * Create an in-app notification for a user
   */
  static async createNotification(data: NotificationData) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { email: true, name: true }
      });

      if (!user) {
        throw new Error(`User not found: ${data.userId}`);
      }

      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type as any,
          title: data.title,
          message: data.message,
          recipientEmail: user.email,
          requestId: data.requestId,
          invoiceId: data.invoiceId,
          paymentId: data.paymentId,
          isRead: false,
          emailSent: false,
        },
        include: {
          request: { select: { id: true, eventName: true, requestNo: true } },
          invoice: { select: { id: true, invoiceNo: true } },
          payment: { select: { id: true, paymentNo: true } },
        }
      });

      console.log(`Notification created for user ${user.email}: ${data.title}`);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create notifications for multiple users
   */
  static async createBulkNotifications(notifications: NotificationData[]) {
    try {
      const results = await Promise.allSettled(
        notifications.map(data => this.createNotification(data))
      );

      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');

      console.log(`Bulk notifications: ${successful.length} successful, ${failed.length} failed`);
      
      if (failed.length > 0) {
        console.error('Failed notifications:', failed);
      }

      return { successful: successful.length, failed: failed.length };
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(userId: string, limit = 20, offset = 0) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        include: {
          request: { select: { id: true, eventName: true, requestNo: true } },
          invoice: { select: { id: true, invoiceNo: true } },
          payment: { select: { id: true, paymentNo: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
      });

      return { notifications, unreadCount };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.updateMany({
        where: { 
          id: notificationId,
          userId: userId // Ensure user can only mark their own notifications as read
        },
        data: { isRead: true },
      });

      return notification.count > 0;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      return result.count;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification for a user
   */
  static async deleteNotification(notificationId: string, userId: string) {
    try {
      const result = await prisma.notification.deleteMany({
        where: { 
          id: notificationId,
          userId: userId // Ensure user can only delete their own notifications
        },
      });

      return result.count > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   */
  static async deleteAllNotifications(userId: string) {
    try {
      const result = await prisma.notification.deleteMany({
        where: { userId },
      });

      return result.count;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }

  /**
   * Delete old notifications (older than 30 days)
   */
  static async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
          isRead: true, // Only delete read notifications
        },
      });

      console.log(`Cleaned up ${result.count} old notifications`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }
}

// Notification helper functions for different events
export const NotificationHelpers = {
  // Request created - notify approvers and finance officers
  async notifyRequestCreated(requestData: any) {
    const approversAndFinance = await prisma.user.findMany({
      where: { role: { in: ['APPROVER', 'FINANCE_OFFICER'] } },
    });

    const notifications = approversAndFinance.map(user => ({
      userId: user.id,
      type: 'REQUEST_CREATED',
      title: `New Service Request: ${requestData.eventName}`,
      message: `A new service request has been submitted by ${requestData.requester?.name} for ${requestData.eventName} on ${new Date(requestData.eventDate).toLocaleDateString()}.`,
      requestId: requestData.id,
    }));

    return NotificationService.createBulkNotifications(notifications);
  },

  // Request approved - notify requester and finance officers
  async notifyRequestApproved(requestData: any, approvalComments?: string) {
    const notifications: NotificationData[] = [
      {
        userId: requestData.requesterId,
        type: 'REQUEST_APPROVED',
        title: `Request Approved: ${requestData.eventName}`,
        message: `Your service request for ${requestData.eventName} has been approved and will proceed to invoice generation.${approvalComments ? ` Comments: ${approvalComments}` : ''}`,
        requestId: requestData.id,
      }
    ];

    // Also notify finance officers
    const financeOfficers = await prisma.user.findMany({
      where: { role: 'FINANCE_OFFICER' },
    });

    financeOfficers.forEach(user => {
      notifications.push({
        userId: user.id,
        type: 'REQUEST_APPROVED',
        title: `Request Approved - Action Required: ${requestData.eventName}`,
        message: `Service request for ${requestData.eventName} has been approved and requires invoice generation.${approvalComments ? ` Approval comments: ${approvalComments}` : ''}`,
        requestId: requestData.id,
      });
    });

    return NotificationService.createBulkNotifications(notifications);
  },

  // Request rejected - notify requester
  async notifyRequestRejected(requestData: any, rejectionReason?: string) {
    const notification: NotificationData = {
      userId: requestData.requesterId,
      type: 'REQUEST_REJECTED',
      title: `Request Rejected: ${requestData.eventName}`,
      message: `Your service request for ${requestData.eventName} has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      requestId: requestData.id,
    };

    return NotificationService.createNotification(notification);
  },

  // Request revision - notify requester
  async notifyRequestRevision(requestData: any, revisionReason?: string) {
    const notification: NotificationData = {
      userId: requestData.requesterId,
      type: 'REQUEST_NEEDS_REVISION',
      title: `Revision Requested: ${requestData.eventName}`,
      message: `Your service request for ${requestData.eventName} requires revision before approval.${revisionReason ? ` Comments: ${revisionReason}` : ''}`,
      requestId: requestData.id,
    };

    return NotificationService.createNotification(notification);
  },

  // Invoice created - notify requester
  async notifyInvoiceCreated(invoiceData: any) {
    const notification: NotificationData = {
      userId: invoiceData.request.requesterId,
      type: 'INVOICE_CREATED',
      title: `Invoice Created: ${invoiceData.request.eventName}`,
      message: `An invoice has been generated for your service request ${invoiceData.request.eventName}. Invoice amount: ₦${invoiceData.netAmount?.toLocaleString()}.`,
      requestId: invoiceData.requestId,
      invoiceId: invoiceData.id,
    };

    return NotificationService.createNotification(notification);
  },

  // Payment recorded - notify requester
  async notifyPaymentRecorded(paymentData: any) {
    const notification: NotificationData = {
      userId: paymentData.invoice.request.requesterId,
      type: 'PAYMENT_RECORDED',
      title: `Payment Recorded: ${paymentData.invoice.request.eventName}`,
      message: `Payment of ₦${paymentData.amount?.toLocaleString()} has been recorded for your service request ${paymentData.invoice.request.eventName}.`,
      requestId: paymentData.invoice.requestId,
      invoiceId: paymentData.invoiceId,
      paymentId: paymentData.id,
    };

    return NotificationService.createNotification(notification);
  },
};
