// ============================================
// App Constants
// ============================================
export const APP_NAME = 'Smart Study';
export const APP_DESCRIPTION = 'Adaptive academic planner for university students';

// ============================================
// Color Scheme
// ============================================
export const COLORS = {
  primary: '#0D0F3C',
  accent: '#F5C518',
  surface: '#FFFFFF',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
} as const;

// ============================================
// Pomodoro Defaults
// ============================================
export const DEFAULT_FOCUS_MINS = 25;
export const DEFAULT_BREAK_MINS = 5;

// ============================================
// Status Label Maps
// ============================================
export const TASK_STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  completed: 'Completed',
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  mid: 'Medium',
  high: 'High',
};

export const SESSION_STATUS_LABELS: Record<string, string> = {
  planned: 'Planned',
  completed: 'Completed',
  missed: 'Missed',
};

export const COURSE_DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};