-- ============================================
-- DIAGNOSTIC - Run this FIRST to see what's wrong
-- ============================================

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('post_likes', 'retweets', 'bookmarks')
ORDER BY table_name;

-- 2. Check actual columns in each table
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('post_likes', 'retweets', 'bookmarks')
ORDER BY table_name, ordinal_position;

-- 3. Check existing foreign keys
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('post_likes', 'retweets', 'bookmarks');

-- 4. Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename IN ('post_likes', 'retweets', 'bookmarks')
ORDER BY tablename;

-- 5. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('post_likes', 'retweets', 'bookmarks');
