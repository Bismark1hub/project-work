import { query } from '../config/database';
import bcrypt from 'bcryptjs';

export class SettingsService {
  static async getProfile(userId: string) {
  const result = await query(
    'SELECT id, first_name, last_name, email, day_streak, productivity_score FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
}

  static async updateProfile(userId: string, data: {
    first_name?: string;
    last_name?: string;
   
  }) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(userId);
    await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}`,
      values
    );

    return SettingsService.getProfile(userId);
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      throw new Error('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);
  }

  static async getSettings(userId: string) {
    const result = await query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );
    return result.rows[0];
  }

  static async updateSettings(userId: string, data: {
    pomodoro_focus_mins?: number;
    pomodoro_break_mins?: number;
    theme?: string;
    notif_academic_analytics?: boolean;
    notif_study_reminders?: boolean;
  }) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(userId);
    await query(
      `UPDATE user_settings SET ${fields.join(', ')} WHERE user_id = $${paramCount}`,
      values
    );

    return SettingsService.getSettings(userId);
  }

  static async deleteAccount(userId: string) {
    await query('DELETE FROM push_subscriptions WHERE user_id = $1', [userId]);
  await query('DELETE FROM behavior_logs WHERE user_id = $1', [userId]);
  await query('DELETE FROM notifications WHERE user_id = $1', [userId]);
  await query('DELETE FROM insights WHERE user_id = $1', [userId]);
  await query('DELETE FROM user_settings WHERE user_id = $1', [userId]);
  await query('DELETE FROM tasks WHERE user_id = $1', [userId]);
  await query('DELETE FROM schedule_sessions WHERE user_id = $1', [userId]);
  await query('DELETE FROM courses WHERE user_id = $1', [userId]);
  // Finally, delete the user
  await query('DELETE FROM users WHERE id = $1', [userId]);
  }
}


