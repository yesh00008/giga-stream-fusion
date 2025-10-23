# SQL Migration Guide - Message Requests Feature

## Overview
This migration adds the message request feature that allows users to only message their followers/following, with non-follower messages appearing as "requests".

## Required Database Changes

### Step 1: Add `is_request` Column to Messages Table

Run this in your Supabase SQL Editor:

```sql
-- Add is_request column to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS is_request BOOLEAN DEFAULT false NOT NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_is_request 
ON public.messages(is_request, receiver_id)
WHERE is_request = true;

-- Create index for conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON public.messages(sender_id, receiver_id, created_at DESC);
```

### Step 2: Update RLS Policies (if needed)

If your messages table doesn't have proper RLS policies, add these:

```sql
-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view messages they sent or received
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
  );

-- Policy: Users can insert messages
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can update their own messages (mark as read)
CREATE POLICY "Users can update their messages" ON public.messages
  FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Policy: Users can delete messages they received
CREATE POLICY "Users can delete messages" ON public.messages
  FOR DELETE
  USING (auth.uid() = receiver_id);
```

### Step 3: Verify Followers Table

Make sure your followers table exists and has proper structure:

```sql
-- Verify followers table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'followers' 
AND table_schema = 'public';

-- Expected columns:
-- id, follower_id, following_id, created_at

-- If you need to create it:
CREATE TABLE IF NOT EXISTS public.followers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(follower_id, following_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON public.followers(following_id);

-- Enable RLS
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for followers
CREATE POLICY "Anyone can view followers" ON public.followers
  FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others" ON public.followers
  FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON public.followers
  FOR DELETE
  USING (auth.uid() = follower_id);
```

### Step 4: Optional - Add Helper Function for Message Request Count

```sql
-- Function to get unread message request count
CREATE OR REPLACE FUNCTION get_message_request_count(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  request_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT sender_id) INTO request_count
  FROM public.messages
  WHERE receiver_id = user_id
    AND is_request = true
    AND NOT EXISTS (
      SELECT 1 FROM public.followers
      WHERE follower_id = messages.sender_id
      AND following_id = user_id
    );
  
  RETURN COALESCE(request_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Testing Your Migration

After running the SQL migrations, test the following:

1. **Follower-only search**: Try searching for users in Messages - you should only see followers/following
2. **Send message to follower**: Should work normally and appear in "Messages" tab
3. **Send message to non-follower**: Should appear in their "Requests" tab with `is_request=true`
4. **Accept request**: Should move from "Requests" to "Messages" tab
5. **Delete request**: Should remove the message entirely

## Verification Queries

Run these to verify the migration worked:

```sql
-- Check if is_request column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'messages' AND column_name = 'is_request';

-- Check for message requests
SELECT m.*, p.username as sender_username
FROM messages m
JOIN profiles p ON p.id = m.sender_id
WHERE m.is_request = true
LIMIT 10;

-- Check follower relationships
SELECT 
  f1.username as follower,
  f2.username as following
FROM followers
JOIN profiles f1 ON f1.id = followers.follower_id
JOIN profiles f2 ON f2.id = followers.following_id
LIMIT 10;
```

## Rollback (if needed)

If something goes wrong, you can rollback:

```sql
-- Remove is_request column
ALTER TABLE public.messages DROP COLUMN IF EXISTS is_request;

-- Drop indexes
DROP INDEX IF EXISTS idx_messages_is_request;
DROP INDEX IF EXISTS idx_messages_conversation;

-- Drop function
DROP FUNCTION IF EXISTS get_message_request_count(UUID);
```

## Feature Overview

After migration, your messaging system will:

1. ✅ Only allow users to search and message followers/following
2. ✅ Show non-follower messages as "requests" in a separate tab
3. ✅ Allow users to accept or reject message requests
4. ✅ Display mutual followers with badges
5. ✅ Maintain proper relationship context in all conversations

## Support

If you encounter issues:
- Check Supabase logs for SQL errors
- Verify RLS policies are enabled
- Ensure auth.users() function works in your environment
- Check that all foreign keys reference correct tables
