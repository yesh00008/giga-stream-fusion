-- Add voice message support to messages table
-- This enables Instagram/WhatsApp-style voice messaging:
-- - Record voice messages
-- - Send voice messages as audio files
-- - Play voice messages with waveform visualization
-- - Play-once feature (like Instagram/Snapchat)

-- Add voice_url column for storing audio file URL
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS voice_url TEXT;

-- Add voice_duration column for storing audio duration in seconds
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS voice_duration INTEGER;

-- Add voice_play_once column for play-once feature
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS voice_play_once BOOLEAN DEFAULT FALSE;

-- Create index for better query performance on voice messages
CREATE INDEX IF NOT EXISTS idx_messages_voice_url ON messages(voice_url) WHERE voice_url IS NOT NULL;

-- Add comments to document the columns
COMMENT ON COLUMN messages.voice_url IS 'URL to the voice message audio file stored in Supabase Storage';
COMMENT ON COLUMN messages.voice_duration IS 'Duration of the voice message in seconds';
COMMENT ON COLUMN messages.voice_play_once IS 'If true, voice message can only be played once by the recipient';

-- Update RLS policies to allow voice message access (if not already covered)
-- Users should be able to read voice messages they sent or received
-- This is typically already covered by existing message RLS policies

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON messages TO authenticated;
