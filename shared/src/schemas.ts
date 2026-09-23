import { z } from 'zod';

// ============================================
// Auth Schemas
// ============================================
export const registerSchema = z.object({
  first_name: z
  .string()
  .min(1, 'First name is required')
  .max(50, 'First name must be at most 50 characters')
  .regex(/^[A-Za-z\s'-]+$/, 'First name can only contain letters'),

  last_name: z
  .string()
  .min(1, 'Last name is required')
  .max (50, 'Last name must be at most 50 characters')
  .regex(/^[A-Za-z\s'-]+$/, 'Last name can only contain letters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  university_id: z.string().optional(),
  department: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  keep_me_logged_in: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ============================================
// Course Schemas
// ============================================
export const createCourseSchema = z.object({
  code: z.string().min(1, 'Course code is required'),
  name: z.string().min(1, 'Course name is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

// ============================================
// Schedule Schemas
// ============================================
export const createSessionSchema = z.object({
  course_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  focus_topic: z.string().optional(),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  location: z.string().optional(),
  is_urgent: z.boolean().optional(),
});

export const updateSessionSchema = createSessionSchema.partial();

export const updateSessionStatusSchema = z.object({
  status: z.enum(['completed', 'missed']),
  actual_start: z.string().datetime().optional(),
  actual_end: z.string().datetime().optional(),
});

// ============================================
// Task Schemas
// ============================================
export const createTaskSchema = z.object({
  course_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'in_review', 'completed']).optional(),
  priority: z.enum(['low', 'mid', 'high']).optional(),
  due_date: z.string().datetime(),
  attachments: z.array(z.string()).optional(),
  assignees: z.array(z.string()).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

// ============================================
// User Settings Schemas
// ============================================
export const updateUserSchema = z.object({
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
  university_id: z.string().optional(),
  department: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

export const updateSettingsSchema = z.object({
  pomodoro_focus_mins: z.number().min(5).max(60).optional(),
  pomodoro_break_mins: z.number().min(1).max(30).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  notif_academic_analytics: z.boolean().optional(),
  notif_study_reminders: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ============================================
// Type exports from schemas
// ============================================
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type UpdateSessionStatusInput = z.infer<typeof updateSessionStatusSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;