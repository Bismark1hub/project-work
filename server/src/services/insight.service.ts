import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';
import { NotificationService } from './notification.service';

export class InsightService {
  static async getPending(userId: string) {
    const result = await query(
      "SELECT * FROM insights WHERE user_id = $1 AND status = 'pending' ORDER BY created_at DESC",
      [userId]
    );
    return result.rows;
  }

  static async getAll(userId: string) {
    const result = await query(
      'SELECT * FROM insights WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );
    return result.rows;
  }

  static async generateInsights(userId: string) {
    // 1. Try to get insights from the Python engine (existing behavior)
    const engineInsights = await this.fetchEngineInsights(userId);
    if (engineInsights.length > 0) {
      await this.storeInsights(userId, engineInsights);
    }

    // 2. Also generate reschedule insights for missed sessions (new)
    await this.generateRescheduleInsights(userId);

    // 3. Return all pending insights for this user
    return this.getPending(userId);
  }

  // Existing method to call Python engine
  private static async fetchEngineInsights(userId: string): Promise<any[]> {
    try {
      const logsResult = await query(
        `SELECT id, user_id, session_id, scheduled_at, actual_start, actual_end, status, subject_id
         FROM behavior_logs
         WHERE user_id = $1
         ORDER BY scheduled_at DESC
         LIMIT 200`,
        [userId]
      );
      const tasksResult = await query(
        `SELECT id, title, due_date, priority, status
         FROM tasks
         WHERE user_id = $1 AND status != 'completed'
         ORDER BY due_date ASC
         LIMIT 50`,
        [userId]
      );

      const logs = logsResult.rows.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        session_id: row.session_id,
        scheduled_at: row.scheduled_at instanceof Date ? row.scheduled_at.toISOString() : row.scheduled_at,
        actual_start: row.actual_start instanceof Date ? row.actual_start.toISOString() : row.actual_start,
        actual_end: row.actual_end instanceof Date ? row.actual_end.toISOString() : row.actual_end,
        status: row.status,
        subject_id: row.subject_id,
      }));

      const tasks = tasksResult.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        due_date: row.due_date instanceof Date ? row.due_date.toISOString() : row.due_date,
        priority: row.priority,
        status: row.status,
      }));

      const engineUrl = process.env.ENGINE_URL || 'http://localhost:8001';
      const response = await fetch(`${engineUrl}/api/engine/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, behavior_logs: logs, upcoming_tasks: tasks, current_schedule: [] }),
      });

      if (!response.ok) {
        console.error(`Engine returned ${response.status}`);
        return [];
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data.insights)) {
        return data.data.insights;
      }
      return [];
    } catch (err) {
      console.error('Adaptive Engine call failed:', err);
      return [];
    }
  }

  // Store insights from engine, now with metadata support
  private static async storeInsights(userId: string, insights: any[]) {
    for (const insight of insights) {
      const id = uuidv4();
      await query(
        `INSERT INTO insights (id, user_id, type, title, description, confidence_score, recommendation, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
          userId,
          insight.type || 'efficiency',
          insight.title || 'Insight',
          insight.description || '',
          insight.confidence_score || 0,
          insight.recommendation || '',
          insight.metadata ? JSON.stringify(insight.metadata) : null,
        ]
      );
    }
  }

  // NEW: Generate reschedule insights for missed sessions
  private static async generateRescheduleInsights(userId: string) {
    // Find missed sessions that don't already have a reschedule insight
    const missed = await query(
      `SELECT ss.id, ss.title, ss.start_time, ss.end_time, ss.course_id
       FROM schedule_sessions ss
       WHERE ss.user_id = $1 AND ss.status = 'missed'
         AND NOT EXISTS (
           SELECT 1 FROM insights i
           WHERE i.user_id = $1
             AND i.type = 'reschedule'
             AND i.metadata->>'session_id' = ss.id::text
         )
       LIMIT 5`,
      [userId]
    );

    for (const session of missed.rows) {
      try {
        const engineUrl = process.env.ENGINE_URL || 'http://localhost:8001';
        // Call the rescheduler endpoint in the Python engine
        const response = await fetch(`${engineUrl}/api/engine/reschedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            missed_session: {
              id: session.id,
              title: session.title,
              start_time: session.start_time instanceof Date ? session.start_time.toISOString() : session.start_time,
              end_time: session.end_time instanceof Date ? session.end_time.toISOString() : session.end_time,
            },
            current_schedule: [],
            preferred_window: null,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.suggested_start) {
            const metadata = {
              session_id: session.id,
              session_title: session.title,
              new_start_time: data.data.suggested_start,
              new_end_time: data.data.suggested_end,
            };
            const id = uuidv4();
            await query(
              `INSERT INTO insights (id, user_id, type, title, description, confidence_score, recommendation, metadata)
               VALUES ($1, $2, 'reschedule', 'Reschedule Missed Session', $3, $4, $5, $6)`,
              [
                id,
                userId,
                `You missed "${session.title}". A free slot was found.`,
                data.data.confidence || 85,
                data.data.message || 'Move this session to the suggested time.',
                JSON.stringify(metadata),
              ]
            );
          }
        }
      } catch (err) {
        console.error('Reschedule API call failed:', err);
      }
    }
  }

  // NEW: Apply schedule change when accepting a reschedule insight
  static async accept(userId: string, insightId: string) {
  const result = await query('SELECT * FROM insights WHERE id = $1 AND user_id = $2', [insightId, userId]);
  if (result.rows.length === 0) throw new Error('Insight not found');

  const insight = result.rows[0];

  // If insight has metadata with session_id, update the schedule session
  if (insight.metadata && insight.metadata.session_id) {
    const { session_id, new_start_time, new_end_time } = insight.metadata;
    await query(
      `UPDATE schedule_sessions
       SET start_time = $1, end_time = $2, status = 'planned'
       WHERE id = $3 AND user_id = $4`,
      [new_start_time, new_end_time, session_id, userId]
    );

    // Create a notification about the reschedule

const sessionTitle = insight.metadata?.session_title || 'your session';
await NotificationService.create(userId, {
  type: 'adaptive',
  title: 'Schedule Updated',
  body: `Your session "${sessionTitle}" has been rescheduled.`
});



  } else {
    // For other insight types, just acknowledge with a notification
    await NotificationService.create(userId, {
      type: 'adaptive',
      title: 'Insight Accepted',
      body: `You accepted the insight: ${insight.title}`
    });
  }

  // Mark insight as accepted
  await query("UPDATE insights SET status = 'accepted' WHERE id = $1 AND user_id = $2", [insightId, userId]);
}
}