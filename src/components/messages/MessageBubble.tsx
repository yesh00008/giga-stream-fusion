import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageStatus } from "./MessageStatus";
import { VoiceMessage } from "./VoiceMessage";
import { MessageContextMenu } from "./MessageContextMenu";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface MessageBubbleProps {
  content: string;
  imageUrl?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  voicePlayOnce?: boolean;
  messageId?: string;
  timestamp: string;
  isOwn: boolean;
  delivered?: boolean;
  isRead?: boolean;
  senderAvatar?: string;
  senderName?: string;
  showAvatar?: boolean;
  isLast?: boolean;
  isConsecutive?: boolean;
  failed?: boolean;
  isRecipientOnline?: boolean;
  reactions?: Array<{ emoji: string; count: number; userReacted: boolean }>;
  onReply?: () => void;
  onForward?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onUnsend?: () => void;
  onReaction?: (emoji: string) => void;
  onRemoveReaction?: () => void;
}

export function MessageBubble({
  content,
  imageUrl,
  voiceUrl,
  voiceDuration,
  voicePlayOnce,
  messageId,
  timestamp,
  isOwn,
  delivered = false,
  isRead = false,
  senderAvatar,
  senderName,
  showAvatar = false,
  isLast = false,
  isConsecutive = false,
  failed = false,
  isRecipientOnline = false,
  reactions = [],
  onReply,
  onForward,
  onPin,
  onDelete,
  onUnsend,
  onReaction,
  onRemoveReaction,
}: MessageBubbleProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  // Long press detection for mobile
  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      setShowContextMenu(true);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (messageRef.current && !messageRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showContextMenu]);

  const handleReactionClick = (emoji: string) => {
    const existingReaction = reactions.find(r => r.emoji === emoji);
    if (existingReaction?.userReacted) {
      onRemoveReaction?.();
    } else {
      onReaction?.(emoji);
    }
    setShowContextMenu(false);
  };
  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8,
      }}
      className={cn(
        "flex items-end gap-2 group relative px-1",
        isOwn ? "justify-end" : "justify-start",
        isConsecutive && !isOwn ? "ml-9" : "",
        isConsecutive ? "mb-0.5" : "mb-3"
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowContextMenu(true);
      }}
    >
      {/* Avatar for received messages - only show for first in sequence */}
      {!isOwn && !isConsecutive && (
        <Avatar className="w-7 h-7 flex-shrink-0 mb-1">
          <AvatarImage src={senderAvatar} />
          <AvatarFallback className="text-[10px] bg-gradient-to-br from-blue-400 to-purple-500 text-white">
            {senderName?.[0]?.toUpperCase() || "?"}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "flex flex-col max-w-[75%] min-w-[60px] relative",
        isOwn ? "items-end" : "items-start"
      )}>
        {/* Context Menu */}
        <AnimatePresence>
          {showContextMenu && (
            <MessageContextMenu
              isOwn={isOwn}
              onReply={() => {
                onReply?.();
                setShowContextMenu(false);
              }}
              onForward={() => {
                onForward?.();
                setShowContextMenu(false);
              }}
              onPin={() => {
                onPin?.();
                setShowContextMenu(false);
              }}
              onDelete={() => {
                onDelete?.();
                setShowContextMenu(false);
              }}
              onUnsend={() => {
                onUnsend?.();
                setShowContextMenu(false);
              }}
              onReaction={handleReactionClick}
              showReactions={true}
            />
          )}
        </AnimatePresence>

        {/* Voice message */}
        {voiceUrl && voiceDuration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-1"
          >
            <VoiceMessage
              audioUrl={voiceUrl}
              duration={voiceDuration}
              isOwn={isOwn}
              timestamp={timestamp}
              playOnce={voicePlayOnce}
              messageId={messageId}
            />
          </motion.div>
        )}

        {/* Image attachment */}
        {imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "mb-1 overflow-hidden",
              isOwn ? "rounded-[20px] rounded-br-[8px]" : "rounded-[20px] rounded-bl-[8px]"
            )}
          >
            <img
              src={imageUrl}
              alt="Attachment"
              className="max-h-72 max-w-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
              loading="lazy"
            />
          </motion.div>
        )}

        {/* Text bubble */}
        {content && (
          <motion.div
            data-message-bubble
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: imageUrl ? 0.2 : 0.05 }}
            className={cn(
              "px-4 py-2.5 break-words relative shadow-sm",
              // Unique bubble shapes
              isOwn
                ? cn(
                    "bg-white text-gray-900 border border-gray-200",
                    isConsecutive 
                      ? "rounded-[20px] rounded-br-[8px]" 
                      : "rounded-[20px] rounded-br-[8px]"
                  )
                : cn(
                    "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
                    isConsecutive
                      ? "rounded-[20px] rounded-bl-[8px]"
                      : "rounded-[20px] rounded-bl-[8px]"
                  ),
              "before:absolute before:w-0 before:h-0",
              // Tail styling - smaller and better positioned
              isOwn && !isConsecutive && "before:border-l-[10px] before:border-l-white before:border-t-[6px] before:border-t-transparent before:border-b-[6px] before:border-b-transparent before:-right-[6px] before:bottom-[2px]",
              !isOwn && !isConsecutive && "before:border-r-[10px] before:border-r-blue-600 before:border-t-[6px] before:border-t-transparent before:border-b-[6px] before:border-b-transparent before:-left-[6px] before:bottom-[2px]",
              // Add shadow to tail
              !isConsecutive && "before:filter before:drop-shadow-sm"
            )}
          >
            <div className="flex items-end gap-2">
              <p className={cn(
                "text-[15px] leading-[1.4] font-normal flex-1",
                isOwn ? "text-gray-800" : "text-white"
              )}>
                {content}
              </p>
              
              {/* Timestamp and Status inline with message */}
              <div className="flex items-center gap-1 flex-shrink-0 self-end pb-[1px]">
                <span className={cn(
                  "text-[10px] font-normal leading-none",
                  isOwn ? "text-gray-500" : "text-white/70"
                )}>
                  {new Date(timestamp).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  }).toLowerCase()}
                </span>
                
                {/* WhatsApp-style status indicators */}
                {isOwn && (
                  <MessageStatus
                    timestamp={timestamp}
                    isOwn={isOwn}
                    delivered={delivered}
                    isRead={isRead}
                    showStatus={true}
                    inline={true}
                    failed={failed}
                    isRecipientOnline={isRecipientOnline}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Reactions Display */}
        {reactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "flex items-center gap-1 mt-1 flex-wrap",
              isOwn ? "justify-end" : "justify-start"
            )}
          >
            {reactions.map(({ emoji, count, userReacted }) => (
              <motion.button
                key={emoji}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReactionClick(emoji)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-sm flex items-center gap-1 transition-all",
                  userReacted
                    ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500"
                    : "bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300"
                )}
              >
                <span>{emoji}</span>
                {count > 1 && (
                  <span className={cn(
                    "text-xs font-medium",
                    userReacted ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                  )}>
                    {count}
                  </span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
