-- ============================================
-- FORCE FIX RLS POLICIES - Run this in Supabase SQL Editor
-- This will completely reset and fix all RLS policies
-- ============================================

-- First, drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can view post likes" ON post_likes;
DROP POLICY IF EXISTS "Authenticated users can like posts" ON post_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON post_likes;
DROP POLICY IF EXISTS "Users can view post likes" ON post_likes;
DROP POLICY IF EXISTS "Users can create post likes" ON post_likes;
DROP POLICY IF EXISTS "Users can delete their own post likes" ON post_likes;

DROP POLICY IF EXISTS "Authenticated users can view retweets" ON retweets;
DROP POLICY IF EXISTS "Authenticated users can retweet posts" ON retweets;
DROP POLICY IF EXISTS "Users can delete their own retweets" ON retweets;
DROP POLICY IF EXISTS "Users can view retweets" ON retweets;
DROP POLICY IF EXISTS "Users can create retweets" ON retweets;
DROP POLICY IF EXISTS "Users can delete own retweets" ON retweets;

DROP POLICY IF EXISTS "Authenticated users can view bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Authenticated users can bookmark posts" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can view bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can create bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE retweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POST_LIKES POLICIES
-- ============================================

-- Allow authenticated users to view all post likes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'post_likes' AND policyname = 'Anyone can view post likes'
    ) THEN
        CREATE POLICY "Anyone can view post likes"
        ON post_likes
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END $$;

-- Allow authenticated users to insert their own likes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'post_likes' AND policyname = 'Users can create their own post likes'
    ) THEN
        CREATE POLICY "Users can create their own post likes"
        ON post_likes
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Allow users to delete their own likes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'post_likes' AND policyname = 'Users can delete their own post likes'
    ) THEN
        CREATE POLICY "Users can delete their own post likes"
        ON post_likes
        FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- RETWEETS POLICIES
-- ============================================

-- Allow authenticated users to view all retweets
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'retweets' AND policyname = 'Anyone can view retweets'
    ) THEN
        CREATE POLICY "Anyone can view retweets"
        ON retweets
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END $$;

-- Allow authenticated users to insert their own retweets
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'retweets' AND policyname = 'Users can create their own retweets'
    ) THEN
        CREATE POLICY "Users can create their own retweets"
        ON retweets
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Allow users to delete their own retweets
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'retweets' AND policyname = 'Users can delete their own retweets'
    ) THEN
        CREATE POLICY "Users can delete their own retweets"
        ON retweets
        FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- BOOKMARKS POLICIES
-- ============================================

-- Allow authenticated users to view all bookmarks
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bookmarks' AND policyname = 'Anyone can view bookmarks'
    ) THEN
        CREATE POLICY "Anyone can view bookmarks"
        ON bookmarks
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END $$;

-- Allow authenticated users to insert their own bookmarks
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bookmarks' AND policyname = 'Users can create their own bookmarks'
    ) THEN
        CREATE POLICY "Users can create their own bookmarks"
        ON bookmarks
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Allow users to delete their own bookmarks
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bookmarks' AND policyname = 'Users can delete their own bookmarks'
    ) THEN
        CREATE POLICY "Users can delete their own bookmarks"
        ON bookmarks
        FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- VERIFY SETUP
-- ============================================

-- Check RLS is enabled (should show 't' for all)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('post_likes', 'retweets', 'bookmarks');

-- Check policies exist (should show 9 policies: 3 per table)
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('post_likes', 'retweets', 'bookmarks')
GROUP BY tablename
ORDER BY tablename;

-- Show all policies
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('post_likes', 'retweets', 'bookmarks')
ORDER BY tablename, cmd;
