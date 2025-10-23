-- Chat Settings Features - Testing & Verification Script
-- ⚠️ NOTE: Run ADD_CHAT_SETTINGS.sql FIRST before running these tests!
-- Run these queries in Supabase SQL Editor to test functionality

-- ==================================================
-- 0. CHECK IF TABLES EXIST (Run this first!)
-- ==================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_settings') THEN
    RAISE EXCEPTION 'Table chat_settings does not exist! Run ADD_CHAT_SETTINGS.sql first.';
  END IF;
  
  RAISE NOTICE 'All required tables exist. You can proceed with tests.';
END $$;

-- ==================================================
-- 1. VERIFY TABLES EXIST
-- ==================================================
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'chat_settings',
    'disappearing_message_settings',
    'blocked_users',
    'reports',
    'conversation_media'
  )
ORDER BY table_name;

-- Expected result: 5 tables

-- ==================================================
-- 2. VERIFY REALTIME IS ENABLED
-- ==================================================
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
  AND tablename IN (
    'chat_settings',
    'disappearing_message_settings',
    'blocked_users',
    'conversation_media'
  )
ORDER BY tablename;

-- Expected result: 4 tables in publication

-- ==================================================
-- 3. VERIFY RLS POLICIES
-- ==================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN (
  'chat_settings',
  'disappearing_message_settings',
  'blocked_users',
  'reports',
  'conversation_media'
)
ORDER BY tablename, policyname;

-- Expected: Multiple policies per table

-- ==================================================
-- 4. VERIFY HELPER FUNCTIONS
-- ==================================================
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'is_user_blocked',
    'get_chat_settings',
    'get_conversation_media',
    'cleanup_disappearing_messages'
  )
ORDER BY routine_name;

-- Expected result: 4 functions

-- ==================================================
-- 5. VERIFY INDEXES
-- ==================================================
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN (
  'chat_settings',
  'disappearing_message_settings',
  'blocked_users',
  'conversation_media'
)
ORDER BY tablename, indexname;

-- Expected: Multiple indexes for performance

-- ==================================================
-- 6. TEST CHAT SETTINGS (Replace UUIDs with real values)
-- ==================================================

-- STEP 1: Get real UUIDs from your database
-- Uncomment and run these queries first to get actual UUIDs:
/*
SELECT id as user_id FROM auth.users LIMIT 5;
SELECT DISTINCT id as conversation_id FROM (
  SELECT sender_id as id FROM messages
  UNION
  SELECT receiver_id FROM messages
) subquery LIMIT 5;
*/

-- STEP 2: Replace the UUIDs below with actual values from STEP 1
-- Then uncomment and run these test queries:

/*
-- Insert test chat settings (REPLACE UUIDs!)
INSERT INTO chat_settings (
  user_id,
  conversation_id,
  theme,
  is_muted,
  nickname
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,  -- Replace with actual user_id
  '00000000-0000-0000-0000-000000000001'::uuid,  -- Replace with actual conversation_id
  'dark',
  false,
  'Test Nickname'
) ON CONFLICT (user_id, conversation_id) 
DO UPDATE SET
  theme = EXCLUDED.theme,
  nickname = EXCLUDED.nickname;

-- Query chat settings (REPLACE UUID!)
SELECT * FROM chat_settings 
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid  -- Replace with actual user_id
ORDER BY created_at DESC;
*/

-- ==================================================
-- 7. TEST DISAPPEARING MESSAGES
-- ==================================================

/*
-- Enable disappearing messages (24 hours) (REPLACE UUIDs!)
INSERT INTO disappearing_message_settings (
  conversation_id,
  enabled_by,
  is_enabled,
  duration_seconds
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,  -- Replace with actual conversation_id
  '00000000-0000-0000-0000-000000000000'::uuid,  -- Replace with actual user_id
  true,
  86400
) ON CONFLICT (conversation_id)
DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  duration_seconds = EXCLUDED.duration_seconds;

-- Query disappearing settings (REPLACE UUID!)
SELECT * FROM disappearing_message_settings
WHERE conversation_id = '00000000-0000-0000-0000-000000000001'::uuid;  -- Replace with actual conversation_id
*/

-- ==================================================
-- 8. TEST BLOCK USER
-- ==================================================

/*
-- Block a user (REPLACE UUIDs!)
INSERT INTO blocked_users (
  blocker_id,
  blocked_id,
  reason
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,  -- Replace with blocker user_id
  '00000000-0000-0000-0000-000000000002'::uuid,  -- Replace with blocked user_id
  'Test block reason'
);

-- Check if user is blocked (REPLACE UUIDs!)
SELECT is_user_blocked(
  '00000000-0000-0000-0000-000000000000'::uuid,  -- Replace with user1_id
  '00000000-0000-0000-0000-000000000002'::uuid   -- Replace with user2_id
);

-- Query blocked users (REPLACE UUID!)
SELECT * FROM blocked_users
WHERE blocker_id = '00000000-0000-0000-0000-000000000000'::uuid;  -- Replace with user_id

-- Unblock user (REPLACE UUIDs!)
DELETE FROM blocked_users
WHERE blocker_id = '00000000-0000-0000-0000-000000000000'::uuid  -- Replace with blocker_id
  AND blocked_id = '00000000-0000-0000-0000-000000000002'::uuid;  -- Replace with blocked_id
*/

-- ==================================================
-- 9. TEST REPORTS
-- ==================================================

/*
-- Submit a report (REPLACE UUIDs!)
INSERT INTO reports (
  reporter_id,
  reported_user_id,
  reason,
  description
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,  -- Replace with reporter user_id
  '00000000-0000-0000-0000-000000000002'::uuid,  -- Replace with reported user_id
  'spam',
  'Test report description'
);

-- Query reports (REPLACE UUID!)
SELECT 
  id,
  reason,
  description,
  status,
  created_at
FROM reports
WHERE reporter_id = '00000000-0000-0000-0000-000000000000'::uuid  -- Replace with user_id
ORDER BY created_at DESC;
*/

-- ==================================================
-- 10. TEST CONVERSATION MEDIA
-- ==================================================

/*
-- Add media to conversation (REPLACE UUIDs!)
INSERT INTO conversation_media (
  conversation_id,
  message_id,
  sender_id,
  media_type,
  media_url,
  thumbnail_url,
  file_name
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,  -- Replace with conversation_id
  '00000000-0000-0000-0000-000000000003'::uuid,  -- Replace with message_id
  '00000000-0000-0000-0000-000000000000'::uuid,  -- Replace with sender user_id
  'image',
  'https://example.com/image.jpg',
  'https://example.com/thumb.jpg',
  'test-image.jpg'
);

-- Query conversation media (REPLACE UUID!)
SELECT * FROM get_conversation_media(
  '00000000-0000-0000-0000-000000000001'::uuid,  -- Replace with conversation_id
  NULL,  -- media_type (NULL = all)
  50,    -- limit
  0      -- offset
);
*/

-- ==================================================
-- 11. TEST ARCHIVE CHAT
-- ==================================================

/*
-- Archive a chat (REPLACE UUIDs!)
UPDATE chat_settings
SET 
  is_archived = true,
  archived_at = NOW()
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid  -- Replace with user_id
  AND conversation_id = '00000000-0000-0000-0000-000000000001'::uuid;  -- Replace with conversation_id

-- Query archived chats (REPLACE UUID!)
SELECT * FROM chat_settings
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid  -- Replace with user_id
  AND is_archived = true
ORDER BY archived_at DESC;

-- Unarchive chat (REPLACE UUIDs!)
UPDATE chat_settings
SET 
  is_archived = false,
  archived_at = NULL
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid  -- Replace with user_id
  AND conversation_id = '00000000-0000-0000-0000-000000000001'::uuid;  -- Replace with conversation_id
*/

-- ==================================================
-- 12. TEST MUTE NOTIFICATIONS
-- ==================================================

/*
-- Mute chat for 8 hours (REPLACE UUIDs!)
UPDATE chat_settings
SET 
  is_muted = true,
  muted_until = NOW() + INTERVAL '8 hours'
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid  -- Replace with user_id
  AND conversation_id = '00000000-0000-0000-0000-000000000001'::uuid;  -- Replace with conversation_id

-- Check if chat is muted and not expired (REPLACE UUIDs!)
SELECT 
  is_muted,
  muted_until,
  CASE 
    WHEN is_muted AND (muted_until IS NULL OR muted_until > NOW()) 
    THEN 'MUTED'
    ELSE 'NOT MUTED'
  END as mute_status
FROM chat_settings
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid  -- Replace with user_id
  AND conversation_id = '00000000-0000-0000-0000-000000000001'::uuid;  -- Replace with conversation_id

-- Unmute chat (REPLACE UUIDs!)
UPDATE chat_settings
SET 
  is_muted = false,
  muted_until = NULL
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid  -- Replace with user_id
  AND conversation_id = '00000000-0000-0000-0000-000000000001'::uuid;  -- Replace with conversation_id
*/

-- ==================================================
-- 13. TEST SEARCH MESSAGES
-- ==================================================

/*
-- Search for messages containing "hello" (REPLACE UUID!)
SELECT 
  id,
  content,
  created_at
FROM messages
WHERE conversation_id = '00000000-0000-0000-0000-000000000001'::uuid  -- Replace with conversation_id
  AND content ILIKE '%hello%'
ORDER BY created_at DESC
LIMIT 50;
*/

-- ==================================================
-- 14. TEST DISAPPEARING MESSAGE CLEANUP
-- ==================================================

-- Manual cleanup of expired disappearing messages (Safe to run anytime)
SELECT cleanup_disappearing_messages();

/*
-- Check which messages would be deleted (REPLACE UUID!)
SELECT 
  m.id,
  m.content,
  m.created_at,
  dms.duration_seconds,
  m.created_at + (dms.duration_seconds || ' seconds')::INTERVAL as expires_at,
  CASE 
    WHEN m.created_at + (dms.duration_seconds || ' seconds')::INTERVAL < NOW()
    THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as status
FROM messages m
JOIN disappearing_message_settings dms ON m.conversation_id = dms.conversation_id
WHERE dms.is_enabled = true
  AND m.conversation_id = '00000000-0000-0000-0000-000000000001'::uuid  -- Replace with conversation_id
ORDER BY m.created_at DESC;
*/

-- ==================================================
-- 15. TEST PRIVACY SETTINGS
-- ==================================================

/*
-- Update privacy settings (REPLACE UUIDs!)
UPDATE chat_settings
SET 
  read_receipts_enabled = false,
  typing_indicators_enabled = false
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid  -- Replace with user_id
  AND conversation_id = '00000000-0000-0000-0000-000000000001'::uuid;  -- Replace with conversation_id

-- Query privacy settings (REPLACE UUIDs!)
SELECT 
  nickname,
  read_receipts_enabled,
  typing_indicators_enabled,
  theme
FROM chat_settings
WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid  -- Replace with user_id
  AND conversation_id = '00000000-0000-0000-0000-000000000001'::uuid;  -- Replace with conversation_id
*/

-- ==================================================
-- 16. PERFORMANCE TEST - Count all settings
-- ==================================================

SELECT 
  'chat_settings' as table_name,
  COUNT(*) as record_count
FROM chat_settings
UNION ALL
SELECT 
  'disappearing_message_settings',
  COUNT(*)
FROM disappearing_message_settings
UNION ALL
SELECT 
  'blocked_users',
  COUNT(*)
FROM blocked_users
UNION ALL
SELECT 
  'reports',
  COUNT(*)
FROM reports
UNION ALL
SELECT 
  'conversation_media',
  COUNT(*)
FROM conversation_media;

-- ==================================================
-- 17. CLEANUP TEST DATA (Optional)
-- ==================================================

/*
-- Delete test chat settings (REPLACE UUID!)
DELETE FROM chat_settings WHERE user_id = '00000000-0000-0000-0000-000000000000'::uuid;

-- Delete test blocks (REPLACE UUID!)
DELETE FROM blocked_users WHERE blocker_id = '00000000-0000-0000-0000-000000000000'::uuid;

-- Delete test reports (REPLACE UUID!)
DELETE FROM reports WHERE reporter_id = '00000000-0000-0000-0000-000000000000'::uuid;

-- Delete test media (REPLACE UUID!)
DELETE FROM conversation_media WHERE conversation_id = '00000000-0000-0000-0000-000000000001'::uuid;
*/

-- ==================================================
-- 18. VERIFY DATA INTEGRITY
-- ==================================================

-- Check for orphaned chat settings (conversation doesn't exist in messages)
SELECT cs.id, cs.conversation_id
FROM chat_settings cs
LEFT JOIN messages m ON cs.conversation_id = m.conversation_id
WHERE m.id IS NULL
LIMIT 10;

-- Check for self-blocks (should be none)
SELECT * FROM blocked_users
WHERE blocker_id = blocked_id;

-- Check for reports without reporter
SELECT * FROM reports
WHERE reporter_id IS NULL OR reported_user_id IS NULL;

-- ==================================================
-- 19. GENERATE STATISTICS
-- ==================================================

-- User engagement stats
SELECT 
  u.id as user_id,
  u.email,
  COUNT(DISTINCT cs.conversation_id) as active_chats,
  COUNT(DISTINCT CASE WHEN cs.is_muted THEN cs.conversation_id END) as muted_chats,
  COUNT(DISTINCT CASE WHEN cs.is_archived THEN cs.conversation_id END) as archived_chats,
  COUNT(DISTINCT bu.blocked_id) as blocked_users,
  COUNT(DISTINCT r.id) as reports_submitted
FROM auth.users u
LEFT JOIN chat_settings cs ON u.id = cs.user_id
LEFT JOIN blocked_users bu ON u.id = bu.blocker_id
LEFT JOIN reports r ON u.id = r.reporter_id
GROUP BY u.id, u.email
ORDER BY active_chats DESC
LIMIT 10;

-- Theme preferences
SELECT 
  theme,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM chat_settings
WHERE theme IS NOT NULL
GROUP BY theme
ORDER BY user_count DESC;

-- Disappearing message usage
SELECT 
  CASE 
    WHEN duration_seconds = 60 THEN '1 minute'
    WHEN duration_seconds = 3600 THEN '1 hour'
    WHEN duration_seconds = 86400 THEN '24 hours'
    WHEN duration_seconds = 604800 THEN '7 days'
    ELSE duration_seconds::text || ' seconds'
  END as duration,
  COUNT(*) as conversation_count
FROM disappearing_message_settings
WHERE is_enabled = true
GROUP BY duration_seconds
ORDER BY duration_seconds;

-- ==================================================
-- 20. MONITORING QUERIES
-- ==================================================

-- Recent activity
SELECT 
  'Settings updated' as activity_type,
  COUNT(*) as count,
  MAX(updated_at) as last_activity
FROM chat_settings
WHERE updated_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'Users blocked',
  COUNT(*),
  MAX(blocked_at)
FROM blocked_users
WHERE blocked_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'Reports submitted',
  COUNT(*),
  MAX(created_at)
FROM reports
WHERE created_at > NOW() - INTERVAL '24 hours';

-- ==================================================
-- NOTES:
-- ==================================================
-- 
-- HOW TO USE THIS TEST FILE:
-- 
-- 1. Run sections 0-5 to verify setup (safe to run anytime)
-- 2. For sections 6-15, FIRST uncomment the helper queries to get real UUIDs
-- 3. Copy real UUIDs into the test queries
-- 4. Then uncomment and run the test queries
-- 5. Section 16 (Performance Test) is safe to run anytime
-- 6. Section 17 (Cleanup) - only run if you want to delete test data
-- 7. Sections 18-20 are safe to run anytime
--
-- QUICK START:
-- Run this query to get UUIDs for testing:
/*
SELECT 
  u.id as user_id,
  u.email,
  (SELECT id FROM messages WHERE sender_id = u.id OR receiver_id = u.id LIMIT 1) as sample_message_id
FROM auth.users u
LIMIT 3;
*/
--
-- ==================================================
