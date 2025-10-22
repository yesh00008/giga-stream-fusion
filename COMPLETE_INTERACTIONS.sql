-- Complete Interaction System
-- Includes: Comments, Comment Likes, Retweet Comments, Duplicate Prevention, Edit History

-- ============================================================
-- COMMENTS TABLE (Enhanced)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    edited BOOLEAN DEFAULT false,
    CONSTRAINT comments_content_length CHECK (char_length(content) <= 1000)
);

-- Create indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- ============================================================
-- COMMENT LIKES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_comment_like UNIQUE(comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON public.comment_likes(user_id);

-- ============================================================
-- RETWEET COMMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.retweet_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    retweet_id UUID NOT NULL REFERENCES public.retweets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    edited BOOLEAN DEFAULT false,
    CONSTRAINT retweet_comments_content_length CHECK (char_length(content) <= 500)
);

CREATE INDEX IF NOT EXISTS idx_retweet_comments_retweet_id ON public.retweet_comments(retweet_id);
CREATE INDEX IF NOT EXISTS idx_retweet_comments_user_id ON public.retweet_comments(user_id);

-- ============================================================
-- RETWEET COMMENT LIKES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.retweet_comment_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    retweet_comment_id UUID NOT NULL REFERENCES public.retweet_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_retweet_comment_like UNIQUE(retweet_comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_retweet_comment_likes_comment_id ON public.retweet_comment_likes(retweet_comment_id);
CREATE INDEX IF NOT EXISTS idx_retweet_comment_likes_user_id ON public.retweet_comment_likes(user_id);

-- ============================================================
-- ADD COLUMNS TO POSTS TABLE
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
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'edited') THEN
        ALTER TABLE public.posts ADD COLUMN edited BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ============================================================
-- ADD COMMENTS_COUNT TO RETWEETS TABLE
-- ============================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'retweets' AND column_name = 'comments_count') THEN
        ALTER TABLE public.retweets ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================================
-- RLS POLICIES FOR COMMENTS
-- ============================================================

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

CREATE POLICY "Anyone can view comments"
ON public.comments FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES FOR COMMENT LIKES
-- ============================================================

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Authenticated users can like comments" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can unlike comments" ON public.comment_likes;

CREATE POLICY "Anyone can view comment likes"
ON public.comment_likes FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can like comments"
ON public.comment_likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
ON public.comment_likes FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES FOR RETWEET COMMENTS
-- ============================================================

ALTER TABLE public.retweet_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view retweet comments" ON public.retweet_comments;
DROP POLICY IF EXISTS "Authenticated users can create retweet comments" ON public.retweet_comments;
DROP POLICY IF EXISTS "Users can update their own retweet comments" ON public.retweet_comments;
DROP POLICY IF EXISTS "Users can delete their own retweet comments" ON public.retweet_comments;

CREATE POLICY "Anyone can view retweet comments"
ON public.retweet_comments FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can create retweet comments"
ON public.retweet_comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own retweet comments"
ON public.retweet_comments FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own retweet comments"
ON public.retweet_comments FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES FOR RETWEET COMMENT LIKES
-- ============================================================

ALTER TABLE public.retweet_comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view retweet comment likes" ON public.retweet_comment_likes;
DROP POLICY IF EXISTS "Authenticated users can like retweet comments" ON public.retweet_comment_likes;
DROP POLICY IF EXISTS "Users can unlike retweet comments" ON public.retweet_comment_likes;

CREATE POLICY "Anyone can view retweet comment likes"
ON public.retweet_comment_likes FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can like retweet comments"
ON public.retweet_comment_likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike retweet comments"
ON public.retweet_comment_likes FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS FOR COMMENT LIKES
-- ============================================================

-- Increment comment likes
CREATE OR REPLACE FUNCTION increment_comment_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.comments
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.comment_id;
    RETURN NEW;
END;
$$;

-- Decrement comment likes
CREATE OR REPLACE FUNCTION decrement_comment_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.comments
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = OLD.comment_id;
    RETURN OLD;
END;
$$;

-- ============================================================
-- FUNCTIONS FOR RETWEET COMMENT LIKES
-- ============================================================

-- Increment retweet comment likes
CREATE OR REPLACE FUNCTION increment_retweet_comment_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.retweet_comments
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.retweet_comment_id;
    RETURN NEW;
END;
$$;

-- Decrement retweet comment likes
CREATE OR REPLACE FUNCTION decrement_retweet_comment_likes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.retweet_comments
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = OLD.retweet_comment_id;
    RETURN OLD;
END;
$$;

-- ============================================================
-- FUNCTIONS FOR RETWEET COMMENTS COUNT
-- ============================================================

-- Increment retweet comments count
CREATE OR REPLACE FUNCTION increment_retweet_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.retweets
    SET comments_count = COALESCE(comments_count, 0) + 1
    WHERE id = NEW.retweet_id;
    RETURN NEW;
END;
$$;

-- Decrement retweet comments count
CREATE OR REPLACE FUNCTION decrement_retweet_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.retweets
    SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
    WHERE id = OLD.retweet_id;
    RETURN OLD;
END;
$$;

-- ============================================================
-- EXISTING FUNCTIONS (from COMMENTS_AND_SHARES.sql)
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

-- Function to increment comments count
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

-- Function to decrement comments count
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

-- Function to increment retweets count
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

-- Function to decrement retweets count
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
-- FUNCTION TO REMOVE DUPLICATE LIKES
-- ============================================================

CREATE OR REPLACE FUNCTION remove_duplicate_likes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Remove duplicate post likes (keep oldest)
    DELETE FROM public.post_likes a
    USING public.post_likes b
    WHERE a.id > b.id
    AND a.post_id = b.post_id
    AND a.user_id = b.user_id;
    
    -- Remove duplicate comment likes (keep oldest)
    DELETE FROM public.comment_likes a
    USING public.comment_likes b
    WHERE a.id > b.id
    AND a.comment_id = b.comment_id
    AND a.user_id = b.user_id;
    
    -- Remove duplicate bookmarks (keep oldest)
    DELETE FROM public.bookmarks a
    USING public.bookmarks b
    WHERE a.id > b.id
    AND a.post_id = b.post_id
    AND a.user_id = b.user_id;
    
    -- Remove duplicate retweets (keep oldest)
    DELETE FROM public.retweets a
    USING public.retweets b
    WHERE a.id > b.id
    AND a.post_id = b.post_id
    AND a.user_id = b.user_id;
    
    RAISE NOTICE 'Duplicate likes removed successfully';
END;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Comment likes triggers
DROP TRIGGER IF EXISTS handle_comment_like_increment ON public.comment_likes;
CREATE TRIGGER handle_comment_like_increment
AFTER INSERT ON public.comment_likes
FOR EACH ROW
EXECUTE FUNCTION increment_comment_likes();

DROP TRIGGER IF EXISTS handle_comment_like_decrement ON public.comment_likes;
CREATE TRIGGER handle_comment_like_decrement
AFTER DELETE ON public.comment_likes
FOR EACH ROW
EXECUTE FUNCTION decrement_comment_likes();

-- Retweet comment likes triggers
DROP TRIGGER IF EXISTS handle_retweet_comment_like_increment ON public.retweet_comment_likes;
CREATE TRIGGER handle_retweet_comment_like_increment
AFTER INSERT ON public.retweet_comment_likes
FOR EACH ROW
EXECUTE FUNCTION increment_retweet_comment_likes();

DROP TRIGGER IF EXISTS handle_retweet_comment_like_decrement ON public.retweet_comment_likes;
CREATE TRIGGER handle_retweet_comment_like_decrement
AFTER DELETE ON public.retweet_comment_likes
FOR EACH ROW
EXECUTE FUNCTION decrement_retweet_comment_likes();

-- Retweet comments count triggers
DROP TRIGGER IF EXISTS handle_retweet_comment_increment ON public.retweet_comments;
CREATE TRIGGER handle_retweet_comment_increment
AFTER INSERT ON public.retweet_comments
FOR EACH ROW
EXECUTE FUNCTION increment_retweet_comments_count();

DROP TRIGGER IF EXISTS handle_retweet_comment_decrement ON public.retweet_comments;
CREATE TRIGGER handle_retweet_comment_decrement
AFTER DELETE ON public.retweet_comments
FOR EACH ROW
EXECUTE FUNCTION decrement_retweet_comments_count();

-- Post comments count triggers
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

-- Retweets count triggers
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
-- RUN DUPLICATE REMOVAL
-- ============================================================

SELECT remove_duplicate_likes();

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('comments', 'comment_likes', 'retweet_comments', 'retweet_comment_likes')
ORDER BY table_name;

-- Check counts in posts table
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('likes_count', 'comments_count', 'retweets_count', 'shares_count', 'edited');

-- Check counts in retweets table
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'retweets' 
AND column_name = 'comments_count';

-- ============================================================
-- NOTES
-- ============================================================
-- 
-- This creates a complete interaction system:
-- 
-- 1. Comments on posts (create, edit, delete, like)
-- 2. Comments on retweets (create, edit, delete, like)
-- 3. Duplicate prevention with UNIQUE constraints
-- 4. Automatic count updates via triggers
-- 5. Edit tracking with 'edited' flag
-- 6. RLS policies for security
-- 
-- Tables Created:
-- - comments (enhanced with 'edited' field)
-- - comment_likes (likes on post comments)
-- - retweet_comments (comments on retweets)
-- - retweet_comment_likes (likes on retweet comments)
-- 
-- Functions:
-- - remove_duplicate_likes() - Clean existing duplicates
-- - Auto-increment/decrement count functions
-- 
-- ============================================================
