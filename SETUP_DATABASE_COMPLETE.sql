-- =====================================================
-- COMPLETE DATABASE SETUP FOR GIGA STREAM FUSION
-- =====================================================
-- This script creates ALL missing tables and fixes 406 errors
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. POST_LIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON public.post_likes(created_at DESC);

-- RLS Policies
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all likes" ON public.post_likes;
CREATE POLICY "Users can view all likes"
    ON public.post_likes FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes;
CREATE POLICY "Users can like posts"
    ON public.post_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike their likes" ON public.post_likes;
CREATE POLICY "Users can unlike their likes"
    ON public.post_likes FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 2. RETWEETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.retweets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_retweets_post_id ON public.retweets(post_id);
CREATE INDEX IF NOT EXISTS idx_retweets_user_id ON public.retweets(user_id);
CREATE INDEX IF NOT EXISTS idx_retweets_created_at ON public.retweets(created_at DESC);

-- RLS Policies
ALTER TABLE public.retweets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all retweets" ON public.retweets;
CREATE POLICY "Users can view all retweets"
    ON public.retweets FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can retweet posts" ON public.retweets;
CREATE POLICY "Users can retweet posts"
    ON public.retweets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unretweet" ON public.retweets;
CREATE POLICY "Users can unretweet"
    ON public.retweets FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 3. BOOKMARKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON public.bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

-- RLS Policies
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view their bookmarks"
    ON public.bookmarks FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can bookmark posts" ON public.bookmarks;
CREATE POLICY "Users can bookmark posts"
    ON public.bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove bookmarks" ON public.bookmarks;
CREATE POLICY "Users can remove bookmarks"
    ON public.bookmarks FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 4. POST_REACTIONS TABLE (New Feature)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.post_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'love', 'laugh', 'wow', 'sad', 'angry')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON public.post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_type ON public.post_reactions(reaction_type);

-- RLS Policies
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all reactions" ON public.post_reactions;
CREATE POLICY "Users can view all reactions"
    ON public.post_reactions FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can add reactions" ON public.post_reactions;
CREATE POLICY "Users can add reactions"
    ON public.post_reactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their reactions" ON public.post_reactions;
CREATE POLICY "Users can update their reactions"
    ON public.post_reactions FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove reactions" ON public.post_reactions;
CREATE POLICY "Users can remove reactions"
    ON public.post_reactions FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- 5. MESSAGES TABLE (Chat Functionality)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(sender_id, receiver_id, created_at DESC);

-- RLS Policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
CREATE POLICY "Users can view their messages"
    ON public.messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their messages" ON public.messages;
CREATE POLICY "Users can update their messages"
    ON public.messages FOR UPDATE
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can delete their messages" ON public.messages;
CREATE POLICY "Users can delete their messages"
    ON public.messages FOR DELETE
    USING (auth.uid() = sender_id);

-- =====================================================
-- 6. UPDATE POSTS TABLE (Add missing columns)
-- =====================================================
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS quoted_post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL;

ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS quote_count INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS reaction_counts JSONB DEFAULT '{}'::jsonb;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_quoted_post_id ON public.posts(quoted_post_id);

-- =====================================================
-- 6B. UPDATE PROFILES TABLE (Add online status)
-- =====================================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Index for online users
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON public.profiles(is_online) WHERE is_online = true;

-- =====================================================
-- 7. TRIGGERS FOR AUTO-UPDATING COUNTS
-- =====================================================

-- Trigger for likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
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

DROP TRIGGER IF EXISTS trigger_update_post_likes_count ON public.post_likes;
CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- Trigger for retweets count
CREATE OR REPLACE FUNCTION update_post_retweets_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts
    SET retweets_count = COALESCE(retweets_count, 0) + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts
    SET retweets_count = GREATEST(COALESCE(retweets_count, 0) - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_post_retweets_count ON public.retweets;
CREATE TRIGGER trigger_update_post_retweets_count
  AFTER INSERT OR DELETE ON public.retweets
  FOR EACH ROW
  EXECUTE FUNCTION update_post_retweets_count();

-- Trigger for quote count
CREATE OR REPLACE FUNCTION update_post_quote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.quoted_post_id IS NOT NULL THEN
    UPDATE public.posts
    SET quote_count = COALESCE(quote_count, 0) + 1
    WHERE id = NEW.quoted_post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.quoted_post_id IS NOT NULL THEN
    UPDATE public.posts
    SET quote_count = GREATEST(COALESCE(quote_count, 0) - 1, 0)
    WHERE id = OLD.quoted_post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_post_quote_count ON public.posts;
CREATE TRIGGER trigger_update_post_quote_count
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION update_post_quote_count();

-- Trigger for reaction counts (aggregated by type)
CREATE OR REPLACE FUNCTION update_post_reaction_counts()
RETURNS TRIGGER AS $$
DECLARE
  reaction_data JSONB;
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE', 'DELETE') THEN
    -- Get post_id based on operation
    IF TG_OP = 'DELETE' THEN
      -- Aggregate reactions for the post
      SELECT jsonb_object_agg(reaction_type, count)
      INTO reaction_data
      FROM (
        SELECT reaction_type, COUNT(*)::integer as count
        FROM public.post_reactions
        WHERE post_id = OLD.post_id
        GROUP BY reaction_type
      ) sub;
      
      UPDATE public.posts
      SET reaction_counts = COALESCE(reaction_data, '{}'::jsonb)
      WHERE id = OLD.post_id;
      RETURN OLD;
    ELSE
      -- Aggregate reactions for the post
      SELECT jsonb_object_agg(reaction_type, count)
      INTO reaction_data
      FROM (
        SELECT reaction_type, COUNT(*)::integer as count
        FROM public.post_reactions
        WHERE post_id = NEW.post_id
        GROUP BY reaction_type
      ) sub;
      
      UPDATE public.posts
      SET reaction_counts = COALESCE(reaction_data, '{}'::jsonb)
      WHERE id = NEW.post_id;
      RETURN NEW;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_post_reaction_counts ON public.post_reactions;
CREATE TRIGGER trigger_update_post_reaction_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reaction_counts();

-- =====================================================
-- 8. VIEWS FOR EASIER QUERYING
-- =====================================================

-- View for posts with retweet information
CREATE OR REPLACE VIEW posts_with_retweets AS
SELECT 
  p.*,
  r.user_id as retweeted_by_user_id,
  r.created_at as retweeted_at,
  rp.username as retweeted_by_username,
  rp.full_name as retweeted_by_name,
  rp.avatar_url as retweeted_by_avatar
FROM public.posts p
INNER JOIN public.retweets r ON p.id = r.post_id
LEFT JOIN public.profiles rp ON r.user_id = rp.id
ORDER BY r.created_at DESC;

-- View for conversation list (latest message per conversation)
CREATE OR REPLACE VIEW conversation_list AS
WITH ranked_messages AS (
  SELECT 
    m.*,
    CASE 
      WHEN m.sender_id = auth.uid() THEN m.receiver_id
      ELSE m.sender_id
    END as other_user_id,
    ROW_NUMBER() OVER (
      PARTITION BY 
        CASE 
          WHEN m.sender_id < m.receiver_id 
          THEN m.sender_id || '-' || m.receiver_id
          ELSE m.receiver_id || '-' || m.sender_id
        END
      ORDER BY m.created_at DESC
    ) as rn
  FROM public.messages m
  WHERE m.sender_id = auth.uid() OR m.receiver_id = auth.uid()
)
SELECT 
  rm.*,
  p.username as other_user_username,
  p.full_name as other_user_name,
  p.avatar_url as other_user_avatar,
  COALESCE(p.is_online, false) as other_user_online
FROM ranked_messages rm
LEFT JOIN public.profiles p ON rm.other_user_id = p.id
WHERE rm.rn = 1
ORDER BY rm.created_at DESC;

-- Grant access to views
GRANT SELECT ON posts_with_retweets TO authenticated;
GRANT SELECT ON posts_with_retweets TO anon;
GRANT SELECT ON conversation_list TO authenticated;

-- =====================================================
-- 9. FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to get conversation between two users
CREATE OR REPLACE FUNCTION get_conversation(other_user_id UUID, limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  receiver_id UUID,
  content TEXT,
  image_url TEXT,
  read BOOLEAN,
  created_at TIMESTAMPTZ,
  sender_username TEXT,
  sender_name TEXT,
  sender_avatar TEXT,
  receiver_username TEXT,
  receiver_name TEXT,
  receiver_avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.sender_id,
    m.receiver_id,
    m.content,
    m.image_url,
    m.read,
    m.created_at,
    sp.username as sender_username,
    sp.full_name as sender_name,
    sp.avatar_url as sender_avatar,
    rp.username as receiver_username,
    rp.full_name as receiver_name,
    rp.avatar_url as receiver_avatar
  FROM public.messages m
  LEFT JOIN public.profiles sp ON m.sender_id = sp.id
  LEFT JOIN public.profiles rp ON m.receiver_id = rp.id
  WHERE 
    (m.sender_id = auth.uid() AND m.receiver_id = other_user_id)
    OR
    (m.sender_id = other_user_id AND m.receiver_id = auth.uid())
  ORDER BY m.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(sender_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.messages
  SET read = true
  WHERE receiver_id = auth.uid() 
    AND sender_id = sender_user_id
    AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_count()
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO unread_count
  FROM public.messages
  WHERE receiver_id = auth.uid() AND read = false;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user online status
CREATE OR REPLACE FUNCTION update_online_status(online BOOLEAN DEFAULT true)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    is_online = online,
    last_seen_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. REALTIME SETUP
-- =====================================================

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if all tables exist
SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('post_likes', 'retweets', 'bookmarks', 'post_reactions', 'messages')
ORDER BY tablename;

-- Check if all triggers exist
SELECT 
  trigger_name,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%update_post%'
ORDER BY trigger_name;

-- Check if all functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_conversation', 'mark_messages_read', 'get_unread_count', 'update_online_status')
ORDER BY routine_name;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '✅ All tables created with RLS policies';
  RAISE NOTICE '✅ All triggers and functions created';
  RAISE NOTICE '✅ Realtime enabled for messages';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 You can now:';
  RAISE NOTICE '  - Like, retweet, and bookmark posts';
  RAISE NOTICE '  - Add reactions to posts';
  RAISE NOTICE '  - Send and receive messages';
  RAISE NOTICE '  - View retweet chains';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '  1. Test the application';
  RAISE NOTICE '  2. Check for any errors';
  RAISE NOTICE '  3. Verify realtime updates work';
END $$;
