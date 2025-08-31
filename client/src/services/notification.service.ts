import { api } from './apiClient';
import { Notification, NotificationResponse } from '../types/notification';

export const notificationService = {
  // Get user notifications with pagination
  async getUserNotifications(page = 1, limit = 20): Promise<NotificationResponse> {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data.unreadCount;
  },

  // Mark a notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/mark-all-read');
  },

  // Get only unread notifications
  async getUnreadNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications?read=false');
    return response.data.notifications;
  }
};
