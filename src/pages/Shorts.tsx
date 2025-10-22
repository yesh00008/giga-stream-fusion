  import { useState, useRef, useEffect } from "react";
  import { ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreVertical, Volume2, VolumeX, Play, RotateCcw, Music2, Upload } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Avatar, AvatarFallback } from "@/components/ui/avatar";
  import { Input } from "@/components/ui/input";
  import { cn } from "@/lib/utils";
  import { fetchPosts } from "@/lib/data-utils";
  import { useAuth } from "@/lib/auth-context";
  import { MobileProfileHeader } from "@/components/MobileProfileHeader";

  export default function Shorts() {
    const { user } = useAuth();
    const [shorts, setShorts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [liked, setLiked] = useState<number[]>([]);
    const [saved, setSaved] = useState<number[]>([]);
    const [muted, setMuted] = useState(false);
    const [playing, setPlaying] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      loadShorts();
    }, []);

    const loadShorts = async () => {
      try {
        setLoading(true);
        const data = await fetchPosts({
          limit: 20,
          orderBy: 'created_at',
          encrypted: true,
        });
        // Filter to show only reels (short-form content)
        const reels = data.filter((post: any) => post.content_type === 'reel');
        setShorts(reels);
      } catch (err) {
        console.error('Error loading shorts:', err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      const handleScroll = (e: WheelEvent) => {
        if (e.deltaY > 0 && currentIndex < shorts.length - 1) {
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
    }, [currentIndex, shorts.length]);

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
      <div className="h-screen overflow-hidden flex flex-col">
        {/* Mobile Header */}
        <MobileProfileHeader username={user?.user_metadata?.username || user?.email?.split('@')[0] || 'user'} />
        
        <div 
          ref={containerRef}
          className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative bg-black"
        >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-white">Loading shorts...</div>
          </div>
        ) : shorts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 px-4">
            <Upload size={64} className="text-white/50" />
            <div className="text-center">
              <h3 className="text-white text-xl font-semibold mb-2">No shorts yet</h3>
              <p className="text-white/60 mb-4">Be the first to create a short!</p>
              <Button className="bg-white text-black hover:bg-white/90">
                <Upload className="mr-2 h-4 w-4" />
                Upload Short
              </Button>
            </div>
          </div>
        ) : (
          shorts.map((short, index) => (
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
                    <p className="font-semibold text-white text-sm">{short.author}</p>
                    <Button size="sm" variant="default" className="h-7 px-4 bg-white text-black hover:bg-white/90 rounded-full font-semibold">
                      Follow
                    </Button>
                  </div>
                  <p className="text-sm text-white/90 mb-2 line-clamp-2">{short.content}</p>
                  <div className="flex items-center gap-2 text-white/80">
                    <Music2 size={14} />
                    <span className="text-xs">Original Audio • {short.author}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Actions - YouTube Shorts Style */}
            <div className="absolute right-2 sm:right-4 bottom-20 sm:bottom-24 z-20 flex flex-col gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleLike(short.id)}
                className="flex flex-col gap-0.5 h-auto p-0 hover:bg-transparent group w-auto"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                  <ThumbsUp 
                    size={20} 
                    className={cn(
                      "transition-smooth sm:w-6 sm:h-6",
                      liked.includes(short.id) 
                        ? "fill-white text-white scale-110" 
                        : "text-white group-hover:scale-110"
                    )} 
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-white font-semibold drop-shadow-lg">
                  {Math.floor(short.likes / 1000)}K
                </span>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="flex flex-col gap-0.5 h-auto p-0 hover:bg-transparent group -mt-2 sm:-mt-3 w-auto"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                  <ThumbsDown size={20} className="text-white group-hover:scale-110 transition-smooth sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] sm:text-xs text-white font-semibold drop-shadow-lg">Dislike</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowComments(true)}
                className="flex flex-col gap-0.5 h-auto p-0 hover:bg-transparent group w-auto"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                  <MessageCircle size={20} className="text-white group-hover:scale-110 transition-smooth sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] sm:text-xs text-white font-semibold drop-shadow-lg">{short.comments}</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="flex flex-col gap-0.5 h-auto p-0 hover:bg-transparent group w-auto"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                  <Share2 size={20} className="text-white group-hover:scale-110 transition-smooth sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] sm:text-xs text-white font-semibold drop-shadow-lg">Share</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSave(short.id)}
                className="flex flex-col gap-0.5 h-auto p-0 hover:bg-transparent group w-auto"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                  <RotateCcw 
                    size={20} 
                    className="text-white group-hover:scale-110 transition-smooth sm:w-6 sm:h-6" 
                  />
                </div>
                <span className="text-[10px] sm:text-xs text-white font-semibold drop-shadow-lg">{saved.includes(short.id) ? 'Added' : 'Remix'}</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMuted(!muted)}
                className="flex flex-col gap-0.5 h-auto p-0 hover:bg-transparent group w-auto"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full">
                  {muted ? <VolumeX size={18} className="text-white sm:w-5 sm:h-5" /> : <Volume2 size={18} className="text-white sm:w-5 sm:h-5" />}
                </div>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="flex flex-col gap-0.5 h-auto p-0 hover:bg-transparent group w-auto"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                  <MoreVertical size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
              </Button>
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );
}
