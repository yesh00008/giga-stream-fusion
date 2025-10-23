import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import type { PinnedMessage } from "@/lib/message-service";

interface PinnedMessagesBarProps {
  pinnedMessages: Array<PinnedMessage & { content?: string; sender_name?: string }>;
  onPinClick: (messageId: string) => void;
  onUnpin: (messageId: string) => void;
  currentUserId?: string;
}

export function PinnedMessagesBar({
  pinnedMessages,
  onPinClick,
  onUnpin,
  currentUserId
}: PinnedMessagesBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBar, setShowBar] = useState(true);

  useEffect(() => {
    // Reset index when pins change
    if (currentIndex >= pinnedMessages.length) {
      setCurrentIndex(0);
    }
  }, [pinnedMessages.length, currentIndex]);

  if (pinnedMessages.length === 0 || !showBar) {
    return null;
  }

  const currentPin = pinnedMessages[currentIndex];
  const hasMultiplePins = pinnedMessages.length > 1;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % pinnedMessages.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + pinnedMessages.length) % pinnedMessages.length);
  };

  const getExpiryText = (expiresAt: string | null) => {
    if (!expiresAt) return "Pinned forever";
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    
    if (expiryDate < now) return "Expired";
    
    return `Expires ${formatDistanceToNow(expiryDate, { addSuffix: true })}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Pin Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Pin size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Navigation - Previous */}
          {hasMultiplePins && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={handlePrevious}
            >
              <ChevronLeft size={16} />
            </Button>
          )}

          {/* Pin Content */}
          <motion.div
            key={currentPin.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onPinClick(currentPin.message_id)}
          >
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Pinned by {currentPin.pinned_by === currentUserId ? 'You' : currentPin.sender_name || 'Other user'}
              </p>
              {hasMultiplePins && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {currentIndex + 1} of {pinnedMessages.length}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-900 dark:text-gray-100 truncate">
              {currentPin.content || "📎 Attachment"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {getExpiryText(currentPin.expires_at)}
            </p>
          </motion.div>

          {/* Navigation - Next */}
          {hasMultiplePins && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={handleNext}
            >
              <ChevronRight size={16} />
            </Button>
          )}

          {/* Unpin Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 hover:bg-red-100 dark:hover:bg-red-900/20"
            onClick={(e) => {
              e.stopPropagation();
              onUnpin(currentPin.message_id);
            }}
          >
            <X size={16} className="text-gray-600 dark:text-gray-400" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
