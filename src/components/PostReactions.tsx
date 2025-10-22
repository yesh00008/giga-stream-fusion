import { useState } from "react";
import { Heart, Laugh, Frown, ThumbsUp, Angry, Sparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

interface Reaction {
  type: ReactionType;
  icon: React.ReactNode;
  label: string;
  color: string;
  hoverColor: string;
}

interface ReactionsProps {
  postId: string;
  currentReaction?: ReactionType | null;
  reactionCounts?: Partial<Record<ReactionType, number>>;
  onReaction: (reactionType: ReactionType) => void;
  className?: string;
}

const reactions: Reaction[] = [
  {
    type: 'like',
    icon: <Heart className="w-5 h-5" />,
    label: 'Like',
    color: 'text-red-500',
    hoverColor: 'hover:bg-red-50 dark:hover:bg-red-950',
  },
  {
    type: 'love',
    icon: <Heart className="w-5 h-5 fill-current" />,
    label: 'Love',
    color: 'text-pink-500',
    hoverColor: 'hover:bg-pink-50 dark:hover:bg-pink-950',
  },
  {
    type: 'laugh',
    icon: <Laugh className="w-5 h-5" />,
    label: 'Haha',
    color: 'text-yellow-500',
    hoverColor: 'hover:bg-yellow-50 dark:hover:bg-yellow-950',
  },
  {
    type: 'wow',
    icon: <Sparkles className="w-5 h-5" />,
    label: 'Wow',
    color: 'text-blue-500',
    hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-950',
  },
  {
    type: 'sad',
    icon: <Frown className="w-5 h-5" />,
    label: 'Sad',
    color: 'text-gray-500',
    hoverColor: 'hover:bg-gray-50 dark:hover:bg-gray-950',
  },
  {
    type: 'angry',
    icon: <Angry className="w-5 h-5" />,
    label: 'Angry',
    color: 'text-orange-500',
    hoverColor: 'hover:bg-orange-50 dark:hover:bg-orange-950',
  },
];

export function PostReactions({
  postId,
  currentReaction,
  reactionCounts = {},
  onReaction,
  className = "",
}: ReactionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  
  const currentReactionData = currentReaction 
    ? reactions.find(r => r.type === currentReaction)
    : null;

  const handleReactionClick = (reactionType: ReactionType) => {
    onReaction(reactionType);
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (currentReaction) {
      // Toggle off current reaction
      onReaction(currentReaction);
    } else {
      // If no current reaction, open picker
      setIsOpen(true);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleButtonClick();
          }}
          onMouseEnter={() => setIsOpen(true)}
          className={cn(
            "flex items-center gap-1.5 p-2 rounded-lg transition-all duration-200",
            currentReaction
              ? `${currentReactionData?.color} ${currentReactionData?.hoverColor}`
              : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10",
            className
          )}
        >
          <motion.div
            key={currentReaction || 'default'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {currentReactionData ? (
              currentReactionData.icon
            ) : (
              <Heart size={19} strokeWidth={2} />
            )}
          </motion.div>
          {totalReactions > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-xs font-medium"
            >
              {totalReactions}
            </motion.span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-2"
        align="start"
        side="top"
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          {reactions.map((reaction, index) => (
            <motion.button
              key={reaction.type}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.03, type: "spring", stiffness: 500, damping: 30 }}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleReactionClick(reaction.type);
              }}
              className={cn(
                "p-2 rounded-full transition-colors",
                reaction.color,
                reaction.hoverColor,
                currentReaction === reaction.type && "ring-2 ring-offset-2 ring-current"
              )}
              title={reaction.label}
            >
              {reaction.icon}
            </motion.button>
          ))}
        </div>

        {/* Reaction counts breakdown */}
        {totalReactions > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 pt-2 border-t border-border/50"
          >
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(reactionCounts).map(([type, count]) => {
                if (count === 0) return null;
                const reactionData = reactions.find(r => r.type === type);
                if (!reactionData) return null;
                
                return (
                  <div
                    key={type}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full",
                      reactionData.color,
                      "bg-muted/50"
                    )}
                  >
                    <span className="scale-75">{reactionData.icon}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Component to display reaction summary (for use in feeds)
export function ReactionSummary({
  reactionCounts,
  className = "",
}: {
  reactionCounts: Partial<Record<ReactionType, number>>;
  className?: string;
}) {
  const topReactions = Object.entries(reactionCounts)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3);

  if (topReactions.length === 0) return null;

  const totalCount = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex -space-x-1">
        {topReactions.map(([type, _]) => {
          const reactionData = reactions.find(r => r.type === type);
          if (!reactionData) return null;
          
          return (
            <div
              key={type}
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center bg-background border border-border",
                reactionData.color
              )}
            >
              <span className="scale-75">{reactionData.icon}</span>
            </div>
          );
        })}
      </div>
      <span className="text-xs text-muted-foreground ml-1">
        {totalCount}
      </span>
    </div>
  );
}
