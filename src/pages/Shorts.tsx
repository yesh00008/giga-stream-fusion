import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, MoreVertical, Volume2, VolumeX, Play, Bookmark, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const shortsData = [
  {
    id: 1,
    title: "Amazing coding tips! 🚀",
    channel: "Tech Master",
    likes: 245000,
    comments: 1200,
    description: "Learn these 5 coding tricks that will blow your mind! #coding #programming #webdev",
  },
  {
    id: 2,
    title: "Build a full-stack app in 60 seconds",
    channel: "Dev Guru",
    likes: 189000,
    comments: 890,
    description: "Quick tutorial on React + Node.js #fullstack #react #nodejs",
  },
  {
    id: 3,
    title: "UI Design trends 2024 ✨",
    channel: "Design Hub",
    likes: 320000,
    comments: 2100,
    description: "Top design trends you need to know! #design #ui #ux",
  },
  {
    id: 4,
    title: "JavaScript array methods explained",
    channel: "Code Academy",
    likes: 156000,
    comments: 654,
    description: "Master these array methods like map, filter, reduce #javascript #coding",
  },
  {
    id: 5,
    title: "CSS animations made easy 🎨",
    channel: "Frontend Pro",
    likes: 278000,
    comments: 1500,
    description: "Create stunning animations with pure CSS #css #animation #webdesign",
  },
];

export default function Shorts() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (e.deltaY > 0 && currentIndex < shortsData.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleScroll);
      return () => container.removeEventListener("wheel", handleScroll);
    }
  }, [currentIndex]);

  const handleLike = (id: number) => {
    setLiked(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSave = (id: number) => {
    setSaved(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div 
      ref={containerRef}
      className="h-[calc(100vh-3.5rem)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative bg-black"
    >
      {shortsData.map((short, index) => (
        <div
          key={short.id}
          className="h-[calc(100vh-3.5rem)] snap-start relative flex items-center justify-center bg-black"
        >
          {/* Video placeholder */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black flex items-center justify-center">
            <Play size={80} className="text-white/30" />
          </div>

          {/* Play/Pause Overlay */}
          <div
            onClick={() => setPlaying(!playing)}
            className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          >
            {!playing && (
              <div className="w-20 h-20 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm animate-scale-in">
                <Play size={40} className="text-white ml-2" />
              </div>
            )}
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-16 p-4 sm:p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarFallback className="bg-primary text-white text-sm">
                  {short.channel.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-white text-sm">{short.channel}</p>
                  <Button size="sm" variant="default" className="h-7 px-4 bg-white text-black hover:bg-white/90 rounded-full font-semibold">
                    Follow
                  </Button>
                </div>
                <p className="text-sm text-white/90 mb-2 line-clamp-2">{short.description}</p>
                <div className="flex items-center gap-2 text-white/80">
                  <Music2 size={14} />
                  <span className="text-xs">Original Audio • {short.channel}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Actions - Instagram Reels Style */}
          <div className="absolute right-3 bottom-24 z-20 flex flex-col gap-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleLike(short.id)}
              className="flex flex-col gap-1 h-auto p-2 hover:bg-transparent group"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <Heart 
                  size={28} 
                  className={cn(
                    "transition-smooth",
                    liked.includes(short.id) 
                      ? "fill-primary text-primary scale-110" 
                      : "text-white group-hover:scale-110"
                  )} 
                />
              </div>
              <span className="text-xs text-white font-semibold">
                {(short.likes + (liked.includes(short.id) ? 1 : 0) / 1000).toFixed(1)}K
              </span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowComments(true)}
              className="flex flex-col gap-1 h-auto p-2 hover:bg-transparent group"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <MessageCircle size={28} className="text-white group-hover:scale-110 transition-smooth" />
              </div>
              <span className="text-xs text-white font-semibold">{short.comments}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSave(short.id)}
              className="flex flex-col gap-1 h-auto p-2 hover:bg-transparent group"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <Bookmark 
                  size={28} 
                  className={cn(
                    "transition-smooth",
                    saved.includes(short.id) 
                      ? "fill-white text-white" 
                      : "text-white group-hover:scale-110"
                  )} 
                />
              </div>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="flex flex-col gap-1 h-auto p-2 hover:bg-transparent group"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <Share2 size={28} className="text-white group-hover:scale-110 transition-smooth" />
              </div>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMuted(!muted)}
              className="flex flex-col gap-1 h-auto p-2 hover:bg-transparent group"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-black/40 rounded-full">
                {muted ? <VolumeX size={24} className="text-white" /> : <Volume2 size={24} className="text-white" />}
              </div>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="flex flex-col gap-1 h-auto p-2 hover:bg-transparent"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <MoreVertical size={28} className="text-white" />
              </div>
            </Button>
          </div>
        </div>
      ))}

      {/* Comments Bottom Sheet */}
      {showComments && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 animate-fade-in"
          onClick={() => setShowComments(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl max-h-[80vh] overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-border rounded-full mx-auto my-3"></div>
            <div className="px-4 pb-4">
              <h3 className="text-lg font-semibold mb-4">{shortsData[currentIndex]?.comments || 0} Comments</h3>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto mb-4">
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="gradient-primary text-white text-xs">U</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm"><span className="font-semibold">user123</span> Love this! 🔥</p>
                    <p className="text-xs text-muted-foreground">2h ago</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 border-t border-border pt-4">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="gradient-primary text-white text-xs">Y</AvatarFallback>
                </Avatar>
                <Input 
                  placeholder="Add a comment..." 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" variant="default">Post</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
