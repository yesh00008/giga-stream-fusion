-- Storage RLS Policies for 'posts' bucket
-- Run this in your Supabase SQL Editor to allow image uploads

-- ============================================================
-- STORAGE BUCKET POLICIES FOR 'posts' BUCKET
-- ============================================================
-- NOTE: Run this with your service role key or as the postgres user
-- The storage.objects table is managed by Supabase, so policies might already exist
-- ============================================================

-- First, let's check if the 'posts' bucket exists and create it if needed
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Now let's use Supabase's built-in storage policy helpers
-- These work without needing direct access to storage.objects

-- Drop existing policies if they exist (using DO block to handle errors)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow public read access to posts images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to update their own images" ON storage.objects;
    DROP POLICY IF EXISTS "Allow users to delete their own images" ON storage.objects;
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Cannot drop policies - they may not exist or you need more privileges';
END $$;

-- Create policies using the correct approach
-- 1. Allow authenticated users to UPLOAD images to posts bucket
DO $$ 
BEGIN
    CREATE POLICY "Allow authenticated users to upload images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'posts' AND
      (storage.foldername(name))[1] = 'posts' AND
      auth.uid()::text = (storage.foldername(name))[2]
    );
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Policy "Allow authenticated users to upload images" already exists';
END $$;

-- 2. Allow PUBLIC READ access to all images in posts bucket
DO $$ 
BEGIN
    CREATE POLICY "Allow public read access to posts images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'posts');
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Policy "Allow public read access to posts images" already exists';
END $$;

-- 3. Allow users to UPDATE their own images
DO $$ 
BEGIN
    CREATE POLICY "Allow users to update their own images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'posts' AND
      (storage.foldername(name))[1] = 'posts' AND
      auth.uid()::text = (storage.foldername(name))[2]
    )
    WITH CHECK (
      bucket_id = 'posts' AND
      (storage.foldername(name))[1] = 'posts' AND
      auth.uid()::text = (storage.foldername(name))[2]
    );
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Policy "Allow users to update their own images" already exists';
END $$;

-- 4. Allow users to DELETE their own images
DO $$ 
BEGIN
    CREATE POLICY "Allow users to delete their own images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'posts' AND
      (storage.foldername(name))[1] = 'posts' AND
      auth.uid()::text = (storage.foldername(name))[2]
    );
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Policy "Allow users to delete their own images" already exists';
END $$;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Check if policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;

-- Check bucket exists and is public
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'posts';

-- ============================================================
-- NOTES
-- ============================================================
-- 
-- The storage path structure should be: posts/{user_id}/{filename}
-- Example: posts/da83b077-ea5e-49f6-9dd5-43ad2f8342d0/1234567890.jpg
-- 
-- This policy ensures:
-- 1. Users can only upload to their own folder (posts/{their_user_id}/)
-- 2. Anyone can read/view the images (public access)
-- 3. Users can only update/delete their own images
-- 
-- If you get "new row violates row-level security policy" error:
-- - Make sure you're authenticated (user is logged in)
-- - Check that the path structure matches: posts/{user_id}/{filename}
-- - Verify the 'posts' bucket exists in Storage
-- 
-- ============================================================
