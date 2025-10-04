import { Search, Video, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 sticky top-0 z-50">
      <SidebarTrigger />
      
      <div className="flex-1 max-w-2xl mx-auto flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search videos, channels..." 
            className="pl-10 bg-background"
          />
        </div>
        <Button size="icon" variant="ghost">
          <Search size={20} />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={() => navigate("/upload")}>
          <Video size={20} />
        </Button>
        <Button size="icon" variant="ghost">
          <Bell size={20} />
        </Button>
        <Button size="icon" variant="ghost">
          <User size={20} />
        </Button>
      </div>
    </header>
  );
}
