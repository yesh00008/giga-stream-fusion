import { motion } from "framer-motion";
import { Phone, PhoneOff, Video, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Call } from "@/lib/call-service";

interface IncomingCallNotificationProps {
  call: Call;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCallNotification({ call, onAccept, onReject }: IncomingCallNotificationProps) {
  const isVideoCall = call.call_type === 'video';

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", damping: 20, stiffness: 200 }}
      className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-1rem)] sm:w-[90%] max-w-sm"
    >
      <div className="bg-background/98 backdrop-blur-xl border-2 border-primary/20 rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-primary/30 ring-2 ring-primary/10 flex-shrink-0">
            <AvatarImage src={call.caller_avatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg sm:text-xl">
              {call.caller_name?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base sm:text-lg leading-tight truncate">{call.caller_name}</p>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              {isVideoCall ? (
                <>
                  <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Video call</span>
                </>
              ) : (
                <>
                  <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">Voice call</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Accept/Decline Buttons - Fully Responsive */}
        <div className="flex gap-2 sm:gap-3">
          <Button
            size="lg"
            variant="outline"
            onClick={onReject}
            className="flex-1 rounded-xl sm:rounded-2xl border-2 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-500 hover:text-red-600 transition-all h-12 sm:h-12 text-sm sm:text-base px-4 font-medium"
          >
            <X className="w-5 h-5 mr-1.5 sm:mr-2" />
            <span className="text-xs sm:text-sm">Decline</span>
          </Button>
          <Button
            size="lg"
            onClick={onAccept}
            className="flex-1 rounded-xl sm:rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/30 h-12 sm:h-12 text-sm sm:text-base px-4 font-medium"
          >
            <Phone className="w-5 h-5 mr-1.5 sm:mr-2" />
            <span className="text-xs sm:text-sm">Accept</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
