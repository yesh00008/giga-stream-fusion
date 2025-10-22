# Avatar Fix Guide

Your avatar is showing a fallback letter "Y" instead of the actual profile picture. This is because the `avatar_url` field in the database is likely NULL or empty.

## Quick Diagnosis

1. **Open your browser console** (F12 > Console tab)
2. **Refresh the home page**
3. **Look for the log**: `"First post profile data:"`
4. Check if `avatar_url` is `null` or has a value

## Fix Options

### Option 1: Use Placeholder Avatars (Fastest - 1 minute)

This uses a free service to generate colorful avatars from user names.

**Run this SQL in Supabase:**

```sql
UPDATE profiles
SET avatar_url = 'https://ui-avatars.com/api/?name=' || 
                 REPLACE(COALESCE(full_name, username, 'User'), ' ', '+') || 
                 '&background=random&size=128'
WHERE avatar_url IS NULL OR avatar_url = '';
```

Then **hard refresh** your browser: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)

---

### Option 2: Use Supabase Storage (Production-ready - 5 minutes)

Set up proper avatar storage in Supabase.

#### Step 1: Create Storage Bucket

1. Go to **Supabase Dashboard** > **Storage**
2. Click **"New bucket"**
3. Name it: `avatars`
4. Set **Public bucket**: ✅ ON
5. Click **"Create bucket"**

#### Step 2: Set Storage Policies

In the SQL Editor, run:

```sql
-- Allow anyone to read avatars
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Step 3: Upload Avatars

You can upload via:

**A) Dashboard UI:**
1. Go to **Storage** > **avatars** bucket
2. Click **"Upload file"**
3. Upload image files

**B) Programmatically** (we can add this to the app later)

#### Step 4: Update Profile URLs

Get your Supabase project URL from Dashboard, then run:

```sql
-- Replace YOUR_PROJECT_REF with your actual project reference
-- Example: https://abcdefgh.supabase.co
UPDATE profiles
SET avatar_url = 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/avatars/' || id || '.jpg'
WHERE id IN (
  SELECT id FROM profiles LIMIT 10  -- Update specific users
);
```

---

### Option 3: Extract from Auth Metadata (If already set)

If you signed up with Google/GitHub OAuth and already have avatars:

```sql
UPDATE profiles p
SET avatar_url = (
  SELECT raw_user_meta_data->>'avatar_url'
  FROM auth.users u
  WHERE u.id = p.id
)
WHERE avatar_url IS NULL;
```

---

## Verify It Works

After applying any fix:

1. **Check in Supabase:**
   ```sql
   SELECT username, full_name, avatar_url 
   FROM profiles 
   WHERE id = auth.uid();
   ```
   You should see a URL in `avatar_url`

2. **Check in Browser:**
   - Open browser console (F12)
   - Refresh the page
   - Look for: `"First post profile data:"` log
   - Should show `avatar_url: "https://..."`

3. **Visual Check:**
   - The "Y" letter should be replaced with an actual image
   - If still showing fallback, check if the URL is accessible by pasting it in a new tab

---

## Troubleshooting

### Avatar still not showing?

**Check 1: URL is accessible**
- Copy the `avatar_url` from the console log
- Paste it in a new browser tab
- If it doesn't load, the URL is invalid

**Check 2: CORS issues**
- Open browser console (F12) > Network tab
- Look for failed requests with CORS errors
- Solution: Make sure Storage bucket is public

**Check 3: Cache issues**
- Hard refresh: `Ctrl+Shift+R`
- Clear site data: DevTools > Application > Clear storage

**Check 4: Component receiving data?**
- Console should show: `avatar_url: "https://..."`
- If it shows `avatar_url: null`, the database update didn't work

---

## Recommended: Option 1 First

**I recommend starting with Option 1 (Placeholder Avatars)** because:
- ✅ Works immediately (30 seconds)
- ✅ No file uploads needed
- ✅ Automatically generates colorful avatars
- ✅ You can switch to Option 2 later

Just run this one SQL command:

```sql
UPDATE profiles
SET avatar_url = 'https://ui-avatars.com/api/?name=' || 
                 REPLACE(COALESCE(full_name, username, 'User'), ' ', '+') || 
                 '&background=random&size=128'
WHERE avatar_url IS NULL OR avatar_url = '';
```

Then hard refresh your browser (`Ctrl+Shift+R`).
