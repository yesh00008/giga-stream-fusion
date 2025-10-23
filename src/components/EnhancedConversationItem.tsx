import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

interface EnhancedConversationItemProps {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  otherUserUsername?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
  lastSeen?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export const EnhancedConversationItem: React.FC<EnhancedConversationItemProps> = ({
  id,
  otherUserId,
  otherUserName,
  otherUserAvatar,
  otherUserUsername,
  lastMessage,
  lastMessageTime,
  unreadCount = 0,
  isOnline: initialOnline = false,
  lastSeen,
  isSelected = false,
  onClick
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(initialOnline);
  const [currentLastSeen, setCurrentLastSeen] = useState(lastSeen);

  useEffect(() => {
    // Subscribe to typing indicator
    const typingChannel = supabase
      .channel(`typing:${id}`)
      .on('broadcast', { event: 'typing' }, ({ payload }: any) => {
        if (payload.userId === otherUserId) {
          setIsTyping(payload.isTyping);
          
          // Auto-clear typing after 3 seconds
          if (payload.isTyping) {
            setTimeout(() => setIsTyping(false), 3000);
          }
        }
      })
      .subscribe();

    // Subscribe to online status changes
    const presenceChannel = supabase
      .channel(`presence:${otherUserId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${otherUserId}`
      }, (payload: any) => {
        if (payload.new) {
          setIsOnline(payload.new.is_online || false);
          setCurrentLastSeen(payload.new.last_seen);
        }
      })
      .subscribe();

    return () => {
      typingChannel.unsubscribe();
      presenceChannel.unsubscribe();
    };
  }, [id, otherUserId]);

  // Update online status when prop changes
  useEffect(() => {
    setIsOnline(initialOnline);
  }, [initialOnline]);

  const formatTime = (time?: string) => {
    if (!time) return '';
    try {
      return formatDistanceToNow(new Date(time), { addSuffix: true })
        .replace('about ', '')
        .replace('less than a minute ago', 'just now');
    } catch {
      return '';
    }
  };

  const formatLastSeen = () => {
    if (isOnline) return 'Active now';
    if (!currentLastSeen) return 'Offline';
    
    const lastSeenDate = new Date(currentLastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / 60000);
    
    if (diffInMinutes < 1) return 'Active just now';
    if (diffInMinutes < 60) return `Active ${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `Active ${Math.floor(diffInMinutes / 60)}h ago`;
    return `Active ${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const truncateMessage = (msg?: string) => {
    if (!msg) return '';
    if (msg.length > 40) return msg.substring(0, 40) + '...';
    return msg;
  };

  return (
    <motion.div
      className={`flex items-center gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors relative ${
        isSelected ? 'bg-accent' : ''
      }`}
      onClick={onClick}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Avatar with online indicator */}
      <div className="relative">
        <Avatar className="w-14 h-14">
          <AvatarImage src={otherUserAvatar} />
          <AvatarFallback className="text-lg font-semibold">
            {otherUserName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Online Status Indicator */}
        {isOnline && (
          <motion.div
            className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <motion.div
              className="w-full h-full bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        )}
        
        {/* Offline gray dot */}
        {!isOnline && (
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-gray-400 rounded-full border-2 border-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm truncate">{otherUserName}</h3>
          {lastMessageTime && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTime(lastMessageTime)}
            </span>
          )}
        </div>

        {/* Typing Indicator or Last Message */}
        <div className="flex items-center justify-between gap-2">
          {isTyping ? (
            <motion.div
              className="flex items-center gap-1 text-sm text-blue-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span>Typing</span>
              <div className="flex gap-0.5">
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                >
                  .
                </motion.span>
              </div>
            </motion.div>
          ) : (
            <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
              {lastMessage ? truncateMessage(lastMessage) : formatLastSeen()}
            </p>
          )}

          {/* Unread Badge */}
          {unreadCount > 0 && !isTyping && (
            <motion.div
              className="min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-blue-500 text-white text-xs font-bold rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}

          {/* Unread Dot (when count is 0 but there's a new message) */}
          {unreadCount === 0 && lastMessage && !isTyping && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          )}
        </div>

        {/* Username */}
        {otherUserUsername && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            @{otherUserUsername}
          </p>
        )}
      </div>
    </motion.div>
  );
};
