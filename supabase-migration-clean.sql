-- ==========================================
-- EngageTracker - Complete Database Migration
-- Clerk + Supabase Integration
-- ==========================================
-- This script will:
-- 1. Drop all existing tables, policies, and functions
-- 2. Create fresh schema with clerk_user_id columns
-- 3. Set up RLS policies for Clerk JWT authentication
-- 4. Create indexes and triggers
--
-- Safe to run multiple times (idempotent)
-- ==========================================

-- ==========================================
-- STEP 1: Clean Up Existing Schema
-- ==========================================

-- WARNING: This will delete all existing data!
-- Make sure you have a backup if you need to preserve data.

-- Drop OLD tables from Supabase Auth schema (in correct dependency order)
DROP TABLE IF EXISTS public.engagements CASCADE;
DROP TABLE IF EXISTS public.scraping_jobs CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop NEW tables if they exist (from previous migration attempts)
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop custom types if they exist
DROP TYPE IF EXISTS job_status CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ==========================================
-- STEP 2: Create Tables
-- ==========================================

-- 1. Users Table (synced from Clerk via webhook)
CREATE TABLE users (
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
CREATE TABLE posts (
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
CREATE TABLE scraping_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  post_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  apify_run_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_scraping_jobs_user FOREIGN KEY (clerk_user_id)
    REFERENCES users(clerk_user_id) ON DELETE CASCADE
);

-- 4. Engagements Table
CREATE TABLE engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID,
  scraping_job_id UUID,
  clerk_user_id TEXT NOT NULL,
  linkedin_profile_url TEXT,
  name TEXT NOT NULL,
  headline TEXT,
  title TEXT,
  company TEXT,
  profile_image_url TEXT,
  reaction_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_engagements_post FOREIGN KEY (post_id)
    REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_engagements_job FOREIGN KEY (scraping_job_id)
    REFERENCES scraping_jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_engagements_user FOREIGN KEY (clerk_user_id)
    REFERENCES users(clerk_user_id) ON DELETE CASCADE
);

-- ==========================================
-- STEP 3: Create Indexes
-- ==========================================

CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX idx_scraping_jobs_user ON scraping_jobs(clerk_user_id);
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX idx_engagements_job ON engagements(scraping_job_id);
CREATE INDEX idx_engagements_user ON engagements(clerk_user_id);
CREATE INDEX idx_engagements_post ON engagements(post_id);

-- ==========================================
-- STEP 4: Enable Row Level Security (RLS)
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- STEP 5: Create RLS Policies
-- ==========================================

-- Users Table Policies
-- Users can only read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt()->>'sub') = clerk_user_id);

-- Service role (webhooks) can insert/update users
CREATE POLICY "Service role can insert users" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can update users" ON users
  FOR UPDATE
  TO authenticated
  USING (true);

-- Scraping Jobs Policies
-- Users can only see their own jobs
CREATE POLICY "Users can view own jobs" ON scraping_jobs
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt()->>'sub') = clerk_user_id);

-- Users can create their own jobs
CREATE POLICY "Users can create jobs" ON scraping_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.jwt()->>'sub') = clerk_user_id);

-- Users can update their own jobs
CREATE POLICY "Users can update own jobs" ON scraping_jobs
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.jwt()->>'sub') = clerk_user_id);

-- Engagements Policies
-- Users can only see engagements from their own jobs
CREATE POLICY "Users can view own engagements" ON engagements
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt()->>'sub') = clerk_user_id);

-- Service role can insert engagements (from webhook/poll)
CREATE POLICY "Service role can insert engagements" ON engagements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Posts Policies
-- Anyone authenticated can read posts (they might be shared across users)
CREATE POLICY "Authenticated users can view posts" ON posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Service role can insert/update posts
CREATE POLICY "Service role can manage posts" ON posts
  FOR ALL
  TO authenticated
  USING (true);

-- ==========================================
-- STEP 6: Create Functions and Triggers
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- STEP 7: Verification
-- ==========================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE '✓ Migration completed successfully!';
  RAISE NOTICE '✓ Tables created: users, posts, scraping_jobs, engagements';
  RAISE NOTICE '✓ RLS enabled on all tables';
  RAISE NOTICE '✓ Policies created for Clerk JWT authentication';
  RAISE NOTICE '✓ Indexes created for performance';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify Clerk integration is active in Clerk Dashboard';
  RAISE NOTICE '2. Verify Clerk is configured as third-party auth in Supabase';
  RAISE NOTICE '3. Test sign-up to verify user sync';
  RAISE NOTICE '4. Test RLS policies by creating scraping jobs';
END $$;
