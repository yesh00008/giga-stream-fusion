import { Repeat2, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface RetweetMenuProps {
  isRetweeted: boolean;
  retweetCount: string | number;
  onRepost: () => void;
  onQuote: () => void;
  className?: string;
}

export function RetweetMenu({
  isRetweeted,
  retweetCount,
  onRepost,
  onQuote,
  className = ""
}: RetweetMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-2 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 transition-colors ${
            isRetweeted ? "text-green-600" : "text-muted-foreground"
          } ${className}`}
        >
          <Repeat2 size={18} />
          {Number(retweetCount) > 0 && (
            <span className="text-xs font-medium">{retweetCount}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem
          onClick={onRepost}
          className="flex items-center gap-3 cursor-pointer py-3"
        >
          <Repeat2 size={18} />
          <div>
            <div className="font-medium">
              {isRetweeted ? "Undo Repost" : "Repost"}
            </div>
            <div className="text-xs text-muted-foreground">
              {isRetweeted ? "Remove from your profile" : "Share this post with your followers"}
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onQuote}
          className="flex items-center gap-3 cursor-pointer py-3"
        >
          <MessageSquare size={18} />
          <div>
            <div className="font-medium">Quote</div>
            <div className="text-xs text-muted-foreground">
              Add a comment, photo, or GIF before you share this post
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
