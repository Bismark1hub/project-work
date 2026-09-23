import { query } from '../config/database';

export class AdminService {
  static async getStats() {
    const users = await query('SELECT COUNT(*) as count FROM users');
    const courses = await query('SELECT COUNT(*) as count FROM courses');
    const sessions = await query('SELECT COUNT(*) as count FROM schedule_sessions');
    const tasks = await query('SELECT COUNT(*) as count FROM tasks');
    const insights = await query('SELECT COUNT(*) as count FROM insights');
    const notifications = await query('SELECT COUNT(*) as count FROM notifications');

    return {
      users: parseInt(users.rows[0].count),
      courses: parseInt(courses.rows[0].count),
      sessions: parseInt(sessions.rows[0].count),
      tasks: parseInt(tasks.rows[0].count),
      insights: parseInt(insights.rows[0].count),
      notifications: parseInt(notifications.rows[0].count),
    };
  }

  static async getUsers() {
    const result = await query(
      `SELECT id, first_name, last_name, email, university_id, department, role, day_streak, productivity_score, created_at
       FROM users ORDER BY created_at DESC`
    );
    return result.rows;
  }

  static async getTableCounts() {
    const tables = ['users', 'courses', 'schedule_sessions', 'tasks', 'behavior_logs', 'insights', 'notifications', 'user_settings'];
    const counts: Record<string, number> = {};

    for (const table of tables) {
      const result = await query(`SELECT COUNT(*) as count FROM ${table}`);
      counts[table] = parseInt(result.rows[0].count);
    }

    return counts;
  }

  static async checkEngine() {
    try {
      const response = await fetch('http://localhost:8001/health');
      const data = await response.json();
      return { online: true, ...data };
    } catch {
      return { online: false, status: 'offline' };
    }
  }

  static async updateUserRole(userId: string, role: string) {
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, userId]);
  }
}