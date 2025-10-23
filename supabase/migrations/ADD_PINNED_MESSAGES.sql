-- Create pinned_messages table for pinning messages in conversations
CREATE TABLE IF NOT EXISTS pinned_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  conversation_user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pinned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL means unlimited/no expiration
  pin_order INTEGER DEFAULT 0, -- For ordering multiple pins
  
  -- Unique constraint to prevent duplicate pins
  CONSTRAINT unique_pinned_message UNIQUE (message_id)
);

-- Create indexes for performance
CREATE INDEX idx_pinned_messages_message_id ON pinned_messages(message_id);
CREATE INDEX idx_pinned_messages_conversation ON pinned_messages(conversation_user1_id, conversation_user2_id);
CREATE INDEX idx_pinned_messages_expires_at ON pinned_messages(expires_at);
CREATE INDEX idx_pinned_messages_pin_order ON pinned_messages(pin_order);

-- Enable Row Level Security
ALTER TABLE pinned_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view pins in their conversations
CREATE POLICY "Users can view pins in their conversations"
ON pinned_messages FOR SELECT
USING (
  auth.uid() = conversation_user1_id OR auth.uid() = conversation_user2_id
);

-- Users can pin messages in their conversations
CREATE POLICY "Users can pin messages in their conversations"
ON pinned_messages FOR INSERT
WITH CHECK (
  auth.uid() = conversation_user1_id OR auth.uid() = conversation_user2_id
);

-- Users can update pins in their conversations
CREATE POLICY "Users can update pins in their conversations"
ON pinned_messages FOR UPDATE
USING (
  auth.uid() = conversation_user1_id OR auth.uid() = conversation_user2_id
);

-- Users can unpin messages in their conversations
CREATE POLICY "Users can unpin messages in their conversations"
ON pinned_messages FOR DELETE
USING (
  auth.uid() = conversation_user1_id OR auth.uid() = conversation_user2_id
);

-- Function to clean up expired pins automatically
CREATE OR REPLACE FUNCTION cleanup_expired_pins()
RETURNS void AS $$
BEGIN
  DELETE FROM pinned_messages
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active pins for a conversation
CREATE OR REPLACE FUNCTION get_active_pins(user1_id UUID, user2_id UUID)
RETURNS TABLE (
  id UUID,
  message_id UUID,
  pinned_by UUID,
  pinned_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  pin_order INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.id,
    pm.message_id,
    pm.pinned_by,
    pm.pinned_at,
    pm.expires_at,
    pm.pin_order
  FROM pinned_messages pm
  WHERE 
    ((pm.conversation_user1_id = user1_id AND pm.conversation_user2_id = user2_id) OR
     (pm.conversation_user1_id = user2_id AND pm.conversation_user2_id = user1_id))
    AND (pm.expires_at IS NULL OR pm.expires_at > NOW())
  ORDER BY pm.pin_order ASC, pm.pinned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
