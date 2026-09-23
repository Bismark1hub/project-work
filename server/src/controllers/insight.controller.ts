import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { InsightService } from '../services/insight.service';

export class InsightController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const insights = await InsightService.getAll(req.userId!);
      res.json({ success: true, data: insights });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getPending(req: AuthRequest, res: Response) {
    try {
      const insights = await InsightService.getPending(req.userId!);
      res.json({ success: true, data: insights });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async analyze(req: AuthRequest, res: Response) {
    try {
      const insights = await InsightService.generateInsights(req.userId!);
      res.json({ success: true, data: insights, message: `Generated ${insights.length} insights` });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async accept(req: AuthRequest, res: Response) {
    try {
      await InsightService.accept(req.userId!, req.params.id);
      res.json({ success: true, data: null, message: 'Insight accepted' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async dismiss(req: AuthRequest, res: Response) {
    try {
      await InsightService.dismiss(req.userId!, req.params.id);
      res.json({ success: true, data: null, message: 'Insight dismissed' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}