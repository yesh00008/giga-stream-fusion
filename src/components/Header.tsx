import { BellDot, Mail, Plus, PlaySquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-border/50 bg-background/95 backdrop-blur-sm flex items-center px-4 gap-4 sticky top-0 z-50">
      <div className="flex items-center gap-3 flex-1">
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">G</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">Giga</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full hover:bg-secondary"
            >
              <Plus size={22} strokeWidth={2.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/upload")}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              Upload Photo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/shorts")}>
              <PlaySquare className="mr-2 h-4 w-4" />
              Create Short
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/upload")}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              Write Post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => navigate("/notifications")}
          className="relative h-10 w-10 rounded-full hover:bg-secondary"
        >
          <BellDot size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></span>
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => navigate("/messages")}
          className="relative h-10 w-10 rounded-full hover:bg-secondary"
        >
          <Mail size={20} />
          <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 flex items-center justify-center bg-primary text-[10px] rounded-full border-2 border-background">
            3
          </Badge>
        </Button>
      </div>
    </header>
  );
}
