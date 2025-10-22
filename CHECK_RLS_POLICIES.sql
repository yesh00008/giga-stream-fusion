-- Check existing RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('post_likes', 'retweets', 'bookmarks', 'comments')
ORDER BY tablename, policyname;

-- Check if RLS is enabled on tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('post_likes', 'retweets', 'bookmarks', 'comments');

-- Check table structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('post_likes', 'retweets', 'bookmarks')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
