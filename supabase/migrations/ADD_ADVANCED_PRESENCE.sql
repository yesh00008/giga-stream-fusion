-- Add advanced presence features to profiles table

-- Add away status columns if they don't exist
DO $$ 
BEGIN
  -- Add is_away column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_away'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_away BOOLEAN DEFAULT false;
  END IF;

  -- Add away_message column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'away_message'
  ) THEN
    ALTER TABLE profiles ADD COLUMN away_message TEXT;
  END IF;
END $$;

-- Create index for away status
CREATE INDEX IF NOT EXISTS idx_profiles_is_away ON profiles(is_away) WHERE is_away = true;

-- Update the set_user_online function to handle away status
CREATE OR REPLACE FUNCTION set_user_online(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    is_online = true,
    is_away = false,  -- Clear away status when user comes online
    last_seen = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to set away status
CREATE OR REPLACE FUNCTION set_user_away(user_id UUID, away_msg TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    is_away = true,
    away_message = away_msg,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to clear away status
CREATE OR REPLACE FUNCTION clear_user_away(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET 
    is_away = false,
    away_message = NULL,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get enhanced presence info
CREATE OR REPLACE FUNCTION get_enhanced_presence(user_id UUID)
RETURNS TABLE (
  is_online BOOLEAN,
  is_away BOOLEAN,
  last_seen TIMESTAMPTZ,
  away_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.is_online,
    p.is_away,
    p.last_seen,
    p.away_message
  FROM profiles p
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
