import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, X, Send, Trash2, Lock, LockOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number, playOnce?: boolean) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [playOnce, setPlayOnce] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Start recording immediately when component mounts
    startRecording();

    return () => {
      cleanup();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSend = () => {
    stopRecording();
    if (audioBlob || audioChunksRef.current.length > 0) {
      const finalBlob = audioBlob || new Blob(audioChunksRef.current, { type: "audio/webm" });
      // Pass playOnce setting with the voice message
      (onSend as any)(finalBlob, duration, playOnce);
    }
    cleanup();
  };

  const handleCancel = () => {
    cleanup();
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-2 w-full"
    >
      {/* Cancel Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCancel}
        className="h-10 w-10 rounded-full hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 flex-shrink-0"
      >
        <X size={22} strokeWidth={2.5} />
      </Button>

      {/* Recording Container */}
      <div className="flex-1 flex items-center gap-2 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border border-red-200 dark:border-red-900 rounded-full px-4 py-2.5 h-12">
        {/* Recording Dot */}
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <div className="w-2.5 h-2.5 bg-red-600 rounded-full" />
          <span className="text-sm font-semibold text-red-600 dark:text-red-400 tabular-nums">
            {formatDuration(duration)}
          </span>
        </motion.div>
        
        {/* Waveform Animation */}
        <div className="flex-1 flex items-center justify-center gap-[3px] h-6 px-2">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="w-[2px] bg-red-500 dark:bg-red-400 rounded-full"
              animate={{
                height: ["30%", "100%", "50%", "80%", "40%"],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: i * 0.04,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        {/* Microphone Icon */}
        <Mic size={16} className="text-red-600 dark:text-red-400 flex-shrink-0" />
      </div>

      {/* Play Once Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setPlayOnce(!playOnce)}
        className={cn(
          "h-10 w-10 rounded-full flex-shrink-0",
          playOnce 
            ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900" 
            : "hover:bg-muted text-muted-foreground"
        )}
        title={playOnce ? "Play once (locked)" : "Play infinite times"}
      >
        {playOnce ? <Lock size={18} /> : <LockOpen size={18} />}
      </Button>

      {/* Send Button */}
      <Button
        onClick={handleSend}
        size="icon"
        disabled={duration < 1}
        className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white shadow-lg flex-shrink-0"
      >
        <Send size={20} strokeWidth={2.5} />
      </Button>
    </motion.div>
  );
}
