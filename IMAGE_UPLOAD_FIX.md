# 🚀 Feed Image Upload Fix

## Issues Found:
1. ❌ **Bucket not found**: Code was trying to use `media` bucket which doesn't exist
2. ❌ **Missing column**: `posts` table doesn't have `image_url` column

## ✅ Fixes Applied:

### 1. Changed Storage Bucket
**File**: `src/lib/feed-service.ts`
- Changed from: `supabase.storage.from('media')`
- Changed to: `supabase.storage.from('posts')`

This uses the existing `posts` bucket for image uploads.

### 2. Added image_url Column
**File**: `FEED_TABLES.sql`
- Added SQL to create `image_url` column in `posts` table

## 📋 Quick Setup (Choose One):

### Option A: Run Quick Fix (Fastest - 30 seconds)
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste contents of **`ADD_IMAGE_URL_COLUMN.sql`**
3. Click **"Run"**
4. You should see: ✅ "image_url column added successfully"

### Option B: Run Full Schema (Recommended - 2 minutes)
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste contents of **`FEED_TABLES.sql`**
3. Click **"Run"**
4. This will create all tables + add missing columns

## 🧪 Verification

After running the SQL, verify with this query:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('image_url', 'video_url', 'is_draft', 'metadata')
ORDER BY column_name;
```

You should see all 4 columns listed.

## 🎯 Storage Buckets Used

The feed now uses these **existing** buckets:
- **`posts`** - For images uploaded with feed posts
- **`videos`** - For video uploads (future feature)

### Storage Structure:
```
posts/
  └── {user_id}/
      ├── 1761124963757-0.989916.jpg
      ├── 1761124963758-0.234567.png
      └── ...
```

## 🔧 What Changed in Code:

### feed-service.ts (Line ~393)
```typescript
// BEFORE:
const { error: uploadError } = await supabase.storage
  .from('media')  // ❌ Doesn't exist
  .upload(filePath, file);

// AFTER:
const { error: uploadError } = await supabase.storage
  .from('posts')  // ✅ Uses existing bucket
  .upload(filePath, file);
```

### FEED_TABLES.sql (Added)
```sql
-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'image_url') THEN
        ALTER TABLE public.posts ADD COLUMN image_url TEXT;
    END IF;
END $$;
```

## ✅ After Setup - Test It!

1. **Hard refresh** your browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Go to Feed page
3. Try creating a post with:
   - ✅ Just text
   - ✅ Text + 1 image
   - ✅ Text + multiple images (up to 4)

## 🎉 Expected Results:

✅ **Text Post**: Should post immediately, no errors
✅ **Post with Images**: 
   - Images upload to `posts` bucket
   - First image stored in `image_url` column
   - All images stored in `metadata.image_urls` array
   - Post appears in feed with images displayed

## 🐛 Still Getting Errors?

### Error: "Bucket not found"
**Solution**: Make sure `posts` bucket exists in Supabase Storage
1. Go to Supabase Dashboard → Storage
2. Check if "posts" bucket exists
3. If not, create it:
   - Name: `posts`
   - Public: Yes
   - File size limit: 100MB

### Error: "image_url column not found"
**Solution**: Run the SQL script again
1. Open SQL Editor
2. Run `ADD_IMAGE_URL_COLUMN.sql`
3. Hard refresh browser

### Error: "Row Level Security violation"
**Solution**: Check storage policies
```sql
-- Run this to add storage policy
CREATE POLICY "Authenticated users can upload posts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts' 
  AND auth.role() = 'authenticated'
);
```

## 📞 Need Help?

If you still see errors:
1. Copy the **exact error message** from browser console
2. Check which file/line it's coming from
3. Verify the SQL ran successfully (check for success message)

---

**Status**: ✅ Code fixed, waiting for database schema update
**Next Step**: Run `ADD_IMAGE_URL_COLUMN.sql` in Supabase
