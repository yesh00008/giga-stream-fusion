import { VideoCard } from "@/components/VideoCard";
import { Heart, PlayCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const likedVideos = [
  {
    id: "l1",
    title: "Amazing Coding Tutorial - Must Watch",
    channel: "Code Academy",
    views: "2.1M",
    timestamp: "Liked 1 week ago",
    duration: "25:30",
  },
  {
    id: "l2",
    title: "Beautiful UI Design Inspiration",
    channel: "Design Masters",
    views: "1.5M",
    timestamp: "Liked 2 weeks ago",
    duration: "18:45",
  },
  {
    id: "l3",
    title: "Epic Game Walkthrough Part 1",
    channel: "Gaming Pro",
    views: "3.2M",
    timestamp: "Liked 3 weeks ago",
    duration: "45:20",
  },
];

export default function Liked() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <Heart className="text-red-500 fill-current" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Liked Videos</h1>
              <p className="text-muted-foreground">{likedVideos.length} videos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="gradient">
              <PlayCircle className="mr-2" size={18} />
              Play All
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2" size={18} />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {likedVideos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      </div>
    </div>
  );
}
