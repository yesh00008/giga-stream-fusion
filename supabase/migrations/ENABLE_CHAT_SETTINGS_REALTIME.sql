-- Enable realtime for chat settings tables

-- Check if tables exist before adding to publication
DO $$ 
BEGIN
  -- Enable realtime on chat_settings table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_settings') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'chat_settings'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE chat_settings;
      RAISE NOTICE 'Added chat_settings to realtime publication';
    ELSE
      RAISE NOTICE 'chat_settings already in realtime publication';
    END IF;
  ELSE
    RAISE WARNING 'Table chat_settings does not exist. Run ADD_CHAT_SETTINGS.sql first!';
  END IF;

  -- Enable realtime on disappearing_message_settings table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'disappearing_message_settings') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'disappearing_message_settings'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE disappearing_message_settings;
      RAISE NOTICE 'Added disappearing_message_settings to realtime publication';
    ELSE
      RAISE NOTICE 'disappearing_message_settings already in realtime publication';
    END IF;
  ELSE
    RAISE WARNING 'Table disappearing_message_settings does not exist. Run ADD_CHAT_SETTINGS.sql first!';
  END IF;

  -- Enable realtime on blocked_users table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'blocked_users') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'blocked_users'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE blocked_users;
      RAISE NOTICE 'Added blocked_users to realtime publication';
    ELSE
      RAISE NOTICE 'blocked_users already in realtime publication';
    END IF;
  ELSE
    RAISE WARNING 'Table blocked_users does not exist. Run ADD_CHAT_SETTINGS.sql first!';
  END IF;

  -- Enable realtime on conversation_media table
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'conversation_media') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_media'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE conversation_media;
      RAISE NOTICE 'Added conversation_media to realtime publication';
    ELSE
      RAISE NOTICE 'conversation_media already in realtime publication';
    END IF;
  ELSE
    RAISE WARNING 'Table conversation_media does not exist. Run ADD_CHAT_SETTINGS.sql first!';
  END IF;
END $$;

-- Verify the tables are added to the publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('chat_settings', 'disappearing_message_settings', 'blocked_users', 'conversation_media')
ORDER BY tablename;
