import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('WARNING: DATABASE_URL is not set. Database connections will fail.');
}

export const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Query executed', { duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function testConnection(): Promise<void> {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}
