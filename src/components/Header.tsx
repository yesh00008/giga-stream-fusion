import { useState } from "react";
import { Search, Upload, Bell, MessageSquare, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-14 border-b border-border bg-card flex items-center px-2 sm:px-4 gap-2 sm:gap-4 sticky top-0 z-50">
      <SidebarTrigger />
      
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hidden sm:block" size={18} />
          <Input 
            placeholder="Search videos, channels..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-3 sm:pl-10 bg-background text-sm h-9"
          />
        </div>
      </form>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/live")}
          className="hidden md:flex h-9 gap-2"
        >
          <Radio className="w-4 h-4 text-red-500" />
          <span className="text-sm">Go Live</span>
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => navigate("/upload")}
          className="h-9 w-9"
        >
          <Upload size={18} />
        </Button>

        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => navigate("/messages")}
          className="relative hidden sm:flex h-9 w-9"
        >
          <MessageSquare size={18} />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-primary text-[10px]">
            3
          </Badge>
        </Button>

        <Button 
          size="icon" 
          variant="ghost" 
          onClick={() => navigate("/notifications")}
          className="relative h-9 w-9"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        <Avatar className="w-8 h-8 cursor-pointer" onClick={() => navigate("/settings")}>
          <AvatarFallback className="gradient-primary text-white text-xs">U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
