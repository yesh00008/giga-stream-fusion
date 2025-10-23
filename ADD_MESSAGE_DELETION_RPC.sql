-- ============================================================================
-- RPC FUNCTION FOR MESSAGE DELETION
-- ============================================================================
-- This function marks messages as deleted for a specific user
-- by adding their ID to the deleted_for_users array

CREATE OR REPLACE FUNCTION mark_messages_deleted(
  p_conversation_id TEXT,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE messages
  SET deleted_for_users = array_append(
    COALESCE(deleted_for_users, '{}'), 
    p_user_id
  )
  WHERE conversation_id = p_conversation_id
    AND NOT (p_user_id = ANY(COALESCE(deleted_for_users, '{}')));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION mark_messages_deleted TO authenticated;

COMMENT ON FUNCTION mark_messages_deleted IS 'Marks all messages in a conversation as deleted for a specific user';
