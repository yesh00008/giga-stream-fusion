import { VideoCard } from "@/components/VideoCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Music, Gamepad2, Trophy } from "lucide-react";

const trendingNow = [
  {
    id: "tr1",
    title: "🔥 BREAKING: Major Tech Announcement - Industry Changed Forever!",
    channel: "Tech News",
    views: "8.5M",
    timestamp: "3 hours ago",
    duration: "12:45",
  },
  {
    id: "tr2",
    title: "This Video Broke The Internet - 10M Views in 24 Hours",
    channel: "Viral Central",
    views: "10.2M",
    timestamp: "1 day ago",
    duration: "8:30",
  },
  {
    id: "tr3",
    title: "Epic Gaming Tournament Finals - Most Watched Event Ever",
    channel: "Esports Pro",
    views: "5.8M",
    timestamp: "6 hours ago",
    duration: "2:15:30",
  },
];

export default function Trending() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
            <Flame className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Trending</h1>
            <p className="text-muted-foreground">See what's popular on Giga right now</p>
          </div>
        </div>

        <Tabs defaultValue="now" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="now">
              <Flame className="mr-2" size={16} />
              Now
            </TabsTrigger>
            <TabsTrigger value="music">
              <Music className="mr-2" size={16} />
              Music
            </TabsTrigger>
            <TabsTrigger value="gaming">
              <Gamepad2 className="mr-2" size={16} />
              Gaming
            </TabsTrigger>
            <TabsTrigger value="sports">
              <Trophy className="mr-2" size={16} />
              Sports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="now" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trendingNow.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="music">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trendingNow.slice(0, 2).map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gaming">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trendingNow.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sports">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trendingNow.slice(1).map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
