# Storage Setup - UI Method (EASIEST)

If you're getting "must be owner of table objects" error, use the Supabase Dashboard UI instead of SQL:

## Method 1: Using Supabase Dashboard (RECOMMENDED)

### Step 1: Check if 'posts' bucket exists
1. Go to **Supabase Dashboard**
2. Click **Storage** in the left sidebar
3. Look for a bucket named **'posts'**
4. If it doesn't exist, click **"New bucket"** and create it with:
   - Name: `posts`
   - Public bucket: ✅ **Checked**

### Step 2: Create RLS Policies via UI
1. In Storage, click on the **'posts'** bucket
2. Click on **"Policies"** tab at the top
3. Click **"New Policy"**

#### Policy 1: Allow uploads (INSERT)
- **Policy Name:** `Allow authenticated users to upload images`
- **Allowed operation:** `INSERT`
- **Target roles:** `authenticated`
- **USING expression:** Leave empty
- **WITH CHECK expression:**
  ```sql
  (bucket_id = 'posts'::text) AND 
  ((storage.foldername(name))[1] = 'posts'::text) AND 
  ((storage.foldername(name))[2] = (auth.uid())::text)
  ```

#### Policy 2: Allow public reads (SELECT)
- **Policy Name:** `Allow public read access to posts images`
- **Allowed operation:** `SELECT`
- **Target roles:** `public`
- **USING expression:**
  ```sql
  bucket_id = 'posts'::text
  ```
- **WITH CHECK expression:** Leave empty

#### Policy 3: Allow deletes (DELETE)
- **Policy Name:** `Allow users to delete their own images`
- **Allowed operation:** `DELETE`
- **Target roles:** `authenticated`
- **USING expression:**
  ```sql
  (bucket_id = 'posts'::text) AND 
  ((storage.foldername(name))[1] = 'posts'::text) AND 
  ((storage.foldername(name))[2] = (auth.uid())::text)
  ```
- **WITH CHECK expression:** Leave empty

### Step 3: Verify Setup
1. Go back to Storage → posts bucket
2. You should see 3 policies listed in the Policies tab
3. Try uploading an image from your app
4. Should work! ✅

---

## Method 2: Using SQL Editor (Alternative)

If the UI method doesn't work, try this simplified SQL:

```sql
-- Just create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

Then use **Method 1** (UI) to create the policies.

---

## Method 3: Super Simple - Just Make Bucket Public

If you just want to get it working quickly:

1. Go to **Storage** → **posts** bucket
2. Click on **Configuration** tab
3. Make sure **"Public bucket"** is ✅ **Checked**
4. This allows anyone to read, but you still need policies for uploads

---

## Quick Verification

After setup, test in your app:
1. Log in
2. Go to Feed page
3. Click the image icon
4. Select 1-4 images
5. Type some text
6. Click "Post"
7. Should upload successfully! ✅

---

## Common Issues

### "Bucket not found"
👉 Create the 'posts' bucket in Storage → New bucket

### "new row violates row-level security policy"
👉 Create the policies using Method 1 (UI method above)

### "must be owner of table objects"
👉 Use Method 1 (UI) instead of SQL

### Images upload but return 404
👉 Make sure bucket is set to **Public** in Configuration tab

---

## What These Policies Do

✅ **Upload Policy:** Users can only upload to `posts/{their_user_id}/filename.jpg`

✅ **Read Policy:** Anyone can view/download images (public access)

✅ **Delete Policy:** Users can only delete their own images

This is secure because:
- Users can't upload to other users' folders
- Users can't delete other users' images
- Everyone can view images (needed for social feed)

---

## Need Help?

If you're still having issues:
1. Make sure you're logged in to the app
2. Check browser console for detailed error messages
3. Verify the 'posts' bucket exists and is public
4. Try the UI method (Method 1) - it's the most reliable

Your code is correct - you just need these storage policies set up! 🚀
