import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SettingsService } from '../services/settings.service';

export class SettingsController {
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const profile = await SettingsService.getProfile(req.userId!);
      res.json({ success: true, data: profile });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const profile = await SettingsService.updateProfile(req.userId!, req.body);
      res.json({ success: true, data: profile });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async changePassword(req: AuthRequest, res: Response) {
    try {
      const { current_password, new_password } = req.body;
      await SettingsService.changePassword(req.userId!, current_password, new_password);
      res.json({ success: true, data: null, message: 'Password changed' });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await SettingsService.getSettings(req.userId!);
      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await SettingsService.updateSettings(req.userId!, req.body);
      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async deleteAccount(req: AuthRequest, res: Response) {
    try {
      await SettingsService.deleteAccount(req.userId!);
      res.json({ success: true, data: null, message: 'Account deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}