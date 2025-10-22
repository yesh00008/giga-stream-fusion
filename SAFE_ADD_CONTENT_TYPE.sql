-- ============================================
-- SAFE MIGRATION: Add content_type column
-- ============================================
-- This version adds the column directly without any checks

-- Step 1: Add the column (will fail silently if already exists)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'post';

-- Step 2: Update any NULL values
UPDATE posts SET content_type = 'post' WHERE content_type IS NULL;

-- Step 3: Add constraint (drop first if exists)
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_content_type_check;
ALTER TABLE posts ADD CONSTRAINT posts_content_type_check 
  CHECK (content_type IN ('post', 'reel', 'tweet'));

-- Step 4: Create index
CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts(content_type);

-- Verify it worked
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'posts'
  AND column_name = 'content_type';
