import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';

export class NotificationService {
  static async getAll(userId: string) {
    const result = await query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    return result.rows;
  }

  static async getUnread(userId: string) {
    const result = await query(
      'SELECT * FROM notifications WHERE user_id = $1 AND read = false ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async markAllRead(userId: string) {
    await query(
      'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
      [userId]
    );
  }

  static async create(userId: string, data: { type: string; title: string; body: string }) {
    const id = uuidv4();
    await query(
      `INSERT INTO notifications (id, user_id, type, title, body)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, userId, data.type, data.title, data.body]
    );
    return { id, ...data, read: false };
  }
}