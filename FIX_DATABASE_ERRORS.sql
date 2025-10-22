-- Fix Database Relationships and RLS Policies
-- Run this to fix the 406 and 400 errors

-- ============================================================
-- FIX RETWEETS TABLE FOREIGN KEY
-- ============================================================

-- First, check if retweets table has correct foreign key
DO $$ 
BEGIN
    -- Ensure user_id column exists in retweets
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'retweets' AND column_name = 'user_id') THEN
        ALTER TABLE public.retweets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure post_id column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'retweets' AND column_name = 'post_id') THEN
        ALTER TABLE public.retweets ADD COLUMN post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure created_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'retweets' AND column_name = 'created_at') THEN
        ALTER TABLE public.retweets ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- Create unique constraint for retweets (prevent duplicates)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_retweet'
    ) THEN
        ALTER TABLE public.retweets ADD CONSTRAINT unique_retweet UNIQUE(post_id, user_id);
    END IF;
END $$;

-- ============================================================
-- FIX POST_LIKES TABLE
-- ============================================================

DO $$ 
BEGIN
    -- Ensure post_id column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_likes' AND column_name = 'post_id') THEN
        ALTER TABLE public.post_likes ADD COLUMN post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure user_id column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_likes' AND column_name = 'user_id') THEN
        ALTER TABLE public.post_likes ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure created_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'post_likes' AND column_name = 'created_at') THEN
        ALTER TABLE public.post_likes ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- Create unique constraint for post_likes (prevent duplicates)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_post_like'
    ) THEN
        ALTER TABLE public.post_likes ADD CONSTRAINT unique_post_like UNIQUE(post_id, user_id);
    END IF;
END $$;

-- ============================================================
-- FIX BOOKMARKS TABLE
-- ============================================================

DO $$ 
BEGIN
    -- Ensure post_id column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookmarks' AND column_name = 'post_id') THEN
        ALTER TABLE public.bookmarks ADD COLUMN post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure user_id column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookmarks' AND column_name = 'user_id') THEN
        ALTER TABLE public.bookmarks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure created_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'bookmarks' AND column_name = 'created_at') THEN
        ALTER TABLE public.bookmarks ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- Create unique constraint for bookmarks (prevent duplicates)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_bookmark'
    ) THEN
        ALTER TABLE public.bookmarks ADD CONSTRAINT unique_bookmark UNIQUE(post_id, user_id);
    END IF;
END $$;

-- ============================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_retweets_post_id ON public.retweets(post_id);
CREATE INDEX IF NOT EXISTS idx_retweets_user_id ON public.retweets(user_id);
CREATE INDEX IF NOT EXISTS idx_retweets_created_at ON public.retweets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON public.bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);

-- ============================================================
-- RLS POLICIES FOR POST_LIKES
-- ============================================================

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view post likes" ON public.post_likes;
DROP POLICY IF EXISTS "Authenticated users can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON public.post_likes;

CREATE POLICY "Anyone can view post likes"
ON public.post_likes FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can like posts"
ON public.post_likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
ON public.post_likes FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES FOR RETWEETS
-- ============================================================

ALTER TABLE public.retweets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view retweets" ON public.retweets;
DROP POLICY IF EXISTS "Authenticated users can retweet" ON public.retweets;
DROP POLICY IF EXISTS "Users can unretweet" ON public.retweets;

CREATE POLICY "Anyone can view retweets"
ON public.retweets FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can retweet"
ON public.retweets FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unretweet"
ON public.retweets FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES FOR BOOKMARKS
-- ============================================================

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Authenticated users can bookmark" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can unbookmark" ON public.bookmarks;

CREATE POLICY "Anyone can view bookmarks"
ON public.bookmarks FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can bookmark"
ON public.bookmarks FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unbookmark"
ON public.bookmarks FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS FOR POST LIKES COUNT
-- ============================================================

-- Function to increment likes count
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.posts
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$;

-- Function to decrement likes count
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.posts
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS handle_post_like_increment ON public.post_likes;
CREATE TRIGGER handle_post_like_increment
AFTER INSERT ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION increment_likes_count();

DROP TRIGGER IF EXISTS handle_post_like_decrement ON public.post_likes;
CREATE TRIGGER handle_post_like_decrement
AFTER DELETE ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION decrement_likes_count();

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check post_likes table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'post_likes'
ORDER BY ordinal_position;

-- Check retweets table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'retweets'
ORDER BY ordinal_position;

-- Check bookmarks table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookmarks'
ORDER BY ordinal_position;

-- Check unique constraints
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE constraint_type = 'UNIQUE'
AND table_name IN ('post_likes', 'retweets', 'bookmarks')
ORDER BY table_name;

-- Check RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('post_likes', 'retweets', 'bookmarks')
ORDER BY tablename, policyname;

-- ============================================================
-- NOTES
-- ============================================================
--
-- This fixes:
-- 1. 406 (Not Acceptable) errors - Missing RLS policies
-- 2. 400 (Bad Request) errors - Missing foreign key relationships
-- 3. Duplicate prevention with UNIQUE constraints
-- 4. Auto-count updates with triggers
-- 
-- After running this:
-- - All queries will return proper responses
-- - Duplicate likes/retweets/bookmarks prevented
-- - Counts auto-update on insert/delete
-- - RLS security enforced
--
-- ============================================================
