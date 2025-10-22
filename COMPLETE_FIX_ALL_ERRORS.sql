-- ============================================
-- COMPLETE FIX - Run this ONE file to fix all errors
-- This fixes both 406 (RLS) and 400 (foreign key) errors
-- ============================================

-- ============================================
-- STEP 1: Add missing columns and foreign keys
-- ============================================

-- Fix retweets table
DO $$ 
BEGIN
    -- Add user_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'retweets' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE retweets ADD COLUMN user_id UUID;
    END IF;
    
    -- Add post_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'retweets' AND column_name = 'post_id'
    ) THEN
        ALTER TABLE retweets ADD COLUMN post_id UUID;
    END IF;
END $$;

-- Fix post_likes table
DO $$ 
BEGIN
    -- Add user_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'post_likes' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE post_likes ADD COLUMN user_id UUID;
    END IF;
    
    -- Add post_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'post_likes' AND column_name = 'post_id'
    ) THEN
        ALTER TABLE post_likes ADD COLUMN post_id UUID;
    END IF;
END $$;

-- Fix bookmarks table
DO $$ 
BEGIN
    -- Add user_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookmarks' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE bookmarks ADD COLUMN user_id UUID;
    END IF;
    
    -- Add post_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookmarks' AND column_name = 'post_id'
    ) THEN
        ALTER TABLE bookmarks ADD COLUMN post_id UUID;
    END IF;
END $$;

-- ============================================
-- STEP 2: Add foreign key constraints
-- ============================================

-- Retweets foreign keys
DO $$ 
BEGIN
    -- Drop existing constraints if they exist
    ALTER TABLE retweets DROP CONSTRAINT IF EXISTS retweets_user_id_fkey;
    ALTER TABLE retweets DROP CONSTRAINT IF EXISTS retweets_post_id_fkey;
    
    -- Add foreign keys
    ALTER TABLE retweets 
    ADD CONSTRAINT retweets_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    
    ALTER TABLE retweets 
    ADD CONSTRAINT retweets_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
END $$;

-- Post_likes foreign keys
DO $$ 
BEGIN
    -- Drop existing constraints if they exist
    ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;
    ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS post_likes_post_id_fkey;
    
    -- Add foreign keys
    ALTER TABLE post_likes 
    ADD CONSTRAINT post_likes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    
    ALTER TABLE post_likes 
    ADD CONSTRAINT post_likes_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
END $$;

-- Bookmarks foreign keys
DO $$ 
BEGIN
    -- Drop existing constraints if they exist
    ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;
    ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_post_id_fkey;
    
    -- Add foreign keys
    ALTER TABLE bookmarks 
    ADD CONSTRAINT bookmarks_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    
    ALTER TABLE bookmarks 
    ADD CONSTRAINT bookmarks_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
END $$;

-- ============================================
-- STEP 3: Fix RLS policies (allow public read)
-- ============================================

-- Enable RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE retweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Public can view post likes" ON post_likes;
DROP POLICY IF EXISTS "Authenticated can create post likes" ON post_likes;
DROP POLICY IF EXISTS "Users can delete own post likes" ON post_likes;
DROP POLICY IF EXISTS "Anyone can view post likes" ON post_likes;
DROP POLICY IF EXISTS "Users can create their own post likes" ON post_likes;
DROP POLICY IF EXISTS "Users can delete their own post likes" ON post_likes;

DROP POLICY IF EXISTS "Public can view retweets" ON retweets;
DROP POLICY IF EXISTS "Authenticated can create retweets" ON retweets;
DROP POLICY IF EXISTS "Users can delete own retweets" ON retweets;
DROP POLICY IF EXISTS "Anyone can view retweets" ON retweets;
DROP POLICY IF EXISTS "Users can create their own retweets" ON retweets;
DROP POLICY IF EXISTS "Users can delete their own retweets" ON retweets;

DROP POLICY IF EXISTS "Public can view bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Authenticated can create bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Anyone can view bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;

-- Create new policies with public read access
-- POST_LIKES
CREATE POLICY "Enable read access for all users"
ON post_likes FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON post_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id"
ON post_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RETWEETS
CREATE POLICY "Enable read access for all users"
ON retweets FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON retweets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id"
ON retweets FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- BOOKMARKS
CREATE POLICY "Enable read access for all users"
ON bookmarks FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON bookmarks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id"
ON bookmarks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- STEP 4: Add indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_retweets_post_id ON retweets(post_id);
CREATE INDEX IF NOT EXISTS idx_retweets_user_id ON retweets(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

-- ============================================
-- STEP 5: Add unique constraints (prevent duplicates)
-- ============================================

DO $$
BEGIN
    -- Post likes
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_post_like'
    ) THEN
        ALTER TABLE post_likes 
        ADD CONSTRAINT unique_post_like 
        UNIQUE(post_id, user_id);
    END IF;
    
    -- Retweets
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_retweet'
    ) THEN
        ALTER TABLE retweets 
        ADD CONSTRAINT unique_retweet 
        UNIQUE(post_id, user_id);
    END IF;
    
    -- Bookmarks
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_bookmark'
    ) THEN
        ALTER TABLE bookmarks 
        ADD CONSTRAINT unique_bookmark 
        UNIQUE(post_id, user_id);
    END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check foreign keys (should show 6 rows)
SELECT 
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS references_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('post_likes', 'retweets', 'bookmarks')
ORDER BY tc.table_name;

-- Check RLS policies (should show 9 rows: 3 per table)
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('post_likes', 'retweets', 'bookmarks')
ORDER BY tablename, cmd;

-- Check unique constraints (should show 3 rows)
SELECT conname, conrelid::regclass AS table_name
FROM pg_constraint
WHERE conname IN ('unique_post_like', 'unique_retweet', 'unique_bookmark');

-- Show table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('post_likes', 'retweets', 'bookmarks')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
