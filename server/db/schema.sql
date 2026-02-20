-- ============================================
-- Storia Database Schema (v2 — uses Supabase Auth)
-- Run this in: https://supabase.com/dashboard/project/qbsoedfpjyyvqkkmshea/sql/new
-- ============================================

-- Stories table (links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free',
  monthly_used INT DEFAULT 0,
  monthly_limit INT DEFAULT 5,
  bundles_remaining INT DEFAULT 0,
  total_generated INT DEFAULT 0,
  next_reset_date TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_public ON stories(is_public) WHERE is_public = TRUE;

-- Disable Row Level Security (server uses service_role key which bypasses RLS anyway)
ALTER TABLE stories DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
