import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCard } from "@/components/VideoCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Flame, Music, Gamepad2, Film, Newspaper, Lightbulb, Dumbbell, Code, Hash, TrendingUp, Search, Filter, Calendar, Eye } from "lucide-react";
import { useState } from "react";

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

const trendingHashtags = [
  { tag: "WebDevelopment", posts: "2.5M", trending: true },
  { tag: "AI", posts: "5.8M", trending: true },
  { tag: "Gaming", posts: "3.2M", trending: false },
  { tag: "Music2024", posts: "1.9M", trending: true },
  { tag: "Tutorial", posts: "4.1M", trending: false },
  { tag: "TechNews", posts: "2.3M", trending: true },
];

const trendingCreators = [
  { name: "Tech Master", subscribers: "2.1M", avatar: "TM" },
  { name: "Code Wizard", subscribers: "1.5M", avatar: "CW" },
  { name: "Design Pro", subscribers: "980K", avatar: "DP" },
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
  {
    id: "t5",
    title: "Ultimate Productivity Hacks for Developers",
    channel: "Developer Tips",
    views: "1.8M",
    timestamp: "3 days ago",
    duration: "18:45",
  },
  {
    id: "t6",
    title: "AI Revolution: What's Coming in 2025",
    channel: "Future Tech",
    views: "6.2M",
    timestamp: "5 hours ago",
    duration: "25:10",
  },
];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Explore</h1>
            <p className="text-muted-foreground">Discover trending content across all categories</p>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search trending topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter size={18} />
            </Button>
            <Button variant="outline">
              <Calendar size={18} className="mr-2" />
              Today
            </Button>
            <Button variant="outline">
              <Eye size={18} className="mr-2" />
              Most Viewed
            </Button>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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

          <Tabs defaultValue="foryou" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="foryou">For You</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
              <TabsTrigger value="gaming">Gaming</TabsTrigger>
              <TabsTrigger value="tech">Tech</TabsTrigger>
            </TabsList>

            <TabsContent value="foryou" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingVideos.map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trending" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingVideos.map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="music">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingVideos.slice(0, 3).map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gaming">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingVideos.slice(1, 4).map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tech">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingVideos.map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block space-y-6">
          {/* Trending Hashtags */}
          <Card className="p-4 gradient-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Hash size={18} className="text-primary" />
              Trending Hashtags
            </h3>
            <div className="space-y-3">
              {trendingHashtags.map((hashtag) => (
                <div
                  key={hashtag.tag}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">#{hashtag.tag}</p>
                      {hashtag.trending && (
                        <TrendingUp size={14} className="text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {hashtag.posts} posts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Trending Creators */}
          <Card className="p-4 gradient-card">
            <h3 className="font-semibold mb-4">Trending Creators</h3>
            <div className="space-y-3">
              {trendingCreators.map((creator) => (
                <div
                  key={creator.name}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {creator.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{creator.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {creator.subscribers} subscribers
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Categories Quick Access */}
          <Card className="p-4 gradient-card">
            <h3 className="font-semibold mb-4">Quick Access</h3>
            <div className="space-y-2">
              {categories.slice(0, 4).map((category) => (
                <Button
                  key={category.name}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <category.icon className={`mr-2 ${category.color}`} size={18} />
                  {category.name}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
