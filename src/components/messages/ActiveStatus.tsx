import { formatDistanceToNow, format, isToday, differenceInMinutes } from "date-fns";

interface ActiveStatusProps {
  isOnline?: boolean;
  lastSeen?: string;
  className?: string;
  showDot?: boolean;
}

export function ActiveStatus({ isOnline, lastSeen, className = "", showDot = false }: ActiveStatusProps) {
  if (isOnline) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {showDot && (
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
        )}
        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Active now</span>
      </div>
    );
  }

  if (!lastSeen) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {showDot && <div className="h-2 w-2 rounded-full bg-gray-400"></div>}
        <span className="text-xs text-muted-foreground">Offline</span>
      </div>
    );
  }

  const lastSeenDate = new Date(lastSeen);
  const minutesSince = differenceInMinutes(new Date(), lastSeenDate);

  let statusText = "";

  if (minutesSince < 1) {
    statusText = "Active just now";
  } else if (minutesSince < 5) {
    statusText = `Active ${minutesSince}m ago`;
  } else if (minutesSince < 60) {
    statusText = `Active ${minutesSince}m ago`;
  } else if (isToday(lastSeenDate)) {
    statusText = `Active ${format(lastSeenDate, "h:mm a")}`;
  } else {
    statusText = `Active ${formatDistanceToNow(lastSeenDate, { addSuffix: true })}`;
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {showDot && <div className="h-2 w-2 rounded-full bg-gray-400"></div>}
      <span className="text-xs text-muted-foreground">{statusText}</span>
    </div>
  );
}
