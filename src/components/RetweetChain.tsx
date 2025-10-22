import { Repeat2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface RetweetHeaderProps {
  retweetedBy: {
    username: string;
    fullName: string;
    avatar?: string;
  };
  className?: string;
}

export function RetweetHeader({ retweetedBy, className = "" }: RetweetHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2 px-4 pt-3 pb-1 ${className}`}
    >
      <Repeat2 size={14} className="text-green-600 ml-10" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/profile/${retweetedBy.username}`);
        }}
        className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
      >
        <span className="font-medium">{retweetedBy.fullName}</span> retweeted
      </button>
    </motion.div>
  );
}

interface QuotedPostProps {
  post: {
    id: string;
    content: string;
    image?: string;
    author: {
      name: string;
      username: string;
      avatar?: string;
      badge?: string | null;
    };
    timestamp: string;
  };
  onPostClick?: () => void;
  className?: string;
}

export function QuotedPost({ post, onPostClick, className = "" }: QuotedPostProps) {
  const navigate = useNavigate();

  return (
    <div
      className={`mt-3 border border-border rounded-xl p-3 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onPostClick?.();
        navigate(`/post/${post.id}`);
      }}
    >
      <div className="flex items-start gap-2">
        <Avatar
          className="w-6 h-6 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${post.author.username}`);
          }}
        >
          {post.author.avatar ? (
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
          ) : null}
          <AvatarFallback className="text-xs">
            {post.author.name[0]?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${post.author.username}`);
              }}
              className="font-semibold text-xs hover:underline truncate"
            >
              {post.author.name}
            </button>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              @{post.author.username}
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0">·</span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {post.timestamp}
            </span>
          </div>

          <p className="text-sm text-foreground leading-relaxed line-clamp-4 whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {post.image && (
            <img
              src={post.image}
              alt="Quoted post"
              className="mt-2 rounded-lg max-h-48 w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
