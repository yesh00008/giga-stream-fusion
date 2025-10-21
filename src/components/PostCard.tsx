import { MoreVertical, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  likes: string;
  comments: string;
  timestamp: string;
  image?: string;
}

export function PostCard({ id, title, content, author, likes, comments, timestamp, image }: PostCardProps) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle more options
  };

  return (
    <div 
      className="group cursor-pointer transition-all duration-200 hover:bg-muted/30 p-4 rounded-lg border border-transparent hover:border-border"
      onClick={() => navigate(`/post/${id}`)}
    >
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
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
              <div className="w-full aspect-video flex items-center justify-center">
                <span className="text-5xl">{image}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button 
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors min-w-[60px] ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={(e) => {
                e.stopPropagation();
                setLiked(!liked);
              }}
            >
              <Heart size={20} className={liked ? 'fill-current' : ''} strokeWidth={2} />
              <span className="text-xs font-medium">{likes}</span>
            </button>

            <button 
              className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors min-w-[60px]"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
              <span className="text-xs font-medium">{comments}</span>
            </button>

            <button 
              className="flex flex-col items-center gap-0.5 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors min-w-[60px]"
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <span className="text-xs font-medium">Share</span>
            </button>

            <button 
              className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors min-w-[60px] ml-auto ${saved ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={(e) => {
                e.stopPropagation();
                setSaved(!saved);
              }}
            >
              <Bookmark size={20} className={saved ? 'fill-current' : ''} strokeWidth={2} />
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
