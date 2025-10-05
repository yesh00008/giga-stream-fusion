import { Bell, Heart, MessageCircle, UserPlus, Video, TrendingUp, Award } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const notifications = [
  { id: 1, type: "like", user: "Tech Master", action: "liked your video", time: "5m ago", icon: Heart, color: "text-red-500" },
  { id: 2, type: "comment", user: "Gaming Pro", action: "commented on your short", time: "15m ago", icon: MessageCircle, color: "text-blue-500" },
  { id: 3, type: "subscriber", user: "Music Lover", action: "subscribed to your channel", time: "1h ago", icon: UserPlus, color: "text-green-500" },
  { id: 4, type: "upload", user: "Design Hub", action: "uploaded a new video", time: "2h ago", icon: Video, color: "text-purple-500" },
  { id: 5, type: "trending", user: "", action: "Your video is trending!", time: "3h ago", icon: TrendingUp, color: "text-orange-500" },
  { id: 6, type: "achievement", user: "", action: "You reached 10K subscribers!", time: "1d ago", icon: Award, color: "text-yellow-500" },
];

export default function Notifications() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Bell className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
            Notifications
          </h1>
          <Button variant="ghost" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
            Mark all as read
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full sm:w-auto mb-4 sm:mb-6 grid grid-cols-3 sm:flex">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="mentions" className="text-xs sm:text-sm">Mentions</TabsTrigger>
            <TabsTrigger value="subscribers" className="text-xs sm:text-sm">Subscribers</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-2 sm:space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-3 p-3 sm:p-4 bg-card rounded-lg border border-border hover:border-primary transition-smooth cursor-pointer"
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                  <notif.icon size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-foreground">
                    {notif.user && <span className="font-semibold">{notif.user} </span>}
                    {notif.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                </div>
                {notif.user && (
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                    <AvatarFallback className="gradient-primary text-white text-xs sm:text-sm">
                      {notif.user[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="mentions" className="space-y-2 sm:space-y-3">
            {notifications.filter(n => n.type === "comment").map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-3 p-3 sm:p-4 bg-card rounded-lg border border-border hover:border-primary transition-smooth cursor-pointer"
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                  <notif.icon size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-foreground">
                    <span className="font-semibold">{notif.user} </span>
                    {notif.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                </div>
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  <AvatarFallback className="gradient-primary text-white text-xs sm:text-sm">
                    {notif.user[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="subscribers" className="space-y-2 sm:space-y-3">
            {notifications.filter(n => n.type === "subscriber").map((notif) => (
              <div
                key={notif.id}
                className="flex items-start gap-3 p-3 sm:p-4 bg-card rounded-lg border border-border hover:border-primary transition-smooth cursor-pointer"
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                  <notif.icon size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base text-foreground">
                    <span className="font-semibold">{notif.user} </span>
                    {notif.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                </div>
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  <AvatarFallback className="gradient-primary text-white text-xs sm:text-sm">
                    {notif.user[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
