-- Enable realtime for message-related tables

-- Enable realtime for message_reactions table
ALTER PUBLICATION supabase_realtime ADD TABLE message_reactions;

-- Enable realtime for deleted_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE deleted_messages;

-- Enable realtime for pinned_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE pinned_messages;

-- Enable realtime for messages table (if not already enabled)
DO $$
BEGIN
  -- Check if messages table is already in the publication
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;

-- Verify all tables are enabled
SELECT 
  tablename, 
  schemaname 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
