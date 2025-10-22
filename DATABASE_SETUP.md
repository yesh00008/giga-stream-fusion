# 🗄️ Database Setup Guide

## Quick Setup (Recommended)

Follow these steps to set up your complete database in **under 5 minutes**:

### Step 1: Run the Main Schema (2 minutes)

1. Open your Supabase Dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the **ENTIRE** contents of `database-schema.sql`
5. Paste into the SQL editor
6. Click **Run** (bottom right)
7. Wait for "Success" message (~30 seconds)

✅ This creates:
- 13 tables (profiles, posts, likes, comments, follows, notifications, messages, playlists, etc.)
- All indexes for performance
- Row Level Security policies
- Automatic triggers and functions
- Complete relationships between tables

### Step 2: Create Storage Buckets (2 minutes)

Go to **Storage** in your Supabase Dashboard:

#### Create These Buckets (click "New Bucket" for each):

1. **avatars**
   - Public: ✅ Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

2. **banners**
   - Public: ✅ Yes
   - File size limit: 10MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

3. **posts**
   - Public: ✅ Yes
   - File size limit: 100MB
   - Allowed MIME types: `image/*, video/*, audio/*`

4. **videos**
   - Public: ✅ Yes
   - File size limit: 500MB
   - Allowed MIME types: `video/mp4, video/webm, video/ogg`

5. **shorts**
   - Public: ✅ Yes
   - File size limit: 100MB
   - Allowed MIME types: `video/mp4, video/webm`

6. **stories**
   - Public: ✅ Yes
   - File size limit: 50MB
   - Allowed MIME types: `image/*, video/*`

7. **thumbnails**
   - Public: ✅ Yes
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

### Step 3: Set Up Storage Policies (1 minute)

1. Go back to **SQL Editor**
2. Click **New Query**
3. Copy the **ENTIRE** contents of `storage-setup.sql`
4. Paste and click **Run**
5. Wait for "Success" message

✅ This sets up secure access policies for all storage buckets

### Step 4: Verify Everything Works (30 seconds)

1. Go to **Table Editor** in Supabase Dashboard
2. You should see all these tables:
   - ✅ profiles
   - ✅ posts
   - ✅ likes
   - ✅ comments
   - ✅ follows
   - ✅ notifications
   - ✅ messages
   - ✅ playlists
   - ✅ playlist_items
   - ✅ watch_history
   - ✅ subscriptions
   - ✅ stories

3. Go to **Storage** and verify all 7 buckets are created

4. Start your app:
   ```bash
   npm run dev
   ```

5. Try signing up - a profile should be automatically created!

## 📊 Database Structure

### Core Tables

#### profiles
User profile information with character data, verification status, and social counts.

#### posts
All content types: regular posts, shorts, live streams, stories. Includes media URLs, engagement metrics, and visibility settings.

#### likes
User likes on posts with automatic count updates.

#### comments
Nested comments with reply support and likes.

#### follows
User follow relationships with automatic follower/following counts.

### Engagement Tables

#### notifications
Real-time notifications for likes, comments, follows, mentions, and shares.

#### messages
Direct messaging between users.

#### subscriptions
Channel subscriptions with notification preferences.

### Content Organization

#### playlists & playlist_items
User-created playlists with videos.

#### watch_history
Tracking what users have watched and progress.

#### stories
24-hour temporary stories (auto-expire).

## 🔐 Security Features

All tables have:
- ✅ **Row Level Security (RLS)** enabled
- ✅ **Policies** for read/write access
- ✅ **User isolation** - users can only modify their own data
- ✅ **Public read** - everyone can view public content
- ✅ **Authenticated write** - only logged-in users can create content

## ⚡ Performance Optimizations

Included in the schema:
- ✅ **Indexes** on frequently queried columns
- ✅ **Automatic counts** via triggers (likes_count, comments_count, etc.)
- ✅ **Cascading deletes** - cleanup when users/posts are deleted
- ✅ **GIN indexes** for array fields (tags)
- ✅ **Timestamp indexes** for sorting by date

## 🔧 Automatic Features

### Triggers & Functions

**On user signup:**
- Automatically creates profile in `profiles` table
- Sets username from metadata or generates one

**On like/unlike:**
- Updates `likes_count` on the post
- Creates notification for post owner

**On comment:**
- Updates `comments_count` on the post
- Supports nested replies

**On follow/unfollow:**
- Updates `followers_count` and `following_count`
- Creates notification

**On update:**
- Automatically updates `updated_at` timestamp

## 📁 Storage Buckets

### Bucket Structure

```
avatars/
  └── {user_id}/
      └── avatar.jpg

banners/
  └── {user_id}/
      └── banner.jpg

posts/
  └── {user_id}/
      └── {post_id}/
          └── media.jpg

videos/
  └── {user_id}/
      └── {video_id}/
          └── video.mp4

shorts/
  └── {user_id}/
      └── {short_id}/
          └── short.mp4

stories/
  └── {user_id}/
      └── {story_id}/
          └── story.jpg

thumbnails/
  └── {user_id}/
      └── {video_id}/
          └── thumb.jpg
```

### Storage Policies

All buckets have:
- ✅ Public read access
- ✅ Authenticated users can upload to their own folder
- ✅ Users can update/delete only their own files
- ✅ Files organized by user_id for security

## 🧪 Testing the Setup

### Test 1: User Signup
```bash
# Start your app
npm run dev

# Navigate to /signup
# Create a new account
# Check Supabase Dashboard > Authentication > Users
# Check Table Editor > profiles - your profile should be there!
```

### Test 2: Create a Post
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('posts')
  .insert({
    user_id: 'your-user-id',
    content: 'Hello, Giga!',
    post_type: 'post',
    visibility: 'public'
  });
```

### Test 3: Upload an Avatar
```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file);
```

## 🐛 Troubleshooting

### "Failed to run query" error

**Cause:** SQL syntax error or permission issue

**Solution:**
1. Make sure you copied the ENTIRE SQL file
2. Check for any copy-paste errors
3. Run in smaller chunks if needed
4. Verify you're using the service_role key (not anon key)

### Tables not showing up

**Cause:** SQL didn't execute completely

**Solution:**
1. Go to SQL Editor
2. Run: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
3. Check which tables exist
4. Re-run the missing table creation statements

### Storage policies not working

**Cause:** Policies not created or syntax error

**Solution:**
1. Go to Storage > Buckets > [bucket name] > Policies
2. Verify policies are listed
3. Re-run storage-setup.sql if empty
4. Check Storage Logs for policy violation errors

### Profile not created on signup

**Cause:** Trigger not working

**Solution:**
1. Go to SQL Editor
2. Run: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
3. If empty, re-run the trigger creation from database-schema.sql
4. Delete test user and try signup again

### Counts not updating (likes_count, followers_count)

**Cause:** Triggers not working

**Solution:**
1. Verify triggers exist: 
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%count%';
   ```
2. Re-run the trigger sections from database-schema.sql
3. Manually test by liking/unliking a post

## 📚 Additional Resources

- **Supabase Docs:** https://supabase.com/docs
- **SQL Editor:** https://supabase.com/dashboard/project/_/sql
- **Table Editor:** https://supabase.com/dashboard/project/_/editor
- **Storage:** https://supabase.com/dashboard/project/_/storage

## 🎯 Next Steps

After setup is complete:

1. ✅ Test user signup/login
2. ✅ Create some test posts
3. ✅ Try uploading images to storage
4. ✅ Test following/unfollowing users
5. ✅ Check notifications are created
6. ✅ Verify RLS policies work (can't edit other users' posts)

---

**Need help?** Check the Supabase Dashboard logs or the troubleshooting section above.
