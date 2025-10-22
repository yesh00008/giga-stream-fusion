-- ============================================
-- CHECK DATABASE STRUCTURE
-- ============================================
-- Run this to see what columns exist in your tables

-- Check if posts table exists and what columns it has
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'posts'
ORDER BY ordinal_position;
