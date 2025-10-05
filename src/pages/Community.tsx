import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreVertical, Image, Video, Smile, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const posts = [
  {
    id: 1,
    author: "Tech Master",
    avatar: "TM",
    time: "2h ago",
    content: "Just dropped a new tutorial on React Server Components! Check it out and let me know what you think 🚀",
    likes: 1245,
    comments: 89,
    shares: 34,
    type: "text"
  },
  {
    id: 2,
    author: "Design Hub",
    avatar: "DH",
    time: "5h ago",
    content: "Which color scheme do you prefer for our next project?",
    likes: 892,
    comments: 156,
    shares: 23,
    type: "poll",
    poll: {
      options: ["Dark Mode", "Light Mode", "Auto"],
      votes: [450, 320, 122]
    }
  },
  {
    id: 3,
    author: "Gaming Zone",
    avatar: "GZ",
    time: "1d ago",
    content: "Epic gaming session tonight! Who's ready? 🎮",
    likes: 2341,
    comments: 234,
    shares: 67,
    type: "image"
  }
];

export default function Community() {
  const [liked, setLiked] = useState<number[]>([]);
  const [newPost, setNewPost] = useState("");

  const handleLike = (id: number) => {
    setLiked(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto p-3 sm:p-6">
        {/* Create Post */}
        <div className="bg-card rounded-xl border border-border p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex gap-2 sm:gap-3 mb-3">
            <Avatar className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
              <AvatarFallback className="gradient-primary text-white text-xs sm:text-sm">U</AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="Share something with your community..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[80px] sm:min-h-[100px] resize-none text-sm sm:text-base"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1 sm:gap-2">
              <Button variant="ghost" size="sm" className="h-8 sm:h-9 gap-1 sm:gap-2 text-xs sm:text-sm">
                <Image className="w-4 h-4" />
                <span className="hidden sm:inline">Photo</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 sm:h-9 gap-1 sm:gap-2 text-xs sm:text-sm">
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Video</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 sm:h-9 gap-1 sm:gap-2 text-xs sm:text-sm">
                <BarChart2 className="w-4 h-4" />
                <span className="hidden sm:inline">Poll</span>
              </Button>
            </div>
            <Button variant="default" size="sm" className="h-8 sm:h-9 bg-primary hover:bg-primary/90 text-xs sm:text-sm">
              Post
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs defaultValue="all" className="mb-4 sm:mb-6">
          <TabsList className="w-full grid grid-cols-3 sm:w-auto sm:inline-flex">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All Posts</TabsTrigger>
            <TabsTrigger value="popular" className="text-xs sm:text-sm">Popular</TabsTrigger>
            <TabsTrigger value="recent" className="text-xs sm:text-sm">Recent</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Posts Feed */}
        <div className="space-y-3 sm:space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-smooth">
              {/* Post Header */}
              <div className="flex items-center justify-between p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
                    <AvatarFallback className="gradient-primary text-white text-xs sm:text-sm">
                      {post.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground text-sm sm:text-base">{post.author}</p>
                    <p className="text-xs text-muted-foreground">{post.time}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              {/* Post Content */}
              <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                <p className="text-foreground mb-3 text-sm sm:text-base whitespace-pre-wrap">{post.content}</p>

                {/* Poll if exists */}
                {post.type === "poll" && post.poll && (
                  <div className="space-y-2 mb-3">
                    {post.poll.options.map((option, idx) => {
                      const total = post.poll!.votes.reduce((a, b) => a + b, 0);
                      const percentage = Math.round((post.poll!.votes[idx] / total) * 100);
                      return (
                        <div key={idx} className="relative">
                          <div className="border border-border rounded-lg p-2 sm:p-3 cursor-pointer hover:border-primary transition-smooth">
                            <div className="flex justify-between items-center relative z-10">
                              <span className="text-xs sm:text-sm font-medium">{option}</span>
                              <span className="text-xs text-muted-foreground">{percentage}%</span>
                            </div>
                            <div 
                              className="absolute inset-0 bg-primary/10 rounded-lg transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Image placeholder */}
                {post.type === "image" && (
                  <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Image className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center gap-1 sm:gap-2 pt-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`flex-1 gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm ${
                      liked.includes(post.id) ? "text-red-500" : ""
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${liked.includes(post.id) ? "fill-current" : ""}`} />
                    <span className="hidden sm:inline">Like</span>
                    <span className="text-xs sm:text-sm">({post.likes})</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm">
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Comment</span>
                    <span className="text-xs sm:text-sm">({post.comments})</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm">
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                    <span className="text-xs sm:text-sm">({post.shares})</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
