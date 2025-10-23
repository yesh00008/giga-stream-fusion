-- Create deleted_messages table to track which messages each user has deleted for themselves
CREATE TABLE IF NOT EXISTS deleted_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Each user can only delete a message once
  CONSTRAINT unique_user_deleted_message UNIQUE (message_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_deleted_messages_message_id ON deleted_messages(message_id);
CREATE INDEX idx_deleted_messages_user_id ON deleted_messages(user_id);
CREATE INDEX idx_deleted_messages_deleted_at ON deleted_messages(deleted_at);

-- Enable Row Level Security
ALTER TABLE deleted_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own deleted messages list
CREATE POLICY "Users can view their own deleted messages"
ON deleted_messages FOR SELECT
USING (user_id = auth.uid());

-- Users can add messages to their deleted list
CREATE POLICY "Users can delete messages for themselves"
ON deleted_messages FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can remove from their deleted list (undelete - optional feature)
CREATE POLICY "Users can undelete their messages"
ON deleted_messages FOR DELETE
USING (user_id = auth.uid());

-- Create a function to check if a message is deleted for a user
CREATE OR REPLACE FUNCTION is_message_deleted_for_user(msg_id UUID, usr_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM deleted_messages
    WHERE message_id = msg_id AND user_id = usr_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
