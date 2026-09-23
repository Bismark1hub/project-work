import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../validation';
import jwt from 'jsonwebtoken';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await AuthService.register(data);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('REGISTER ERROR:', error);
      if (error.issues) {
        return res.status(400).json({ success: false, error: error.issues[0].message });
      }
      return res.status(400).json({
        success: false,
        error: error?.message || 'Unknown error',
        debug: {
          name: error?.name,
          code: error?.code,
          stackTop: error?.stack?.split('\n').slice(0, 3).join(' | '),
          stringified: String(error),
        },
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await AuthService.login(email, password);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('LOGIN ERROR:', error);
      if (error.issues) {
        return res.status(400).json({ success: false, error: error.issues[0].message });
      }
      return res.status(400).json({
        success: false,
        error: error?.message || 'Unknown error',
        debug: {
          name: error?.name,
          code: error?.code,
          stackTop: error?.stack?.split('\n').slice(0, 3).join(' | '),
          stringified: String(error),
        },
      });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const { refresh_token } = req.body;
      if (!refresh_token) {
        return res.status(400).json({ success: false, error: 'Refresh token required' });
      }
      const decoded = jwt.verify(
        refresh_token,
        process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'
      ) as { userId: string };
      const tokens = AuthService.generateTokens(decoded.userId);
      res.json({ success: true, data: tokens });
    } catch {
      res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }
  }
}
