
-- 1. USERS
CREATE TABLE users (
    id                  UUID PRIMARY KEY,
    first_name          VARCHAR(50) NOT NULL,
    last_name           VARCHAR(50) NOT NULL,
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    google_id           VARCHAR(255),
    avatar_url          TEXT,
    role                VARCHAR(20) DEFAULT 'student',
    day_streak          INTEGER DEFAULT 0,
    productivity_score  INTEGER DEFAULT 0,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- 2. USER SETTINGS
CREATE TABLE user_settings (
    user_id                 UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    pomodoro_focus_mins     INTEGER DEFAULT 25,
    pomodoro_break_mins     INTEGER DEFAULT 5,
    theme                   VARCHAR(10) DEFAULT 'dark',
    notif_academic_analytics BOOLEAN DEFAULT true,
    notif_study_reminders   BOOLEAN DEFAULT true
);

-- 3. COURSES
CREATE TABLE courses (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code            VARCHAR(20) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    difficulty      VARCHAR(10) DEFAULT 'medium',
    retention_pct   INTEGER DEFAULT 0,
    color           VARCHAR(7) DEFAULT '#F5C518',
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 4. SCHEDULE SESSIONS
CREATE TABLE schedule_sessions (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id       UUID REFERENCES courses(id) ON DELETE SET NULL,
    title           VARCHAR(200) NOT NULL,
    focus_topic     VARCHAR(200),
    start_time      TIMESTAMP NOT NULL,
    end_time        TIMESTAMP NOT NULL,
    status          VARCHAR(20) DEFAULT 'planned',
    is_urgent       BOOLEAN DEFAULT false,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 5. TASKS
CREATE TABLE tasks (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id       UUID REFERENCES courses(id) ON DELETE SET NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) DEFAULT 'todo',
    priority        VARCHAR(10) DEFAULT 'mid',
    due_date        TIMESTAMP NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 6. BEHAVIOR LOGS
CREATE TABLE behavior_logs (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id      UUID REFERENCES schedule_sessions(id) ON DELETE SET NULL,
    scheduled_at    TIMESTAMP,
    actual_start    TIMESTAMP,
    actual_end      TIMESTAMP,
    status          VARCHAR(20),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 7. INSIGHTS
CREATE TABLE insights (
    id                  UUID PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                VARCHAR(50) NOT NULL,
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    confidence_score    INTEGER DEFAULT 0,
    recommendation      TEXT,
    status              VARCHAR(20) DEFAULT 'pending',
    metadata            JSONB,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- 8. NOTIFICATIONS
CREATE TABLE notifications (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    body            TEXT,
    read            BOOLEAN DEFAULT false,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- 9. PUSH SUBSCRIPTIONS
CREATE TABLE push_subscriptions (
    id              UUID PRIMARY KEY,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint        TEXT NOT NULL,
    p256dh          TEXT NOT NULL,
    auth            TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, endpoint)
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_sessions_user_id ON schedule_sessions(user_id);
CREATE INDEX idx_sessions_start_time ON schedule_sessions(start_time);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_behavior_logs_user_id ON behavior_logs(user_id);
CREATE INDEX idx_behavior_logs_scheduled_at ON behavior_logs(scheduled_at);
CREATE INDEX idx_insights_user_id ON insights(user_id);
CREATE INDEX idx_insights_status ON insights(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
