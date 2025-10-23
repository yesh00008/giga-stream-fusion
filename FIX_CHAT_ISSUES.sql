-- ============================================================================
-- FIX CHAT ISSUES - Add conversation_id to messages table
-- ============================================================================
-- This migration adds conversation_id to messages table for better chat management
-- Created: October 23, 2025

-- Add conversation_id column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS conversation_id TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON messages(conversation_id);

-- Create function to generate conversation_id from sender and receiver
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

-- Create trigger to auto-populate conversation_id
DROP TRIGGER IF EXISTS set_message_conversation_id ON messages;
CREATE TRIGGER set_message_conversation_id
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION generate_message_conversation_id();

-- Backfill existing messages with conversation_id
UPDATE messages
SET conversation_id = CASE
  WHEN sender_id < receiver_id THEN sender_id || '_' || receiver_id
  ELSE receiver_id || '_' || sender_id
END
WHERE conversation_id IS NULL;

-- Add deleted_for_users column to track who deleted the chat
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS deleted_for_users UUID[] DEFAULT '{}';

-- Create index for deleted_for_users
CREATE INDEX IF NOT EXISTS idx_messages_deleted_for_users 
ON messages USING GIN(deleted_for_users);

COMMENT ON COLUMN messages.conversation_id IS 'Unique identifier for the conversation between two users';
COMMENT ON COLUMN messages.deleted_for_users IS 'Array of user IDs who have deleted this chat';
