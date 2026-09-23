import { z } from 'zod';

// ============================================
// AUTH
// ============================================
export const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be under 50 characters')
    .regex(/^[A-Za-z\s'-]+$/, 'First name can only contain letters'),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be under 50 characters')
    .regex(/^[A-Za-z\s'-]+$/, 'Last name can only contain letters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ============================================
// COURSES
// ============================================
export const createCourseSchema = z.object({
  code: z.string().min(1, 'Course code is required').max(20),
  name: z.string().min(1, 'Course name is required').max(100),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  color: z.string().max(7).optional(),
  icon: z.string().max(50).optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

// ============================================
// SCHEDULE
// ============================================
export const createSessionSchema = z.object({
  course_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  focus_topic: z.string().max(200).optional(),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  location: z.string().max(100).optional(),
  is_urgent: z.boolean().optional(),
});










export const updateSessionStatusSchema = z.object({
  status: z.enum(['planned', 'completed', 'missed']),
  actual_start: z.string().optional(),
  actual_end: z.string().optional(),
});

// ============================================
// TASKS
// ============================================
export const createTaskSchema = z.object({
  course_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'completed']).optional(),
  priority: z.enum(['low', 'mid', 'high']).optional(),
  due_date: z.string().min(1, 'Due date is required'),
});

export const updateTaskSchema = createTaskSchema.partial();

export const updateTaskStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'in_review', 'completed']),
});

// ============================================
// SETTINGS
// ============================================
export const updateProfileSchema = z.object({
  first_name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[A-Za-z\s'-]+$/, 'First name can only contain letters')
    .optional(),
  last_name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[A-Za-z\s'-]+$/, 'Last name can only contain letters')
    .optional(),
});

export const updateSettingsSchema = z.object({
  pomodoro_focus_mins: z.number().min(5).max(60).optional(),
  pomodoro_break_mins: z.number().min(1).max(30).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  notif_academic_analytics: z.boolean().optional(),
  notif_study_reminders: z.boolean().optional(),
});