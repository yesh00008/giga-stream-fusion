import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCard } from "@/components/VideoCard";
import { Card } from "@/components/ui/card";
import { Bell, Share2, MoreHorizontal, Play, Grid3X3 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const channelVideos = [
  {
    id: "c1",
    title: "Getting Started with React - Complete Tutorial",
    channel: "Tech Tutorials",
    views: "500K",
    timestamp: "1 week ago",
    duration: "45:30",
  },
  {
    id: "c2",
    title: "Advanced TypeScript Tips and Tricks",
    channel: "Tech Tutorials",
    views: "320K",
    timestamp: "2 weeks ago",
    duration: "32:15",
  },
  {
    id: "c3",
    title: "Building Modern Web Apps with Vite",
    channel: "Tech Tutorials",
    views: "450K",
    timestamp: "3 weeks ago",
    duration: "28:45",
  },
];

const playlists = [
  { id: 1, name: "React Tutorials", videos: 25, thumbnail: "RT" },
  { id: 2, name: "TypeScript Mastery", videos: 18, thumbnail: "TM" },
  { id: 3, name: "Web Development", videos: 42, thumbnail: "WD" },
  { id: 4, name: "Design Patterns", videos: 15, thumbnail: "DP" },
];

export default function Channel() {
  const { id } = useParams();

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Channel Banner */}
      <div className="h-48 md:h-64 gradient-primary relative">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Channel Info */}
      <div className="px-4 md:px-6 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end mb-6">
          <Avatar className="w-32 h-32 border-4 border-background">
            <AvatarFallback className="bg-card text-4xl">TT</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Tech Tutorials</h1>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-4">
              <span>@techtutorials</span>
              <span>•</span>
              <span>1.2M subscribers</span>
              <span>•</span>
              <span>156 videos</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-2xl">
              Welcome to Tech Tutorials! Learn web development, programming, and more with easy-to-follow tutorials.
              New videos every week! 🚀
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="gradient" size="lg">
                <Bell className="mr-2" size={18} />
                Subscribe
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="mr-2" size={18} />
                Share
              </Button>
              <Button variant="outline" size="icon">
                <MoreHorizontal size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Channel Tabs */}
        <Tabs defaultValue="videos" className="w-full">
          <TabsList className="mb-6 w-full justify-start overflow-x-auto">
            <TabsTrigger value="videos">
              <Play className="mr-2" size={16} />
              Videos
            </TabsTrigger>
            <TabsTrigger value="shorts">Shorts</TabsTrigger>
            <TabsTrigger value="playlists">
              <Grid3X3 className="mr-2" size={16} />
              Playlists
            </TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="videos" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {channelVideos.map((video) => (
                <VideoCard key={video.id} {...video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="shorts" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="aspect-[9/16] gradient-card cursor-pointer hover:scale-105 transition-smooth">
                  <div className="w-full h-full flex items-center justify-center">
                    <Play size={32} className="text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="playlists" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {playlists.map((playlist) => (
                <Card key={playlist.id} className="gradient-card overflow-hidden cursor-pointer hover:scale-105 transition-smooth">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <div className="text-6xl font-bold text-primary opacity-20">{playlist.thumbnail}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{playlist.name}</h3>
                    <p className="text-sm text-muted-foreground">{playlist.videos} videos</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-4">
            <Card className="p-6 gradient-card text-center">
              <p className="text-muted-foreground">Community posts coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card className="p-6 gradient-card space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">
                  Welcome to Tech Tutorials! We create high-quality programming tutorials and web development courses.
                  Join our community of 1.2M+ developers learning to code!
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>Joined: Jan 2020</div>
                  <div>Total views: 45M</div>
                  <div>Country: United States</div>
                  <div>Language: English</div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
