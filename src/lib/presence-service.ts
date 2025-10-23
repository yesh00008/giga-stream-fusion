import { supabase } from './supabase';

// Typing Indicator Service
let typingTimeout: NodeJS.Timeout | null = null;

export const broadcastTyping = async (conversationId: string, userId: string, isTyping: boolean) => {
  try {
    const channel = supabase.channel(`typing:${conversationId}`);
    
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId,
        isTyping,
        timestamp: new Date().toISOString()
      }
    });

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      if (typingTimeout) clearTimeout(typingTimeout);
      
      typingTimeout = setTimeout(() => {
        broadcastTyping(conversationId, userId, false);
      }, 3000);
    }
  } catch (error) {
    console.error('Error broadcasting typing status:', error);
  }
};

export const subscribeToTyping = (
  conversationId: string,
  onTypingChange: (userId: string, isTyping: boolean) => void
) => {
  const channel = supabase
    .channel(`typing:${conversationId}`)
    .on('broadcast', { event: 'typing' }, ({ payload }: any) => {
      onTypingChange(payload.userId, payload.isTyping);
    })
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
};

// Advanced Online Status Service
export const updateOnlineStatus = async (userId: string, isOnline: boolean) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_online: isOnline,
        last_seen: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating online status:', error);
  }
};

// Heartbeat to keep user online
let heartbeatInterval: NodeJS.Timeout | null = null;

export const startPresenceHeartbeat = (userId: string) => {
  // Set online immediately
  updateOnlineStatus(userId, true);

  // Update every 30 seconds
  heartbeatInterval = setInterval(() => {
    updateOnlineStatus(userId, true);
  }, 30000);

  // Handle page visibility
  const handleVisibilityChange = () => {
    if (document.hidden) {
      updateOnlineStatus(userId, false);
    } else {
      updateOnlineStatus(userId, true);
    }
  };

  // Handle page unload
  const handleBeforeUnload = () => {
    // Use sendBeacon for reliable offline status (if available)
    if (navigator.sendBeacon) {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const blob = new Blob(
        [JSON.stringify({ is_online: false, last_seen: new Date().toISOString() })],
        { type: 'application/json' }
      );
      
      navigator.sendBeacon(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
        blob
      );
    }
    
    // Backup sync call
    updateOnlineStatus(userId, false);
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    updateOnlineStatus(userId, false);
  };
};

export const stopPresenceHeartbeat = (userId: string) => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  updateOnlineStatus(userId, false);
};

// Subscribe to user presence changes
export const subscribeToPresence = (
  userId: string,
  onPresenceChange: (isOnline: boolean, lastSeen: string) => void
) => {
  const channel = supabase
    .channel(`presence:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'profiles',
      filter: `id=eq.${userId}`
    }, (payload: any) => {
      if (payload.new) {
        onPresenceChange(payload.new.is_online, payload.new.last_seen);
      }
    })
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
};

// Get bulk online status for multiple users
export const getBulkOnlineStatus = async (userIds: string[]): Promise<Map<string, { isOnline: boolean; lastSeen: string }>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, is_online, last_seen')
      .in('id', userIds);

    if (error) throw error;

    const statusMap = new Map();
    data?.forEach((profile: any) => {
      statusMap.set(profile.id, {
        isOnline: profile.is_online || false,
        lastSeen: profile.last_seen || new Date().toISOString()
      });
    });

    return statusMap;
  } catch (error) {
    console.error('Error fetching bulk online status:', error);
    return new Map();
  }
};

// Advanced: Track user activity (last active in conversation)
export const updateConversationActivity = async (
  userId: string,
  conversationId: string
) => {
  try {
    const { error } = await supabase
      .from('chat_settings')
      .upsert({
        user_id: userId,
        conversation_id: conversationId,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,conversation_id'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating conversation activity:', error);
  }
};

// Get unread count for conversation
export const getUnreadCount = async (
  userId: string,
  conversationId: string
): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Get total unread count across all conversations
export const getTotalUnreadCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting total unread count:', error);
    return 0;
  }
};

// Mark conversation as read
export const markConversationAsRead = async (
  userId: string,
  conversationId: string
) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking conversation as read:', error);
  }
};

// Advanced: Get user's "away" status
export const setAwayStatus = async (
  userId: string,
  isAway: boolean,
  awayMessage?: string
) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_away: isAway,
        away_message: awayMessage || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error setting away status:', error);
  }
};

// Get detailed presence info
export const getDetailedPresence = async (userId: string): Promise<{
  isOnline: boolean;
  lastSeen: string;
  isAway: boolean;
  awayMessage: string | null;
} | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_online, last_seen, is_away, away_message')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      isOnline: data.is_online || false,
      lastSeen: data.last_seen || new Date().toISOString(),
      isAway: data.is_away || false,
      awayMessage: data.away_message
    };
  } catch (error) {
    console.error('Error getting detailed presence:', error);
    return null;
  }
};
