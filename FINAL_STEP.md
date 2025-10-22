# 🎯 FINAL STEP: Create Database Tables

## ✅ What's Already Done:
- Environment variables configured
- 7 storage buckets created in Supabase
- Database schema ready (database-schema.sql)

## 📋 Choose ONE Method:

### Method 1: Supabase Dashboard (EASIEST - 2 minutes)

1. **Open SQL Editor:**
   https://supabase.com/dashboard/project/mbppxyzdynwjpftzdpgt/sql/new

2. **In VS Code:**
   - Open `database-schema.sql`
   - Press `Ctrl+A` (select all)
   - Press `Ctrl+C` (copy)

3. **In Supabase SQL Editor:**
   - Press `Ctrl+V` (paste)
   - Click **RUN** button (bottom right)
   - Wait ~30 seconds

4. **Verify:**
   ```bash
   npm run db:verify
   ```

---

### Method 2: Command Line (if you have DB password)

1. **Get your database password:**
   https://supabase.com/dashboard/project/mbppxyzdynwjpftzdpgt/settings/database

2. **Run this command:**
   ```bash
   PGPASSWORD=your-db-password psql \
     "postgresql://postgres@db.mbppxyzdynwjpftzdpgt.supabase.co:5432/postgres" \
     -f database-schema.sql
   ```

3. **Verify:**
   ```bash
   npm run db:verify
   ```

---

## 🎉 After Tables Are Created:

```bash
# Start the app
npm run dev
```

Navigate to: http://localhost:5173/signup

Test:
1. Create an account
2. Profile will be auto-created!
3. Upload an avatar
4. Create your first post

---

## ✅ What You'll Have:

**13 Tables:**
- profiles, posts, likes, comments, follows
- notifications, messages, playlists, playlist_items
- watch_history, subscriptions, stories

**7 Storage Buckets:**
- avatars, banners, posts, videos, shorts, stories, thumbnails

**Automatic Features:**
- Profile creation on signup
- Like/comment counters
- Follower counts
- RLS security policies
- Cascade deletes
- Timestamps

---

**Stuck?** Run `npm run db:verify` to see what's missing!
