import { PostCard } from "@/components/PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flame, Music, Gamepad2, Trophy } from "lucide-react";

const trendingNow = [
  {
    id: "tr1",
    title: "🔥 BREAKING: Major Tech Announcement - Industry Changed Forever!",
    content: "The tech industry is buzzing with this groundbreaking announcement that will change how we develop applications forever...",
    author: "Tech News",
    likes: "8.5K",
    comments: "1.2K",
    timestamp: "3 hours ago",
    image: "🔥",
  },
  {
    id: "tr2",
    title: "This Post Broke The Internet - Viral Sensation",
    content: "Everyone is talking about this! The most shared post of the week with incredible insights...",
    author: "Viral Central",
    likes: "10.2K",
    comments: "2.3K",
    timestamp: "1 day ago",
    image: "⚡",
  },
  {
    id: "tr3",
    title: "Epic Gaming Tournament Finals - Most Watched Event Ever",
    content: "The gaming community came together for the most exciting tournament finals in esports history...",
    author: "Esports Pro",
    likes: "5.8K",
    comments: "890",
    timestamp: "6 hours ago",
    image: "🎮",
  },
];

export default function Trending() {
  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
            <div className="max-w-3xl mx-auto space-y-1">
              {trendingNow.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="music">
            <div className="max-w-3xl mx-auto space-y-1">
              {trendingNow.slice(0, 2).map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="gaming">
            <div className="max-w-3xl mx-auto space-y-1">
              {trendingNow.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sports">
            <div className="max-w-3xl mx-auto space-y-1">
              {trendingNow.slice(1).map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
