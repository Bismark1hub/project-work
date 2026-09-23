// ============================================
// User Types
// ============================================
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  university_id: string;
  department: string;
  google_id: string | null;
  avatar_url: string | null;
  day_streak: number;
  productivity_score: number;
  created_at: string;
}

// ============================================
// Course Types
// ============================================
export type CourseDifficulty = 'easy' | 'medium' | 'hard';

export interface Course {
  id: string;
  user_id: string;
  code: string;
  name: string;
  difficulty: CourseDifficulty;
  retention_pct: number;
  color: string;
  icon: string;
  created_at: string;
}

// ============================================
// Schedule Session Types
// ============================================
export type SessionStatus = 'planned' | 'completed' | 'missed';

export interface ScheduleSession {
  id: string;
  user_id: string;
  course_id: string | null;
  title: string;
  focus_topic: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  status: SessionStatus;
  is_urgent: boolean;
  created_at: string;
}

// ============================================
// Task Types
// ============================================
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed';
export type TaskPriority = 'low' | 'mid' | 'high';

export interface Task {
  id: string;
  user_id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  attachments: string[];
  assignees: string[];
  created_at: string;
}

// ============================================
// Insight Types
// ============================================
export type InsightType = 'circadian' | 'burnout' | 'efficiency' | 'knowledge_gap' | 'calculus';
export type InsightStatus = 'pending' | 'accepted' | 'dismissed';

export interface Insight {
  id: string;
  user_id: string;
  type: InsightType;
  title: string;
  description: string;
  confidence_score: number;
  recommendation: string;
  status: InsightStatus;
  created_at: string;
}

// ============================================
// Notification Types
// ============================================
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

// ============================================
// User Settings Types
// ============================================
export type Theme = 'light' | 'dark';

export interface UserSettings {
  user_id: string;
  pomodoro_focus_mins: number;
  pomodoro_break_mins: number;
  theme: Theme;
  notif_academic_analytics: boolean;
  notif_study_reminders: boolean;
}

// ============================================
// API Response Types
// ============================================
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

// ============================================
// Analytics Types
// ============================================
export interface AnalyticsSummary {
  gpa: number;
  target_gpa: number;
  productivity_score: number;
  day_streak: number;
  total_study_hours: number;
  completed_sessions: number;
  missed_sessions: number;
}

export interface ConsistencyData {
  date: string;
  minutes: number;
}

export interface SubjectAllocation {
  subject: string;
  percentage: number;
  color: string;
}

export interface HeatmapData {
  date: string;
  count: number;
}

export interface FocusTrend {
  date: string;
  focus_score: number;
}