-- ==========================================
-- EngageTracker MVP - Database Enhancements
-- Adds: ICP scoring, contacted tracking, monitoring, subscription limits
-- ==========================================

-- ==========================================
-- STEP 1: Add fields to POSTS table
-- ==========================================

-- Add clerk_user_id to link posts to users
ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  clerk_user_id TEXT REFERENCES users(clerk_user_id) ON DELETE CASCADE;

-- Update existing posts to have a clerk_user_id (from their scraping_jobs)
UPDATE posts p
SET clerk_user_id = (
  SELECT sj.clerk_user_id
  FROM scraping_jobs sj
  WHERE sj.post_url = p.url
  LIMIT 1
)
WHERE p.clerk_user_id IS NULL;

-- Now make it NOT NULL
ALTER TABLE posts ALTER COLUMN clerk_user_id SET NOT NULL;

-- Add monitoring fields
ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  last_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  next_scrape_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  scrape_frequency TEXT DEFAULT 'daily' CHECK (scrape_frequency IN ('daily', 'weekly', 'manual'));

ALTER TABLE posts ADD COLUMN IF NOT EXISTS
  is_active BOOLEAN DEFAULT true;

-- ==========================================
-- STEP 2: Add fields to ENGAGEMENTS table
-- ==========================================

ALTER TABLE engagements ADD COLUMN IF NOT EXISTS
  icp_score INTEGER CHECK (icp_score >= 0 AND icp_score <= 100);

ALTER TABLE engagements ADD COLUMN IF NOT EXISTS
  icp_fit TEXT CHECK (icp_fit IN ('high', 'medium', 'low'));

ALTER TABLE engagements ADD COLUMN IF NOT EXISTS
  icp_reasoning TEXT;

ALTER TABLE engagements ADD COLUMN IF NOT EXISTS
  contacted BOOLEAN DEFAULT false;

ALTER TABLE engagements ADD COLUMN IF NOT EXISTS
  contacted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE engagements ADD COLUMN IF NOT EXISTS
  hidden BOOLEAN DEFAULT false;

ALTER TABLE engagements ADD COLUMN IF NOT EXISTS
  notes TEXT;

-- ==========================================
-- STEP 3: Add post_id reference to SCRAPING_JOBS
-- ==========================================

ALTER TABLE scraping_jobs ADD COLUMN IF NOT EXISTS
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE;

-- ==========================================
-- STEP 4: Create ICP_PROFILES table
-- ==========================================

CREATE TABLE IF NOT EXISTS icp_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  target_industries TEXT[],
  target_seniorities TEXT[],
  company_size_min INTEGER,
  company_size_max INTEGER,
  additional_criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_icp_user FOREIGN KEY (clerk_user_id)
    REFERENCES users(clerk_user_id) ON DELETE CASCADE
);

-- ==========================================
-- STEP 5: Create USER_LIMITS table
-- ==========================================

CREATE TABLE IF NOT EXISTS user_limits (
  clerk_user_id TEXT PRIMARY KEY,
  max_posts INTEGER DEFAULT 3,
  max_engagements_per_post INTEGER DEFAULT 500,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_limits_user FOREIGN KEY (clerk_user_id)
    REFERENCES users(clerk_user_id) ON DELETE CASCADE
);

-- ==========================================
-- STEP 6: Create indexes for performance
-- ==========================================

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_active
  ON posts(clerk_user_id, is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_posts_scrape_schedule
  ON posts(next_scrape_at)
  WHERE is_active = true AND next_scrape_at IS NOT NULL;

-- Engagements indexes
CREATE INDEX IF NOT EXISTS idx_engagements_contacted
  ON engagements(contacted, hidden);

CREATE INDEX IF NOT EXISTS idx_engagements_icp_score
  ON engagements(icp_score DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_engagements_post_user
  ON engagements(post_id, clerk_user_id);

-- Scraping jobs indexes
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_post
  ON scraping_jobs(post_id);

-- ==========================================
-- STEP 7: Update RLS policies for new tables
-- ==========================================

-- ICP Profiles RLS
ALTER TABLE icp_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own ICP profile" ON icp_profiles;
CREATE POLICY "Users can view own ICP profile" ON icp_profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt()->>'sub') = clerk_user_id);

DROP POLICY IF EXISTS "Users can create own ICP profile" ON icp_profiles;
CREATE POLICY "Users can create own ICP profile" ON icp_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.jwt()->>'sub') = clerk_user_id);

DROP POLICY IF EXISTS "Users can update own ICP profile" ON icp_profiles;
CREATE POLICY "Users can update own ICP profile" ON icp_profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.jwt()->>'sub') = clerk_user_id);

-- User Limits RLS
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own limits" ON user_limits;
CREATE POLICY "Users can view own limits" ON user_limits
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt()->>'sub') = clerk_user_id);

-- ==========================================
-- STEP 8: Create helper functions
-- ==========================================

-- Function to auto-create user limits on user creation
CREATE OR REPLACE FUNCTION create_default_user_limits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_limits (clerk_user_id, plan_type, max_posts, max_engagements_per_post)
  VALUES (NEW.clerk_user_id, 'free', 3, 500)
  ON CONFLICT (clerk_user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create limits when user is created
DROP TRIGGER IF EXISTS create_user_limits ON users;
CREATE TRIGGER create_user_limits
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_limits();

-- Function to update ICP profile updated_at
CREATE OR REPLACE FUNCTION update_icp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ICP profile updates
DROP TRIGGER IF EXISTS update_icp_profiles_updated_at ON icp_profiles;
CREATE TRIGGER update_icp_profiles_updated_at
  BEFORE UPDATE ON icp_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_icp_updated_at();

-- ==========================================
-- STEP 9: Verification
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '✓ MVP Database Enhancements completed successfully!';
  RAISE NOTICE '✓ New fields added to posts table';
  RAISE NOTICE '✓ New fields added to engagements table';
  RAISE NOTICE '✓ ICP profiles table created';
  RAISE NOTICE '✓ User limits table created';
  RAISE NOTICE '✓ Indexes created for performance';
  RAISE NOTICE '✓ RLS policies configured';
  RAISE NOTICE '✓ Helper functions and triggers created';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Run this migration in Supabase SQL Editor';
  RAISE NOTICE '2. Verify all tables have new columns';
  RAISE NOTICE '3. Start building the dashboard UI';
END $$;
