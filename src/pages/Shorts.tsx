import { useState, useRef, useEffect } from "react";
import { Heart, MessageCircle, Share2, MoreVertical, Volume2, VolumeX, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const shortsData = [
  {
    id: 1,
    title: "Amazing coding tips! 🚀",
    channel: "Tech Master",
    likes: "245K",
    comments: "1.2K",
    description: "Learn these 5 coding tricks that will blow your mind! #coding #programming #webdev",
  },
  {
    id: 2,
    title: "Build a full-stack app in 60 seconds",
    channel: "Dev Guru",
    likes: "189K",
    comments: "890",
    description: "Quick tutorial on React + Node.js #fullstack #react #nodejs",
  },
  {
    id: 3,
    title: "UI Design trends 2024 ✨",
    channel: "Design Hub",
    likes: "320K",
    comments: "2.1K",
    description: "Top design trends you need to know! #design #ui #ux",
  },
  {
    id: 4,
    title: "JavaScript array methods explained",
    channel: "Code Academy",
    likes: "156K",
    comments: "654",
    description: "Master these array methods like map, filter, reduce #javascript #coding",
  },
  {
    id: 5,
    title: "CSS animations made easy 🎨",
    channel: "Frontend Pro",
    likes: "278K",
    comments: "1.5K",
    description: "Create stunning animations with pure CSS #css #animation #webdesign",
  },
];

export default function Shorts() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentShort = shortsData[currentIndex];

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
    setLiked((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSwipe = (direction: "up" | "down") => {
    if (direction === "up" && currentIndex < shortsData.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (direction === "down" && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 h-[calc(100vh-3.5rem)] overflow-hidden bg-black relative snap-y snap-mandatory"
    >
      {/* Navigation Dots */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        {shortsData.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              idx === currentIndex
                ? "bg-white h-6"
                : "bg-white/50 hover:bg-white/75"
            )}
          />
        ))}
      </div>

      {/* Short Video Container */}
      <div className="w-full h-full flex items-center justify-center relative">
        {/* Video Placeholder */}
        <div className="w-full max-w-md h-full gradient-card flex items-center justify-center relative">
          <div className="text-white text-center p-8">
            <Play size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">{currentShort.title}</p>
            <p className="text-sm text-white/70">Short #{currentShort.id}</p>
          </div>

          {/* Video Controls Overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <Button
              size="icon"
              variant="ghost"
              className="bg-black/50 text-white hover:bg-black/70 rounded-full"
              onClick={() => setPlaying(!playing)}
            >
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="bg-black/50 text-white hover:bg-black/70 rounded-full"
              onClick={() => setMuted(!muted)}
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>
          </div>

          {/* Bottom Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-start gap-3 mb-4">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarFallback className="bg-primary text-white">
                  {currentShort.channel[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">{currentShort.channel}</p>
                <Button
                  variant="gradient"
                  size="sm"
                  className="mt-2 h-8"
                >
                  Subscribe
                </Button>
              </div>
            </div>

            <p className="text-white text-sm mb-2">{currentShort.description}</p>

            {/* Audio Track */}
            <div className="flex items-center gap-2 text-white/70 text-xs">
              <Volume2 size={14} />
              <span>Original Audio - {currentShort.channel}</span>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-10">
            <button
              onClick={() => handleLike(currentShort.id)}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                  liked.includes(currentShort.id)
                    ? "bg-red-500 scale-110"
                    : "bg-white/20 hover:bg-white/30"
                )}
              >
                <Heart
                  size={24}
                  className={liked.includes(currentShort.id) ? "fill-current" : ""}
                />
              </div>
              <span className="text-xs font-medium">{currentShort.likes}</span>
            </button>

            <button className="flex flex-col items-center gap-1 text-white">
              <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-smooth">
                <MessageCircle size={24} />
              </div>
              <span className="text-xs font-medium">{currentShort.comments}</span>
            </button>

            <button className="flex flex-col items-center gap-1 text-white">
              <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-smooth">
                <Share2 size={24} />
              </div>
              <span className="text-xs font-medium">Share</span>
            </button>

            <button className="flex flex-col items-center gap-1 text-white">
              <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-smooth">
                <MoreVertical size={24} />
              </div>
            </button>
          </div>
        </div>

        {/* Swipe Navigation Hints */}
        {currentIndex > 0 && (
          <button
            onClick={() => handleSwipe("down")}
            className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 hover:text-white animate-bounce"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              ↑
            </div>
          </button>
        )}
        {currentIndex < shortsData.length - 1 && (
          <button
            onClick={() => handleSwipe("up")}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 hover:text-white animate-bounce"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              ↓
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
