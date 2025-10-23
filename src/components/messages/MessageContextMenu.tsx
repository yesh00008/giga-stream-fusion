import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reply, Forward, Pin, Trash2, CornerUpLeft, Heart, ThumbsUp, Smile, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageContextMenuProps {
  isOwn: boolean;
  onReply?: () => void;
  onForward?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onUnsend?: () => void;
  onReaction?: (emoji: string) => void;
  showReactions?: boolean;
  position?: { x: number; y: number };
}

const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "😡", "👍"];

export function MessageContextMenu({
  isOwn,
  onReply,
  onForward,
  onPin,
  onDelete,
  onUnsend,
  onReaction,
  showReactions = true,
  position
}: MessageContextMenuProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      {/* Quick Reactions Bar */}
      {showReactions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className={cn(
            "absolute -top-12 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center gap-1 z-50",
            isOwn ? "right-0" : "left-0"
          )}
        >
          {QUICK_REACTIONS.map((emoji, index) => (
            <motion.button
              key={emoji}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                onReaction?.(emoji);
              }}
              className="text-2xl hover:scale-125 transition-transform active:scale-110"
            >
              {emoji}
            </motion.button>
          ))}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreHorizontal size={18} />
          </Button>
        </motion.div>
      )}

      {/* Context Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={cn(
              "absolute top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px] z-50",
              isOwn ? "right-0" : "left-0"
            )}
          >
            {/* Reply */}
            <button
              onClick={() => {
                onReply?.();
                setShowMenu(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Reply size={20} className="text-gray-700 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Reply</span>
            </button>

            {/* Forward */}
            <button
              onClick={() => {
                onForward?.();
                setShowMenu(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Forward size={20} className="text-gray-700 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Forward</span>
            </button>

            {/* Pin */}
            <button
              onClick={() => {
                onPin?.();
                setShowMenu(false);
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Pin size={20} className="text-gray-700 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Pin</span>
            </button>

            {/* Delete for you */}
            {!isOwn && (
              <button
                onClick={() => {
                  onDelete?.();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Trash2 size={20} className="text-gray-700 dark:text-gray-300" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Delete for you</span>
              </button>
            )}

            {/* Unsend (only for own messages) */}
            {isOwn && (
              <button
                onClick={() => {
                  onUnsend?.();
                  setShowMenu(false);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <CornerUpLeft size={20} className="text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">Unsend</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
