-- =============================================
-- OPTIMIZED FOLLOW STATUS CHECK FUNCTION
-- =============================================
-- This function combines profile lookup and follow/request status check
-- into a single database query for maximum performance

CREATE OR REPLACE FUNCTION check_follow_and_request_status(
  viewer_id UUID,
  target_username TEXT
)
RETURNS TABLE (
  is_following BOOLEAN,
  has_pending_request BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH target_profile AS (
    SELECT id FROM profiles WHERE username = target_username LIMIT 1
  )
  SELECT 
    EXISTS (
      SELECT 1 
      FROM followers f
      WHERE f.follower_id = viewer_id
      AND f.following_id = (SELECT id FROM target_profile)
    ) AS is_following,
    EXISTS (
      SELECT 1 
      FROM follow_requests fr
      WHERE fr.requester_id = viewer_id
      AND fr.target_id = (SELECT id FROM target_profile)
      AND fr.status = 'pending'
    ) AS has_pending_request;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_follow_and_request_status(UUID, TEXT) TO authenticated;

-- Example usage:
-- SELECT * FROM check_follow_and_request_status('user-uuid-here', 'target_username');
