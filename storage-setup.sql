-- Giga Stream Fusion Storage Buckets Setup
-- This file contains instructions for creating storage buckets in Supabase

/*
  STORAGE BUCKETS
  ===============
  
  Go to Supabase Dashboard > Storage > Create Bucket
  
  Create the following buckets:
*/

-- 1. AVATARS BUCKET
-- Name: avatars
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- 2. BANNERS BUCKET
-- Name: banners
-- Public: true
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- 3. POSTS BUCKET
-- Name: posts
-- Public: true
-- File size limit: 100MB
-- Allowed MIME types: image/*, video/*, audio/*

-- 4. VIDEOS BUCKET
-- Name: videos
-- Public: true
-- File size limit: 500MB
-- Allowed MIME types: video/mp4, video/webm, video/ogg

-- 5. SHORTS BUCKET
-- Name: shorts
-- Public: true
-- File size limit: 100MB
-- Allowed MIME types: video/mp4, video/webm

-- 6. STORIES BUCKET
-- Name: stories
-- Public: true
-- File size limit: 50MB
-- Allowed MIME types: image/*, video/*

-- 7. THUMBNAILS BUCKET
-- Name: thumbnails
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

/*
  STORAGE POLICIES
  ================
  
  Run these SQL commands in Supabase SQL Editor to set up storage policies:
*/

-- ============================================================================
-- AVATARS BUCKET POLICIES
-- ============================================================================

-- Allow public to read avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- BANNERS BUCKET POLICIES
-- ============================================================================

-- Allow public to read banners
CREATE POLICY "Banners are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Allow authenticated users to upload their own banner
CREATE POLICY "Users can upload their own banner"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own banner
CREATE POLICY "Users can update their own banner"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own banner
CREATE POLICY "Users can delete their own banner"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'banners' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- POSTS BUCKET POLICIES
-- ============================================================================

-- Allow public to read posts media
CREATE POLICY "Post media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

-- Allow authenticated users to upload posts
CREATE POLICY "Authenticated users can upload posts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own posts
CREATE POLICY "Users can update their own posts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete their own posts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- VIDEOS BUCKET POLICIES
-- ============================================================================

-- Allow public to read videos
CREATE POLICY "Videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own videos
CREATE POLICY "Users can update their own videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- SHORTS BUCKET POLICIES
-- ============================================================================

-- Allow public to read shorts
CREATE POLICY "Shorts are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'shorts');

-- Allow authenticated users to upload shorts
CREATE POLICY "Authenticated users can upload shorts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'shorts' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own shorts
CREATE POLICY "Users can update their own shorts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'shorts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own shorts
CREATE POLICY "Users can delete their own shorts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'shorts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- STORIES BUCKET POLICIES
-- ============================================================================

-- Allow public to read stories
CREATE POLICY "Stories are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'stories');

-- Allow authenticated users to upload stories
CREATE POLICY "Authenticated users can upload stories"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'stories' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own stories
CREATE POLICY "Users can update their own stories"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'stories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own stories
CREATE POLICY "Users can delete their own stories"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'stories' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- THUMBNAILS BUCKET POLICIES
-- ============================================================================

-- Allow public to read thumbnails
CREATE POLICY "Thumbnails are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

-- Allow authenticated users to upload thumbnails
CREATE POLICY "Authenticated users can upload thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'thumbnails' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own thumbnails
CREATE POLICY "Users can update their own thumbnails"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own thumbnails
CREATE POLICY "Users can delete their own thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'thumbnails' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
