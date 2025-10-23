-- =====================================================
-- FIX MESSAGES TABLE - Add Missing Columns
-- =====================================================
-- Run this in your Supabase SQL Editor to fix the messages table

-- Add missing columns to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS is_request BOOLEAN DEFAULT false NOT NULL;

-- CRITICAL: Add the 'read' column that's currently missing
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT false NOT NULL;

-- Add index for is_request queries
CREATE INDEX IF NOT EXISTS idx_messages_is_request 
ON public.messages(is_request, receiver_id) 
WHERE is_request = true;

-- Drop existing functions before recreating them
DROP FUNCTION IF EXISTS public.get_conversation(uuid, integer);
DROP FUNCTION IF EXISTS public.mark_messages_read(uuid);

-- Update the get_conversation function to include image_url
CREATE OR REPLACE FUNCTION public.get_conversation(
    other_user_id UUID,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    sender_id UUID,
    receiver_id UUID,
    content TEXT,
    image_url TEXT,
    read BOOLEAN,
    is_request BOOLEAN,
    created_at TIMESTAMPTZ,
    sender_username TEXT,
    sender_name TEXT,
    sender_avatar TEXT,
    receiver_username TEXT,
    receiver_name TEXT,
    receiver_avatar TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.content,
        m.image_url,
        m.read,
        m.is_request,
        m.created_at,
        p1.username as sender_username,
        p1.full_name as sender_name,
        p1.avatar_url as sender_avatar,
        p2.username as receiver_username,
        p2.full_name as receiver_name,
        p2.avatar_url as receiver_avatar
    FROM public.messages m
    LEFT JOIN public.profiles p1 ON m.sender_id = p1.id
    LEFT JOIN public.profiles p2 ON m.receiver_id = p2.id
    WHERE 
        (m.sender_id = auth.uid() AND m.receiver_id = other_user_id)
        OR 
        (m.sender_id = other_user_id AND m.receiver_id = auth.uid())
    ORDER BY m.created_at DESC
    LIMIT limit_count;
END;
$$;

-- Update the mark_messages_read function
CREATE OR REPLACE FUNCTION public.mark_messages_read(sender_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.messages
    SET read = true
    WHERE receiver_id = auth.uid() 
    AND sender_id = sender_user_id
    AND read = false;
END;
$$;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Messages table fixed successfully!';
    RAISE NOTICE 'Added columns: image_url, is_request';
    RAISE NOTICE 'Updated functions: get_conversation, mark_messages_read';
END $$;
