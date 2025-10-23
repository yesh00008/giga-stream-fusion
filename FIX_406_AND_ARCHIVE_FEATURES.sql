-- ============================================================================
-- FIX 406 ERROR AND ADD ARCHIVED CHAT FEATURES
-- ============================================================================
-- Run this in Supabase SQL Editor
-- Created: October 23, 2025

-- Ensure profiles table has proper indexes
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Add function to safely get profile (prevents 406 errors)
CREATE OR REPLACE FUNCTION get_profile_safe(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url
  FROM profiles p
  WHERE p.id = p_user_id
  LIMIT 1;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_profile_safe TO authenticated;

-- Add archived_chats view for easier querying
CREATE OR REPLACE VIEW archived_chats_view AS
SELECT 
  cs.user_id,
  cs.conversation_id,
  cs.nickname,
  cs.is_archived,
  cs.archived_at,
  cs.updated_at,
  -- Extract other user ID from conversation_id
  CASE 
    WHEN SPLIT_PART(cs.conversation_id, '_', 1)::uuid = cs.user_id 
    THEN SPLIT_PART(cs.conversation_id, '_', 2)::uuid
    ELSE SPLIT_PART(cs.conversation_id, '_', 1)::uuid
  END as other_user_id
FROM chat_settings cs
WHERE cs.is_archived = true
ORDER BY cs.archived_at DESC;

-- Grant access to view
GRANT SELECT ON archived_chats_view TO authenticated;

-- Add function to get archived chats with user details
CREATE OR REPLACE FUNCTION get_archived_chats_detailed(p_user_id UUID)
RETURNS TABLE (
  conversation_id TEXT,
  nickname TEXT,
  is_archived BOOLEAN,
  archived_at TIMESTAMPTZ,
  other_user_id UUID,
  other_user_username TEXT,
  other_user_full_name TEXT,
  other_user_avatar_url TEXT,
  last_message TEXT,
  last_message_time TIMESTAMPTZ,
  unread_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    acv.conversation_id,
    acv.nickname,
    acv.is_archived,
    acv.archived_at,
    acv.other_user_id,
    p.username as other_user_username,
    p.full_name as other_user_full_name,
    p.avatar_url as other_user_avatar_url,
    (
      SELECT m.content
      FROM messages m
      WHERE m.conversation_id = acv.conversation_id
        AND NOT (p_user_id = ANY(COALESCE(m.deleted_for_users, '{}')))
      ORDER BY m.created_at DESC
      LIMIT 1
    ) as last_message,
    (
      SELECT m.created_at
      FROM messages m
      WHERE m.conversation_id = acv.conversation_id
        AND NOT (p_user_id = ANY(COALESCE(m.deleted_for_users, '{}')))
      ORDER BY m.created_at DESC
      LIMIT 1
    ) as last_message_time,
    (
      SELECT COUNT(*)
      FROM messages m
      WHERE m.conversation_id = acv.conversation_id
        AND m.receiver_id = p_user_id
        AND m.is_read = false
        AND NOT (p_user_id = ANY(COALESCE(m.deleted_for_users, '{}')))
    ) as unread_count
  FROM archived_chats_view acv
  LEFT JOIN profiles p ON p.id = acv.other_user_id
  WHERE acv.user_id = p_user_id
  ORDER BY acv.archived_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_archived_chats_detailed TO authenticated;

-- Add function to bulk unarchive chats
CREATE OR REPLACE FUNCTION bulk_unarchive_chats(
  p_user_id UUID,
  p_conversation_ids TEXT[]
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE chat_settings
  SET 
    is_archived = false,
    archived_at = NULL,
    updated_at = NOW()
  WHERE user_id = p_user_id
    AND conversation_id = ANY(p_conversation_ids)
    AND is_archived = true;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION bulk_unarchive_chats TO authenticated;

-- Add function to get chat statistics
CREATE OR REPLACE FUNCTION get_chat_statistics(p_user_id UUID)
RETURNS TABLE (
  total_conversations BIGINT,
  archived_count BIGINT,
  unread_count BIGINT,
  today_messages BIGINT,
  blocked_users_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Total conversations (including archived)
    (SELECT COUNT(DISTINCT conversation_id) 
     FROM messages 
     WHERE (sender_id = p_user_id OR receiver_id = p_user_id)
       AND NOT (p_user_id = ANY(COALESCE(deleted_for_users, '{}')))),
    
    -- Archived count
    (SELECT COUNT(*) 
     FROM chat_settings 
     WHERE user_id = p_user_id AND is_archived = true),
    
    -- Unread messages
    (SELECT COUNT(*) 
     FROM messages 
     WHERE receiver_id = p_user_id 
       AND is_read = false
       AND NOT (p_user_id = ANY(COALESCE(deleted_for_users, '{}')))),
    
    -- Today's messages
    (SELECT COUNT(*) 
     FROM messages 
     WHERE (sender_id = p_user_id OR receiver_id = p_user_id)
       AND created_at >= CURRENT_DATE
       AND NOT (p_user_id = ANY(COALESCE(deleted_for_users, '{}')))),
    
    -- Blocked users
    (SELECT COUNT(*) 
     FROM blocked_users 
     WHERE blocker_id = p_user_id);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_chat_statistics TO authenticated;

-- Add notification preferences to chat_settings if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chat_settings' AND column_name = 'notification_sound'
  ) THEN
    ALTER TABLE chat_settings 
    ADD COLUMN notification_sound TEXT DEFAULT 'default',
    ADD COLUMN show_previews BOOLEAN DEFAULT true,
    ADD COLUMN auto_download_media BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_settings_archived 
ON chat_settings(user_id, is_archived) 
WHERE is_archived = true;

CREATE INDEX IF NOT EXISTS idx_messages_unread 
ON messages(receiver_id, is_read) 
WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_messages_today 
ON messages(created_at) 
WHERE created_at >= CURRENT_DATE;

COMMENT ON FUNCTION get_profile_safe IS 'Safely gets a profile without 406 errors';
COMMENT ON FUNCTION get_archived_chats_detailed IS 'Gets all archived chats with full user details and last messages';
COMMENT ON FUNCTION bulk_unarchive_chats IS 'Unarchives multiple chats at once';
COMMENT ON FUNCTION get_chat_statistics IS 'Gets comprehensive chat statistics for a user';
COMMENT ON VIEW archived_chats_view IS 'View of all archived chats with extracted user IDs';
