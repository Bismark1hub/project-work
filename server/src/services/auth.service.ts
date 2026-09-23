import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database';

export interface CreateUserInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}


export class AuthService {
  static async register(input: CreateUserInput) {
  const { first_name, last_name, email, password } = input;

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new Error('Email already registered');
  }

  const password_hash = await bcrypt.hash(password, 12);
  const id = uuidv4();

  await query(
    `INSERT INTO users (id, first_name, last_name, email, password_hash, day_streak, productivity_score)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, first_name, last_name, email, password_hash, 0, 0]
  );

  await query(
    `INSERT INTO user_settings (user_id, pomodoro_focus_mins, pomodoro_break_mins, theme, notif_academic_analytics, notif_study_reminders)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, 25, 5, 'dark', true, true]
  );

  const tokens = this.generateTokens(id);

  return {
    user: {
      id,
      first_name,
      last_name,
      email,
      day_streak: 0,
      productivity_score: 0,
      role: 'student',
    },
    ...tokens,
  };
}
  

  static async login(email: string, password: string) {
    // Added 'role' to the SELECT query
    const result = await query(
      'SELECT id, first_name, last_name, email, password_hash, day_streak, productivity_score, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      throw new Error('Invalid email or password');
    }

    const tokens = this.generateTokens(user.id);
    const { password_hash, ...userWithoutPassword } = user;

    // userWithoutPassword now includes 'role' (defaults to 'student' if null)
    return {
      user: { ...userWithoutPassword, role: user.role || 'student' },
      ...tokens,
    };
  }

  static generateTokens(userId: string) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      { expiresIn: '7d' }
    );

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}