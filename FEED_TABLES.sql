-- Feed System Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Create post_likes table
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON public.post_likes(created_at DESC);

-- Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.post_likes;

-- RLS Policies for post_likes
CREATE POLICY "Anyone can view likes" ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like posts" ON public.post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON public.post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. Create bookmarks table
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON public.bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can bookmark posts" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can remove their bookmarks" ON public.bookmarks;

-- RLS Policies for bookmarks
CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark posts" ON public.bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their bookmarks" ON public.bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. Create retweets table
-- ============================================
CREATE TABLE IF NOT EXISTS public.retweets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_retweets_post_id ON public.retweets(post_id);
CREATE INDEX IF NOT EXISTS idx_retweets_user_id ON public.retweets(user_id);
CREATE INDEX IF NOT EXISTS idx_retweets_created_at ON public.retweets(created_at DESC);

-- Enable RLS
ALTER TABLE public.retweets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view retweets" ON public.retweets;
DROP POLICY IF EXISTS "Users can retweet posts" ON public.retweets;
DROP POLICY IF EXISTS "Users can unretweet" ON public.retweets;

-- RLS Policies for retweets
CREATE POLICY "Anyone can view retweets" ON public.retweets
    FOR SELECT USING (true);

CREATE POLICY "Users can retweet posts" ON public.retweets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unretweet" ON public.retweets
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. Update posts table to add missing columns
-- ============================================
-- Add is_draft column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'is_draft') THEN
        ALTER TABLE public.posts ADD COLUMN is_draft BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add metadata column if it doesn't exist (for storing additional data like poll, visibility, etc.)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'metadata') THEN
        ALTER TABLE public.posts ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Add video_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'video_url') THEN
        ALTER TABLE public.posts ADD COLUMN video_url TEXT;
    END IF;
END $$;

-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'image_url') THEN
        ALTER TABLE public.posts ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Create index for is_draft
CREATE INDEX IF NOT EXISTS idx_posts_is_draft ON public.posts(is_draft);

-- Create index for content_type and is_draft combined
CREATE INDEX IF NOT EXISTS idx_posts_content_type_draft ON public.posts(content_type, is_draft);

-- ============================================
-- 5. Create functions to increment/decrement counts
-- ============================================

-- Function to increment likes count
CREATE OR REPLACE FUNCTION increment_likes_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement likes count
CREATE OR REPLACE FUNCTION decrement_likes_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment comments count
CREATE OR REPLACE FUNCTION increment_comments_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET comments_count = COALESCE(comments_count, 0) + 1
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement comments count
CREATE OR REPLACE FUNCTION decrement_comments_count(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET comments_count = GREATEST(COALESCE(comments_count, 0) - 1, 0)
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. Create trigger to update likes count automatically
-- ============================================

-- Function to handle like count updates
CREATE OR REPLACE FUNCTION handle_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts
        SET likes_count = COALESCE(likes_count, 0) + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts
        SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_like_count ON public.post_likes;
CREATE TRIGGER trigger_like_count
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW
    EXECUTE FUNCTION handle_like_count();

-- ============================================
-- 7. Grant permissions
-- ============================================
GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.bookmarks TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.retweets TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ============================================
-- 8. Create view for feed with user interactions (Optional but recommended)
-- ============================================
CREATE OR REPLACE VIEW public.feed_posts_view AS
SELECT 
    p.*,
    prof.username,
    prof.full_name,
    prof.avatar_url,
    prof.badge_type,
    COUNT(DISTINCT pl.id) as total_likes,
    COUNT(DISTINCT r.id) as total_retweets,
    COUNT(DISTINCT b.id) as total_bookmarks
FROM public.posts p
LEFT JOIN public.profiles prof ON p.user_id = prof.id
LEFT JOIN public.post_likes pl ON p.id = pl.post_id
LEFT JOIN public.retweets r ON p.id = r.post_id
LEFT JOIN public.bookmarks b ON p.id = b.post_id
WHERE p.content_type = 'post' AND p.is_draft = false
GROUP BY p.id, prof.username, prof.full_name, prof.avatar_url, prof.badge_type
ORDER BY p.created_at DESC;

-- Grant access to the view
GRANT SELECT ON public.feed_posts_view TO authenticated;

-- ============================================
-- 9. Sample data insertion (Optional - for testing)
-- ============================================
-- Uncomment below to insert sample data

-- INSERT INTO public.posts (user_id, title, content, content_type, is_draft, likes_count, comments_count)
-- VALUES 
--     (auth.uid(), 'First Post', 'This is my first post on the feed!', 'post', false, 0, 0),
--     (auth.uid(), 'Second Post', 'Another amazing post with some content', 'post', false, 5, 2);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything is set up correctly:

-- Check if tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_name IN ('post_likes', 'bookmarks', 'retweets');

-- Check if columns exist in posts table
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'posts' AND column_name IN ('is_draft', 'metadata', 'video_url');

-- Check if functions exist
-- SELECT routine_name FROM information_schema.routines 
-- WHERE routine_schema = 'public' AND routine_name LIKE '%_count';

-- View sample posts with counts
-- SELECT id, title, content, likes_count, comments_count, is_draft, created_at 
-- FROM public.posts 
-- WHERE content_type = 'post' 
-- ORDER BY created_at DESC 
-- LIMIT 10;
