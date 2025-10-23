import { useState, useEffect, useRef } from "react";
import { Search, Send, Image as ImageIcon, X, ArrowLeft, Info, Plus, ChevronDown, Mic, Paperclip, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { TypingIndicator } from "@/components/messages/TypingIndicator";
import { MessageBubble } from "@/components/messages/MessageBubble";
import { ConversationItem } from "@/components/messages/ConversationItem";
import { ActiveStatus } from "@/components/messages/ActiveStatus";
import { CallModal } from "@/components/messages/CallModal";
import { IncomingCallNotification } from "@/components/messages/IncomingCallNotification";
import { ChatProfilePanel } from "@/components/messages/ChatProfilePanel";
import { VoiceRecorder } from "@/components/messages/VoiceRecorder";
import { PinMessageDialog } from "@/components/messages/PinMessageDialog";
import { PinnedMessagesBar } from "@/components/messages/PinnedMessagesBar";
import { ChatSettingsPanel } from "@/components/ChatSettingsPanel";
import ArchivedChats from "@/components/ArchivedChats";
import {
  getConversations,
  getConversation,
  sendMessage,
  searchUsersForMessaging,
  subscribeToMessages,
  uploadMessageImage,
  uploadVoiceMessage,
  getMessageRequests,
  markMessagesAsRead,
  deleteMessage,
  deleteMessageForUser,
  getDeletedMessageIds,
  addReaction,
  removeReaction,
  getMessagesReactions,
  pinMessage,
  unpinMessage,
  getPinnedMessages,
  type Conversation,
  type MessageWithProfiles,
  type MessageReaction,
  type PinnedMessage
} from "@/lib/message-service";
import {
  initiateCall,
  subscribeToIncomingCalls,
  updateCallStatus,
  getActiveCallState,
  saveActiveCallState,
  clearActiveCallState,
  type Call,
  type CallType
} from "@/lib/call-service";
import { formatDistanceToNow } from "date-fns";

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageWithProfiles[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [messageRequestsCount, setMessageRequestsCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isOutgoingCall, setIsOutgoingCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showArchivedChats, setShowArchivedChats] = useState(false);
  const [archivedChatsCount, setArchivedChatsCount] = useState(0);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<MessageWithProfiles | null>(null);
  const [messageReactions, setMessageReactions] = useState<Map<string, MessageReaction[]>>(new Map());
  const [deletedMessageIds, setDeletedMessageIds] = useState<Set<string>>(new Set());
  const [pinnedMessages, setPinnedMessages] = useState<Array<PinnedMessage & { content?: string; sender_name?: string }>>([]);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [messageToPinId, setMessageToPinId] = useState<string | null>(null);
  const [messageToPin, setMessageToPin] = useState<MessageWithProfiles | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load deleted messages on mount
  useEffect(() => {
    if (user?.id) {
      getDeletedMessageIds(user.id).then(({ data }) => {
        if (data) {
          setDeletedMessageIds(new Set(data));
        }
      });
    }
  }, [user?.id]);

  // Set user online when component mounts and offline when unmounts
  useEffect(() => {
    if (!user?.id) return;

    // Set user online
    const setOnline = async () => {
      await supabase
        .from('profiles')
        .update({ is_online: true, last_seen: new Date().toISOString() })
        .eq('id', user.id);
      
      console.log('👤 User set to online');
    };

    // Set user offline
    const setOffline = async () => {
      await supabase
        .from('profiles')
        .update({ is_online: false, last_seen: new Date().toISOString() })
        .eq('id', user.id);
      
      console.log('👤 User set to offline');
    };

    setOnline();

    // Update online status every 30 seconds (heartbeat)
    const heartbeatInterval = setInterval(() => {
      setOnline();
    }, 30000);

    // Set offline when user closes/refreshes page
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliable offline status
      const blob = new Blob(
        [JSON.stringify({ 
          id: user.id,
          is_online: false,
          last_seen: new Date().toISOString()
        })],
        { type: 'application/json' }
      );
      navigator.sendBeacon('/api/user-offline', blob);
      
      // Also try regular update
      setOffline();
    };

    // Handle visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline();
      } else {
        setOnline();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      setOffline();
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);

  // Restore selected conversation on mount
  useEffect(() => {
    const savedConversationId = localStorage.getItem('selectedConversationId');
    if (savedConversationId && user?.id) {
      // Load conversations first, then select the saved one
      loadConversations().then(() => {
        // Find the conversation by other_user_id
        const conversation = conversations.find(c => c.other_user_id === savedConversationId);
        if (conversation) {
          setSelectedConversation(conversation);
        }
      });
    }
  }, [user?.id]);

  // Save selected conversation to localStorage
  useEffect(() => {
    if (selectedConversation) {
      localStorage.setItem('selectedConversationId', selectedConversation.other_user_id);
    } else {
      localStorage.removeItem('selectedConversationId');
    }
  }, [selectedConversation]);

  // Prevent page refresh/close during active call
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (activeCall && (activeCall.status === 'ringing' || activeCall.status === 'ongoing')) {
        e.preventDefault();
        e.returnValue = 'You are currently in a call. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeCall]);

  // Handle opening chat from navigation state
  useEffect(() => {
    const state = location.state as any;
    if (state?.openChat && user?.id) {
      const chatUser = state.openChat;
      const newConversation: Conversation = {
        id: chatUser.id,
        other_user_id: chatUser.id,
        other_user_username: chatUser.username,
        other_user_name: chatUser.full_name,
        other_user_avatar: chatUser.avatar_url,
        other_user_online: chatUser.is_online || false,
        content: '',
        sender_id: user.id,
        receiver_id: chatUser.id,
        delivered: false,
        read: true,
        is_request: false,
        created_at: new Date().toISOString(),
        is_following: true,
        is_follower: true
      };
      setSelectedConversation(newConversation);
      setTimeout(() => window.history.replaceState({}, document.title), 100);
    }
  }, [location, user?.id]);

  // Load conversations and message requests count
  useEffect(() => {
    if (user?.id) {
      console.log('👤 Setting up for user:', user.id);
      loadConversations();
      loadMessageRequestsCount();
      loadArchivedChatsCount();
      
      // Restore active call from localStorage if exists
      const { call: savedCall, role } = getActiveCallState();
      if (savedCall) {
        console.log('📱 Restoring active call from previous session:', savedCall);
        setActiveCall(savedCall);
        setIsOutgoingCall(role === 'caller');
        
        // Don't auto-decline on refresh - keep the call active
        if (savedCall.status === 'ringing' || savedCall.status === 'ongoing') {
          console.log('✅ Call still active, maintaining state');
        }
      }
      
      // Subscribe to incoming calls
      console.log('📞 Subscribing to incoming calls...');
      const callChannel = subscribeToIncomingCalls(user.id, handleIncomingCall);
      
      return () => {
        console.log('🔌 Unsubscribing from incoming calls');
        callChannel.unsubscribe();
      };
    }
  }, [user?.id]);

  // Subscribe to all new messages for real-time conversation updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('all-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 New message received:', payload);
          // Reload conversations to show new message
          loadConversations();
          loadMessageRequestsCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📤 Message sent:', payload);
          // Reload conversations to update latest message
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversation && user?.id) {
      loadMessages(selectedConversation.other_user_id);
      // Scroll to bottom immediately when entering chat
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [selectedConversation, user?.id]);

  // Subscribe to realtime messages for active conversation
  useEffect(() => {
    if (!selectedConversation || !user?.id) return;
    
    const channel = supabase
      .channel(`messages:${selectedConversation.other_user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const newMsg = payload.new as any;
          
          // Only add message if it's part of this conversation
          if (
            (newMsg.sender_id === user.id && newMsg.receiver_id === selectedConversation.other_user_id) ||
            (newMsg.sender_id === selectedConversation.other_user_id && newMsg.receiver_id === user.id)
          ) {
            console.log('💬 New message in conversation:', newMsg);
            
            // Get sender profile info
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('username, full_name, avatar_url')
              .eq('id', newMsg.sender_id)
              .single();

            // Get receiver profile info
            const { data: receiverProfile } = await supabase
              .from('profiles')
              .select('username, full_name, avatar_url')
              .eq('id', newMsg.receiver_id)
              .single();
            
            const messageWithProfiles = {
              ...newMsg,
              sender_username: senderProfile?.username || '',
              sender_name: senderProfile?.full_name || '',
              sender_avatar: senderProfile?.avatar_url,
              receiver_username: receiverProfile?.username || '',
              receiver_name: receiverProfile?.full_name || '',
              receiver_avatar: receiverProfile?.avatar_url
            };
            
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, messageWithProfiles];
            });
            
            scrollToBottom();
            
            // Mark as read if received
            if (newMsg.receiver_id === user.id) {
              await markMessagesAsRead(newMsg.sender_id);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const updatedMsg = payload.new as any;
          
          // Update message status in real-time (delivered/read changes)
          if (
            (updatedMsg.sender_id === user.id && updatedMsg.receiver_id === selectedConversation.other_user_id) ||
            (updatedMsg.sender_id === selectedConversation.other_user_id && updatedMsg.receiver_id === user.id)
          ) {
            console.log('✓ Message status updated:', updatedMsg.id, {
              delivered: updatedMsg.delivered,
              read: updatedMsg.read
            });
            
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMsg.id 
                ? { 
                    ...msg, 
                    delivered: updatedMsg.delivered,
                    read: updatedMsg.read,
                    failed: updatedMsg.failed
                  }
                : msg
            ));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const deletedMsg = payload.old as any;
          
          console.log('📨 Message DELETE event received:', deletedMsg);
          
          // Remove unsent message from both users' chats in real-time
          if (
            (deletedMsg.sender_id === user.id && deletedMsg.receiver_id === selectedConversation.other_user_id) ||
            (deletedMsg.sender_id === selectedConversation.other_user_id && deletedMsg.receiver_id === user.id)
          ) {
            console.log('🗑️ Message unsent (deleted from database):', deletedMsg.id);
            
            setMessages(prev => {
              const filtered = prev.filter(msg => msg.id !== deletedMsg.id);
              console.log('✅ Messages after delete:', filtered.length);
              return filtered;
            });
            
            toast.info('A message was unsent');
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Messages subscription status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [selectedConversation, user?.id]);

  // Subscribe to message reactions in real-time (both users share same channel)
  useEffect(() => {
    if (!selectedConversation || !user?.id) return;

    // Create a consistent channel name for both users
    const userIds = [user.id, selectedConversation.other_user_id].sort();
    const channelName = `reactions:${userIds[0]}:${userIds[1]}`;

    console.log('🔔 Setting up reaction subscription:', channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'message_reactions'
        },
        async (payload) => {
          console.log('🎭 Reaction changed:', payload.eventType, payload);
          
          // Refresh all reactions for current conversation
          if (messages.length > 0) {
            const messageIds = messages.map(m => m.id);
            const { data: reactions } = await getMessagesReactions(messageIds, user.id);
            if (reactions) {
              console.log('✅ Updated reactions:', reactions);
              setMessageReactions(reactions);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Reaction subscription status:', status);
      });

    return () => {
      console.log('🔕 Unsubscribing from reactions:', channelName);
      channel.unsubscribe();
    };
  }, [selectedConversation, user?.id, messages]);

  // Subscribe to recipient's online status changes
  useEffect(() => {
    if (!selectedConversation || !user?.id) return;

    const channel = supabase
      .channel(`profile_status:${selectedConversation.other_user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${selectedConversation.other_user_id}`
        },
        (payload) => {
          const updatedProfile = payload.new as any;
          console.log('👤 Recipient online status changed:', updatedProfile.is_online);
          
          // Update conversation online status
          setSelectedConversation(prev => 
            prev ? { ...prev, other_user_online: updatedProfile.is_online } : null
          );
          
          // When recipient comes online, undelivered messages will be auto-delivered by trigger
          // The UPDATE event on messages will fire and update the UI
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [selectedConversation, user?.id]);

  // Subscribe to deleted messages (sync across devices)
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`deleted_messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deleted_messages',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const deletedMsg = payload.new as any;
          console.log('🗑️ Message deleted for you on another device:', deletedMsg.message_id);
          
          // Add to local deleted messages set
          setDeletedMessageIds(prev => new Set([...prev, deletedMsg.message_id]));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  // Subscribe to pinned messages in real-time (both users share same channel)
  useEffect(() => {
    if (!selectedConversation || !user?.id) return;

    // Create a consistent channel name for both users
    const userIds = [user.id, selectedConversation.other_user_id].sort();
    const channelName = `pins:${userIds[0]}:${userIds[1]}`;

    console.log('🔔 Setting up pin subscription:', channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'pinned_messages'
        },
        async (payload) => {
          console.log('📌 Pin changed:', payload.eventType, payload);
          
          // Reload pinned messages when someone pins/unpins
          if (user?.id) {
            await loadPinnedMessages(user.id, selectedConversation.other_user_id);
            console.log('✅ Reloaded pinned messages');
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Pin subscription status:', status);
      });

    return () => {
      console.log('🔕 Unsubscribing from pins:', channelName);
      channel.unsubscribe();
    };
  }, [selectedConversation, user?.id, messages]);

  // Typing indicator subscription
  useEffect(() => {
    if (!selectedConversation || !user?.id) return;

    const channel = supabase.channel(`typing:${selectedConversation.other_user_id}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId === selectedConversation.other_user_id && payload.payload.isTyping) {
          setOtherUserTyping(true);
          setTimeout(() => setOtherUserTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [selectedConversation, user?.id]);

  // Auto-scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  // Search users
  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (searchQuery.trim().length > 0 && user?.id) {
        const { data } = await searchUsersForMessaging(searchQuery, user.id);
        setSearchResults(data || []);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, user?.id]);

  const scrollToBottom = (immediate = false) => {
    if (immediate) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const loadConversations = async () => {
    if (!user?.id) return;
    const { data, error } = await getConversations(user.id);
    if (error) {
      console.error('❌ Error loading conversations:', error);
      toast.error('Failed to load conversations');
      return;
    }
    if (data) {
      console.log('📬 Loaded conversations:', data);
      
      // Filter out archived chats and message requests
      const { getChatSettings } = await import('@/services/chat-settings-service');
      const filteredConversations = [];
      
      for (const conv of data) {
        // Skip message requests (unless user is sender)
        if (conv.is_request && conv.sender_id !== user.id) continue;
        
        // Check if chat is archived
        const settings = await getChatSettings(user.id, conv.other_user_id);
        if (settings?.is_archived) continue;
        
        filteredConversations.push(conv);
      }
      
      setConversations(filteredConversations);
    }
  };

  const loadMessageRequestsCount = async () => {
    if (!user?.id) return;
    const { data } = await getMessageRequests(user.id);
    setMessageRequestsCount(data?.length || 0);
  };

  const loadArchivedChatsCount = async () => {
    if (!user?.id) return;
    try {
      const { getArchivedChats } = await import('@/services/chat-settings-service');
      const archivedChats = await getArchivedChats(user.id);
      setArchivedChatsCount(archivedChats.length);
    } catch (error) {
      console.error('Error loading archived chats count:', error);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    const { data, error } = await getConversation(otherUserId);
    if (error) {
      toast.error('Failed to load messages');
    } else {
      setMessages(data || []);
      
      // Load reactions for all messages
      if (data && data.length > 0 && user?.id) {
        const messageIds = data.map(m => m.id);
        const { data: reactions } = await getMessagesReactions(messageIds, user.id);
        if (reactions) {
          setMessageReactions(reactions);
        }
      }
      
      // Load pinned messages
      if (user?.id) {
        loadPinnedMessages(user.id, otherUserId);
      }
      
      // Scroll to bottom immediately after loading messages
      setTimeout(() => scrollToBottom(true), 50);
    }
  };

  const loadPinnedMessages = async (userId: string, otherUserId: string) => {
    const { data, error } = await getPinnedMessages(userId, otherUserId);
    if (error) {
      console.error('Error loading pinned messages:', error);
      return;
    }
    
    if (data) {
      // Enrich pins with message content
      const enrichedPins = await Promise.all(
        data.map(async (pin) => {
          const message = messages.find(m => m.id === pin.message_id);
          return {
            ...pin,
            content: message?.content,
            sender_name: message?.sender_name
          };
        })
      );
      setPinnedMessages(enrichedPins);
    }
  };

  const broadcastTyping = async (isTyping: boolean) => {
    if (!selectedConversation || !user?.id) return;
    
    const channel = supabase.channel(`typing:${user.id}`);
    await channel.subscribe();
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, isTyping }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    
    // Broadcast typing indicator
    if (!isTyping) {
      setIsTyping(true);
      broadcastTyping(true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      broadcastTyping(false);
    }, 2000);
  };

  const handleStartCall = async (callType: CallType) => {
    if (!selectedConversation || !user?.id) return;

    try {
      const { data, error } = await initiateCall(selectedConversation.other_user_id, callType);
      
      if (error) {
        if (error.code === 'USER_BUSY') {
          toast.error('User is currently in another call');
        } else if (error.code === 'CALLER_BUSY') {
          toast.error('You are already in a call');
        } else {
          toast.error('Failed to start call');
        }
        return;
      }
      
      if (data) {
        // Add user details to the call
        const callWithDetails: Call = {
          ...data,
          receiver_name: selectedConversation.other_user_name,
          receiver_avatar: selectedConversation.other_user_avatar,
        };
        
        setActiveCall(callWithDetails);
        setIsOutgoingCall(true);
        toast.success(`${callType === 'video' ? 'Video' : 'Voice'} call started`);
      }
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start call');
    }
  };

  const handleIncomingCall = (call: Call) => {
    console.log('📞 handleIncomingCall triggered with call:', call);
    console.log('🔍 Current activeCall state:', activeCall);
    
    // Ignore incoming call if already in a call
    if (activeCall) {
      console.log('⚠️ Already in a call, rejecting incoming call');
      updateCallStatus(call.id, 'rejected');
      return;
    }
    
    console.log('✅ Setting incoming call state');
    setIncomingCall(call);
    
    // Play ringtone (you can add audio here)
    toast.info(`Incoming ${call.call_type} call from ${call.caller_name}`, {
      duration: 30000, // 30 seconds
    });
  };

  const handleAcceptCall = () => {
    if (incomingCall) {
      setActiveCall(incomingCall);
      setIsOutgoingCall(false);
      setIncomingCall(null);
      
      // Save call state for persistence
      saveActiveCallState(incomingCall, 'receiver');
    }
  };

  const handleRejectCall = async () => {
    if (incomingCall) {
      await updateCallStatus(incomingCall.id, 'rejected');
      setIncomingCall(null);
      clearActiveCallState();
      toast.info('Call rejected');
    }
  };

  const handleEndCall = () => {
    setActiveCall(null);
    setIsOutgoingCall(false);
    clearActiveCallState();
    toast.info('Call ended');
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !user?.id) return;
    if (!messageInput.trim() && !imageFile) return;

    // Stop typing indicator
    setIsTyping(false);
    broadcastTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setIsSending(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const { url, error } = await uploadMessageImage(imageFile, user.id);
        if (error) throw new Error("Failed to upload image");
        imageUrl = url || undefined;
      }

      const { data, error } = await sendMessage(
        selectedConversation.other_user_id,
        messageInput.trim(),
        user.id,
        imageUrl
      );

      if (error) throw error;

      if (data) {
        setMessages(prev => [...prev, {
          ...data,
          sender_username: user.user_metadata?.username || '',
          sender_name: user.user_metadata?.full_name || '',
          sender_avatar: user.user_metadata?.avatar_url,
          receiver_username: selectedConversation.other_user_username,
          receiver_name: selectedConversation.other_user_name,
          receiver_avatar: selectedConversation.other_user_avatar
        }]);
      }

      setMessageInput("");
      setImageFile(null);
      setImagePreview(null);
      loadConversations();
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleStartConversation = (userProfile: any) => {
    const newConversation: Conversation = {
      id: userProfile.id,
      other_user_id: userProfile.id,
      other_user_username: userProfile.username,
      other_user_name: userProfile.full_name,
      other_user_avatar: userProfile.avatar_url,
      other_user_online: userProfile.is_online,
      content: '',
      sender_id: user?.id || '',
      receiver_id: userProfile.id,
      delivered: false,
      read: true,
      is_request: false,
      created_at: new Date().toISOString(),
      is_following: userProfile.is_following,
      is_follower: userProfile.is_follower
    };
    setSelectedConversation(newConversation);
    setSearchQuery("");
    setSearchResults([]);
    setMessages([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleStartVoiceRecording = () => {
    setIsRecordingVoice(true);
  };

  // Message action handlers
  const handleReply = (message: MessageWithProfiles) => {
    setReplyToMessage(message);
    toast.info(`Replying to ${message.sender_id === user?.id ? 'yourself' : message.sender_name}`);
  };

  const handleForward = (message: MessageWithProfiles) => {
    // TODO: Implement forward modal to select recipients
    toast.info('Forward feature coming soon');
    console.log('Forward message:', message);
  };

  const handlePin = async (message: MessageWithProfiles) => {
    setMessageToPin(message);
    setMessageToPinId(message.id);
    setShowPinDialog(true);
  };

  const handleConfirmPin = async (expiresInMinutes?: number) => {
    if (!messageToPinId || !user?.id || !selectedConversation) return;
    
    try {
      const { error } = await pinMessage(
        messageToPinId,
        user.id,
        selectedConversation.other_user_id,
        user.id,
        expiresInMinutes
      );
      
      if (error) throw error;
      
      // Reload pinned messages
      if (user?.id) {
        await loadPinnedMessages(user.id, selectedConversation.other_user_id);
      }
      
      const durationText = expiresInMinutes 
        ? `for ${expiresInMinutes >= 1440 ? `${Math.floor(expiresInMinutes / 1440)} day(s)` : `${expiresInMinutes} minute(s)`}`
        : 'forever';
      toast.success(`Message pinned ${durationText}`);
    } catch (error) {
      console.error('Error pinning message:', error);
      toast.error('Failed to pin message');
    } finally {
      setMessageToPinId(null);
      setMessageToPin(null);
    }
  };

  const handleUnpin = async (messageId: string) => {
    try {
      const { error } = await unpinMessage(messageId);
      if (error) throw error;
      
      // Reload pinned messages
      if (user?.id && selectedConversation) {
        await loadPinnedMessages(user.id, selectedConversation.other_user_id);
      }
      
      toast.success('Message unpinned');
    } catch (error) {
      console.error('Error unpinning message:', error);
      toast.error('Failed to unpin message');
    }
  };

  const handlePinClick = (messageId: string) => {
    // Scroll to the pinned message with animation
    const messageElement = messageRefs.current.get(messageId);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Find the actual message bubble (not the wrapper div)
      const messageBubble = messageElement.querySelector('[data-message-bubble]');
      if (messageBubble) {
        // Add border for pulse animation
        (messageBubble as HTMLElement).style.border = '2px solid transparent';
        (messageBubble as HTMLElement).style.animation = 'pulse 1s ease-in-out 3';
        
        setTimeout(() => {
          (messageBubble as HTMLElement).style.animation = '';
          (messageBubble as HTMLElement).style.border = '';
        }, 3000);
      }
    }
  };

  const handleDeleteForYou = async (messageId: string) => {
    if (!user?.id) return;
    
    try {
      // Add fade-out animation
      const messageElement = messageRefs.current.get(messageId);
      if (messageElement) {
        messageElement.classList.add('message-unsending');
      }
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Add to deleted_messages table
      const { error } = await deleteMessageForUser(messageId, user.id);
      if (error) throw error;
      
      // Update local state to hide message immediately
      setDeletedMessageIds(prev => new Set([...prev, messageId]));
      toast.success('Message deleted for you');
    } catch (error) {
      console.error('Error deleting message for user:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleUnsend = async (messageId: string) => {
    if (!user?.id) return;
    
    try {
      // Add fade-out animation before deleting
      const messageElement = messageRefs.current.get(messageId);
      if (messageElement) {
        messageElement.classList.add('message-unsending');
      }
      
      // Wait for animation to complete (300ms)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { error } = await deleteMessage(messageId);
      if (error) throw error;
      
      // Remove from UI
      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success('Message unsent');
      loadConversations();
    } catch (error) {
      console.error('Error unsending message:', error);
      toast.error('Failed to unsend message');
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await addReaction(messageId, user.id, emoji);
      if (error) throw error;
      
      // Update local reactions state
      const currentReactions = messageReactions.get(messageId) || [];
      const existingReaction = currentReactions.find(r => r.emoji === emoji);
      
      let updatedReactions: MessageReaction[];
      if (existingReaction) {
        updatedReactions = currentReactions.map(r => 
          r.emoji === emoji 
            ? { ...r, count: r.count + 1, userReacted: true }
            : r
        );
      } else {
        updatedReactions = [...currentReactions, { emoji, count: 1, userReacted: true }];
      }
      
      setMessageReactions(prev => new Map(prev).set(messageId, updatedReactions));
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const handleRemoveReaction = async (messageId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await removeReaction(messageId, user.id);
      if (error) throw error;
      
      // Update local reactions state
      const currentReactions = messageReactions.get(messageId) || [];
      const updatedReactions = currentReactions
        .map(r => {
          if (r.userReacted) {
            return r.count > 1 
              ? { ...r, count: r.count - 1, userReacted: false }
              : null;
          }
          return r;
        })
        .filter((r): r is MessageReaction => r !== null);
      
      setMessageReactions(prev => new Map(prev).set(messageId, updatedReactions));
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast.error('Failed to remove reaction');
    }
  };

  const handleSendVoiceMessage = async (audioBlob: Blob, duration: number, playOnce: boolean = false) => {
    if (!selectedConversation || !user?.id) return;

    setIsSending(true);
    setIsRecordingVoice(false);

    try {
      // Upload voice message
      const { url, error: uploadError } = await uploadVoiceMessage(audioBlob, user.id);
      if (uploadError || !url) throw new Error("Failed to upload voice message");

      // Send message with voice URL
      const { data, error } = await sendMessage(
        selectedConversation.other_user_id,
        '', // Empty content for voice messages
        user.id,
        undefined,
        url,
        duration,
        playOnce
      );

      if (error) throw error;

      if (data) {
        setMessages(prev => [...prev, {
          ...data,
          sender_username: user.user_metadata?.username || '',
          sender_name: user.user_metadata?.full_name || '',
          sender_avatar: user.user_metadata?.avatar_url,
          receiver_username: selectedConversation.other_user_username,
          receiver_name: selectedConversation.other_user_name,
          receiver_avatar: selectedConversation.other_user_avatar
        }]);
      }

      toast.success("Voice message sent");
      loadConversations();
    } catch (error) {
      console.error("Error sending voice message:", error);
      toast.error("Failed to send voice message");
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelVoiceRecording = () => {
    setIsRecordingVoice(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-col border-r border-border`}>
        {/* Header */}
        <div className="border-b border-border">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="md:hidden -ml-2"
              >
                <ArrowLeft size={22} />
              </Button>
              <h1 className="text-xl font-semibold flex items-center gap-1">
                {user?.user_metadata?.username || 'Messages'}
                <ChevronDown size={16} className="text-muted-foreground" />
              </h1>
            </div>
            <Button variant="ghost" size="icon">
              <Plus size={24} strokeWidth={2.5} />
            </Button>
          </div>
          
          {/* Requests Button */}
          {messageRequestsCount > 0 && (
            <div className="px-4 pb-3">
              <button
                onClick={() => navigate('/messages/requests')}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium">Message requests</span>
                <span className="text-sm text-primary font-semibold">{messageRequestsCount}</span>
              </button>
            </div>
          )}

          {/* Archived Chats Button */}
          {archivedChatsCount > 0 && (
            <div className="px-4 pb-3">
              <button
                onClick={() => setShowArchivedChats(true)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Archive size={18} className="text-muted-foreground" />
                  <span className="text-sm font-medium">Archived</span>
                </div>
                <span className="text-sm text-muted-foreground font-semibold">{archivedChatsCount}</span>
              </button>
            </div>
          )}
          
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-lg bg-muted border-0 h-9"
              />
            </div>
          </div>
        </div>

        {/* Search Results or Conversations */}
        <ScrollArea className="flex-1">
          {searchQuery && searchResults.length > 0 ? (
            <div>
              {searchResults.map((userProfile) => (
                <button
                  key={userProfile.id}
                  onClick={() => handleStartConversation(userProfile)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                >
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={userProfile.avatar_url} />
                    <AvatarFallback>{userProfile.full_name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">{userProfile.full_name}</p>
                    <p className="text-xs text-muted-foreground">@{userProfile.username}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="p-8 text-center text-muted-foreground">No users found</div>
          ) : (
            <div>
              {conversations.length > 0 ? conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  avatar={conversation.other_user_avatar}
                  name={conversation.other_user_name || conversation.other_user_username || 'Unknown User'}
                  username={conversation.other_user_username}
                  lastMessage={conversation.content || 'No messages yet'}
                  timestamp={conversation.created_at}
                  isOnline={conversation.other_user_online}
                  isUnread={!conversation.read && conversation.receiver_id === user?.id}
                  isActive={selectedConversation?.other_user_id === conversation.other_user_id}
                  isSentByMe={conversation.sender_id === user?.id}
                  onClick={() => setSelectedConversation(conversation)}
                />
              )) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="mb-2">No conversations yet</p>
                  <p className="text-xs">Search for users to start chatting</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col h-screen">
          {/* Chat Header - Fixed at top */}
          <div className="sticky top-0 z-10 bg-background px-4 py-3 border-b border-border flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSelectedConversation(null)}
            >
              <ArrowLeft size={20} />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedConversation.other_user_avatar} />
              <AvatarFallback>{selectedConversation.other_user_name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm">{selectedConversation.other_user_name}</p>
              {otherUserTyping ? (
                <p className="text-xs text-primary">Typing...</p>
              ) : (
                <ActiveStatus
                  isOnline={selectedConversation.other_user_online}
                  lastSeen={selectedConversation.created_at}
                  showDot={true}
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSettingsPanel(true)}
                title="Chat settings"
              >
                <Info size={20} />
              </Button>
            </div>
          </div>

          {/* Pinned Messages Bar */}
          {pinnedMessages.length > 0 && (
            <PinnedMessagesBar
              pinnedMessages={pinnedMessages}
              onPinClick={handlePinClick}
              onUnpin={handleUnpin}
              currentUserId={user?.id}
            />
          )}

          {/* Messages - Scrollable area */}
          <div className="flex-1 overflow-y-auto scroll-smooth p-3" style={{ scrollBehavior: 'smooth' }}>
            <div className="max-w-2xl mx-auto px-2 min-h-full flex flex-col justify-end">
              <AnimatePresence>
                {messages.filter(msg => !deletedMessageIds.has(msg.id)).map((message, index) => {
                  const isOwn = message.sender_id === user?.id;
                  
                  // Use filtered messages for calculating consecutive/last states
                  const visibleMessages = messages.filter(msg => !deletedMessageIds.has(msg.id));
                  const visibleIndex = visibleMessages.findIndex(m => m.id === message.id);
                  const prevMessage = visibleMessages[visibleIndex - 1];
                  const nextMessage = visibleMessages[visibleIndex + 1];
                  
                  // Check if this message is consecutive with previous one
                  const isConsecutive = prevMessage && 
                    prevMessage.sender_id === message.sender_id && 
                    (new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime()) < 60000; // Within 1 minute
                  
                  // Check if this is the last message in conversation or from this sender
                  const isLastInGroup = !nextMessage || 
                    nextMessage.sender_id !== message.sender_id ||
                    (new Date(nextMessage.created_at).getTime() - new Date(message.created_at).getTime()) > 60000;
                  
                  const isLastOverall = visibleIndex === visibleMessages.length - 1;
                  
                  return (
                    <div
                      key={message.id}
                      ref={(el) => {
                        if (el) {
                          messageRefs.current.set(message.id, el);
                        } else {
                          messageRefs.current.delete(message.id);
                        }
                      }}
                    >
                      <MessageBubble
                        messageId={message.id}
                        content={message.content}
                        imageUrl={message.image_url}
                        voiceUrl={message.voice_url}
                        voiceDuration={message.voice_duration}
                        voicePlayOnce={message.voice_play_once}
                        timestamp={message.created_at}
                        isOwn={isOwn}
                        delivered={message.delivered || false}
                        isRead={message.read}
                        senderAvatar={message.sender_avatar}
                        senderName={message.sender_name}
                        showAvatar={!isConsecutive}
                        isLast={isLastOverall}
                        isConsecutive={isConsecutive}
                        failed={message.failed || false}
                        isRecipientOnline={selectedConversation?.other_user_online || false}
                        reactions={messageReactions.get(message.id) || []}
                        onReply={() => handleReply(message)}
                        onForward={() => handleForward(message)}
                        onPin={() => handlePin(message)}
                        onDelete={() => handleDeleteForYou(message.id)}
                        onUnsend={() => handleUnsend(message.id)}
                        onReaction={(emoji) => handleAddReaction(message.id, emoji)}
                        onRemoveReaction={() => handleRemoveReaction(message.id)}
                      />
                    </div>
                  );
                })}
                
                {/* Typing Indicator */}
                {otherUserTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex justify-start pl-9"
                  >
                    <TypingIndicator />
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Fixed at bottom */}
          <div className="sticky bottom-0 bg-background p-2 sm:p-3 md:p-4 border-t border-border">
            <div className="w-full max-w-3xl mx-auto">
              {/* Reply Preview */}
              {replyToMessage && (
                <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Replying to {replyToMessage.sender_id === user?.id ? 'yourself' : replyToMessage.sender_name}</p>
                    <p className="text-sm truncate">{replyToMessage.content || '🎵 Voice message'}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => setReplyToMessage(null)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
              
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="rounded-lg max-h-32 object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
              
              {/* Show Voice Recorder or Normal Input */}
              {isRecordingVoice ? (
                <VoiceRecorder
                  onSend={handleSendVoiceMessage}
                  onCancel={handleCancelVoiceRecording}
                />
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  
                  {/* Attachment Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-muted text-muted-foreground flex-shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip size={20} />
                  </Button>

                  {/* Input Field */}
                  <div className="flex-1 min-w-0">
                    <Input
                      placeholder="Message"
                      value={messageInput}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="w-full rounded-full border-0 bg-muted/80 dark:bg-muted px-4 py-2 h-10 sm:h-12 text-[14px] sm:text-[15px] focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>

                  {/* Send/Mic Button */}
                  {messageInput.trim() || imageFile ? (
                    <Button
                      onClick={handleSendMessage}
                      disabled={(!messageInput.trim() && !imageFile) || isSending}
                      size="icon"
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white shadow-lg flex-shrink-0"
                    >
                      <Send size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStartVoiceRecording}
                      size="icon"
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg flex-shrink-0"
                    >
                      <Mic size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <Send size={64} className="text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
            <p className="text-muted-foreground">Send private messages to your followers</p>
          </div>
        </div>
      )}

      {/* Incoming Call Notification */}
      <AnimatePresence>
        {incomingCall && (
          <IncomingCallNotification
            call={incomingCall}
            onAccept={handleAcceptCall}
            onReject={handleRejectCall}
          />
        )}
      </AnimatePresence>

      {/* Active Call Modal */}
      {activeCall && (
        <CallModal
          call={activeCall}
          isOutgoing={isOutgoingCall}
          onEnd={handleEndCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Chat Profile Panel */}
      <ChatProfilePanel
        isOpen={showProfilePanel}
        onClose={() => setShowProfilePanel(false)}
        userName={selectedConversation?.other_user_name || 'User'}
        username={selectedConversation?.other_user_username}
        avatar={selectedConversation?.other_user_avatar}
        isOnline={selectedConversation?.other_user_online}
        onViewProfile={() => {
          if (selectedConversation?.other_user_username) {
            navigate(`/${selectedConversation.other_user_username}`);
          }
        }}
      />

      {/* Pin Message Dialog */}
      <PinMessageDialog
        open={showPinDialog}
        onOpenChange={setShowPinDialog}
        onConfirm={handleConfirmPin}
        messagePreview={messageToPin?.content || messageToPin?.voice_url ? '🎵 Voice message' : '📎 Attachment'}
      />

      {/* Chat Settings Panel */}
      {selectedConversation && (
        <ChatSettingsPanel
          isOpen={showSettingsPanel}
          onClose={() => setShowSettingsPanel(false)}
          recipientId={selectedConversation.other_user_id}
          conversationId={selectedConversation.id}
          recipientName={selectedConversation.other_user_name}
          recipientAvatar={selectedConversation.other_user_avatar}
        />
      )}

      {/* Archived Chats Panel */}
      <ArchivedChats
        isOpen={showArchivedChats}
        onClose={() => {
          setShowArchivedChats(false);
          loadArchivedChatsCount(); // Reload count when closing
        }}
        onSelectChat={(conversationId, userId) => {
          // Find or create conversation with this user
          const existingConv = conversations.find(
            c => c.other_user_id === userId
          );
          
          if (existingConv) {
            setSelectedConversation(existingConv);
          } else {
            // Create a temporary conversation object
            const tempConv: Conversation = {
              id: conversationId,
              other_user_id: userId,
              other_user_name: '',
              other_user_username: '',
              other_user_avatar: '',
              other_user_online: false,
              content: '',
              sender_id: '',
              receiver_id: '',
              created_at: new Date().toISOString(),
              read: true,
              delivered: false,
              is_request: false,
              is_following: false,
              is_follower: false,
            };
            setSelectedConversation(tempConv);
            loadMessages(userId);
          }
          
          setShowArchivedChats(false);
          loadArchivedChatsCount();
        }}
      />
    </div>
  );
}
