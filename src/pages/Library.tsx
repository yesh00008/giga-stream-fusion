import { Clock, ThumbsUp, PlaySquare, Download, Folder } from "lucide-react";
import { VideoCard } from "@/components/VideoCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const recentVideos = [
  { id: "1", title: "React Advanced Patterns", channel: "Tech Master", views: "1.2M", timestamp: "2 days ago", duration: "25:30" },
  { id: "2", title: "CSS Grid Complete Guide", channel: "Design Pro", views: "850K", timestamp: "1 week ago", duration: "18:45" },
  { id: "3", title: "TypeScript Best Practices", channel: "Code Academy", views: "620K", timestamp: "3 days ago", duration: "32:15" },
];

const watchLater = [
  { id: "4", title: "Build a Full Stack App", channel: "Developer Hub", views: "2.1M", timestamp: "4 days ago", duration: "45:20" },
  { id: "5", title: "Advanced Node.js", channel: "Backend Pro", views: "1.5M", timestamp: "5 days ago", duration: "38:10" },
];

const downloads = [
  { id: "6", title: "JavaScript ES2024 Features", channel: "JS Expert", views: "920K", timestamp: "1 week ago", duration: "22:45" },
  { id: "7", title: "Docker Tutorial", channel: "DevOps Master", views: "780K", timestamp: "2 weeks ago", duration: "28:30" },
];

export default function Library() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Library</h1>

        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto grid grid-cols-2 sm:flex gap-1">
            <TabsTrigger value="recent" className="text-xs sm:text-sm gap-1 sm:gap-2">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Recent</span>
            </TabsTrigger>
            <TabsTrigger value="watchlater" className="text-xs sm:text-sm gap-1 sm:gap-2">
              <PlaySquare className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Watch Later</span>
            </TabsTrigger>
            <TabsTrigger value="liked" className="text-xs sm:text-sm gap-1 sm:gap-2">
              <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Liked</span>
            </TabsTrigger>
            <TabsTrigger value="downloads" className="text-xs sm:text-sm gap-1 sm:gap-2">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Downloads</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Recently Watched
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {recentVideos.map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="watchlater">
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <PlaySquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Watch Later ({watchLater.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {watchLater.map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="liked">
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Liked Videos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {recentVideos.map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="downloads">
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Downloaded Videos ({downloads.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {downloads.map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
