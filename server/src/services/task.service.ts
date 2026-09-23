import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';

export class TaskService {
  static async getAll(userId: string) {
    const result = await query(
      `SELECT t.*, c.code as course_code, c.name as course_name, c.color as course_color
       FROM tasks t
       LEFT JOIN courses c ON t.course_id = c.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async create(userId: string, data: {
    course_id?: string;
    title: string;
    description?: string;
    priority?: string;
    due_date: string;
  }) {
    const id = uuidv4();
    await query(
      `INSERT INTO tasks (id, user_id, course_id, title, description, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, userId, data.course_id || null, data.title, data.description || null, data.priority || 'mid', data.due_date]
    );
    const result = await query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async updateStatus(userId: string, taskId: string, status: string) {
    await query(
      'UPDATE tasks SET status = $1 WHERE id = $2 AND user_id = $3',
      [status, taskId, userId]
    );
    const result = await query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    return result.rows[0];
  }

  static async update(userId: string, taskId: string, data: any) {
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

    values.push(taskId, userId);
    await query(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1}`,
      values
    );

    const result = await query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    return result.rows[0];
  }

  static async delete(userId: string, taskId: string) {
    await query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
  }
}