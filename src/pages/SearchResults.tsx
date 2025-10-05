import { useSearchParams } from "react-router-dom";
import { VideoCard } from "@/components/VideoCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const searchResults = {
  videos: [
    { id: "1", title: "React Tutorial for Beginners", channel: "Code Academy", views: "1.2M", timestamp: "2 days ago", duration: "25:30" },
    { id: "2", title: "Advanced React Patterns", channel: "Tech Master", views: "850K", timestamp: "1 week ago", duration: "18:45" },
    { id: "3", title: "React Performance Optimization", channel: "Developer Pro", views: "620K", timestamp: "3 days ago", duration: "32:15" },
  ],
  channels: [
    { id: 1, name: "React Academy", subscribers: "2.5M", videos: 342, avatar: "RA" },
    { id: 2, name: "Frontend Masters", subscribers: "1.8M", videos: 215, avatar: "FM" },
  ],
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 sm:p-6">
        <h1 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
          Search results for: <span className="text-primary">"{query}"</span>
        </h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto grid grid-cols-3 sm:flex">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="videos" className="text-xs sm:text-sm">Videos</TabsTrigger>
            <TabsTrigger value="channels" className="text-xs sm:text-sm">Channels</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 sm:space-y-6">
            {/* Channels */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Channels</h2>
              <div className="space-y-3 sm:space-y-4">
                {searchResults.channels.map((channel) => (
                  <div key={channel.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg border border-border">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                      <AvatarFallback className="gradient-primary text-white text-lg sm:text-xl">{channel.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{channel.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {channel.subscribers} subscribers • {channel.videos} videos
                      </p>
                    </div>
                    <Button variant="gradient" size="sm" className="flex-shrink-0 h-8 sm:h-9 text-xs sm:text-sm">
                      Subscribe
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Videos */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Videos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {searchResults.videos.map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {searchResults.videos.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="channels">
            <div className="space-y-3 sm:space-y-4">
              {searchResults.channels.map((channel) => (
                <div key={channel.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg border border-border">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                    <AvatarFallback className="gradient-primary text-white text-lg sm:text-xl">{channel.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{channel.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {channel.subscribers} subscribers • {channel.videos} videos
                    </p>
                  </div>
                  <Button variant="gradient" size="sm" className="flex-shrink-0 h-8 sm:h-9 text-xs sm:text-sm">
                    Subscribe
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
