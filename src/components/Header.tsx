import { Search, Video, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-2 sm:px-4 gap-2 sm:gap-4 sticky top-0 z-50">
      <SidebarTrigger />
      
      <div className="flex-1 max-w-2xl mx-auto flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hidden sm:block" size={18} />
          <Input 
            placeholder="Search..." 
            className="pl-3 sm:pl-10 bg-background text-sm"
          />
        </div>
        <Button size="icon" variant="ghost" className="hidden sm:flex">
          <Search size={20} />
        </Button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button size="icon" variant="ghost" onClick={() => navigate("/upload")} className="hidden sm:flex">
          <Video size={20} />
        </Button>
        <Button size="icon" variant="ghost">
          <Bell size={20} />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => navigate("/settings")}>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">U</AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </header>
  );
}
