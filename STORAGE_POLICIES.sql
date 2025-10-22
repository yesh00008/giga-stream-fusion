-- ============================================
-- SUPABASE STORAGE POLICIES FIX
-- ============================================
-- This script sets up the correct RLS policies for avatar and banner uploads
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. AVATARS BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Allow public read access to avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 2. BANNERS BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Banner images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own banner" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own banner" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own banner" ON storage.objects;

-- Allow public read access to banners
CREATE POLICY "Banner images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Allow authenticated users to upload their own banners
CREATE POLICY "Users can upload their own banner"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'banners' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own banners
CREATE POLICY "Users can update their own banner"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'banners' AND 
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'banners' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own banners
CREATE POLICY "Users can delete their own banner"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'banners' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 3. VERIFY BUCKETS EXIST
-- ============================================

-- Check if avatars bucket exists, create if not
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[];

-- Check if banners bucket exists, create if not
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[];

-- ============================================
-- 4. VERIFICATION QUERIES
-- ============================================

-- Run these to verify everything is set up correctly:

-- Check bucket configuration
-- SELECT * FROM storage.buckets WHERE id IN ('avatars', 'banners');

-- Check policies
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- Test upload (replace 'YOUR_USER_ID' with actual auth.uid())
-- SELECT 
--   bucket_id,
--   name,
--   (storage.foldername(name))[1] as user_folder,
--   auth.uid()::text as current_user
-- FROM storage.objects 
-- WHERE bucket_id IN ('avatars', 'banners');

-- ============================================
-- DONE! 
-- ============================================
-- After running this script:
-- 1. Users can upload to: /{user_id}/filename.jpg
-- 2. Users can only manage their own files
-- 3. Everyone can view all avatars and banners
-- 4. File size limits are enforced
-- 5. Only image files are allowed
