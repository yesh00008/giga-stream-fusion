import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url?: string;
  read: boolean;
  created_at: string;
  updated_at: string;
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
  read: boolean;
  created_at: string;
}

export interface MessageWithProfiles extends Message {
  sender_username: string;
  sender_name: string;
  sender_avatar?: string;
  receiver_username: string;
  receiver_name: string;
  receiver_avatar?: string;
}

// Get all conversations for the current user
export const getConversations = async (userId: string): Promise<{ data: Conversation[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('conversation_list')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return { data: null, error };
  }
};

// Get messages between current user and another user
export const getConversation = async (
  otherUserId: string,
  limit: number = 50
): Promise<{ data: MessageWithProfiles[] | null; error: any }> => {
  try {
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

// Send a message
export const sendMessage = async (
  receiverId: string,
  content: string,
  imageUrl?: string
): Promise<{ data: Message | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        receiver_id: receiverId,
        content,
        image_url: imageUrl
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

// Delete a message
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

// Search users for messaging
export const searchUsersForMessaging = async (
  query: string
): Promise<{ data: any[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, is_online, badge_type')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error searching users:', error);
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
