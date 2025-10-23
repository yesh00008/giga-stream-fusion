import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  avatar?: string;
  name: string;
  username?: string;
  lastMessage: string;
  timestamp: string;
  isOnline?: boolean;
  isUnread?: boolean;
  isActive?: boolean;
  isSentByMe?: boolean;
  onClick: () => void;
}

export function ConversationItem({
  avatar,
  name,
  username,
  lastMessage,
  timestamp,
  isOnline = false,
  isUnread = false,
  isActive = false,
  isSentByMe = false,
  onClick,
}: ConversationItemProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 transition-colors relative",
        isActive && "bg-muted"
      )}
    >
      {/* Avatar with online indicator and unread dot */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-14 h-14">
          <AvatarImage src={avatar} />
          <AvatarFallback>{name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
        </Avatar>
        {/* Show unread indicator on avatar */}
        {isUnread && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-background"
          />
        )}
        {/* Show online status only when no unread messages */}
        {isOnline && !isUnread && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-sm truncate">{name}</p>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatDistanceToNow(new Date(timestamp), { addSuffix: false })}
          </span>
        </div>
        <p
          className={cn(
            "text-xs truncate",
            isUnread ? "font-medium text-foreground" : "text-muted-foreground"
          )}
        >
          {isSentByMe && "You: "}
          {lastMessage}
        </p>
      </div>
    </motion.button>
  );
}
