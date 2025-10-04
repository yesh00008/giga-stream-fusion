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

  return (
    <Card 
      className="group cursor-pointer overflow-hidden border-0 bg-transparent transition-smooth hover:scale-[1.02]"
      onClick={() => navigate(`/watch/${id}`)}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full gradient-card flex items-center justify-center">
            <Eye className="text-muted-foreground" size={48} />
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
          <Clock size={12} />
          {duration}
        </div>
      </div>

      <div className="flex gap-3 mt-3">
        <Avatar className="w-9 h-9 flex-shrink-0">
          <AvatarFallback className="bg-card text-xs">{channel[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium line-clamp-2 text-sm mb-1 group-hover:text-primary transition-smooth">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">{channel}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
            <span>{views} views</span>
            <span>•</span>
            <span>{timestamp}</span>
          </div>
        </div>

        <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-smooth">
          <MoreVertical size={16} />
        </Button>
      </div>
    </Card>
  );
}
