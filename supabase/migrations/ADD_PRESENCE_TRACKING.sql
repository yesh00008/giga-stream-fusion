-- Add real-time presence tracking to profiles table

-- Add last_seen column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_seen TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Create function to update last_seen automatically
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_seen when is_online changes to true
  IF NEW.is_online = true AND (OLD.is_online IS NULL OR OLD.is_online = false) THEN
    NEW.last_seen = NOW();
  END IF;
  
  -- Update last_seen when is_online changes to false
  IF NEW.is_online = false AND OLD.is_online = true THEN
    NEW.last_seen = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic last_seen updates
DROP TRIGGER IF EXISTS trigger_update_last_seen ON profiles;
CREATE TRIGGER trigger_update_last_seen
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.is_online IS DISTINCT FROM NEW.is_online)
  EXECUTE FUNCTION update_last_seen();

-- Create function to set user online
CREATE OR REPLACE FUNCTION set_user_online(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET is_online = true, last_seen = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to set user offline
CREATE OR REPLACE FUNCTION set_user_offline(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET is_online = false, last_seen = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get active users count
CREATE OR REPLACE FUNCTION get_active_users_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM profiles 
    WHERE is_online = true 
    AND last_seen > NOW() - INTERVAL '5 minutes'
  )::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for online status queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON profiles(is_online) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen ON profiles(last_seen DESC);
