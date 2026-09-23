import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const notifications = await NotificationService.getAll(req.userId!);
      res.json({ success: true, data: notifications });
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getUnread(req: AuthRequest, res: Response) {
    try {
      const notifications = await NotificationService.getUnread(req.userId!);
      res.json({ success: true, data: notifications });
    } catch (error: any) {
      console.error('Error fetching unread notifications:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async markAllRead(req: AuthRequest, res: Response) {
    try {
      await NotificationService.markAllRead(req.userId!);
      res.json({ success: true, data: null, message: 'All marked as read' });
    } catch (error: any) {
      console.error('Error marking notifications read:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}