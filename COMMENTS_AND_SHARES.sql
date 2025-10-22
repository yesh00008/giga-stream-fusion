-- Comments and Shares Tables
-- Run this in Supabase SQL Editor to add comments functionality

-- ============================================================
-- COMMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT comments_content_length CHECK (char_length(content) <= 1000)
);

-- Create indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- ============================================================
-- ADD SHARES_COUNT TO POSTS TABLE
-- ============================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'shares_count') THEN
        ALTER TABLE public.posts ADD COLUMN shares_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'retweets_count') THEN
        ALTER TABLE public.posts ADD COLUMN retweets_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================================
-- RLS POLICIES FOR COMMENTS
-- ============================================================

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

-- Allow anyone to view comments
CREATE POLICY "Anyone can view comments"
ON public.comments
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to create comments
CREATE POLICY "Authenticated users can create comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments"
ON public.comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to increment shares count
CREATE OR REPLACE FUNCTION increment_shares_count(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.posts
    SET shares_count = COALESCE(shares_count, 0) + 1
    WHERE id = post_id;
END;
$$;

-- Function to increment comments count (trigger-based)
CREATE OR REPLACE FUNCTION increment_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.posts
    SET comments_count = COALESCE(comments_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$;

-- Function to decrement comments count (trigger-based)
CREATE OR REPLACE FUNCTION decrement_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.posts
    SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$;

-- Function to increment retweets count (trigger-based)
CREATE OR REPLACE FUNCTION increment_retweets_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.posts
    SET retweets_count = COALESCE(retweets_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$;

-- Function to decrement retweets count (trigger-based)
CREATE OR REPLACE FUNCTION decrement_retweets_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.posts
    SET retweets_count = GREATEST(COALESCE(retweets_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
END;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger for comments count
DROP TRIGGER IF EXISTS handle_comment_count ON public.comments;
CREATE TRIGGER handle_comment_count
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION increment_comments_count();

DROP TRIGGER IF EXISTS handle_comment_delete ON public.comments;
CREATE TRIGGER handle_comment_delete
AFTER DELETE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION decrement_comments_count();

-- Trigger for retweets count (if retweets table exists)
DROP TRIGGER IF EXISTS handle_retweet_count ON public.retweets;
CREATE TRIGGER handle_retweet_count
AFTER INSERT ON public.retweets
FOR EACH ROW
EXECUTE FUNCTION increment_retweets_count();

DROP TRIGGER IF EXISTS handle_retweet_delete ON public.retweets;
CREATE TRIGGER handle_retweet_delete
AFTER DELETE ON public.retweets
FOR EACH ROW
EXECUTE FUNCTION decrement_retweets_count();

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check if comments table exists
SELECT 
    table_name,
    column_name,
    data_type 
FROM information_schema.columns 
WHERE table_name = 'comments'
ORDER BY ordinal_position;

-- Check if shares_count column exists
SELECT 
    column_name,
    data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
  AND column_name IN ('shares_count', 'retweets_count');

-- Check policies
SELECT 
    policyname,
    cmd 
FROM pg_policies 
WHERE tablename = 'comments'
ORDER BY policyname;

-- ============================================================
-- NOTES
-- ============================================================
-- 
-- This creates:
-- 1. comments table with RLS policies
-- 2. shares_count and retweets_count columns in posts table
-- 3. Functions to increment/decrement counts
-- 4. Triggers to auto-update counts
-- 
-- Comments structure:
-- - id: UUID
-- - post_id: References posts table
-- - user_id: References auth.users
-- - content: Text (max 1000 chars)
-- - likes_count: Integer
-- - created_at, updated_at: Timestamps
-- 
-- ============================================================
