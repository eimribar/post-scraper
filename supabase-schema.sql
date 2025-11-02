-- EngageTracker Database Schema with Clerk Authentication
-- Run this SQL in your Supabase SQL Editor

-- 1. Users Table (synced from Clerk via webhook)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT UNIQUE NOT NULL,
  author_name TEXT,
  author_headline TEXT,
  content TEXT,
  total_reactions INTEGER DEFAULT 0,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Scraping Jobs Table
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  post_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  apify_run_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Engagements Table
CREATE TABLE IF NOT EXISTS engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  scraping_job_id UUID REFERENCES scraping_jobs(id) ON DELETE CASCADE,
  clerk_user_id TEXT NOT NULL REFERENCES users(clerk_user_id) ON DELETE CASCADE,
  linkedin_profile_url TEXT,
  name TEXT NOT NULL,
  headline TEXT,
  title TEXT,
  company TEXT,
  profile_image_url TEXT,
  reaction_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_user ON scraping_jobs(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_engagements_job ON engagements(scraping_job_id);
CREATE INDEX IF NOT EXISTS idx_engagements_user ON engagements(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_engagements_post ON engagements(post_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users Table
-- Users can only read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  USING ((SELECT auth.jwt()->>'sub') = clerk_user_id);

-- Service role (webhooks) can insert/update users
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update users" ON users
  FOR UPDATE
  USING (true);

-- RLS Policies for Scraping Jobs
-- Users can only see their own jobs
CREATE POLICY "Users can view own jobs" ON scraping_jobs
  FOR SELECT
  USING ((SELECT auth.jwt()->>'sub') = clerk_user_id);

-- Users can create their own jobs
CREATE POLICY "Users can create jobs" ON scraping_jobs
  FOR INSERT
  WITH CHECK ((SELECT auth.jwt()->>'sub') = clerk_user_id);

-- Users can update their own jobs
CREATE POLICY "Users can update own jobs" ON scraping_jobs
  FOR UPDATE
  USING ((SELECT auth.jwt()->>'sub') = clerk_user_id);

-- RLS Policies for Engagements
-- Users can only see engagements from their own jobs
CREATE POLICY "Users can view own engagements" ON engagements
  FOR SELECT
  USING ((SELECT auth.jwt()->>'sub') = clerk_user_id);

-- Service role can insert engagements (from webhook/poll)
CREATE POLICY "Service role can insert engagements" ON engagements
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for Posts
-- Anyone authenticated can read posts (they might be shared across users)
CREATE POLICY "Authenticated users can view posts" ON posts
  FOR SELECT
  USING (true);

-- Service role can insert/update posts
CREATE POLICY "Service role can manage posts" ON posts
  FOR ALL
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
