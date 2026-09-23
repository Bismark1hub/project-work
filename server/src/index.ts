import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import scheduleRoutes from './routes/schedule.routes';
import courseRoutes from './routes/course.routes';
import taskRoutes from './routes/task.routes';
import settingsRoutes from './routes/settings.routes';
import analyticsRoutes from './routes/analytics.routes';
import insightRoutes from './routes/insight.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import pushRoutes from './routes/push.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// CORS — allow localhost (dev) and production origins
// ============================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.CORS_ORIGIN,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ============================================
// Middleware
// ============================================
app.use(express.json());

// ============================================
// Health check
// ============================================
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

// ============================================
// Routes
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/push', pushRoutes);

// ============================================
// Start
// ============================================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Allowed CORS origins:`, allowedOrigins);
});
