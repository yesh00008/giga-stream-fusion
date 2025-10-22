-- =============================================
-- CREATE FOLLOWERS TABLE AND FUNCTIONS
-- =============================================
-- This enables users to follow/unfollow each other
-- Tracks follower and following counts

-- Create followers table
CREATE TABLE IF NOT EXISTS public.followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Prevent self-follows and duplicate follows
  CONSTRAINT followers_no_self_follow CHECK (follower_id != following_id),
  CONSTRAINT followers_unique UNIQUE (follower_id, following_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON public.followers(following_id);
CREATE INDEX IF NOT EXISTS idx_followers_created ON public.followers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view followers relationships
CREATE POLICY "followers_select_policy" ON public.followers
  FOR SELECT
  USING (true);

-- Users can follow others (insert)
CREATE POLICY "followers_insert_policy" ON public.followers
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow (delete their own follows)
CREATE POLICY "followers_delete_policy" ON public.followers
  FOR DELETE
  USING (auth.uid() = follower_id);

-- Add follower/following counts to profiles table (if columns don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'followers_count') THEN
    ALTER TABLE public.profiles ADD COLUMN followers_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'following_count') THEN
    ALTER TABLE public.profiles ADD COLUMN following_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following_count for follower
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
    
    -- Increment followers_count for followed user
    UPDATE public.profiles 
    SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following_count for follower
    UPDATE public.profiles 
    SET following_count = GREATEST(0, following_count - 1) 
    WHERE id = OLD.follower_id;
    
    -- Decrement followers_count for followed user
    UPDATE public.profiles 
    SET followers_count = GREATEST(0, followers_count - 1) 
    WHERE id = OLD.following_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update counts
DROP TRIGGER IF EXISTS followers_count_trigger ON public.followers;
CREATE TRIGGER followers_count_trigger
  AFTER INSERT OR DELETE ON public.followers
  FOR EACH ROW
  EXECUTE FUNCTION update_follower_counts();

-- Initialize existing counts (run once to sync existing data)
UPDATE public.profiles p
SET followers_count = (
  SELECT COUNT(*) FROM public.followers f WHERE f.following_id = p.id
),
following_count = (
  SELECT COUNT(*) FROM public.followers f WHERE f.follower_id = p.id
);

-- Verify setup
SELECT 
  'Followers table created' as status,
  COUNT(*) as total_follows
FROM public.followers;
