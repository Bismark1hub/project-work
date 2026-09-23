import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';

export class ScheduleService {
  static async getByDate(userId: string, date: string) {
    const result = await query(
      `SELECT * FROM schedule_sessions 
       WHERE user_id = $1 AND DATE(start_time) = $2 
       ORDER BY start_time ASC`,
      [userId, date]
    );
    return result.rows;
  }

  static async getByWeek(userId: string, startDate: string, endDate: string) {
    const result = await query(
      `SELECT * FROM schedule_sessions 
       WHERE user_id = $1 AND DATE(start_time) BETWEEN $2 AND $3 
       ORDER BY start_time ASC`,
      [userId, startDate, endDate]
    );
    return result.rows;
  }

  static async create(userId: string, data: {
    course_id?: string;
    title: string;
    focus_topic?: string;
    start_time: string;
    end_time: string;
    is_urgent?: boolean;
  }) {
    const id = uuidv4();
    await query(
      `INSERT INTO schedule_sessions (id, user_id, course_id, title, focus_topic, start_time, end_time, is_urgent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        userId,
        data.course_id || null,
        data.title,
        data.focus_topic || null,
        data.start_time,
        data.end_time,
        data.is_urgent || false,
      ]
    );
    const result = await query('SELECT * FROM schedule_sessions WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async updateStatus(
    userId: string,
    sessionId: string,
    status: string,
    actualStart?: string,
    actualEnd?: string
  ) {
    await query(
      `UPDATE schedule_sessions SET status = $1 WHERE id = $2 AND user_id = $3`,
      [status, sessionId, userId]
    );

    // Insert into behavior_logs when status changes to completed or missed
    if (status === 'completed' || status === 'missed') {
      await query(
        `INSERT INTO behavior_logs (id, user_id, session_id, scheduled_at, actual_start, actual_end, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          uuidv4(),
          userId,
          sessionId,
          new Date().toISOString(),
          actualStart || null,
          actualEnd || null,
          status,
        ]
      );
    }

    const result = await query('SELECT * FROM schedule_sessions WHERE id = $1', [sessionId]);
    return result.rows[0];
  }

  static async delete(userId: string, sessionId: string) {
    await query('DELETE FROM schedule_sessions WHERE id = $1 AND user_id = $2', [
      sessionId,
      userId,
    ]);
  }
}
