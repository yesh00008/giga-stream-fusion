import { PostCard } from "@/components/PostCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, BellRing } from "lucide-react";

const following = [
  { id: 1, name: "Tech Tutorials", avatar: "TT", followers: "1.2M" },
  { id: 2, name: "Code Masters", avatar: "CM", followers: "850K" },
  { id: 3, name: "Developer Pro", avatar: "DP", followers: "2.1M" },
  { id: 4, name: "Design Hub", avatar: "DH", followers: "920K" },
  { id: 5, name: "Gaming Zone", avatar: "GZ", followers: "1.5M" },
  { id: 6, name: "Music Hub", avatar: "MH", followers: "680K" },
];

const posts = [
  {
    id: "s1",
    title: "New Guide: Advanced React Patterns",
    content: "Deep dive into advanced React patterns that will make your code more maintainable and scalable...",
    author: "Tech Tutorials",
    likes: "1.2K",
    comments: "89",
    timestamp: "2 hours ago",
    image: "⚛️",
  },
  {
    id: "s2",
    title: "Building a Full Stack App - Live Session",
    content: "Join me live as we build a complete full stack application from scratch...",
    author: "Code Masters",
    likes: "856",
    comments: "67",
    timestamp: "30 minutes ago",
    image: "🚀",
  },
  {
    id: "s3",
    title: "Design System Best Practices 2024",
    content: "Learn how to create and maintain a design system that scales with your team...",
    author: "Design Hub",
    likes: "734",
    comments: "45",
    timestamp: "5 hours ago",
    image: "🎨",
  },
  {
    id: "s4",
    title: "Epic Gaming Session - New Game Release",
    content: "Playing the hottest new game release! Come join the fun and excitement...",
    author: "Gaming Zone",
    likes: "2.3K",
    comments: "234",
    timestamp: "1 hour ago",
    image: "🎮",
  },
];

export default function Subscriptions() {
  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Following</h1>
          <p className="text-muted-foreground">Latest from people you follow</p>
        </div>

        {/* Following Bar */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {following.map((author) => (
            <div
              key={author.id}
              className="flex flex-col items-center gap-2 cursor-pointer min-w-[100px] group"
            >
              <div className="relative">
                <Avatar className="w-16 h-16 border-2 border-primary group-hover:scale-110 transition-smooth">
                  <AvatarFallback className="bg-card text-lg">{author.avatar}</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-background border border-border"
                >
                  <BellRing size={14} className="text-primary" />
                </Button>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium truncate max-w-[100px]">{author.name}</p>
                <p className="text-xs text-muted-foreground">{author.followers}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Latest Posts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Latest Posts</h2>
            <Button variant="outline" size="sm">
              <Bell size={16} className="mr-2" />
              Manage
            </Button>
          </div>

          <div className="max-w-3xl mx-auto space-y-1">
            {posts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
