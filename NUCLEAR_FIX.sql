-- ============================================
-- NUCLEAR OPTION - Complete database fix with cache reload
-- Run this to fix everything and reload PostgREST schema cache
-- ============================================

-- Step 1: Reload PostgREST schema cache (CRITICAL!)
NOTIFY pgrst, 'reload schema';

-- Step 1.5: Ensure profiles table has proper foreign key to auth.users
DO $$
BEGIN
    -- Check if profiles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        -- Drop existing constraint if it exists
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
        
        -- Add foreign key to auth.users
        ALTER TABLE profiles 
        ADD CONSTRAINT profiles_id_fkey 
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Add comment to help PostgREST understand the relationship
        COMMENT ON CONSTRAINT profiles_id_fkey ON profiles IS 'Foreign key to auth.users';
    END IF;
END $$;

-- Step 2: Drop and recreate tables with correct structure
-- This ensures clean slate

-- ============================================
-- RETWEETS TABLE
-- ============================================

-- Drop and recreate retweets
DROP TABLE IF EXISTS retweets CASCADE;

CREATE TABLE retweets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    comments_count INTEGER DEFAULT 0,
    UNIQUE(post_id, user_id),
    -- Add foreign key to auth.users
    CONSTRAINT retweets_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE retweets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view retweets"
ON retweets FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create retweets"
ON retweets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own retweets"
ON retweets FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_retweets_post_id ON retweets(post_id);
CREATE INDEX idx_retweets_user_id ON retweets(user_id);
CREATE INDEX idx_retweets_created_at ON retweets(created_at);

-- Add foreign key relationship comment for PostgREST
COMMENT ON CONSTRAINT retweets_user_fkey ON retweets IS 'Foreign key to profiles via auth.users';

-- ============================================
-- POST_LIKES TABLE
-- ============================================

-- Drop and recreate post_likes
DROP TABLE IF EXISTS post_likes CASCADE;

CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view post likes"
ON post_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create likes"
ON post_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON post_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);

-- ============================================
-- BOOKMARKS TABLE
-- ============================================

-- Drop and recreate bookmarks
DROP TABLE IF EXISTS bookmarks CASCADE;

CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view bookmarks"
ON bookmarks FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create bookmarks"
ON bookmarks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON bookmarks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_bookmarks_post_id ON bookmarks(post_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

-- ============================================
-- COMMENTS TABLE
-- ============================================

-- Fix comments table structure
DO $$
BEGIN
    -- Add foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_user_fkey' 
        AND table_name = 'comments'
    ) THEN
        ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
        ALTER TABLE comments 
        ADD CONSTRAINT comments_user_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Create policies
CREATE POLICY "Anyone can view comments"
ON comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- ============================================
-- COMMENT_LIKES TABLE
-- ============================================

-- Fix comment_likes table
DO $$
BEGIN
    -- Create table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comment_likes') THEN
        CREATE TABLE comment_likes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
            user_id UUID NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(comment_id, user_id),
            CONSTRAINT comment_likes_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
        );
    ELSE
        -- Add foreign key if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'comment_likes_user_fkey' 
            AND table_name = 'comment_likes'
        ) THEN
            ALTER TABLE comment_likes DROP CONSTRAINT IF EXISTS comment_likes_user_id_fkey;
            ALTER TABLE comment_likes 
            ADD CONSTRAINT comment_likes_user_fkey 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Authenticated users can like comments" ON comment_likes;
DROP POLICY IF EXISTS "Users can unlike comments" ON comment_likes;

-- Create policies
CREATE POLICY "Anyone can view comment likes"
ON comment_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like comments"
ON comment_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
ON comment_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- ============================================
-- RELOAD SCHEMA CACHE AGAIN
-- ============================================

NOTIFY pgrst, 'reload schema';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check tables exist
SELECT 'Tables:' as check_type, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('post_likes', 'retweets', 'bookmarks');

-- Check columns
SELECT 'Columns:' as check_type, table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('post_likes', 'retweets', 'bookmarks')
ORDER BY table_name, ordinal_position;

-- Check foreign keys
SELECT 'Foreign Keys:' as check_type, tc.table_name, tc.constraint_name, kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('post_likes', 'retweets', 'bookmarks');

-- Check policies
SELECT 'Policies:' as check_type, tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('post_likes', 'retweets', 'bookmarks')
ORDER BY tablename;
