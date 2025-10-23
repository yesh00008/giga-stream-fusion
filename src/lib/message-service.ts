import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface MessageReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export interface PinnedMessage {
  id: string;
  message_id: string;
  conversation_user1_id: string;
  conversation_user2_id: string;
  pinned_by: string;
  pinned_at: string;
  expires_at: string | null;
  pin_order: number;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string;
  voice_url?: string; // Voice message audio URL
  voice_duration?: number; // Voice message duration in seconds
  voice_play_once?: boolean; // If true, voice can only be played once
  delivered: boolean; // Message delivered to recipient's device
  read: boolean; // Message opened/read by recipient
  is_request: boolean;
  created_at: string;
  failed?: boolean; // Message failed to send
  reactions?: MessageReaction[];
}

export interface Conversation {
  id: string;
  other_user_id: string;
  other_user_username: string;
  other_user_name: string;
  other_user_avatar?: string;
  other_user_online?: boolean;
  content: string;
  sender_id: string;
  receiver_id: string;
  delivered: boolean;
  read: boolean;
  is_request: boolean;
  created_at: string;
  is_following: boolean;
  is_follower: boolean;
}

export interface MessageWithProfiles extends Message {
  sender_username: string;
  sender_name: string;
  sender_avatar?: string;
  receiver_username: string;
  receiver_name: string;
  receiver_avatar?: string;
}

// Get all conversations for the current user (followers/following only)
export const getConversations = async (userId: string): Promise<{ data: Conversation[] | null; error: any }> => {
  try {
    // Get user's followers and following
    const { data: relationships } = await supabase
      .from('followers')
      .select('follower_id, following_id')
      .or(`follower_id.eq.${userId},following_id.eq.${userId}`);

    const followerIds = relationships
      ?.filter(r => r.following_id === userId)
      .map(r => r.follower_id) || [];
    
    const followingIds = relationships
      ?.filter(r => r.follower_id === userId)
      .map(r => r.following_id) || [];

    const connectionIds = [...new Set([...followerIds, ...followingIds])];

    // Get messages with followers/following
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by conversation and get latest message
    const conversationsMap = new Map<string, any>();

    for (const msg of messages || []) {
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      
      // Skip if otherUserId is invalid
      if (!otherUserId || typeof otherUserId !== 'string') {
        console.warn('Invalid otherUserId:', otherUserId);
        continue;
      }
      
      const conversationKey = [userId, otherUserId].sort().join('-');

      if (!conversationsMap.has(conversationKey)) {
        // Get other user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', otherUserId)
          .single();
        
        if (profileError) {
          console.error('❌ Error fetching profile for user:', otherUserId, profileError);
          continue;
        }

        if (profile) {
          console.log('✅ Loaded profile:', profile.username, profile.full_name);
          conversationsMap.set(conversationKey, {
            id: msg.id,
            other_user_id: otherUserId,
            other_user_username: profile.username || 'unknown',
            other_user_name: profile.full_name || profile.username || 'Unknown User',
            other_user_avatar: profile.avatar_url,
            other_user_online: false,
            content: msg.content || '',
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id,
            read: msg.read || false,
            is_request: msg.is_request || false,
            created_at: msg.created_at,
            is_following: followingIds.includes(otherUserId),
            is_follower: followerIds.includes(otherUserId)
          });
        } else {
          console.warn('⚠️ No profile found for user:', otherUserId);
        }
      }
    }

    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { data: conversations, error: null };
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return { data: null, error };
  }
};

// Get message requests (from non-followers)
export const getMessageRequests = async (userId: string): Promise<{ data: Conversation[] | null; error: any }> => {
  try {
    // Get user's followers
    const { data: followers } = await supabase
      .from('followers')
      .select('follower_id')
      .eq('following_id', userId);

    const followerIds = followers?.map(f => f.follower_id) || [];

    // Get messages from non-followers that are marked as requests
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('receiver_id', userId)
      .eq('is_request', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group by sender
    const requestsMap = new Map<string, any>();

    for (const msg of messages || []) {
      // Skip if sender_id is invalid
      if (!msg.sender_id || typeof msg.sender_id !== 'string') {
        console.warn('Invalid sender_id:', msg.sender_id);
        continue;
      }
      
      if (!followerIds.includes(msg.sender_id) && !requestsMap.has(msg.sender_id)) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', msg.sender_id)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile for sender:', msg.sender_id, profileError);
          continue;
        }

        if (profile) {
          requestsMap.set(msg.sender_id, {
            id: msg.id,
            other_user_id: msg.sender_id,
            other_user_username: profile.username,
            other_user_name: profile.full_name,
            other_user_avatar: profile.avatar_url,
            content: msg.content,
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id,
            read: msg.read,
            is_request: true,
            created_at: msg.created_at,
            is_following: false,
            is_follower: false
          });
        }
      }
    }

    return { data: Array.from(requestsMap.values()), error: null };
  } catch (error: any) {
    console.error('Error fetching message requests:', error);
    return { data: null, error };
  }
};

// Accept message request
export const acceptMessageRequest = async (senderId: string, userId: string): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_request: false })
      .eq('sender_id', senderId)
      .eq('receiver_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error accepting message request:', error);
    return { error };
  }
};

// Delete message request
export const deleteMessageRequest = async (senderId: string, userId: string): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('sender_id', senderId)
      .eq('receiver_id', userId)
      .eq('is_request', true);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error deleting message request:', error);
    return { error };
  }
};

// Get messages between current user and another user
export const getConversation = async (
  otherUserId: string,
  limit: number = 50
): Promise<{ data: MessageWithProfiles[] | null; error: any }> => {
  try {
    // Validate otherUserId
    if (!otherUserId || typeof otherUserId !== 'string') {
      console.error('❌ Invalid otherUserId provided to getConversation:', otherUserId);
      return { data: [], error: { message: 'Invalid user ID' } };
    }

    const { data, error } = await supabase.rpc('get_conversation', {
      other_user_id: otherUserId,
      limit_count: limit
    });

    if (error) throw error;
    return { data: data?.reverse() || [], error: null };
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    return { data: null, error };
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  senderUserId: string
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase.rpc('mark_messages_read', {
      sender_user_id: senderUserId
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    return { error };
  }
};

// Get unread message count
export const getUnreadCount = async (): Promise<{ count: number; error: any }> => {
  try {
    const { data, error } = await supabase.rpc('get_unread_count');

    if (error) throw error;
    return { count: data || 0, error: null };
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    return { count: 0, error };
  }
};

// Delete a message (Unsend - deletes from database for everyone)
export const deleteMessage = async (
  messageId: string
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error deleting message:', error);
    return { error };
  }
};

// Delete message for current user only (doesn't affect other user)
export const deleteMessageForUser = async (
  messageId: string,
  userId: string
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('deleted_messages')
      .insert({
        message_id: messageId,
        user_id: userId
      });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error deleting message for user:', error);
    return { error };
  }
};

// Get list of message IDs deleted by the user
export const getDeletedMessageIds = async (
  userId: string
): Promise<{ data: string[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('deleted_messages')
      .select('message_id')
      .eq('user_id', userId);

    if (error) throw error;
    return { data: data?.map(d => d.message_id) || [], error: null };
  } catch (error: any) {
    console.error('Error getting deleted messages:', error);
    return { data: null, error };
  }
};

// Add reaction to message
export const addReaction = async (
  messageId: string,
  userId: string,
  emoji: string
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('message_reactions')
      .upsert({
        message_id: messageId,
        user_id: userId,
        emoji: emoji
      }, {
        onConflict: 'message_id,user_id'
      });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error adding reaction:', error);
    return { error };
  }
};

// Remove reaction from message
export const removeReaction = async (
  messageId: string,
  userId: string
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error removing reaction:', error);
    return { error };
  }
};

// Get reactions for a message
export const getMessageReactions = async (
  messageId: string,
  currentUserId: string
): Promise<{ data: MessageReaction[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('message_reactions')
      .select('emoji, user_id')
      .eq('message_id', messageId);

    if (error) throw error;

    // Group reactions by emoji and check if current user reacted
    const reactionsMap = new Map<string, { count: number; userReacted: boolean }>();
    
    data?.forEach(reaction => {
      const existing = reactionsMap.get(reaction.emoji) || { count: 0, userReacted: false };
      reactionsMap.set(reaction.emoji, {
        count: existing.count + 1,
        userReacted: existing.userReacted || reaction.user_id === currentUserId
      });
    });

    const reactions: MessageReaction[] = Array.from(reactionsMap.entries()).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      userReacted: data.userReacted
    }));

    return { data: reactions, error: null };
  } catch (error: any) {
    console.error('Error getting message reactions:', error);
    return { data: null, error };
  }
};

// Get reactions for multiple messages
export const getMessagesReactions = async (
  messageIds: string[],
  currentUserId: string
): Promise<{ data: Map<string, MessageReaction[]> | null; error: any }> => {
  try {
    if (messageIds.length === 0) {
      return { data: new Map(), error: null };
    }

    const { data, error } = await supabase
      .from('message_reactions')
      .select('message_id, emoji, user_id')
      .in('message_id', messageIds);

    if (error) throw error;

    // Group reactions by message ID and emoji
    const reactionsMap = new Map<string, Map<string, { count: number; userReacted: boolean }>>();
    
    data?.forEach(reaction => {
      if (!reactionsMap.has(reaction.message_id)) {
        reactionsMap.set(reaction.message_id, new Map());
      }
      
      const messageReactions = reactionsMap.get(reaction.message_id)!;
      const existing = messageReactions.get(reaction.emoji) || { count: 0, userReacted: false };
      
      messageReactions.set(reaction.emoji, {
        count: existing.count + 1,
        userReacted: existing.userReacted || reaction.user_id === currentUserId
      });
    });

    // Convert to final format
    const result = new Map<string, MessageReaction[]>();
    reactionsMap.forEach((emojiMap, messageId) => {
      const reactions: MessageReaction[] = Array.from(emojiMap.entries()).map(([emoji, data]) => ({
        emoji,
        count: data.count,
        userReacted: data.userReacted
      }));
      result.set(messageId, reactions);
    });

    return { data: result, error: null };
  } catch (error: any) {
    console.error('Error getting messages reactions:', error);
    return { data: null, error };
  }
};

// Pin a message with optional expiry time
export const pinMessage = async (
  messageId: string,
  user1Id: string,
  user2Id: string,
  pinnedBy: string,
  expiresInMinutes?: number // null or undefined for unlimited
): Promise<{ error: any }> => {
  try {
    // Calculate expiry timestamp if provided
    let expiresAt = null;
    if (expiresInMinutes) {
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + expiresInMinutes);
      expiresAt = expiryDate.toISOString();
    }

    // Get current max pin_order to add new pin at the end
    const { data: existingPins } = await supabase
      .from('pinned_messages')
      .select('pin_order')
      .or(`and(conversation_user1_id.eq.${user1Id},conversation_user2_id.eq.${user2Id}),and(conversation_user1_id.eq.${user2Id},conversation_user2_id.eq.${user1Id})`)
      .order('pin_order', { ascending: false })
      .limit(1);

    const nextOrder = existingPins && existingPins.length > 0 ? existingPins[0].pin_order + 1 : 0;

    const { error } = await supabase
      .from('pinned_messages')
      .insert({
        message_id: messageId,
        conversation_user1_id: user1Id,
        conversation_user2_id: user2Id,
        pinned_by: pinnedBy,
        expires_at: expiresAt,
        pin_order: nextOrder
      });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error pinning message:', error);
    return { error };
  }
};

// Unpin a message
export const unpinMessage = async (
  messageId: string
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('pinned_messages')
      .delete()
      .eq('message_id', messageId);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error unpinning message:', error);
    return { error };
  }
};

// Get pinned messages for a conversation
export const getPinnedMessages = async (
  user1Id: string,
  user2Id: string
): Promise<{ data: PinnedMessage[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('pinned_messages')
      .select('*')
      .or(`and(conversation_user1_id.eq.${user1Id},conversation_user2_id.eq.${user2Id}),and(conversation_user1_id.eq.${user2Id},conversation_user2_id.eq.${user1Id})`)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('pin_order', { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error: any) {
    console.error('Error getting pinned messages:', error);
    return { data: null, error };
  }
};

// Search users for messaging (followers and following only)
export const searchUsersForMessaging = async (
  query: string,
  userId: string
): Promise<{ data: any[] | null; error: any }> => {
  try {
    // Get user's followers and following
    const { data: relationships } = await supabase
      .from('followers')
      .select('follower_id, following_id')
      .or(`follower_id.eq.${userId},following_id.eq.${userId}`);

    const followerIds = relationships
      ?.filter(r => r.following_id === userId)
      .map(r => r.follower_id) || [];
    
    const followingIds = relationships
      ?.filter(r => r.follower_id === userId)
      .map(r => r.following_id) || [];

    const connectionIds = [...new Set([...followerIds, ...followingIds])]
      .filter(id => id && typeof id === 'string'); // Filter out invalid IDs

    if (connectionIds.length === 0) {
      return { data: [], error: null };
    }

    // Search only among followers and following
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, badge_type')
      .in('id', connectionIds)
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;

    // Add relationship info
    const usersWithRelationship = data?.map(user => ({
      ...user,
      is_follower: followerIds.includes(user.id),
      is_following: followingIds.includes(user.id)
    }));

    return { data: usersWithRelationship, error: null };
  } catch (error: any) {
    console.error('Error searching users:', error);
    return { data: null, error };
  }
};

// Send a message (check if user can send to receiver)
export const sendMessage = async (
  receiverId: string,
  content: string,
  userId: string,
  imageUrl?: string,
  voiceUrl?: string,
  voiceDuration?: number,
  voicePlayOnce?: boolean
): Promise<{ data: Message | null; error: any }> => {
  try {
    // Check if receiver follows sender (to determine if it's a request)
    const { data: relationship } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', receiverId)
      .eq('following_id', userId)
      .maybeSingle();

    const isRequest = !relationship; // If receiver doesn't follow sender, it's a request

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        sender_id: userId,
        receiver_id: receiverId,
        content,
        image_url: imageUrl,
        voice_url: voiceUrl,
        voice_duration: voiceDuration,
        voice_play_once: voicePlayOnce,
        is_request: isRequest
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error sending message:', error);
    return { data: null, error };
  }
};

// Subscribe to new messages in a conversation
export const subscribeToMessages = (
  otherUserId: string,
  currentUserId: string,
  onMessage: (message: Message) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`messages:${currentUserId}:${otherUserId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${otherUserId},receiver_id=eq.${currentUserId}`
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${currentUserId},receiver_id=eq.${otherUserId}`
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();

  return channel;
};

// Subscribe to all messages for notification
export const subscribeToAllMessages = (
  currentUserId: string,
  onMessage: (message: Message) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`all-messages:${currentUserId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUserId}`
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();

  return channel;
};

// Upload voice message for message
export const uploadVoiceMessage = async (
  audioBlob: Blob,
  userId: string
): Promise<{ url: string | null; error: any }> => {
  try {
    const fileName = `${Date.now()}-${Math.random()}.webm`;
    const filePath = `${userId}/${fileName}`;

    // Use application/octet-stream which is universally supported
    const uploadBlob = new Blob([audioBlob], { type: 'application/octet-stream' });

    // Upload to avatars bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`voices/${filePath}`, uploadBlob, {
        contentType: 'application/octet-stream',
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(`voices/${filePath}`);

    return { url: publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading voice message:', error);
    return { url: null, error };
  }
};

// Upload image for message
export const uploadMessageImage = async (
  file: File,
  userId: string
): Promise<{ url: string | null; error: any }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `messages/${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('messages')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('messages')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading message image:', error);
    return { url: null, error };
  }
};
