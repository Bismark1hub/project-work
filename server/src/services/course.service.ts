import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';

export class CourseService {
  static async getAll(userId: string) {
    const result = await query(
      'SELECT * FROM courses WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async create(userId: string, data: {
    code: string;
    name: string;
    difficulty?: string;
    color?: string;
    icon?: string;
  }) {
    const id = uuidv4();
    await query(
      `INSERT INTO courses (id, user_id, code, name, difficulty, color, icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, userId, data.code, data.name, data.difficulty || 'medium', data.color || '#F5C518', data.icon || 'book']
    );
    const result = await query('SELECT * FROM courses WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async update(userId: string, courseId: string, data: any) {
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

    values.push(courseId, userId);
    await query(
      `UPDATE courses SET ${fields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1}`,
      values
    );

    const result = await query('SELECT * FROM courses WHERE id = $1', [courseId]);
    return result.rows[0];
  }

  static async delete(userId: string, courseId: string) {
    await query('DELETE FROM courses WHERE id = $1 AND user_id = $2', [courseId, userId]);
  }
}