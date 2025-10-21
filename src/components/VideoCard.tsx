import { MoreVertical, Clock, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface VideoCardProps {
  id: string;
  title: string;
  channel: string;
  views: string;
  timestamp: string;
  duration: string;
  thumbnail?: string;
}

export function VideoCard({ id, title, channel, views, timestamp, duration, thumbnail }: VideoCardProps) {
  const navigate = useNavigate();

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle more options
  };

  return (
    <div 
      className="group cursor-pointer transition-all duration-200"
      onClick={() => navigate(`/watch/${id}`)}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/50">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted/30 flex items-center justify-center">
            <Eye className="text-muted-foreground/30" size={48} />
          </div>
        )}
        <div className="absolute bottom-1.5 right-1.5 bg-black/75 text-white px-1.5 py-0.5 rounded text-[11px] font-medium flex items-center gap-0.5">
          <Clock size={10} />
          {duration}
        </div>
      </div>

      <div className="mt-2.5">
        <div className="flex gap-2.5">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarFallback className="bg-muted text-foreground text-xs font-medium">{channel[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium line-clamp-2 text-sm leading-tight mb-1 text-foreground">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground truncate">{channel}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <span className="truncate">{views} views</span>
              <span className="flex-shrink-0">•</span>
              <span className="truncate">{timestamp}</span>
            </div>
          </div>

          <Button 
            size="icon" 
            variant="ghost" 
            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-7 w-7 hover:bg-muted/50"
            onClick={handleMoreClick}
          >
            <MoreVertical size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}
