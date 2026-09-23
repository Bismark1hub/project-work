import { Pool } from 'pg';

export const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'smart_study',
  user: 'postgres',
  password: 'password',
});

export async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result;
}