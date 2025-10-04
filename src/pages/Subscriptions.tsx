import { VideoCard } from "@/components/VideoCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, BellRing } from "lucide-react";

const subscriptions = [
  { id: 1, name: "Tech Tutorials", avatar: "TT", subscribers: "1.2M" },
  { id: 2, name: "Code Masters", avatar: "CM", subscribers: "850K" },
  { id: 3, name: "Developer Pro", avatar: "DP", subscribers: "2.1M" },
  { id: 4, name: "Design Hub", avatar: "DH", subscribers: "920K" },
  { id: 5, name: "Gaming Zone", avatar: "GZ", subscribers: "1.5M" },
  { id: 6, name: "Music Hub", avatar: "MH", subscribers: "680K" },
];

const videos = [
  {
    id: "s1",
    title: "New Tutorial: Advanced React Patterns",
    channel: "Tech Tutorials",
    views: "45K",
    timestamp: "2 hours ago",
    duration: "25:30",
  },
  {
    id: "s2",
    title: "Live Stream: Building a Full Stack App",
    channel: "Code Masters",
    views: "12K",
    timestamp: "30 minutes ago",
    duration: "LIVE",
  },
  {
    id: "s3",
    title: "Design System Best Practices 2024",
    channel: "Design Hub",
    views: "38K",
    timestamp: "5 hours ago",
    duration: "18:45",
  },
  {
    id: "s4",
    title: "Epic Gaming Session - New Game Release",
    channel: "Gaming Zone",
    views: "92K",
    timestamp: "1 hour ago",
    duration: "45:20",
  },
];

export default function Subscriptions() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Subscriptions</h1>
          <p className="text-muted-foreground">Latest from channels you follow</p>
        </div>

        {/* Subscribed Channels Bar */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {subscriptions.map((channel) => (
            <div
              key={channel.id}
              className="flex flex-col items-center gap-2 cursor-pointer min-w-[100px] group"
            >
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-primary group-hover:scale-110 transition-smooth">
                  <AvatarFallback className="bg-card text-lg">{channel.avatar}</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-background border border-border"
                >
                  <BellRing size={14} className="text-primary" />
                </Button>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium truncate max-w-[100px]">{channel.name}</p>
                <p className="text-xs text-muted-foreground">{channel.subscribers}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Latest Videos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Latest Videos</h2>
            <Button variant="outline" size="sm">
              <Bell size={16} className="mr-2" />
              Manage
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id} {...video} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
