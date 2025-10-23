-- ============================================================================
-- COMPREHENSIVE CHAT FIXES - COMPLETE SOLUTION
-- ============================================================================
-- This migration fixes all chat-related issues
-- Run this in Supabase SQL Editor
-- Created: October 23, 2025

-- Step 1: Add conversation_id to messages table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'conversation_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN conversation_id TEXT;
    CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
  END IF;
END $$;

-- Step 2: Add deleted_for_users column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'deleted_for_users'
  ) THEN
    ALTER TABLE messages ADD COLUMN deleted_for_users UUID[] DEFAULT '{}';
    CREATE INDEX idx_messages_deleted_for_users ON messages USING GIN(deleted_for_users);
  END IF;
END $$;

-- Step 3: Create function to generate conversation_id
CREATE OR REPLACE FUNCTION generate_message_conversation_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate consistent conversation_id by sorting user IDs
  IF NEW.sender_id < NEW.receiver_id THEN
    NEW.conversation_id := NEW.sender_id || '_' || NEW.receiver_id;
  ELSE
    NEW.conversation_id := NEW.receiver_id || '_' || NEW.sender_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create trigger to auto-populate conversation_id
DROP TRIGGER IF EXISTS set_message_conversation_id ON messages;
CREATE TRIGGER set_message_conversation_id
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION generate_message_conversation_id();

-- Step 5: Backfill existing messages with conversation_id
UPDATE messages
SET conversation_id = CASE
  WHEN sender_id < receiver_id THEN sender_id || '_' || receiver_id
  ELSE receiver_id || '_' || sender_id
END
WHERE conversation_id IS NULL;

-- Step 6: Create RPC function for marking messages as deleted
CREATE OR REPLACE FUNCTION mark_messages_deleted(
  p_conversation_id TEXT,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET deleted_for_users = array_append(
    COALESCE(deleted_for_users, '{}'), 
    p_user_id
  )
  WHERE conversation_id = p_conversation_id
    AND NOT (p_user_id = ANY(COALESCE(deleted_for_users, '{}')));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_messages_deleted TO authenticated;

-- Step 7: Update get_conversations function to exclude archived chats
CREATE OR REPLACE FUNCTION get_conversations_with_settings(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  other_user_username TEXT,
  other_user_avatar TEXT,
  other_user_online BOOLEAN,
  content TEXT,
  sender_id UUID,
  receiver_id UUID,
  created_at TIMESTAMPTZ,
  read BOOLEAN,
  delivered BOOLEAN,
  is_request BOOLEAN,
  is_following BOOLEAN,
  is_follower BOOLEAN,
  is_archived BOOLEAN,
  nickname TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH latest_messages AS (
    SELECT DISTINCT ON (
      CASE 
        WHEN m.sender_id = p_user_id THEN m.receiver_id
        ELSE m.sender_id
      END
    )
      m.id,
      CASE 
        WHEN m.sender_id = p_user_id THEN m.receiver_id
        ELSE m.sender_id
      END as other_user_id,
      m.content,
      m.sender_id,
      m.receiver_id,
      m.created_at,
      m.is_read as read,
      false as delivered
    FROM messages m
    WHERE (m.sender_id = p_user_id OR m.receiver_id = p_user_id)
      AND NOT (p_user_id = ANY(COALESCE(m.deleted_for_users, '{}')))
    ORDER BY 
      CASE 
        WHEN m.sender_id = p_user_id THEN m.receiver_id
        ELSE m.sender_id
      END,
      m.created_at DESC
  )
  SELECT 
    lm.id,
    lm.other_user_id,
    p.full_name as other_user_name,
    p.username as other_user_username,
    p.avatar_url as other_user_avatar,
    p.is_online as other_user_online,
    lm.content,
    lm.sender_id,
    lm.receiver_id,
    lm.created_at,
    lm.read,
    lm.delivered,
    false as is_request,
    EXISTS(SELECT 1 FROM followers WHERE follower_id = p_user_id AND following_id = lm.other_user_id) as is_following,
    EXISTS(SELECT 1 FROM followers WHERE follower_id = lm.other_user_id AND following_id = p_user_id) as is_follower,
    COALESCE(cs.is_archived, false) as is_archived,
    cs.nickname
  FROM latest_messages lm
  JOIN profiles p ON p.id = lm.other_user_id
  LEFT JOIN chat_settings cs ON cs.user_id = p_user_id AND cs.conversation_id = (
    CASE 
      WHEN p_user_id < lm.other_user_id THEN p_user_id || '_' || lm.other_user_id
      ELSE lm.other_user_id || '_' || p_user_id
    END
  )
  WHERE COALESCE(cs.is_archived, false) = false
  ORDER BY lm.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_conversations_with_settings TO authenticated;

COMMENT ON COLUMN messages.conversation_id IS 'Unique identifier for the conversation between two users';
COMMENT ON COLUMN messages.deleted_for_users IS 'Array of user IDs who have deleted this chat';
COMMENT ON FUNCTION mark_messages_deleted IS 'Marks all messages in a conversation as deleted for a specific user';
COMMENT ON FUNCTION get_conversations_with_settings IS 'Gets all conversations for a user excluding archived chats';
