-- Add delivered status to messages table
-- This enables WhatsApp-style message status tracking:
-- Single tick (✓) - Sent but not delivered
-- Double grey ticks (✓✓) - Delivered but not read
-- Double blue ticks (✓✓) - Read by recipient

-- Add delivered column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS delivered BOOLEAN DEFAULT FALSE;

-- Add failed column for failed message tracking
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS failed BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_delivered ON messages(delivered);
CREATE INDEX IF NOT EXISTS idx_messages_failed ON messages(failed);

-- Function to auto-mark messages as delivered when recipient is online
CREATE OR REPLACE FUNCTION mark_message_as_delivered()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-mark as delivered if recipient is online
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = NEW.receiver_id 
    AND is_online = TRUE
  ) THEN
    NEW.delivered = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-mark messages as delivered
DROP TRIGGER IF EXISTS trigger_mark_message_delivered ON messages;
CREATE TRIGGER trigger_mark_message_delivered
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION mark_message_as_delivered();

-- Function to mark messages as delivered when user comes online
CREATE OR REPLACE FUNCTION mark_pending_messages_delivered()
RETURNS TRIGGER AS $$
BEGIN
  -- When user comes online, mark all undelivered messages as delivered
  IF NEW.is_online = TRUE AND (OLD.is_online = FALSE OR OLD.is_online IS NULL) THEN
    UPDATE messages 
    SET delivered = TRUE 
    WHERE receiver_id = NEW.id 
    AND delivered = FALSE 
    AND failed = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to mark messages as delivered when user comes online
DROP TRIGGER IF EXISTS trigger_user_online_deliver_messages ON profiles;
CREATE TRIGGER trigger_user_online_deliver_messages
  AFTER UPDATE OF is_online ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION mark_pending_messages_delivered();

-- Function to ensure delivered=true when message is marked as read
CREATE OR REPLACE FUNCTION mark_delivered_on_read()
RETURNS TRIGGER AS $$
BEGIN
  -- When message is marked as read, also mark as delivered
  IF NEW.read = TRUE AND (OLD.read = FALSE OR OLD.read IS NULL) THEN
    NEW.delivered = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-mark as delivered when read
DROP TRIGGER IF EXISTS trigger_mark_delivered_on_read ON messages;
CREATE TRIGGER trigger_mark_delivered_on_read
  BEFORE UPDATE OF read ON messages
  FOR EACH ROW
  EXECUTE FUNCTION mark_delivered_on_read();

-- Update existing messages to have delivered status
-- (Mark as delivered if created more than 1 minute ago, assuming they were delivered)
UPDATE messages 
SET delivered = TRUE 
WHERE delivered = FALSE 
AND created_at < NOW() - INTERVAL '1 minute'
AND failed = FALSE;

-- Grant necessary permissions
GRANT SELECT, UPDATE ON messages TO authenticated;
