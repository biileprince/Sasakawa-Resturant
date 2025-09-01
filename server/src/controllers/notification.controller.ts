import { Request, Response } from 'express';
import { NotificationService } from '../utils/notification.util';

// Get user's notifications
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await NotificationService.getUserNotifications(user.id, limit, offset);
    res.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Mark notification as read (delete it)
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params;
    const success = await NotificationService.deleteNotification(id, user.id);

    if (success) {
      res.json({ message: 'Notification deleted' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

// Mark all notifications as read (delete them)
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const count = await NotificationService.deleteAllNotifications(user.id);
    res.json({ message: `${count} notifications cleared` });
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    res.status(500).json({ message: 'Failed to clear all notifications' });
  }
};

// Get unread notification count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const result = await NotificationService.getUserNotifications(user.id, 1, 0);
    res.json({ unreadCount: result.unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
};
