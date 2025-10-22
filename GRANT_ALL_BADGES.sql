-- ============================================
-- GRANT BADGES TO USERS
-- ============================================
-- Badge Categories:
-- 🔵 BLUE - Organizations
-- 🟡 GOLD - Government Officials & CEOs
-- 🔴 LIGHT RED - Founders & Co-Founders

-- First, remove all dummy badges from all profiles
UPDATE profiles 
SET badge_type = NULL, badge_verified_at = NULL;

-- Grant founder badge (Light Red) to yeshh
UPDATE profiles 
SET badge_type = 'founder', badge_verified_at = NOW()
WHERE username = 'yeshh';

-- ============================================
-- ORGANIZATION BADGES (Blue)
-- ============================================

-- Example: Grant organization badge (Blue)
-- UPDATE profiles 
-- SET badge_type = 'organization', badge_verified_at = NOW()
-- WHERE username = 'company_name';

-- ============================================
-- GOVERNMENT BADGES (Gold)
-- ============================================

-- Example: Grant government official badge (Gold)
-- UPDATE profiles 
-- SET badge_type = 'government', badge_verified_at = NOW()
-- WHERE username = 'gov_official';

-- ============================================
-- EXECUTIVE BADGES (Gold)
-- ============================================

-- Example: Grant CEO badge (Gold)
-- UPDATE profiles 
-- SET badge_type = 'ceo', badge_verified_at = NOW()
-- WHERE username = 'john_ceo';

-- ============================================
-- FOUNDER BADGES (Light Red)
-- ============================================

-- Example: Grant co-founder badge (Light Red)
-- UPDATE profiles 
-- SET badge_type = 'cofounder', badge_verified_at = NOW()
-- WHERE username = 'jane_cofounder';

-- ============================================
-- LEGACY BADGES
-- ============================================

-- Example: Grant verified badge
-- UPDATE profiles 
-- SET badge_type = 'verified', badge_verified_at = NOW()
-- WHERE username = 'user123';

-- Example: Grant premium badge
-- UPDATE profiles 
-- SET badge_type = 'premium', badge_verified_at = NOW()
-- WHERE username = 'premium_user';

-- Example: Grant VIP badge
-- UPDATE profiles 
-- SET badge_type = 'vip', badge_verified_at = NOW()
-- WHERE username = 'vip_user';

-- Example: Grant partner badge
-- UPDATE profiles 
-- SET badge_type = 'partner', badge_verified_at = NOW()
-- WHERE username = 'partner_user';

-- Example: Grant official badge
-- UPDATE profiles 
-- SET badge_type = 'official', badge_verified_at = NOW()
-- WHERE username = 'official_account';

-- Verify all badges
SELECT 
  username,
  badge_type,
  badge_verified_at,
  created_at
FROM profiles 
WHERE badge_type IS NOT NULL
ORDER BY badge_verified_at DESC;
