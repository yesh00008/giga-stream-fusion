-- Create message_reactions table for Instagram-style message reactions
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (char_length(emoji) <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Each user can only have one reaction per message
  CONSTRAINT unique_user_message_reaction UNIQUE (message_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX idx_message_reactions_created_at ON message_reactions(created_at);

-- Enable Row Level Security
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view reactions on messages they have access to
CREATE POLICY "Users can view reactions on accessible messages"
ON message_reactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM messages m
    WHERE m.id = message_reactions.message_id
    AND (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
  )
);

-- Users can add reactions to messages in their conversations
CREATE POLICY "Users can add reactions to their messages"
ON message_reactions FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM messages m
    WHERE m.id = message_id
    AND (m.sender_id = auth.uid() OR m.receiver_id = auth.uid())
  )
);

-- Users can update their own reactions
CREATE POLICY "Users can update their own reactions"
ON message_reactions FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions"
ON message_reactions FOR DELETE
USING (user_id = auth.uid());

-- Create a function to get reaction counts for a message
CREATE OR REPLACE FUNCTION get_message_reaction_counts(msg_id UUID)
RETURNS TABLE (emoji TEXT, count BIGINT, user_reacted BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mr.emoji,
    COUNT(*)::BIGINT as count,
    bool_or(mr.user_id = auth.uid()) as user_reacted
  FROM message_reactions mr
  WHERE mr.message_id = msg_id
  GROUP BY mr.emoji
  ORDER BY COUNT(*) DESC, MIN(mr.created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
