-- ============================================
-- ADD ALL NEW BADGE TYPES
-- ============================================

-- Update the badge_type constraint to include all new types
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_badge_type_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_badge_type_check 
  CHECK (badge_type IN ('verified', 'official', 'premium', 'vip', 'partner', 'founder', 'ceo', 'cofounder', 'government', 'organization'));

-- Update badge_requests constraint
ALTER TABLE badge_requests DROP CONSTRAINT IF EXISTS badge_requests_badge_type_check;
ALTER TABLE badge_requests ADD CONSTRAINT badge_requests_badge_type_check 
  CHECK (badge_type IN ('verified', 'official', 'premium', 'vip', 'partner', 'founder', 'ceo', 'cofounder', 'government', 'organization'));

-- Grant founder badge to yeshh user
-- First, find the user ID for username 'yeshh'
DO $$ 
DECLARE
  user_uuid UUID;
BEGIN
  -- Find user by username
  SELECT id INTO user_uuid FROM profiles WHERE username = 'yeshh';
  
  IF user_uuid IS NOT NULL THEN
    -- Grant founder badge
    UPDATE profiles 
    SET 
      badge_type = 'founder',
      badge_verified_at = NOW()
    WHERE id = user_uuid;
    
    RAISE NOTICE '✅ Founder badge granted to user: yeshh (%)' , user_uuid;
  ELSE
    RAISE NOTICE '⚠️  User "yeshh" not found. Please update the username in the script.';
  END IF;
END $$;

-- Verify the badge was granted
SELECT 
  username,
  badge_type,
  badge_verified_at
FROM profiles 
WHERE username = 'yeshh';
