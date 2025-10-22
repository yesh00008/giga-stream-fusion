-- =====================================================
-- SETUP QUOTE/REPOST FUNCTIONALITY
-- =====================================================
-- This script adds quote functionality to posts
-- Run this in your Supabase SQL Editor

-- Step 1: Add quoted_post_id column to posts table
-- This links a quote post to the original post being quoted
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS quoted_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL;

-- Step 2: Add quote_count column to track how many times a post has been quoted
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS quote_count INTEGER DEFAULT 0 NOT NULL;

-- Step 3: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_quoted_post_id ON public.posts(quoted_post_id);

-- Step 4: Create function to update quote count
CREATE OR REPLACE FUNCTION update_post_quote_count()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new quote post is created
  IF TG_OP = 'INSERT' AND NEW.quoted_post_id IS NOT NULL THEN
    UPDATE public.posts
    SET quote_count = COALESCE(quote_count, 0) + 1
    WHERE id = NEW.quoted_post_id;
    RETURN NEW;
    
  -- When a quote post is deleted
  ELSIF TG_OP = 'DELETE' AND OLD.quoted_post_id IS NOT NULL THEN
    UPDATE public.posts
    SET quote_count = GREATEST(COALESCE(quote_count, 0) - 1, 0)
    WHERE id = OLD.quoted_post_id;
    RETURN OLD;
    
  -- When a post's quoted_post_id is updated (edge case)
  ELSIF TG_OP = 'UPDATE' THEN
    -- Decrease count for old quoted post
    IF OLD.quoted_post_id IS NOT NULL AND OLD.quoted_post_id != NEW.quoted_post_id THEN
      UPDATE public.posts
      SET quote_count = GREATEST(COALESCE(quote_count, 0) - 1, 0)
      WHERE id = OLD.quoted_post_id;
    END IF;
    
    -- Increase count for new quoted post
    IF NEW.quoted_post_id IS NOT NULL AND OLD.quoted_post_id != NEW.quoted_post_id THEN
      UPDATE public.posts
      SET quote_count = COALESCE(quote_count, 0) + 1
      WHERE id = NEW.quoted_post_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger to automatically update quote counts
DROP TRIGGER IF EXISTS trigger_update_post_quote_count ON public.posts;
CREATE TRIGGER trigger_update_post_quote_count
  AFTER INSERT OR UPDATE OR DELETE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION update_post_quote_count();

-- Step 6: Add RLS policy for quoted posts (users can view quoted posts they have access to)
-- This assumes you already have RLS enabled on posts table
-- Users should be able to see quoted posts if they can see the quote post itself
DROP POLICY IF EXISTS "Users can view quoted posts" ON public.posts;
CREATE POLICY "Users can view quoted posts"
  ON public.posts FOR SELECT
  USING (
    -- Can view if it's a public post or user is authenticated
    auth.role() = 'authenticated'
    OR 
    -- Add additional logic here based on your privacy settings
    true
  );

-- Step 7: Create a view for posts with quoted post details (optional but recommended)
CREATE OR REPLACE VIEW posts_with_quotes AS
SELECT 
  p.*,
  qp.id as quoted_post_id,
  qp.content as quoted_content,
  qp.image_url as quoted_image_url,
  qp.created_at as quoted_created_at,
  qp_profile.id as quoted_author_id,
  qp_profile.username as quoted_author_username,
  qp_profile.full_name as quoted_author_name,
  qp_profile.avatar_url as quoted_author_avatar,
  qp_profile.badge_type as quoted_author_badge
FROM public.posts p
LEFT JOIN public.posts qp ON p.quoted_post_id = qp.id
LEFT JOIN public.profiles qp_profile ON qp.user_id = qp_profile.id;

-- Step 8: Grant access to the view
GRANT SELECT ON posts_with_quotes TO authenticated;
GRANT SELECT ON posts_with_quotes TO anon;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the setup worked correctly

-- Check if columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts' 
  AND column_name IN ('quoted_post_id', 'quote_count')
ORDER BY column_name;

-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_post_quote_count';

-- Check if function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'update_post_quote_count';

-- =====================================================
-- EXAMPLE USAGE
-- =====================================================
-- After running this script, you can create quote posts like:
/*
INSERT INTO public.posts (user_id, content, quoted_post_id)
VALUES (
  auth.uid(),
  'This is my take on this post!',
  'uuid-of-original-post'
);
*/

-- Query posts with their quoted posts:
/*
SELECT * FROM posts_with_quotes 
WHERE id = 'your-post-id';
*/

-- Get all quotes of a specific post:
/*
SELECT p.*, pr.username, pr.full_name
FROM public.posts p
JOIN public.profiles pr ON p.user_id = pr.id
WHERE p.quoted_post_id = 'original-post-id'
ORDER BY p.created_at DESC;
*/
