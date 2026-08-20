-- ============================================================
-- BatchHub — Database Schema
-- Run this in Supabase SQL Editor to set up the database
-- ============================================================

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SUBJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  code       TEXT,
  color      TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  content     TEXT,
  type        TEXT NOT NULL CHECK (type IN ('assignment', 'lab', 'notice', 'deadline', 'resource', 'important')),
  subject_id  UUID REFERENCES subjects(id) ON DELETE SET NULL,
  is_pinned   BOOLEAN DEFAULT false,
  status      TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  due_date    TIMESTAMPTZ,
  tags        TEXT[] DEFAULT '{}',
  links       JSONB DEFAULT '[]',
  batch_id    TEXT DEFAULT 'default',
  created_by  TEXT DEFAULT 'admin',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- ATTACHMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS attachments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  file_name  TEXT NOT NULL,
  file_url   TEXT NOT NULL,
  file_size  BIGINT,
  file_type  TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_subject ON posts(subject_id);
CREATE INDEX IF NOT EXISTS idx_posts_due_date ON posts(due_date);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_is_pinned ON posts(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_posts_batch ON posts(batch_id);
CREATE INDEX IF NOT EXISTS idx_attachments_post ON attachments(post_id);

-- Full-text search index on title and content
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_posts_updated_at ON posts;
CREATE TRIGGER trigger_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Public read access (anon can SELECT)
CREATE POLICY "Public read subjects"  ON subjects  FOR SELECT USING (true);
CREATE POLICY "Public read posts"     ON posts     FOR SELECT USING (status = 'published');
CREATE POLICY "Public read attachments" ON attachments FOR SELECT USING (true);

-- Service role has full access (used by Edge Functions)
CREATE POLICY "Service role full access subjects" ON subjects
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access posts" ON posts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access attachments" ON attachments
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- ADMIN LOGIN ATTEMPTS TABLE (Global Rate Limiting)
-- Tracks all login attempts for persistent, cross-IP rate limiting
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip          TEXT NOT NULL DEFAULT 'unknown',
  fingerprint TEXT,
  success     BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON admin_login_attempts(attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON admin_login_attempts(success) WHERE success = false;
CREATE INDEX IF NOT EXISTS idx_login_attempts_fingerprint ON admin_login_attempts(fingerprint) WHERE fingerprint IS NOT NULL;

-- RLS: No public access — only service role can read/write
ALTER TABLE admin_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access login_attempts" ON admin_login_attempts
  FOR ALL USING (auth.role() = 'service_role');
