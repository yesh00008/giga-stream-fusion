-- ============================================
-- DIAGNOSE DATABASE STRUCTURE
-- ============================================

-- Check 1: Does the posts table exist at all?
SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE tablename = 'posts';

-- Check 2: What tables DO exist in the public schema?
SELECT 
  tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check 3: If posts exists, what columns does it have?
SELECT 
  table_schema,
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;
