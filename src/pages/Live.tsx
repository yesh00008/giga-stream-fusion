import { useState } from "react";
import { Video, Users, MessageSquare, Send, Settings, Radio, Eye, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const liveStreams = [
  { id: 1, title: "Coding a Full Stack App LIVE!", channel: "Tech Master", viewers: "12.5K", thumbnail: "🎮" },
  { id: 2, title: "Music Production Session", channel: "Beat Maker", viewers: "8.2K", thumbnail: "🎵" },
  { id: 3, title: "Cooking Italian Pasta", channel: "Chef Pro", viewers: "15.3K", thumbnail: "🍝" },
  { id: 4, title: "Gaming Tournament Finals", channel: "Pro Gamer", viewers: "45K", thumbnail: "🎮" },
];

const comments = [
  { id: 1, user: "User123", text: "Amazing stream!", color: "hsl(280 85% 60%)" },
  { id: 2, user: "Viewer456", text: "Love this content!", color: "hsl(340 82% 62%)" },
  { id: 3, user: "Fan789", text: "Keep it up! 🔥", color: "hsl(200 85% 60%)" },
];

export default function Live() {
  const [message, setMessage] = useState("");
  const [isLive, setIsLive] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Main Live Stream */}
          <div className="flex-1">
            <div className="aspect-video bg-card rounded-lg gradient-card flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex gap-2 z-10">
                <Badge className="bg-red-500 text-white animate-pulse">
                  <Radio size={12} className="mr-1" />
                  LIVE
                </Badge>
                <Badge className="bg-black/60 text-white">
                  <Eye size={12} className="mr-1" />
                  24.5K watching
                </Badge>
              </div>
              
              <div className="text-center p-4 sm:p-8">
                <Video size={48} className="mx-auto mb-4 text-primary opacity-50 sm:w-16 sm:h-16" />
                <p className="text-base sm:text-lg font-semibold text-foreground mb-2">Live Stream View</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Building a Modern Video Platform</p>
              </div>

              {/* Live Reactions Overlay */}
              <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex flex-col gap-2">
                <Button size="icon" variant="ghost" className="bg-black/50 text-white hover:bg-black/70 rounded-full h-8 w-8 sm:h-10 sm:w-10">
                  <Heart size={16} className="sm:w-5 sm:h-5" />
                </Button>
                <Button size="icon" variant="ghost" className="bg-black/50 text-white hover:bg-black/70 rounded-full h-8 w-8 sm:h-10 sm:w-10">
                  <Share2 size={16} className="sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>

            {/* Stream Info */}
            <div className="mt-3 sm:mt-4">
              <h1 className="text-lg sm:text-xl font-bold text-foreground mb-2">Building a Modern Video Platform LIVE!</h1>
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                  <AvatarFallback className="gradient-primary text-white text-xs sm:text-sm">TM</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm sm:text-base">Tech Master</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">124K subscribers</p>
                </div>
                <Button variant="gradient" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                  Subscribe
                </Button>
              </div>
            </div>

            {/* Go Live Section */}
            <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-card rounded-lg border border-border">
              <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <Radio className="text-primary w-4 h-4 sm:w-5 sm:h-5" />
                Go Live
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <Input placeholder="Stream Title" className="h-9 sm:h-10 text-sm sm:text-base" />
                <Input placeholder="Description" className="h-9 sm:h-10 text-sm sm:text-base" />
                <div className="flex gap-2">
                  <Button 
                    variant={isLive ? "destructive" : "gradient"} 
                    className="flex-1 h-9 sm:h-10 text-sm sm:text-base"
                    onClick={() => setIsLive(!isLive)}
                  >
                    <Radio size={16} className="mr-2 sm:w-4 sm:h-4" />
                    {isLive ? "End Stream" : "Start Streaming"}
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                    <Settings size={16} className="sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Chat & Info */}
          <div className="w-full lg:w-80 xl:w-96">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="chat" className="text-xs sm:text-sm">
                  <MessageSquare size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
                  Live Chat
                </TabsTrigger>
                <TabsTrigger value="viewers" className="text-xs sm:text-sm">
                  <Users size={14} className="mr-1 sm:mr-2 sm:w-4 sm:h-4" />
                  Viewers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-3 sm:mt-4">
                <div className="bg-card rounded-lg border border-border h-[400px] sm:h-[500px] flex flex-col">
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                          <AvatarFallback style={{ background: comment.color }} className="text-white text-[10px] sm:text-xs">
                            {comment.user[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm">
                            <span className="font-semibold" style={{ color: comment.color }}>{comment.user}</span>
                            {" "}
                            <span className="text-muted-foreground">{comment.text}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 sm:p-3 border-t border-border">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Say something..." 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="h-8 sm:h-9 text-xs sm:text-sm"
                      />
                      <Button size="icon" variant="gradient" className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
                        <Send size={14} className="sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="viewers" className="mt-3 sm:mt-4">
                <div className="bg-card rounded-lg border border-border h-[400px] sm:h-[500px] overflow-y-auto p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">24,532 viewers</p>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 sm:gap-3 mb-3">
                      <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                        <AvatarFallback className="gradient-primary text-white text-[10px] sm:text-xs">U{i}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs sm:text-sm text-foreground">User{i + 1}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Live Now Section */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <Radio className="text-red-500 animate-pulse w-4 h-4 sm:w-5 sm:h-5" />
            Live Now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {liveStreams.map((stream) => (
              <div key={stream.id} className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary transition-smooth cursor-pointer">
                <div className="aspect-video gradient-card flex items-center justify-center relative">
                  <span className="text-4xl sm:text-5xl">{stream.thumbnail}</span>
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs">
                    <Radio size={10} className="mr-1 sm:w-3 sm:h-3" />
                    LIVE
                  </Badge>
                  <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] sm:text-xs">
                    <Eye size={10} className="mr-1 sm:w-3 sm:h-3" />
                    {stream.viewers}
                  </Badge>
                </div>
                <div className="p-2 sm:p-3">
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-2 text-xs sm:text-sm">{stream.title}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{stream.channel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
