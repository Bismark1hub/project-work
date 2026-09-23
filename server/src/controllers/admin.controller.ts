import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AdminService } from '../services/admin.service';
import { query } from '../config/database';

export class AdminController {
  static async checkAdmin(req: AuthRequest, res: Response, next: Function) {
    try {
      const result = await query('SELECT role FROM users WHERE id = $1', [req.userId]);
      if (result.rows[0]?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
      next();
    } catch {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
  }

  static async getStats(req: AuthRequest, res: Response) {
    try {
      const stats = await AdminService.getStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const users = await AdminService.getUsers();
      res.json({ success: true, data: users });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getTableCounts(req: AuthRequest, res: Response) {
    try {
      const counts = await AdminService.getTableCounts();
      res.json({ success: true, data: counts });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async checkEngine(req: AuthRequest, res: Response) {
    try {
      const status = await AdminService.checkEngine();
      res.json({ success: true, data: status });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateUserRole(req: AuthRequest, res: Response) {
    try {
      await AdminService.updateUserRole(req.params.id, req.body.role);
      res.json({ success: true, data: null, message: 'Role updated' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}