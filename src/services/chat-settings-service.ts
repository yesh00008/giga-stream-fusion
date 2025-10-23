import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface ChatSettings {
  id: string;
  user_id: string;
  conversation_id: string;
  is_muted: boolean;
  muted_until: string | null;
  read_receipts_enabled: boolean;
  typing_indicators_enabled: boolean;
  nickname: string | null;
  theme: 'light' | 'dark' | 'auto';
  is_archived: boolean;
  archived_at: string | null;
  is_pinned: boolean;
  pinned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisappearingSettings {
  id: string;
  conversation_id: string;
  enabled_by: string;
  is_enabled: boolean;
  duration_seconds: number | null;
  enabled_at: string;
  updated_at: string;
}

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason: string | null;
  blocked_at: string;
}

export interface ConversationMedia {
  id: string;
  conversation_id: string;
  message_id: string;
  sender_id: string;
  media_type: 'image' | 'video' | 'audio' | 'file';
  media_url: string;
  thumbnail_url: string | null;
  file_size: number | null;
  file_name: string | null;
  created_at: string;
}

// ============================================================================
// CHAT SETTINGS
// ============================================================================

export const getChatSettings = async (
  userId: string,
  conversationId: string
): Promise<ChatSettings | null> => {
  const { data, error } = await supabase
    .from('chat_settings')
    .select('*')
    .eq('user_id', userId)
    .eq('conversation_id', conversationId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching chat settings:', error);
    return null;
  }

  return data;
};

export const updateChatSettings = async (
  userId: string,
  conversationId: string,
  settings: Partial<Omit<ChatSettings, 'id' | 'user_id' | 'conversation_id' | 'created_at' | 'updated_at'>>
): Promise<ChatSettings | null> => {
  const { data, error } = await supabase
    .from('chat_settings')
    .upsert(
      {
        user_id: userId,
        conversation_id: conversationId,
        ...settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,conversation_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('Error updating chat settings:', error);
    return null;
  }

  return data;
};

// ============================================================================
// THEME SETTINGS
// ============================================================================

export const updateChatTheme = async (
  userId: string,
  conversationId: string,
  theme: 'light' | 'dark' | 'auto'
): Promise<boolean> => {
  const result = await updateChatSettings(userId, conversationId, { theme });
  return result !== null;
};

export const getChatTheme = async (
  userId: string,
  conversationId: string
): Promise<'light' | 'dark' | 'auto'> => {
  const settings = await getChatSettings(userId, conversationId);
  return settings?.theme || 'auto';
};

// ============================================================================
// NICKNAME SETTINGS
// ============================================================================

export const setNickname = async (
  userId: string,
  conversationId: string,
  nickname: string | null
): Promise<boolean> => {
  const result = await updateChatSettings(userId, conversationId, { nickname });
  return result !== null;
};

export const getNickname = async (
  userId: string,
  conversationId: string
): Promise<string | null> => {
  const settings = await getChatSettings(userId, conversationId);
  return settings?.nickname || null;
};

// ============================================================================
// MUTE NOTIFICATIONS
// ============================================================================

export const muteChat = async (
  userId: string,
  conversationId: string,
  duration?: number // Duration in milliseconds, null = forever
): Promise<boolean> => {
  const muted_until = duration
    ? new Date(Date.now() + duration).toISOString()
    : null;

  const result = await updateChatSettings(userId, conversationId, {
    is_muted: true,
    muted_until,
  });

  return result !== null;
};

export const unmuteChat = async (
  userId: string,
  conversationId: string
): Promise<boolean> => {
  const result = await updateChatSettings(userId, conversationId, {
    is_muted: false,
    muted_until: null,
  });

  return result !== null;
};

export const isChatMuted = async (
  userId: string,
  conversationId: string
): Promise<boolean> => {
  const settings = await getChatSettings(userId, conversationId);
  
  if (!settings?.is_muted) return false;
  
  // Check if mute has expired
  if (settings.muted_until) {
    const now = new Date();
    const muteExpiry = new Date(settings.muted_until);
    if (now > muteExpiry) {
      // Auto-unmute if expired
      await unmuteChat(userId, conversationId);
      return false;
    }
  }
  
  return true;
};

// ============================================================================
// DISAPPEARING MESSAGES
// ============================================================================

export const enableDisappearingMessages = async (
  conversationId: string,
  enabledBy: string,
  durationSeconds: number // 60, 3600, 86400, 604800
): Promise<boolean> => {
  const { error } = await supabase.from('disappearing_message_settings').upsert(
    {
      conversation_id: conversationId,
      enabled_by: enabledBy,
      is_enabled: true,
      duration_seconds: durationSeconds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'conversation_id' }
  );

  if (error) {
    console.error('Error enabling disappearing messages:', error);
    return false;
  }

  return true;
};

export const disableDisappearingMessages = async (
  conversationId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('disappearing_message_settings')
    .update({
      is_enabled: false,
      updated_at: new Date().toISOString(),
    })
    .eq('conversation_id', conversationId);

  if (error) {
    console.error('Error disabling disappearing messages:', error);
    return false;
  }

  return true;
};

export const getDisappearingSettings = async (
  conversationId: string
): Promise<DisappearingSettings | null> => {
  const { data, error } = await supabase
    .from('disappearing_message_settings')
    .select('*')
    .eq('conversation_id', conversationId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching disappearing settings:', error);
    return null;
  }

  return data;
};

// ============================================================================
// PRIVACY & SAFETY
// ============================================================================

export const updatePrivacySettings = async (
  userId: string,
  conversationId: string,
  settings: {
    read_receipts_enabled?: boolean;
    typing_indicators_enabled?: boolean;
  }
): Promise<boolean> => {
  const result = await updateChatSettings(userId, conversationId, settings);
  return result !== null;
};

export const getPrivacySettings = async (
  userId: string,
  conversationId: string
): Promise<{ read_receipts_enabled: boolean; typing_indicators_enabled: boolean }> => {
  const settings = await getChatSettings(userId, conversationId);
  return {
    read_receipts_enabled: settings?.read_receipts_enabled ?? true,
    typing_indicators_enabled: settings?.typing_indicators_enabled ?? true,
  };
};

// ============================================================================
// BLOCK USER
// ============================================================================

export const blockUser = async (
  blockerId: string,
  blockedId: string,
  reason?: string
): Promise<boolean> => {
  const { error } = await supabase.from('blocked_users').insert({
    blocker_id: blockerId,
    blocked_id: blockedId,
    reason: reason || null,
  });

  if (error) {
    console.error('Error blocking user:', error);
    return false;
  }

  return true;
};

export const unblockUser = async (
  blockerId: string,
  blockedId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);

  if (error) {
    console.error('Error unblocking user:', error);
    return false;
  }

  return true;
};

export const isUserBlocked = async (
  user1Id: string,
  user2Id: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('id')
    .or(
      `and(blocker_id.eq.${user1Id},blocked_id.eq.${user2Id}),and(blocker_id.eq.${user2Id},blocked_id.eq.${user1Id})`
    )
    .limit(1);

  if (error) {
    console.error('Error checking block status:', error);
    return false;
  }

  return (data?.length || 0) > 0;
};

export const getBlockedUsers = async (userId: string): Promise<BlockedUser[]> => {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('*')
    .eq('blocker_id', userId);

  if (error) {
    console.error('Error fetching blocked users:', error);
    return [];
  }

  return data || [];
};

// ============================================================================
// ARCHIVE CHAT
// ============================================================================

export const archiveChat = async (
  userId: string,
  conversationId: string
): Promise<boolean> => {
  const result = await updateChatSettings(userId, conversationId, {
    is_archived: true,
    archived_at: new Date().toISOString(),
  });

  return result !== null;
};

export const unarchiveChat = async (
  userId: string,
  conversationId: string
): Promise<boolean> => {
  const result = await updateChatSettings(userId, conversationId, {
    is_archived: false,
    archived_at: null,
  });

  return result !== null;
};

export const getArchivedChats = async (userId: string): Promise<ChatSettings[]> => {
  // Try to use the optimized RPC function first
  try {
    const { data: detailedData, error: rpcError } = await supabase
      .rpc('get_archived_chats_detailed', { p_user_id: userId });
    
    if (!rpcError && detailedData) {
      // Transform the detailed data to match ChatSettings interface
      return detailedData.map((chat: any) => ({
        user_id: userId,
        conversation_id: chat.conversation_id,
        nickname: chat.nickname,
        is_archived: chat.is_archived,
        archived_at: chat.archived_at,
        // Add other user details for convenience
        other_user: {
          id: chat.other_user_id,
          username: chat.other_user_username,
          full_name: chat.other_user_full_name,
          avatar_url: chat.other_user_avatar_url,
        },
        last_message: chat.last_message,
        last_message_time: chat.last_message_time,
        unread_count: chat.unread_count,
      }));
    }
  } catch (err) {
    console.log('RPC function not available, falling back to standard query');
  }

  // Fallback to standard query
  const { data, error } = await supabase
    .from('chat_settings')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', true)
    .order('archived_at', { ascending: false });

  if (error) {
    console.error('Error fetching archived chats:', error);
    return [];
  }

  return data || [];
};

// Bulk unarchive multiple chats
export const bulkUnarchiveChats = async (
  userId: string,
  conversationIds: string[]
): Promise<number> => {
  try {
    // Try to use RPC function for bulk operation
    const { data, error } = await supabase.rpc('bulk_unarchive_chats', {
      p_user_id: userId,
      p_conversation_ids: conversationIds,
    });

    if (!error) {
      return data || 0;
    }
  } catch (err) {
    console.log('RPC function not available, falling back to individual updates');
  }

  // Fallback: update individually
  let successCount = 0;
  for (const conversationId of conversationIds) {
    const success = await unarchiveChat(userId, conversationId);
    if (success) successCount++;
  }
  
  return successCount;
};

// Get chat statistics
export const getChatStatistics = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_chat_statistics', {
      p_user_id: userId,
    });

    if (!error && data && data.length > 0) {
      return data[0];
    }
  } catch (err) {
    console.error('Error fetching chat statistics:', err);
  }

  return {
    total_conversations: 0,
    archived_count: 0,
    unread_count: 0,
    today_messages: 0,
    blocked_users_count: 0,
  };
};

// ============================================================================
// SHARED MEDIA
// ============================================================================

export const addConversationMedia = async (
  conversationId: string,
  messageId: string,
  senderId: string,
  mediaType: 'image' | 'video' | 'audio' | 'file',
  mediaUrl: string,
  thumbnailUrl?: string,
  fileSize?: number,
  fileName?: string
): Promise<boolean> => {
  const { error } = await supabase.from('conversation_media').insert({
    conversation_id: conversationId,
    message_id: messageId,
    sender_id: senderId,
    media_type: mediaType,
    media_url: mediaUrl,
    thumbnail_url: thumbnailUrl || null,
    file_size: fileSize || null,
    file_name: fileName || null,
  });

  if (error) {
    console.error('Error adding conversation media:', error);
    return false;
  }

  return true;
};

export const getConversationMedia = async (
  conversationId: string,
  mediaType?: 'image' | 'video' | 'audio' | 'file',
  limit: number = 50,
  offset: number = 0
): Promise<ConversationMedia[]> => {
  let query = supabase
    .from('conversation_media')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (mediaType) {
    query = query.eq('media_type', mediaType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching conversation media:', error);
    return [];
  }

  return data || [];
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const generateConversationId = (user1Id: string, user2Id: string): string => {
  // Create a consistent conversation ID regardless of order
  const ids = [user1Id, user2Id].sort();
  return `${ids[0]}_${ids[1]}`;
};

export const deleteChat = async (
  userId: string,
  conversationId: string
): Promise<boolean> => {
  try {
    // Get sender_id and receiver_id from conversation_id
    const [id1, id2] = conversationId.split('_');
    const otherUserId = id1 === userId ? id2 : id1;

    // Step 1: Get all media files for this conversation to delete from storage
    const { data: mediaFiles } = await supabase
      .from('conversation_media')
      .select('media_url, thumbnail_url')
      .eq('conversation_id', conversationId);

    // Step 2: Delete media files from Supabase Storage
    if (mediaFiles && mediaFiles.length > 0) {
      for (const media of mediaFiles) {
        // Extract file paths from URLs and delete from storage
        try {
          if (media.media_url) {
            const mediaPath = media.media_url.split('/').pop();
            if (mediaPath) {
              await supabase.storage
                .from('chat-media')
                .remove([mediaPath]);
            }
          }
          if (media.thumbnail_url) {
            const thumbPath = media.thumbnail_url.split('/').pop();
            if (thumbPath) {
              await supabase.storage
                .from('chat-media')
                .remove([thumbPath]);
            }
          }
        } catch (storageError) {
          console.error('Error deleting media file:', storageError);
          // Continue even if file deletion fails
        }
      }
    }

    // Step 3: Delete conversation media records
    const { error: mediaError } = await supabase
      .from('conversation_media')
      .delete()
      .eq('conversation_id', conversationId);

    if (mediaError) {
      console.error('Error deleting conversation media:', mediaError);
    }

    // Step 4: Mark messages as deleted for THIS USER ONLY
    // Use RPC function to add userId to deleted_for_users array
    // This hides messages for this user but keeps them visible for the other user
    try {
      // First, try to call RPC function
      const { error: rpcError } = await supabase.rpc('mark_messages_deleted', {
        p_conversation_id: conversationId,
        p_user_id: userId
      });
      
      // If RPC doesn't exist, get all messages and update them individually
      if (rpcError) {
        console.log('RPC function not found, updating messages individually:', rpcError);
        const { data: messages } = await supabase
          .from('messages')
          .select('id, deleted_for_users')
          .eq('conversation_id', conversationId);
        
        if (messages) {
          for (const msg of messages) {
            const deletedUsers = msg.deleted_for_users || [];
            if (!deletedUsers.includes(userId)) {
              deletedUsers.push(userId);
              await supabase
                .from('messages')
                .update({ deleted_for_users: deletedUsers })
                .eq('id', msg.id);
            }
          }
        }
      }
    } catch (messagesError) {
      console.error('Error marking messages as deleted:', messagesError);
      // Continue even if message update fails
    }

    // Step 5: Delete disappearing message settings
    const { error: disappearingError } = await supabase
      .from('disappearing_message_settings')
      .delete()
      .eq('conversation_id', conversationId);

    if (disappearingError) {
      console.error('Error deleting disappearing settings:', disappearingError);
    }

    // Step 6: Delete chat settings for this user
    const { error: settingsError } = await supabase
      .from('chat_settings')
      .delete()
      .eq('user_id', userId)
      .eq('conversation_id', conversationId);

    if (settingsError) {
      console.error('Error deleting chat settings:', settingsError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteChat:', error);
    return false;
  }
};

export const searchMessages = async (
  conversationId: string,
  query: string,
  limit: number = 50
): Promise<any[]> => {
  // Get sender_id and receiver_id from conversation_id
  const [senderId, receiverId] = conversationId.split('_');

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`
    )
    .ilike('content', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching messages:', error);
    return [];
  }

  return data || [];
};
