-- ============================================
-- ADD CONTENT_TYPE COLUMN TO EXISTING POSTS TABLE
-- ============================================
-- Run this first if your posts table already exists without content_type column

-- Add content_type column to existing posts table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'posts' 
    AND column_name = 'content_type'
  ) THEN
    ALTER TABLE posts ADD COLUMN content_type TEXT DEFAULT 'post';
    RAISE NOTICE '✅ Added content_type column to posts table';
  ELSE
    RAISE NOTICE 'ℹ️  content_type column already exists';
  END IF;
END $$;

-- Add constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'posts_content_type_check'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT posts_content_type_check 
    CHECK (content_type IN ('post', 'reel', 'tweet'));
    RAISE NOTICE '✅ Added content_type constraint';
  ELSE
    RAISE NOTICE 'ℹ️  content_type constraint already exists';
  END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_posts_content_type ON posts(content_type);

-- Final success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Content type column setup complete!';
END $$;
