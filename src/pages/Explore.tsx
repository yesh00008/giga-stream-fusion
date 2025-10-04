import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCard } from "@/components/VideoCard";
import { Card } from "@/components/ui/card";
import { Flame, Music, Gamepad2, Film, Newspaper, Lightbulb, Dumbbell, Code } from "lucide-react";

const categories = [
  { name: "Trending", icon: Flame, color: "text-orange-500" },
  { name: "Music", icon: Music, color: "text-purple-500" },
  { name: "Gaming", icon: Gamepad2, color: "text-green-500" },
  { name: "Movies", icon: Film, color: "text-blue-500" },
  { name: "News", icon: Newspaper, color: "text-red-500" },
  { name: "Learning", icon: Lightbulb, color: "text-yellow-500" },
  { name: "Sports", icon: Dumbbell, color: "text-cyan-500" },
  { name: "Tech", icon: Code, color: "text-pink-500" },
];

const trendingVideos = [
  {
    id: "t1",
    title: "Most Viral Video of the Week - You Won't Believe This!",
    channel: "Viral Videos",
    views: "5.2M",
    timestamp: "1 day ago",
    duration: "10:45",
  },
  {
    id: "t2",
    title: "Breaking: Major Tech Announcement Changed Everything",
    channel: "Tech News Daily",
    views: "3.8M",
    timestamp: "6 hours ago",
    duration: "15:20",
  },
  {
    id: "t3",
    title: "Epic Gaming Moments Compilation 2024",
    channel: "Gaming Legends",
    views: "4.1M",
    timestamp: "12 hours ago",
    duration: "22:30",
  },
  {
    id: "t4",
    title: "Mind-Blowing Science Experiment Goes Viral",
    channel: "Science Hub",
    views: "2.9M",
    timestamp: "2 days ago",
    duration: "8:15",
  },
];

export default function Explore() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Explore</h1>
          <p className="text-muted-foreground">Discover trending content across all categories</p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((category) => (
            <Card
              key={category.name}
              className="p-4 gradient-card cursor-pointer hover:scale-105 transition-smooth group"
            >
              <category.icon className={`mx-auto mb-2 ${category.color} group-hover:scale-110 transition-smooth`} size={32} />
              <p className="text-center text-sm font-medium">{category.name}</p>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
            <TabsTrigger value="gaming">Gaming</TabsTrigger>
            <TabsTrigger value="tech">Tech</TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trendingVideos.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="music">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trendingVideos.slice(0, 3).map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gaming">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trendingVideos.slice(1, 4).map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tech">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {trendingVideos.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
