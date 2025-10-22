-- =============================================
-- CHECK AND FIX AVATAR URLS
-- =============================================
-- This script will check if avatar_url is populated and provide a fix

-- Step 1: Check current avatar_url values
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  CASE 
    WHEN avatar_url IS NULL THEN '❌ NULL - No avatar'
    WHEN avatar_url = '' THEN '❌ Empty string'
    ELSE '✅ Has avatar'
  END as status
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Step 2: If avatars are NULL/empty, you have 3 options:

-- OPTION A: Update to use placeholder avatars (temporary fix)
-- This uses UI Avatars service to generate avatar from name
-- Uncomment below to apply:

/*
UPDATE profiles
SET avatar_url = 'https://ui-avatars.com/api/?name=' || 
                 REPLACE(COALESCE(full_name, username, 'User'), ' ', '+') || 
                 '&background=random&size=128'
WHERE avatar_url IS NULL OR avatar_url = '';
*/

-- OPTION B: Upload real avatars via Supabase Storage
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create a bucket named "avatars" (make it public)
-- 3. Upload user avatars
-- 4. Update profiles table with storage URLs:

/*
UPDATE profiles
SET avatar_url = 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/avatars/user_' || id || '.jpg'
WHERE id = 'USER_ID_HERE';
*/

-- OPTION C: Extract from auth.users metadata (if avatars were set during signup)
-- This pulls avatar_url from the user metadata that was set during authentication

/*
UPDATE profiles p
SET avatar_url = (
  SELECT raw_user_meta_data->>'avatar_url'
  FROM auth.users u
  WHERE u.id = p.id
)
WHERE avatar_url IS NULL 
  AND EXISTS (
    SELECT 1 FROM auth.users u 
    WHERE u.id = p.id 
    AND u.raw_user_meta_data->>'avatar_url' IS NOT NULL
  );
*/

-- Step 3: Verify the update
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  CASE 
    WHEN avatar_url IS NULL THEN '❌ Still NULL'
    WHEN avatar_url = '' THEN '❌ Still empty'
    WHEN avatar_url LIKE 'http%' THEN '✅ Valid URL'
    ELSE '⚠️ Check this value'
  END as validation
FROM profiles
ORDER BY created_at DESC
LIMIT 10;
