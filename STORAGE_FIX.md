# 🔧 Fix Avatar Upload Error - Storage RLS Policy

## Problem
```
Failed to upload avatar: new row violates row-level security policy
POST https://*.supabase.co/storage/v1/object/avatars/* 400 (Bad Request)
```

## Cause
The Supabase Storage buckets don't have the correct Row Level Security (RLS) policies to allow authenticated users to upload files.

## Solution

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `mbppxyzdynwjpftzdpgt`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Storage Policies Script

Copy and paste the entire content of `STORAGE_POLICIES.sql` into the SQL Editor, then click **Run**.

This script will:
- ✅ Create/update the `avatars` bucket
- ✅ Create/update the `banners` bucket
- ✅ Set up proper RLS policies for uploads
- ✅ Allow public read access
- ✅ Restrict uploads to authenticated users
- ✅ Ensure users can only manage their own files

### Step 3: Verify Bucket Configuration

Run this query to check buckets:

```sql
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id IN ('avatars', 'banners');
```

Expected result:
```
id       | name    | public | file_size_limit | allowed_mime_types
---------|---------|--------|-----------------|-------------------
avatars  | avatars | true   | 5242880         | {image/jpeg, ...}
banners  | banners | true   | 10485760        | {image/jpeg, ...}
```

### Step 4: Verify RLS Policies

Run this query to check policies:

```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%avatar%' OR policyname LIKE '%banner%';
```

You should see 8 policies (4 for avatars, 4 for banners):
- `Avatar images are publicly accessible` (SELECT)
- `Users can upload their own avatar` (INSERT)
- `Users can update their own avatar` (UPDATE)
- `Users can delete their own avatar` (DELETE)
- `Banner images are publicly accessible` (SELECT)
- `Users can upload their own banner` (INSERT)
- `Users can update their own banner` (UPDATE)
- `Users can delete their own banner` (DELETE)

### Step 5: Test Avatar Upload

1. Log in to your application
2. Go to Profile page
3. Click Edit Profile
4. Click "Upload Avatar"
5. Select an image file
6. Upload should now work! ✅

## How It Works

### File Path Structure
```
bucket: avatars
path: {user_id}/avatar-{timestamp}.{ext}
example: da83b077-ea5e-49f6-9dd5-43ad2f8342d0/avatar-1761114569642.jpg
```

### RLS Policy Logic

#### For Uploads (INSERT)
```sql
-- Allow if:
-- 1. User is authenticated
-- 2. Bucket is 'avatars' or 'banners'
-- 3. First folder in path matches user's ID
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
)
```

This ensures:
- ✅ Only logged-in users can upload
- ✅ Users can only upload to their own folder
- ✅ Users cannot upload to other users' folders

#### For Reading (SELECT)
```sql
-- Allow if:
-- Bucket is 'avatars' or 'banners' (public read)
USING (bucket_id = 'avatars')
```

This ensures:
- ✅ Anyone can view avatars/banners
- ✅ Images are publicly accessible via URL

## Manual Setup (Alternative)

If you prefer to set up manually via the Supabase Dashboard:

### 1. Create Buckets

**Avatars Bucket:**
- Go to **Storage** → **Create new bucket**
- Name: `avatars`
- Public: ✅ Yes
- File size limit: `5242880` (5MB)
- Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp, image/gif`

**Banners Bucket:**
- Go to **Storage** → **Create new bucket**
- Name: `banners`
- Public: ✅ Yes
- File size limit: `10485760` (10MB)
- Allowed MIME types: `image/jpeg, image/jpg, image/png, image/webp`

### 2. Create Policies

For each bucket, create these 4 policies:

#### Policy 1: Public Read
- **Policy name**: `[Avatar/Banner] images are publicly accessible`
- **Target roles**: `public`
- **Policy command**: `SELECT`
- **Policy definition**:
  ```sql
  bucket_id = 'avatars' -- or 'banners'
  ```

#### Policy 2: Insert Own Files
- **Policy name**: `Users can upload their own [avatar/banner]`
- **Target roles**: `authenticated`
- **Policy command**: `INSERT`
- **WITH CHECK expression**:
  ```sql
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
  ```

#### Policy 3: Update Own Files
- **Policy name**: `Users can update their own [avatar/banner]`
- **Target roles**: `authenticated`
- **Policy command**: `UPDATE`
- **USING expression**:
  ```sql
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
  ```
- **WITH CHECK expression**: (same as USING)

#### Policy 4: Delete Own Files
- **Policy name**: `Users can delete their own [avatar/banner]`
- **Target roles**: `authenticated`
- **Policy command**: `DELETE`
- **USING expression**:
  ```sql
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
  ```

## Verification

After setup, test with these queries:

### Check User ID
```sql
SELECT auth.uid();
```

### List All Policies
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

### Test Upload Path
```sql
-- Simulate checking if user can upload
SELECT 
  auth.uid()::text as user_id,
  'da83b077-ea5e-49f6-9dd5-43ad2f8342d0/avatar.jpg' as path,
  (storage.foldername('da83b077-ea5e-49f6-9dd5-43ad2f8342d0/avatar.jpg'))[1] as folder,
  (storage.foldername('da83b077-ea5e-49f6-9dd5-43ad2f8342d0/avatar.jpg'))[1] = auth.uid()::text as can_upload;
```

## Troubleshooting

### Still getting RLS error?
1. Make sure you're logged in (check browser console for auth token)
2. Verify `auth.uid()` returns a valid UUID
3. Check file path format matches: `{user_id}/filename.ext`
4. Ensure bucket exists and is public
5. Verify policies are active (not disabled)

### 400 Bad Request?
- Check file size is within limits
- Verify MIME type is allowed
- Check file path doesn't have special characters

### Network error?
- Verify Supabase project URL is correct
- Check API keys are set in `.env`
- Ensure network connection is stable

### Can't create policies?
- You need to be the project owner or have admin access
- Some policies might already exist - drop them first
- Check SQL syntax is correct

## Success Indicators

✅ No console errors when uploading
✅ Toast shows "Avatar updated successfully!"
✅ New avatar appears immediately
✅ Avatar URL saved to database
✅ Can see uploaded file in Supabase Storage

## Next Steps

After fixing storage policies:
1. Test banner upload as well
2. Upload multiple files to verify policies work
3. Try from different user accounts
4. Check file permissions in Storage dashboard
5. Monitor storage usage

---

**Need Help?**
- Check Supabase docs: https://supabase.com/docs/guides/storage
- Review browser console for detailed errors
- Verify your Supabase project settings
- Ensure you're using the latest Supabase client library

🎉 Once complete, avatar and banner uploads will work perfectly!
