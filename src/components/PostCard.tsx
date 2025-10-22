import { MoreVertical, Heart, MessageCircle, Share2, Bookmark, Repeat2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { VerificationBadge } from "@/components/VerificationBadge";
import { motion } from "framer-motion";
import { RetweetMenu } from "@/components/RetweetMenu";
import { QuoteDialog } from "@/components/QuoteDialog";
import { useAuth } from "@/lib/auth-context";
import { createPost, uploadImage } from "@/lib/feed-service";
import { toast } from "sonner";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  authorUsername?: string;
  authorAvatar?: string;
  authorBadge?: string | null;
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
  authorBadge,
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
  const { user } = useAuth();
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localRetweeted, setLocalRetweeted] = useState(isRetweeted);
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);
  const [localLikes, setLocalLikes] = useState(parseInt(likes));
  const [localRetweets, setLocalRetweets] = useState(parseInt(retweets));
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);

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

  const handleRetweetClick = () => {
    const newRetweeted = !localRetweeted;
    setLocalRetweeted(newRetweeted);
    setLocalRetweets(prev => newRetweeted ? prev + 1 : Math.max(0, prev - 1));
    onRetweet?.(id);
  };

  const handleQuoteClick = () => {
    setShowQuoteDialog(true);
  };

  const handleQuotePosted = async (content: string, imageFile?: File) => {
    if (!user) {
      toast.error('Please sign in to quote this post');
      return;
    }

    try {
      let imageUrl: string | undefined;

      // Upload image if provided
      if (imageFile) {
        const { url, error: uploadError } = await uploadImage(imageFile, user.id);
        if (uploadError) {
          throw new Error('Failed to upload image');
        }
        imageUrl = url || undefined;
      }

      // Create the quote post
      const { data, error } = await createPost({
        user_id: user.id,
        content,
        image_urls: imageUrl ? [imageUrl] : [],
        quoted_post_id: id, // Reference to the original post
      });

      if (error) {
        throw error;
      }

      toast.success('Quote posted successfully!');
      
      // Optionally refresh or update the feed
      // You can call a callback here if you need to refresh the parent component
    } catch (error) {
      console.error('Error posting quote:', error);
      toast.error('Failed to post quote');
      throw error; // Re-throw to let QuoteDialog handle it
    }
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
      className="group cursor-pointer transition-colors duration-200 hover:bg-muted/50 border-b border-border/50 last:border-b-0"
      onClick={() => navigate(`/post/${id}`)}
    >
      <div className="flex items-start gap-3 px-4 pt-4 pb-2">
        <Avatar 
          className="w-10 h-10 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            if (authorUsername) navigate(`/profile/${authorUsername}`);
          }}
        >
          {authorAvatar ? (
            <AvatarImage src={authorAvatar} alt={author} />
          ) : null}
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm font-medium">
            {author?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <p 
                className="font-semibold text-sm text-foreground hover:underline truncate cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  if (authorUsername) navigate(`/profile/${authorUsername}`);
                }}
              >
                {author}
              </p>
              {authorBadge && (
                <VerificationBadge type={authorBadge as any} size={14} className="flex-shrink-0" />
              )}
              <span className="text-xs text-muted-foreground flex-shrink-0">{timestamp}</span>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-muted-foreground hover:text-foreground -mr-2 flex-shrink-0"
              onClick={handleMoreClick}
            >
              <MoreVertical size={16} />
            </Button>
          </div>
          
          <p className="text-[15px] text-foreground leading-normal mb-3 whitespace-pre-wrap">
            {content}
          </p>

          {image && (
            <div className="relative w-full rounded-xl overflow-hidden bg-muted/50 mb-3 border border-border/50">
              <img 
                src={image} 
                alt="Post image" 
                className="w-full aspect-video object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Interaction buttons row */}
      <div className="flex items-center px-4 pb-3 gap-1">
        <button 
          className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors ${localLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'}`}
          onClick={handleLikeClick}
        >
          <Heart size={19} className={localLiked ? 'fill-current' : ''} strokeWidth={2} />
          {localLikes > 0 && <span className="text-xs font-medium">{localLikes}</span>}
        </button>

        <button 
          className="flex items-center gap-1.5 p-2 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/post/${id}`);
          }}
        >
          <MessageCircle size={19} strokeWidth={2} />
          {parseInt(comments) > 0 && <span className="text-xs font-medium">{comments}</span>}
        </button>

        <div onClick={(e) => e.stopPropagation()}>
          <RetweetMenu
            isRetweeted={localRetweeted}
            retweetCount={localRetweets}
            onRepost={handleRetweetClick}
            onQuote={handleQuoteClick}
          />
        </div>

        <button 
          className="flex items-center gap-1.5 p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          onClick={handleShareClick}
        >
          <Share2 size={19} strokeWidth={2} />
          {parseInt(shares) > 0 && <span className="text-xs font-medium">{shares}</span>}
        </button>

        <button 
          className={`flex items-center gap-1.5 p-2 rounded-lg transition-colors ml-auto ${localBookmarked ? 'text-primary' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'}`}
          onClick={handleBookmarkClick}
        >
          <Bookmark size={19} className={localBookmarked ? 'fill-current' : ''} strokeWidth={2} />
        </button>
      </div>

      {/* Quote Dialog */}
      <QuoteDialog
        open={showQuoteDialog}
        onOpenChange={setShowQuoteDialog}
        originalPost={{
          id,
          author,
          authorUsername: authorUsername || '',
          authorAvatar,
          authorBadge,
          content,
          image,
          timestamp
        }}
        onQuote={handleQuotePosted}
      />
    </div>
  );
}
