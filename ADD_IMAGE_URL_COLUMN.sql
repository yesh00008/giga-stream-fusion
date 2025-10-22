-- Quick Fix: Add image_url column to posts table
-- Run this in Supabase SQL Editor

-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'image_url') THEN
        ALTER TABLE public.posts ADD COLUMN image_url TEXT;
        RAISE NOTICE 'image_url column added successfully';
    ELSE
        RAISE NOTICE 'image_url column already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts' 
AND column_name IN ('image_url', 'video_url', 'is_draft', 'metadata')
ORDER BY column_name;
