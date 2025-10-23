import { useState, useRef, useEffect } from "react";
import { Play, Pause, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceMessageProps {
  audioUrl: string;
  duration: number;
  isOwn: boolean;
  timestamp: string;
  playOnce?: boolean;
  messageId?: string;
}

export function VoiceMessage({ audioUrl, duration, isOwn, timestamp, playOnce = false, messageId }: VoiceMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const [hasPlayed, setHasPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if this voice message has been played before (for play-once messages)
    if (playOnce && messageId) {
      const playedKey = `voice_played_${messageId}`;
      const played = localStorage.getItem(playedKey);
      if (played) {
        setHasPlayed(true);
      }
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setAudioDuration(Math.floor(audio.duration));
    });

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(Math.floor(audio.currentTime));
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
      
      // Mark as played for play-once messages
      if (playOnce && messageId) {
        const playedKey = `voice_played_${messageId}`;
        localStorage.setItem(playedKey, "true");
        setHasPlayed(true);
      }
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [audioUrl, playOnce, messageId]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    // Prevent playing if it's a play-once message that has already been played
    if (playOnce && hasPlayed && !isPlaying) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-[18px] min-w-[220px] max-w-[280px]",
        isOwn
          ? "bg-white border border-gray-200"
          : "bg-gradient-to-r from-blue-500 to-blue-600"
      )}
    >
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlayPause}
        disabled={playOnce && hasPlayed && !isPlaying}
        className={cn(
          "h-9 w-9 rounded-full flex-shrink-0",
          isOwn
            ? "hover:bg-blue-50 text-blue-600 disabled:bg-gray-100 disabled:text-gray-400"
            : "hover:bg-white/20 text-white disabled:bg-white/10 disabled:text-white/40"
        )}
      >
        {playOnce && hasPlayed && !isPlaying ? (
          <Lock size={16} strokeWidth={2.5} />
        ) : isPlaying ? (
          <Pause size={18} strokeWidth={2.5} className="fill-current" />
        ) : (
          <Play size={18} strokeWidth={2.5} className="fill-current ml-0.5" />
        )}
      </Button>

      {/* Waveform Progress */}
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center gap-[2px] h-6">
          {[...Array(32)].map((_, i) => {
            const barProgress = (i / 32) * 100;
            const isActive = barProgress <= progress;
            const heights = [35, 55, 45, 75, 50, 65, 40, 85, 55, 45, 65, 50, 75, 45, 55, 40, 70, 50, 60, 45, 80, 55, 50, 65, 45, 60, 50, 75, 55, 45, 60, 50];
            
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-all duration-200",
                  isOwn
                    ? isActive ? "bg-blue-600" : "bg-gray-300"
                    : isActive ? "bg-white" : "bg-white/30"
                )}
                style={{ height: `${heights[i]}%` }}
              />
            );
          })}
        </div>
        
        {/* Duration & Lock Icon */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              isOwn ? "text-gray-600" : "text-white/90"
            )}
          >
            {formatTime(isPlaying ? currentTime : audioDuration)}
          </span>
          
          {playOnce && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isOwn ? "text-gray-500" : "text-white/70"
            )}>
              <Lock size={10} />
              <span className="text-[10px]">Play once</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
