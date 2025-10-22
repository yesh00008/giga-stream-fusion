import { MoreVertical, Heart, MessageCircle, Share2, Bookmark, Repeat2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  authorUsername?: string;
  authorAvatar?: string;
  likes: string;
  comments: string;
  retweets?: string;
  shares?: string;
  timestamp: string;
  image?: string;
  isLiked?: boolean;
  isRetweeted?: boolean;
  isBookmarked?: boolean;
  onLike?: (postId: string) => void;
  onRetweet?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export function PostCard({ 
  id, 
  title, 
  content, 
  author, 
  authorUsername, 
  authorAvatar, 
  likes, 
  comments, 
  retweets = "0",
  shares = "0",
  timestamp, 
  image,
  isLiked = false,
  isRetweeted = false,
  isBookmarked = false,
  onLike,
  onRetweet,
  onBookmark,
  onShare,
}: PostCardProps) {
  const navigate = useNavigate();
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localRetweeted, setLocalRetweeted] = useState(isRetweeted);
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);
  const [localLikes, setLocalLikes] = useState(parseInt(likes));
  const [localRetweets, setLocalRetweets] = useState(parseInt(retweets));

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLiked = !localLiked;
    setLocalLiked(newLiked);
    setLocalLikes(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
    onLike?.(id);
  };

  const handleRetweetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newRetweeted = !localRetweeted;
    setLocalRetweeted(newRetweeted);
    setLocalRetweets(prev => newRetweeted ? prev + 1 : Math.max(0, prev - 1));
    onRetweet?.(id);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalBookmarked(!localBookmarked);
    onBookmark?.(id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(id);
  };

  return (
    <div 
      className="group cursor-pointer transition-all duration-200 hover:bg-muted/30 p-4 rounded-lg border border-transparent hover:border-border"
      onClick={() => navigate(`/post/${id}`)}
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          {authorAvatar && <AvatarImage src={authorAvatar} />}
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm font-medium">
            {author[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm text-foreground">{author}</p>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          </div>
          
          <h3 className="font-semibold text-base leading-snug mb-2 text-foreground">
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {content}
          </p>

          {image && (
            <div className="relative w-full rounded-lg overflow-hidden bg-muted/50 mb-3">
              <img 
                src={image} 
                alt="Post image" 
                className="w-full aspect-video object-cover"
                onError={(e) => {
                  // Hide image if it fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex items-center gap-1">
            <button 
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors min-w-[60px] ${localLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'}`}
              onClick={handleLikeClick}
            >
              <Heart size={20} className={localLiked ? 'fill-current' : ''} strokeWidth={2} />
              <span className="text-xs font-medium">{localLikes}</span>
            </button>

            <button 
              className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors min-w-[60px]"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/post/${id}`);
              }}
            >
              <MessageCircle size={20} strokeWidth={2} />
              <span className="text-xs font-medium">{comments}</span>
            </button>

            <button 
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors min-w-[60px] ${localRetweeted ? 'text-green-500' : 'text-muted-foreground hover:text-green-500 hover:bg-green-500/10'}`}
              onClick={handleRetweetClick}
            >
              <Repeat2 size={20} strokeWidth={2} />
              <span className="text-xs font-medium">{localRetweets}</span>
            </button>

            <button 
              className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors min-w-[60px]"
              onClick={handleShareClick}
            >
              <Share2 size={20} strokeWidth={2} />
              <span className="text-xs font-medium">{shares}</span>
            </button>

            <button 
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors min-w-[60px] ml-auto ${localBookmarked ? 'text-primary' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
              onClick={handleBookmarkClick}
            >
              <Bookmark size={20} className={localBookmarked ? 'fill-current' : ''} strokeWidth={2} />
              <span className="text-xs font-medium">Save</span>
            </button>
          </div>
        </div>

        <Button 
          size="icon" 
          variant="ghost" 
          className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleMoreClick}
        >
          <MoreVertical size={16} />
        </Button>
      </div>
    </div>
  );
}
