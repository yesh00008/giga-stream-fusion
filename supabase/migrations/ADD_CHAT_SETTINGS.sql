-- Chat Settings and Advanced Features

-- Chat Settings Table (per-user, per-conversation settings)
CREATE TABLE IF NOT EXISTS chat_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL,
  
  -- Notifications
  is_muted BOOLEAN DEFAULT false,
  muted_until TIMESTAMPTZ,
  
  -- Privacy
  read_receipts_enabled BOOLEAN DEFAULT true,
  typing_indicators_enabled BOOLEAN DEFAULT true,
  
  -- Display
  nickname VARCHAR(100),
  theme VARCHAR(20) DEFAULT 'auto', -- 'light', 'dark', 'auto'
  
  -- Organization
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  is_pinned BOOLEAN DEFAULT false,
  pinned_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, conversation_id)
);

-- Disappearing Messages Settings
CREATE TABLE IF NOT EXISTS disappearing_message_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  enabled_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Timer settings
  is_enabled BOOLEAN DEFAULT false,
  duration_seconds INTEGER, -- NULL = disabled, else seconds (60, 3600, 86400, 604800)
  
  enabled_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(conversation_id)
);

-- Blocked Users Table
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Reported Users/Chats Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID,
  message_id UUID,
  
  reason VARCHAR(50) NOT NULL, -- 'spam', 'harassment', 'inappropriate', 'fake', 'other'
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Shared Media Index (for quick media gallery queries)
CREATE TABLE IF NOT EXISTS conversation_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  message_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  
  media_type VARCHAR(20) NOT NULL, -- 'image', 'video', 'audio', 'file'
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT,
  file_name TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(message_id, media_url)
);

-- Enable Row Level Security
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE disappearing_message_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_settings
CREATE POLICY "Users can view their own chat settings"
  ON chat_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat settings"
  ON chat_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat settings"
  ON chat_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat settings"
  ON chat_settings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for disappearing_message_settings
CREATE POLICY "Users can view disappearing settings for their conversations"
  ON disappearing_message_settings FOR SELECT
  USING (true);

CREATE POLICY "Users can insert disappearing settings"
  ON disappearing_message_settings FOR INSERT
  WITH CHECK (auth.uid() = enabled_by);

CREATE POLICY "Users can update disappearing settings"
  ON disappearing_message_settings FOR UPDATE
  USING (auth.uid() = enabled_by);

-- RLS Policies for blocked_users
CREATE POLICY "Users can view their own blocks"
  ON blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can view who blocked them"
  ON blocked_users FOR SELECT
  USING (auth.uid() = blocked_id);

CREATE POLICY "Users can block others"
  ON blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock"
  ON blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can submit reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- RLS Policies for conversation_media
CREATE POLICY "Users can view media from their conversations"
  ON conversation_media FOR SELECT
  USING (true);

CREATE POLICY "Users can insert media"
  ON conversation_media FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Create indexes for performance (with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_chat_settings_user_conversation ON chat_settings(user_id, conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_settings_archived ON chat_settings(user_id, is_archived) WHERE is_archived = true;
CREATE INDEX IF NOT EXISTS idx_chat_settings_muted ON chat_settings(user_id, is_muted) WHERE is_muted = true;
CREATE INDEX IF NOT EXISTS idx_disappearing_enabled ON disappearing_message_settings(conversation_id) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_media_conversation ON conversation_media(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_media_type ON conversation_media(conversation_id, media_type, created_at DESC);

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = user1_id AND blocked_id = user2_id)
       OR (blocker_id = user2_id AND blocked_id = user1_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get chat settings
CREATE OR REPLACE FUNCTION get_chat_settings(p_user_id UUID, p_conversation_id UUID)
RETURNS TABLE (
  is_muted BOOLEAN,
  muted_until TIMESTAMPTZ,
  read_receipts_enabled BOOLEAN,
  typing_indicators_enabled BOOLEAN,
  nickname VARCHAR(100),
  theme VARCHAR(20),
  is_archived BOOLEAN,
  is_pinned BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.is_muted,
    cs.muted_until,
    cs.read_receipts_enabled,
    cs.typing_indicators_enabled,
    cs.nickname,
    cs.theme,
    cs.is_archived,
    cs.is_pinned
  FROM chat_settings cs
  WHERE cs.user_id = p_user_id AND cs.conversation_id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation media
CREATE OR REPLACE FUNCTION get_conversation_media(
  p_conversation_id UUID,
  p_media_type VARCHAR DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  message_id UUID,
  sender_id UUID,
  media_type VARCHAR(20),
  media_url TEXT,
  thumbnail_url TEXT,
  file_size BIGINT,
  file_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id,
    cm.message_id,
    cm.sender_id,
    cm.media_type,
    cm.media_url,
    cm.thumbnail_url,
    cm.file_size,
    cm.file_name,
    cm.created_at
  FROM conversation_media cm
  WHERE cm.conversation_id = p_conversation_id
    AND (p_media_type IS NULL OR cm.media_type = p_media_type)
  ORDER BY cm.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired disappearing messages
-- NOTE: This function is currently disabled because the messages table
-- does not have a conversation_id column. To enable this feature:
-- 1. Add a conversation_id UUID column to the messages table
-- 2. Update message inserts to include conversation_id
-- 3. Uncomment and use this function
CREATE OR REPLACE FUNCTION cleanup_disappearing_messages()
RETURNS void AS $$
BEGIN
  -- This function is disabled until messages table has conversation_id
  RAISE NOTICE 'Disappearing messages cleanup is disabled. Messages table needs a conversation_id column.';
  RETURN;
  
  /* Original implementation - requires conversation_id column in messages:
  DELETE FROM messages m
  USING disappearing_message_settings dms
  WHERE m.conversation_id = dms.conversation_id
    AND dms.is_enabled = true
    AND m.created_at + (dms.duration_seconds || ' seconds')::INTERVAL < NOW();
  */
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job (requires pg_cron extension)
-- Run cleanup every hour
-- SELECT cron.schedule('cleanup-disappearing-messages', '0 * * * *', 'SELECT cleanup_disappearing_messages()');
