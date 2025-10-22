# Feed System Setup Instructions

## 🔥 Quick Fix for the Current Error

The error you're seeing is because the database tables for feed interactions don't exist yet. Follow these steps:

### Step 1: Run the SQL Schema

1. **Open Supabase Dashboard**: Go to your project at https://supabase.com/dashboard
2. **Navigate to SQL Editor**: Click on "SQL Editor" in the left sidebar
3. **Create New Query**: Click "New query"
4. **Copy and Paste**: Open the file `FEED_TABLES.sql` and copy ALL the content
5. **Run the Query**: Click "Run" or press `Ctrl+Enter` (Windows) or `Cmd+Enter` (Mac)

This will create:
- ✅ `post_likes` table - Store user likes
- ✅ `bookmarks` table - Store user bookmarks
- ✅ `retweets` table - Store user retweets
- ✅ Added columns to `posts` table: `is_draft`, `metadata`, `video_url`
- ✅ Database functions for counting likes/comments
- ✅ Triggers to auto-update counts
- ✅ Row Level Security (RLS) policies
- ✅ Proper indexes for performance

### Step 2: Verify the Setup

Run these queries in SQL Editor to verify:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('post_likes', 'bookmarks', 'retweets');

-- Should return 3 rows with the table names
```

```sql
-- Check if posts table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('is_draft', 'metadata', 'video_url');

-- Should return 3 rows with column details
```

### Step 3: Reload the Application

After running the SQL:
1. Go back to your browser with the app
2. **Hard refresh**: Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. The feed should now load without errors!

---

## 📊 Database Schema Overview

### Tables Created:

#### 1. `post_likes`
```sql
- id (UUID, Primary Key)
- post_id (UUID, Foreign Key to posts)
- user_id (UUID, Foreign Key to auth.users)
- created_at (Timestamp)
- UNIQUE constraint on (post_id, user_id)
```

#### 2. `bookmarks`
```sql
- id (UUID, Primary Key)
- post_id (UUID, Foreign Key to posts)
- user_id (UUID, Foreign Key to auth.users)
- created_at (Timestamp)
- UNIQUE constraint on (post_id, user_id)
```

#### 3. `retweets`
```sql
- id (UUID, Primary Key)
- post_id (UUID, Foreign Key to posts)
- user_id (UUID, Foreign Key to auth.users)
- created_at (Timestamp)
- UNIQUE constraint on (post_id, user_id)
```

### Posts Table Updates:

New columns added:
- `is_draft` (BOOLEAN) - Whether the post is a draft
- `metadata` (JSONB) - Store additional data like polls, visibility settings
- `video_url` (TEXT) - Store video URLs

---

## 🔒 Security (RLS Policies)

All tables have Row Level Security enabled:

**post_likes:**
- Anyone can view likes
- Users can only like posts as themselves
- Users can only unlike their own likes

**bookmarks:**
- Users can only see their own bookmarks
- Users can only bookmark as themselves
- Users can only remove their own bookmarks

**retweets:**
- Anyone can view retweets
- Users can only retweet as themselves
- Users can only unretweet their own retweets

---

## 🎯 Features Enabled

After running the SQL, you'll have:

✅ **Like System**
- Click heart to like/unlike posts
- Automatic count updates via triggers
- Persists across sessions

✅ **Bookmark System**
- Save posts for later
- Private bookmarks (only you can see)
- Easy to remove bookmarks

✅ **Retweet System**
- Share posts to your followers
- Track retweet counts
- Easy undo

✅ **Draft System**
- Save posts without publishing
- Edit drafts before publishing
- Automatically filtered from public feed

✅ **Media Support**
- Upload images (stored in Supabase Storage)
- Video URL support
- Multiple images per post

✅ **Metadata Storage**
- Poll data
- Visibility settings
- Quote tweet references
- Reply threading

---

## 🐛 Troubleshooting

### Error: "Could not find a relationship between 'posts' and 'post_likes'"

**Solution**: You haven't run the SQL schema yet. Follow Step 1 above.

### Error: "relation 'public.post_likes' does not exist"

**Solution**: Same as above - run the FEED_TABLES.sql script.

### Error: "permission denied for table post_likes"

**Solution**: The RLS policies weren't created. Re-run the SQL script completely.

### Posts show but interactions don't work

**Check**:
1. Are you logged in?
2. Run this query to check if your user exists:
```sql
SELECT id, email FROM auth.users WHERE id = auth.uid();
```

### Likes count doesn't update

**Check if trigger exists**:
```sql
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_like_count';
```

If it doesn't exist, re-run the SQL script.

---

## 🚀 Testing the Feed

After setup, test these features:

1. **Create a Post**
   - Write some text
   - Upload an image (optional)
   - Click "Post"

2. **Like a Post**
   - Click the heart icon
   - Count should increment
   - Heart should turn red

3. **Bookmark a Post**
   - Click the bookmark icon
   - Check your bookmarks (coming soon)

4. **Retweet a Post**
   - Click the retweet icon (circular arrows)
   - Count should increment
   - Icon should turn green

5. **Edit Your Post**
   - Click the 3 dots on YOUR post
   - Select "Edit post"
   - Make changes
   - Save

6. **Delete Your Post**
   - Click the 3 dots on YOUR post
   - Select "Delete post"
   - Confirm deletion

7. **Save as Draft**
   - Write a post
   - Click "Draft" instead of "Post"
   - Post saves without publishing

---

## 📈 Performance Optimizations

The SQL script includes:

✅ **Indexes**
- On `post_id` for faster lookups
- On `user_id` for user-specific queries
- On `created_at` for chronological ordering
- Composite indexes for common query patterns

✅ **Triggers**
- Auto-update likes count on insert/delete
- Prevents manual count maintenance

✅ **Functions**
- Increment/decrement functions for atomic updates
- Security definer for protected operations

✅ **View**
- Optional `feed_posts_view` for complex queries
- Pre-joined data for faster reads

---

## 💾 Backup Recommendation

Before running the SQL, backup your current database:

1. Go to Database → Backups in Supabase
2. Click "Create backup"
3. Wait for completion
4. Then run the SQL script

---

## 📝 Summary

1. ✅ Run `FEED_TABLES.sql` in Supabase SQL Editor
2. ✅ Verify tables were created
3. ✅ Hard refresh your browser
4. ✅ Test the feed features

**Need help?** Check the troubleshooting section or open an issue.

---

**Created**: October 22, 2025  
**Version**: 1.0.0  
**Status**: Ready for Production ✨
