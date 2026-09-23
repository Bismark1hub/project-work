import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PushService } from '../services/push.service';

export class PushController {
  static async saveSubscription(req: AuthRequest, res: Response) {
    try {
      await PushService.saveSubscription(req.userId!, req.body);
      res.json({ success: true, data: null, message: 'Subscription saved' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async deleteSubscription(req: AuthRequest, res: Response) {
    try {
      const { endpoint } = req.body;
      await PushService.deleteSubscription(req.userId!, endpoint);
      res.json({ success: true, data: null, message: 'Subscription removed' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async sendTest(req: AuthRequest, res: Response) {
    try {
      const results = await PushService.sendTest(req.userId!);
      res.json({ success: true, data: results, message: 'Test notification sent' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}