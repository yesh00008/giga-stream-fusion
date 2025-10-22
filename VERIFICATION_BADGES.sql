-- ============================================
-- VERIFICATION BADGES SYSTEM
-- ============================================
-- Badge types by category:
-- ORGANIZATIONS (Blue): organization
-- GOVERNMENT (Gold): government
-- EXECUTIVES (Gold): ceo
-- FOUNDERS (Light Red): founder, cofounder
-- LEGACY: verified, official, premium, vip, partner

-- ============================================
-- STEP 1: ENSURE BASE TABLES EXIST
-- ============================================

-- Create posts table if it doesn't exist (with content_type included)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  content_type TEXT DEFAULT 'post',
  media_url TEXT,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table if it doesn't exist (with badge_type included)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  badge_type TEXT,
  badge_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 2: ADD COLUMNS (for existing tables)
-- ============================================

-- Note: content_type column should already exist from SAFE_ADD_CONTENT_TYPE.sql
-- This step is kept for documentation purposes

-- Index for filtering by content type
CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts(content_type);

-- Add badge column to profiles (if table already exists without it)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'badge_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN badge_type TEXT;
  END IF;
END $$;

-- Add badge constraint separately
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_badge_type_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_badge_type_check 
    CHECK (badge_type IN ('verified', 'official', 'premium', 'vip', 'partner', 'founder', 'ceo', 'cofounder', 'government', 'organization'));
  END IF;
END $$;

-- Add badge_verified_at timestamp (if table already exists without it)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'badge_verified_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN badge_verified_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- ============================================
-- STEP 3: CREATE TABLES
-- ============================================

-- Create badge_requests table for users to request verification
CREATE TABLE IF NOT EXISTS badge_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('verified', 'official', 'premium', 'vip', 'partner', 'founder', 'ceo', 'cofounder', 'government', 'organization')),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  content_type TEXT DEFAULT 'post' CHECK (content_type IN ('post', 'reel', 'tweet')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- ============================================
-- STEP 4: ENABLE RLS
-- ============================================

-- Enable RLS on badge_requests
ALTER TABLE badge_requests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: CREATE RLS POLICIES
-- ============================================

-- RLS Policies for badge_requests
DROP POLICY IF EXISTS "Users can view their own badge requests" ON badge_requests;
CREATE POLICY "Users can view their own badge requests"
  ON badge_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own badge requests" ON badge_requests;
CREATE POLICY "Users can create their own badge requests"
  ON badge_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for bookmarks
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookmarks" ON bookmarks;
CREATE POLICY "Users can create their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;
CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- STEP 6: CREATE INDEXES
-- ============================================

-- Index for faster bookmark queries (only if bookmarks table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookmarks') THEN
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON bookmarks(post_id);
    
    -- Only create content_type index if the column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'bookmarks' AND column_name = 'content_type'
    ) THEN
      CREATE INDEX IF NOT EXISTS idx_bookmarks_content_type ON bookmarks(content_type);
    END IF;
  END IF;
END $$;

-- ============================================
-- STEP 7: CREATE FUNCTIONS
-- ============================================

-- Function to grant badge
CREATE OR REPLACE FUNCTION grant_badge(
  target_user_id UUID,
  badge_type_input TEXT
)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    badge_type = badge_type_input,
    badge_verified_at = NOW()
  WHERE id = target_user_id;
  
  UPDATE badge_requests
  SET 
    status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = auth.uid()
  WHERE user_id = target_user_id;
  
  RAISE NOTICE 'Badge % granted to user %', badge_type_input, target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke badge
CREATE OR REPLACE FUNCTION revoke_badge(target_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    badge_type = NULL,
    badge_verified_at = NULL
  WHERE id = target_user_id;
  
  RAISE NOTICE 'Badge revoked from user %', target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- BOOKMARKS SYSTEM FUNCTIONS
-- ============================================

-- Function to toggle bookmark
CREATE OR REPLACE FUNCTION toggle_bookmark(
  target_post_id UUID,
  content_type_input TEXT DEFAULT 'post'
)
RETURNS BOOLEAN AS $$
DECLARE
  bookmark_exists BOOLEAN;
BEGIN
  -- Check if bookmark exists
  SELECT EXISTS(
    SELECT 1 FROM bookmarks 
    WHERE user_id = auth.uid() AND post_id = target_post_id
  ) INTO bookmark_exists;
  
  IF bookmark_exists THEN
    -- Remove bookmark
    DELETE FROM bookmarks 
    WHERE user_id = auth.uid() AND post_id = target_post_id;
    RETURN FALSE; -- Bookmark removed
  ELSE
    -- Add bookmark
    INSERT INTO bookmarks (user_id, post_id, content_type)
    VALUES (auth.uid(), target_post_id, content_type_input)
    ON CONFLICT (user_id, post_id) DO NOTHING;
    RETURN TRUE; -- Bookmark added
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user bookmarks
CREATE OR REPLACE FUNCTION get_user_bookmarks(
  target_user_id UUID,
  content_type_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  bookmark_id UUID,
  post_id UUID,
  content_type TEXT,
  bookmarked_at TIMESTAMP WITH TIME ZONE,
  post_title TEXT,
  post_content TEXT,
  post_author TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id AS bookmark_id,
    b.post_id AS post_id,
    b.content_type AS content_type,
    b.created_at AS bookmarked_at,
    COALESCE(p.title, ''::TEXT) AS post_title,
    COALESCE(p.content, ''::TEXT) AS post_content,
    COALESCE(pr.username, ''::TEXT) AS post_author
  FROM bookmarks b
  LEFT JOIN posts p ON b.post_id = p.id
  LEFT JOIN profiles pr ON p.user_id = pr.id
  WHERE b.user_id = target_user_id
    AND (content_type_filter IS NULL OR b.content_type = content_type_filter)
  ORDER BY b.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Verification badges and bookmarks system installed successfully';
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check badge system
-- SELECT username, badge_type, badge_verified_at FROM profiles WHERE badge_type IS NOT NULL;

-- Check bookmarks
-- SELECT COUNT(*) as total_bookmarks FROM bookmarks;

-- View user's bookmarks
-- SELECT * FROM get_user_bookmarks(auth.uid(), NULL, 20);

-- Grant badge (admin only)
-- SELECT grant_badge('user-uuid-here', 'verified');

-- Revoke badge (admin only)
-- SELECT revoke_badge('user-uuid-here');

-- Toggle bookmark
-- SELECT toggle_bookmark('post-uuid-here', 'post');

DO $$ 
BEGIN
  RAISE NOTICE '✅ Verification badges and bookmarks system installed successfully';
END $$;
