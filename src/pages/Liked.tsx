import { PostCard } from "@/components/PostCard";
import { Heart, PlayCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const likedPosts = [
  {
    id: "l1",
    title: "Amazing Coding Tutorial - Must Read",
    content: "Essential coding tips and techniques that every developer should know. A comprehensive guide to modern development...",
    author: "Code Academy",
    likes: "2.1K",
    comments: "156",
    timestamp: "Liked 1 week ago",
    image: "💻",
  },
  {
    id: "l2",
    title: "Beautiful UI Design Inspiration",
    content: "Explore the latest trends in UI design with stunning examples and practical tips for creating beautiful interfaces...",
    author: "Design Masters",
    likes: "1.5K",
    comments: "98",
    timestamp: "Liked 2 weeks ago",
    image: "🎨",
  },
  {
    id: "l3",
    title: "Epic Game Walkthrough Part 1",
    content: "The ultimate guide to mastering this epic game. Follow along as we explore every secret and strategy...",
    author: "Gaming Pro",
    likes: "3.2K",
    comments: "234",
    timestamp: "Liked 3 weeks ago",
    image: "🎮",
  },
];

export default function Liked() {
  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <Heart className="text-red-500 fill-current" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Liked Posts</h1>
              <p className="text-muted-foreground">{likedPosts.length} posts</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Share2 className="mr-2" size={18} />
              Share
            </Button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-1">
          {likedPosts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}
