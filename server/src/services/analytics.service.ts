import { query } from '../config/database';

export class AnalyticsService {
  static async getSummary(userId: string) {
    const completedSessions = await query(
      "SELECT COUNT(*) as count FROM schedule_sessions WHERE user_id = $1 AND status = 'completed'",
      [userId]
    );
    const missedSessions = await query(
      "SELECT COUNT(*) as count FROM schedule_sessions WHERE user_id = $1 AND status = 'missed'",
      [userId]
    );
    const totalTasks = await query(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = $1',
      [userId]
    );
    const completedTasks = await query(
      "SELECT COUNT(*) as count FROM tasks WHERE user_id = $1 AND status = 'completed'",
      [userId]
    );
    const user = await query(
      'SELECT day_streak, productivity_score FROM users WHERE id = $1',
      [userId]
    );

    return {
     
   
      productivity_score: user.rows[0]?.productivity_score || 0,
      day_streak: user.rows[0]?.day_streak || 0,
      total_study_hours: Math.round((parseInt(completedSessions.rows[0]?.count) || 0) * 1.5),
      completed_sessions: parseInt(completedSessions.rows[0]?.count) || 0,
      missed_sessions: parseInt(missedSessions.rows[0]?.count) || 0,
      total_tasks: parseInt(totalTasks.rows[0]?.count) || 0,
      completed_tasks: parseInt(completedTasks.rows[0]?.count) || 0,
    };
  }

  static async getConsistency(userId: string, range: string) {
    const days = range === '30d' ? 30 : 7;
    
    const result = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM schedule_sessions
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [userId]
    );

    const dates: { date: string; minutes: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = result.rows.find((r: any) => {
        const rowDate = new Date(r.date).toISOString().split('T')[0];
        return rowDate === dateStr;
      });
      dates.push({
        date: dateStr,
        minutes: found ? found.count * 90 : 0,
      });
    }

    return dates;
  }

  static async getSubjectAllocation(userId: string) {
    const result = await query(
      `SELECT c.code, c.name, c.color, COUNT(ss.id) as session_count
       FROM schedule_sessions ss
       LEFT JOIN courses c ON ss.course_id = c.id
       WHERE ss.user_id = $1 AND ss.status = 'completed'
       GROUP BY c.code, c.name, c.color
       ORDER BY session_count DESC`,
      [userId]
    );

    const total = result.rows.reduce((sum: number, r: any) => sum + parseInt(r.session_count), 0);
    
    return result.rows.map((r: any) => ({
      subject: r.code || 'Other',
      name: r.name || 'General Study',
      percentage: total > 0 ? Math.round((parseInt(r.session_count) / total) * 100) : 0,
      color: r.color || '#F5C518',
    }));
  }

  static async getHeatmap(userId: string) {
    const result = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM schedule_sessions
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '90 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [userId]
    );

    return result.rows.map((r: any) => ({
      date: new Date(r.date).toISOString().split('T')[0],
      count: parseInt(r.count),
    }));
  }

  static async getFocusTrend(userId: string) {
    const result = await query(
      `SELECT DATE(start_time) as date, 
              COUNT(*) FILTER (WHERE status = 'completed') as completed,
              COUNT(*) as total
       FROM schedule_sessions
       WHERE user_id = $1 AND start_time >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(start_time)
       ORDER BY date ASC`,
      [userId]
    );

    return result.rows.map((r: any) => ({
      date: new Date(r.date).toISOString().split('T')[0],
      focus_score: r.total > 0 ? Math.round((parseInt(r.completed) / parseInt(r.total)) * 100) : 0,
    }));
  }
}