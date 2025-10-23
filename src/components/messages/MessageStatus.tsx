import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

interface MessageStatusProps {
  timestamp: string;
  isOwn: boolean;
  delivered?: boolean; // Message delivered to recipient's device
  isRead?: boolean; // Message read by recipient
  showStatus?: boolean;
  inline?: boolean;
  failed?: boolean; // Message failed to send
  isRecipientOnline?: boolean; // Is recipient currently online
}

export function MessageStatus({ 
  timestamp, 
  isOwn, 
  delivered = false,
  isRead = false, 
  showStatus = true, 
  inline = false,
  failed = false,
  isRecipientOnline = false
}: MessageStatusProps) {
  const formatTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d, h:mm a");
    }
  };

  const date = new Date(timestamp);
  const timeString = formatTime(date);

  // Inline mode - show status icons inside bubble
  if (inline && isOwn && showStatus) {
    // Failed to send
    if (failed) {
      return (
        <div className="flex items-center text-red-400">
          <AlertCircle size={14} strokeWidth={2.5} className="drop-shadow-sm" />
        </div>
      );
    }
    
    // Message read - Blue double ticks
    if (isRead) {
      return (
        <div className="flex items-center text-blue-500">
          <CheckCheck size={14} strokeWidth={2.5} className="drop-shadow-sm" />
        </div>
      );
    }
    
    // Message delivered - Blue double ticks (lighter)
    if (delivered) {
      return (
        <div className="flex items-center text-blue-500">
          <CheckCheck size={14} strokeWidth={2.5} className="drop-shadow-sm" />
        </div>
      );
    }
    
    // Message sent but not delivered - Single blue tick
    return (
      <div className="flex items-center text-blue-500">
        <Check size={14} strokeWidth={2.5} className="drop-shadow-sm" />
      </div>
    );
  }

  // Default mode - show timestamp and status
  return (
    <div className="flex items-center gap-1.5 justify-end">
      <span className="text-[11px] text-gray-500 font-medium">{timeString}</span>
      {isOwn && showStatus && (
        <div className="flex items-center">
          {failed ? (
            <AlertCircle size={14} className="text-red-500" strokeWidth={2} />
          ) : isRead ? (
            <CheckCheck size={14} strokeWidth={2} className="text-blue-500 drop-shadow-sm" />
          ) : delivered ? (
            <CheckCheck size={14} strokeWidth={2} className="text-gray-400" />
          ) : (
            <Check size={14} strokeWidth={2} className="text-gray-400" />
          )}
        </div>
      )}
    </div>
  );
}
