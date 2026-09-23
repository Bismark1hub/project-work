import { Response } from 'express';
import { ScheduleService } from '../services/schedule.service';
import { AuthRequest } from '../middleware/auth';
import { createSessionSchema, updateSessionStatusSchema } from '../validation';

export class ScheduleController {
  static async getSchedule(req: AuthRequest, res: Response) {
    try {
      const { date, start, end } = req.query;

      if (start && end) {
        const sessions = await ScheduleService.getByWeek(req.userId!, start as string, end as string);
        return res.json({ success: true, data: sessions });
      }

      const today = (date as string) || new Date().toISOString().split('T')[0];
      const sessions = await ScheduleService.getByDate(req.userId!, today);
      res.json({ success: true, data: sessions });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createSession(req: AuthRequest, res: Response) {
    try {
      const data = createSessionSchema.parse(req.body);
      const session = await ScheduleService.create(req.userId!, data);
      res.status(201).json({ success: true, data: session });
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ success: false, error: error.issues[0].message });
      }
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status, actual_start, actual_end } = updateSessionStatusSchema.parse(req.body);
      const session = await ScheduleService.updateStatus(req.userId!, req.params.id, status, actual_start, actual_end);
      res.json({ success: true, data: session });
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({ success: false, error: error.issues[0].message });
      }
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async deleteSession(req: AuthRequest, res: Response) {
    try {
      await ScheduleService.delete(req.userId!, req.params.id);
      res.json({ success: true, data: null, message: 'Session deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}