import { Play, Plus, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const playlists = [
  { id: 1, title: "Watch Later", videos: 24, thumbnail: "📺", privacy: "private" },
  { id: 2, title: "Liked Videos", videos: 156, thumbnail: "❤️", privacy: "private" },
  { id: 3, title: "Web Development", videos: 42, thumbnail: "💻", privacy: "public" },
  { id: 4, title: "Music Vibes", videos: 89, thumbnail: "🎵", privacy: "public" },
  { id: 5, title: "Cooking Recipes", videos: 31, thumbnail: "🍳", privacy: "unlisted" },
  { id: 6, title: "Workout Routines", videos: 18, thumbnail: "💪", privacy: "public" },
];

export default function Playlists() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Your Playlists</h1>
          <Button variant="gradient" size="sm" className="w-full sm:w-auto h-9 sm:h-10 text-sm">
            <Plus size={16} className="mr-2 sm:w-4 sm:h-4" />
            New Playlist
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto grid grid-cols-3 sm:flex">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="public" className="text-xs sm:text-sm">Public</TabsTrigger>
            <TabsTrigger value="private" className="text-xs sm:text-sm">Private</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary transition-smooth cursor-pointer group"
                >
                  <div className="aspect-video gradient-card flex items-center justify-center relative">
                    <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-smooth">{playlist.thumbnail}</span>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
                      <Button variant="ghost" size="icon" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20">
                        <Play size={20} className="fill-current sm:w-6 sm:h-6" />
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] sm:text-xs text-white flex items-center gap-1">
                      {playlist.privacy === "private" ? <Lock size={10} className="sm:w-3 sm:h-3" /> : <Globe size={10} className="sm:w-3 sm:h-3" />}
                      {playlist.videos} videos
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{playlist.title}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{playlist.privacy}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="public">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {playlists.filter(p => p.privacy === "public").map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary transition-smooth cursor-pointer group"
                >
                  <div className="aspect-video gradient-card flex items-center justify-center relative">
                    <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-smooth">{playlist.thumbnail}</span>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
                      <Button variant="ghost" size="icon" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20">
                        <Play size={20} className="fill-current sm:w-6 sm:h-6" />
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] sm:text-xs text-white flex items-center gap-1">
                      <Globe size={10} className="sm:w-3 sm:h-3" />
                      {playlist.videos} videos
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{playlist.title}</h3>
                    <p className="text-xs text-muted-foreground">Public</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="private">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {playlists.filter(p => p.privacy === "private").map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary transition-smooth cursor-pointer group"
                >
                  <div className="aspect-video gradient-card flex items-center justify-center relative">
                    <span className="text-5xl sm:text-6xl group-hover:scale-110 transition-smooth">{playlist.thumbnail}</span>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
                      <Button variant="ghost" size="icon" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20">
                        <Play size={20} className="fill-current sm:w-6 sm:h-6" />
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] sm:text-xs text-white flex items-center gap-1">
                      <Lock size={10} className="sm:w-3 sm:h-3" />
                      {playlist.videos} videos
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{playlist.title}</h3>
                    <p className="text-xs text-muted-foreground">Private</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
