-- ============================================
-- FORCE FIX FOREIGN KEYS AND RELATIONSHIPS
-- Run this in Supabase SQL Editor AFTER FORCE_FIX_RLS.sql
-- ============================================

-- ============================================
-- 1. FIX RETWEETS TABLE STRUCTURE
-- ============================================

-- First, check if user_id column exists
DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'retweets' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE retweets ADD COLUMN user_id UUID;
    END IF;

    -- Make sure it references auth.users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'retweets_user_id_fkey' 
        AND table_name = 'retweets'
    ) THEN
        ALTER TABLE retweets 
        ADD CONSTRAINT retweets_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 2. FIX POST_LIKES TABLE STRUCTURE
-- ============================================

DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'post_likes' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE post_likes ADD COLUMN user_id UUID;
    END IF;

    -- Add post_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'post_likes' AND column_name = 'post_id'
    ) THEN
        ALTER TABLE post_likes ADD COLUMN post_id UUID;
    END IF;

    -- Add foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'post_likes_user_id_fkey' 
        AND table_name = 'post_likes'
    ) THEN
        ALTER TABLE post_likes 
        ADD CONSTRAINT post_likes_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'post_likes_post_id_fkey' 
        AND table_name = 'post_likes'
    ) THEN
        ALTER TABLE post_likes 
        ADD CONSTRAINT post_likes_post_id_fkey 
        FOREIGN KEY (post_id) 
        REFERENCES posts(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 3. FIX BOOKMARKS TABLE STRUCTURE
-- ============================================

DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookmarks' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE bookmarks ADD COLUMN user_id UUID;
    END IF;

    -- Add post_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookmarks' AND column_name = 'post_id'
    ) THEN
        ALTER TABLE bookmarks ADD COLUMN post_id UUID;
    END IF;

    -- Add foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookmarks_user_id_fkey' 
        AND table_name = 'bookmarks'
    ) THEN
        ALTER TABLE bookmarks 
        ADD CONSTRAINT bookmarks_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookmarks_post_id_fkey' 
        AND table_name = 'bookmarks'
    ) THEN
        ALTER TABLE bookmarks 
        ADD CONSTRAINT bookmarks_post_id_fkey 
        FOREIGN KEY (post_id) 
        REFERENCES posts(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 4. ADD UNIQUE CONSTRAINTS (Prevent Duplicates)
-- ============================================

-- Drop existing constraints if they exist
ALTER TABLE post_likes DROP CONSTRAINT IF EXISTS unique_post_like;
ALTER TABLE retweets DROP CONSTRAINT IF EXISTS unique_retweet;
ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS unique_bookmark;

-- Add new unique constraints
ALTER TABLE post_likes 
ADD CONSTRAINT unique_post_like 
UNIQUE(post_id, user_id);

ALTER TABLE retweets 
ADD CONSTRAINT unique_retweet 
UNIQUE(post_id, user_id);

ALTER TABLE bookmarks 
ADD CONSTRAINT unique_bookmark 
UNIQUE(post_id, user_id);

-- ============================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_post_likes_user_id;
DROP INDEX IF EXISTS idx_post_likes_post_id;
DROP INDEX IF EXISTS idx_retweets_user_id;
DROP INDEX IF EXISTS idx_retweets_post_id;
DROP INDEX IF EXISTS idx_bookmarks_user_id;
DROP INDEX IF EXISTS idx_bookmarks_post_id;

-- Create new indexes
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_retweets_user_id ON retweets(user_id);
CREATE INDEX idx_retweets_post_id ON retweets(post_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_post_id ON bookmarks(post_id);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check foreign keys exist (should return 6 rows)
SELECT 
    tc.table_name, 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('post_likes', 'retweets', 'bookmarks')
ORDER BY tc.table_name, tc.constraint_name;

-- Check unique constraints exist (should return 3 rows)
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc
WHERE tc.constraint_type = 'UNIQUE'
AND tc.table_name IN ('post_likes', 'retweets', 'bookmarks')
ORDER BY tc.table_name;

-- Check indexes exist (should return 6 rows)
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('post_likes', 'retweets', 'bookmarks')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
