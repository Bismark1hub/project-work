import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
  static async getSummary(req: AuthRequest, res: Response) {
    try {
      const summary = await AnalyticsService.getSummary(req.userId!);
      res.json({ success: true, data: summary });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getConsistency(req: AuthRequest, res: Response) {
    try {
      const range = (req.query.range as string) || '7d';
      const data = await AnalyticsService.getConsistency(req.userId!, range);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getSubjectAllocation(req: AuthRequest, res: Response) {
    try {
      const data = await AnalyticsService.getSubjectAllocation(req.userId!);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getHeatmap(req: AuthRequest, res: Response) {
    try {
      const data = await AnalyticsService.getHeatmap(req.userId!);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getFocusTrend(req: AuthRequest, res: Response) {
    try {
      const data = await AnalyticsService.getFocusTrend(req.userId!);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}