import { VideoCard } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const historyVideos = [
  {
    id: "h1",
    title: "Building a Modern Video Platform with React",
    channel: "Tech Tutorials",
    views: "1.2M",
    timestamp: "Watched 2 hours ago",
    duration: "15:42",
  },
  {
    id: "h2",
    title: "CSS Grid vs Flexbox - Complete Guide",
    channel: "Design Hub",
    views: "850K",
    timestamp: "Watched yesterday",
    duration: "12:30",
  },
  {
    id: "h3",
    title: "TypeScript Advanced Patterns",
    channel: "Code Masters",
    views: "2.1M",
    timestamp: "Watched 2 days ago",
    duration: "45:20",
  },
];

export default function History() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Watch History</h1>
            <p className="text-muted-foreground">Track your viewing activity</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Search history..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Trash2 size={18} className="mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {historyVideos.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="today">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {historyVideos.slice(0, 1).map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="week">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {historyVideos.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="month">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {historyVideos.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
