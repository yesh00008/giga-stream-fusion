import { supabase } from './supabase';

// Chat Settings Types
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

export interface DisappearingMessageSettings {
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

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  conversation_id: string | null;
  message_id: string | null;
  reason: 'spam' | 'harassment' | 'inappropriate' | 'fake' | 'other';
  description: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
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

// Chat Settings Functions
export const getChatSettings = async (userId: string, conversationId: string): Promise<ChatSettings | null> => {
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
  updates: Partial<ChatSettings>
): Promise<ChatSettings | null> => {
  const { data, error } = await supabase
    .from('chat_settings')
    .upsert({
      user_id: userId,
      conversation_id: conversationId,
      ...updates,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,conversation_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating chat settings:', error);
    throw error;
  }

  return data;
};

// Disappearing Messages Functions
export const getDisappearingSettings = async (conversationId: string): Promise<DisappearingMessageSettings | null> => {
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

export const updateDisappearingSettings = async (
  conversationId: string,
  enabledBy: string,
  isEnabled: boolean,
  durationSeconds: number | null
): Promise<DisappearingMessageSettings | null> => {
  const { data, error } = await supabase
    .from('disappearing_message_settings')
    .upsert({
      conversation_id: conversationId,
      enabled_by: enabledBy,
      is_enabled: isEnabled,
      duration_seconds: durationSeconds,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'conversation_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating disappearing settings:', error);
    throw error;
  }

  return data;
};

// Block Functions
export const blockUser = async (blockerId: string, blockedId: string, reason?: string): Promise<BlockedUser | null> => {
  const { data, error } = await supabase
    .from('blocked_users')
    .insert({
      blocker_id: blockerId,
      blocked_id: blockedId,
      reason: reason || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error blocking user:', error);
    throw error;
  }

  return data;
};

export const unblockUser = async (blockerId: string, blockedId: string): Promise<void> => {
  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);

  if (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
};

export const isUserBlocked = async (user1Id: string, user2Id: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('is_user_blocked', {
    user1_id: user1Id,
    user2_id: user2Id
  });

  if (error) {
    console.error('Error checking if user is blocked:', error);
    return false;
  }

  return data === true;
};

export const getBlockedUsers = async (userId: string): Promise<BlockedUser[]> => {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('*')
    .eq('blocker_id', userId)
    .order('blocked_at', { ascending: false });

  if (error) {
    console.error('Error fetching blocked users:', error);
    return [];
  }

  return data || [];
};

// Report Functions
export const submitReport = async (
  reporterId: string,
  reportedUserId: string | null,
  conversationId: string | null,
  messageId: string | null,
  reason: Report['reason'],
  description: string | null
): Promise<Report | null> => {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: reporterId,
      reported_user_id: reportedUserId,
      conversation_id: conversationId,
      message_id: messageId,
      reason,
      description
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting report:', error);
    throw error;
  }

  return data;
};

export const getUserReports = async (userId: string): Promise<Report[]> => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user reports:', error);
    return [];
  }

  return data || [];
};

// Media Functions
export const getConversationMedia = async (
  conversationId: string,
  mediaType: 'image' | 'video' | 'all' = 'all',
  limit: number = 50,
  offset: number = 0
): Promise<ConversationMedia[]> => {
  const { data, error } = await supabase.rpc('get_conversation_media', {
    p_conversation_id: conversationId,
    p_media_type: mediaType === 'all' ? null : mediaType,
    p_limit: limit,
    p_offset: offset
  });

  if (error) {
    console.error('Error fetching conversation media:', error);
    return [];
  }

  return data || [];
};

export const addConversationMedia = async (
  conversationId: string,
  messageId: string,
  senderId: string,
  mediaType: ConversationMedia['media_type'],
  mediaUrl: string,
  thumbnailUrl?: string,
  fileSize?: number,
  fileName?: string
): Promise<ConversationMedia | null> => {
  const { data, error } = await supabase
    .from('conversation_media')
    .insert({
      conversation_id: conversationId,
      message_id: messageId,
      sender_id: senderId,
      media_type: mediaType,
      media_url: mediaUrl,
      thumbnail_url: thumbnailUrl || null,
      file_size: fileSize || null,
      file_name: fileName || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding conversation media:', error);
    throw error;
  }

  return data;
};

// Archive Functions
export const archiveChat = async (userId: string, conversationId: string): Promise<void> => {
  await updateChatSettings(userId, conversationId, {
    is_archived: true,
    archived_at: new Date().toISOString()
  });
};

export const unarchiveChat = async (userId: string, conversationId: string): Promise<void> => {
  await updateChatSettings(userId, conversationId, {
    is_archived: false,
    archived_at: null
  });
};

export const getArchivedChats = async (userId: string): Promise<ChatSettings[]> => {
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

// Delete Chat
export const deleteChat = async (conversationId: string, userId: string): Promise<void> => {
  // Delete all messages in the conversation
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', conversationId);

  if (messagesError) {
    console.error('Error deleting messages:', messagesError);
    throw messagesError;
  }

  // Delete chat settings
  const { error: settingsError } = await supabase
    .from('chat_settings')
    .delete()
    .eq('user_id', userId)
    .eq('conversation_id', conversationId);

  if (settingsError) {
    console.error('Error deleting chat settings:', settingsError);
    throw settingsError;
  }
};

// Search Messages
export const searchMessages = async (
  conversationId: string,
  query: string,
  limit: number = 50
): Promise<any[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .ilike('content', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error searching messages:', error);
    return [];
  }

  return data || [];
};

// Mute Functions
export const muteChat = async (userId: string, conversationId: string, durationHours: number = 8): Promise<void> => {
  const mutedUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
  await updateChatSettings(userId, conversationId, {
    is_muted: true,
    muted_until: mutedUntil
  });
};

export const unmuteChat = async (userId: string, conversationId: string): Promise<void> => {
  await updateChatSettings(userId, conversationId, {
    is_muted: false,
    muted_until: null
  });
};

export const isChatMuted = async (userId: string, conversationId: string): Promise<boolean> => {
  const settings = await getChatSettings(userId, conversationId);
  if (!settings || !settings.is_muted) return false;
  
  if (settings.muted_until) {
    const mutedUntilDate = new Date(settings.muted_until);
    if (mutedUntilDate < new Date()) {
      // Mute expired, unmute automatically
      await unmuteChat(userId, conversationId);
      return false;
    }
  }
  
  return true;
};
