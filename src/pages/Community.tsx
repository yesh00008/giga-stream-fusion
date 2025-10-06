import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreVertical, Image, Video, Smile, BarChart2, Repeat2, Quote, Bookmark, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const trendingTopics = [
  { id: 1, tag: "#WebDev", posts: "12.5K posts" },
  { id: 2, tag: "#AI", posts: "8.9K posts" },
  { id: 3, tag: "#React", posts: "15.2K posts" },
  { id: 4, tag: "#JavaScript", posts: "25.1K posts" },
];

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
    retweets: 156,
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
    retweets: 89,
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
    retweets: 421,
    type: "image"
  },
  {
    id: 4,
    author: "Code Ninja",
    avatar: "CN",
    time: "3h ago",
    content: "This is how you properly structure a React app 👇",
    likes: 3421,
    comments: 312,
    shares: 892,
    retweets: 1234,
    type: "thread",
    isThread: true
  }
];

export default function Community() {
  const [liked, setLiked] = useState<number[]>([]);
  const [retweeted, setRetweeted] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [newPost, setNewPost] = useState("");

  const handleLike = (id: number) => {
    setLiked(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleRetweet = (id: number) => {
    setRetweeted(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSave = (id: number) => {
    setSaved(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto p-3 sm:p-6">
        {/* Main Feed */}
        <div className="lg:col-span-2">
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
            <TabsList className="w-full grid grid-cols-4 sm:w-auto sm:inline-flex h-auto">
              <TabsTrigger value="all" className="text-xs sm:text-sm py-2">For You</TabsTrigger>
              <TabsTrigger value="following" className="text-xs sm:text-sm py-2">Following</TabsTrigger>
              <TabsTrigger value="trending" className="text-xs sm:text-sm py-2">Trending</TabsTrigger>
              <TabsTrigger value="recent" className="text-xs sm:text-sm py-2">Recent</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Posts Feed - Twitter Style */}
          <div className="space-y-0">
            {posts.map((post) => (
              <div key={post.id} className="bg-card border-b border-border hover:bg-accent/50 transition-smooth cursor-pointer">
                {/* Post Header - Twitter Style */}
                <div className="flex gap-3 p-4">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="gradient-primary text-white text-sm">
                      {post.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-foreground text-sm">{post.author}</p>
                        <span className="text-muted-foreground text-sm">@{post.author.toLowerCase().replace(' ', '')}</span>
                        <span className="text-muted-foreground text-sm">·</span>
                        <span className="text-muted-foreground text-sm">{post.time}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <p className="text-foreground mb-3 text-sm whitespace-pre-wrap">{post.content}</p>
                    
                    {post.isThread && (
                      <div className="text-primary text-sm mb-3 flex items-center gap-1">
                        <span>Show this thread</span>
                      </div>
                    )}

                    {/* Poll if exists */}
                    {post.type === "poll" && post.poll && (
                      <div className="space-y-2 mb-3 border border-border rounded-2xl p-3">
                        {post.poll.options.map((option, idx) => {
                          const total = post.poll!.votes.reduce((a, b) => a + b, 0);
                          const percentage = Math.round((post.poll!.votes[idx] / total) * 100);
                          return (
                            <div key={idx} className="relative">
                              <div className="border border-border rounded-lg p-3 cursor-pointer hover:bg-accent transition-smooth">
                                <div className="flex justify-between items-center relative z-10">
                                  <span className="text-sm font-medium">{option}</span>
                                  <span className="text-sm font-bold">{percentage}%</span>
                                </div>
                                <div 
                                  className="absolute inset-0 bg-primary/20 rounded-lg transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        <p className="text-xs text-muted-foreground mt-2">{post.poll.votes.reduce((a, b) => a + b, 0)} votes</p>
                      </div>
                    )}

                    {/* Image placeholder */}
                    {post.type === "image" && (
                      <div className="aspect-video bg-muted rounded-2xl mb-3 flex items-center justify-center border border-border overflow-hidden">
                        <Image className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}

                    {/* Post Actions - Twitter Style */}
                    <div className="flex items-center justify-between mt-3 max-w-md">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10 -ml-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{post.comments}</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetweet(post.id)}
                        className={`gap-2 h-8 hover:bg-green-500/10 -ml-2 ${
                          retweeted.includes(post.id) ? "text-green-500" : "text-muted-foreground hover:text-green-500"
                        }`}
                      >
                        <Repeat2 className="w-4 h-4" />
                        <span className="text-sm">{post.retweets + (retweeted.includes(post.id) ? 1 : 0)}</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`gap-2 h-8 hover:bg-red-500/10 -ml-2 ${
                          liked.includes(post.id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${liked.includes(post.id) ? "fill-current" : ""}`} />
                        <span className="text-sm">{post.likes + (liked.includes(post.id) ? 1 : 0)}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSave(post.id)}
                        className={`gap-2 h-8 hover:bg-primary/10 -ml-2 ${
                          saved.includes(post.id) ? "text-primary" : "text-muted-foreground hover:text-primary"
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${saved.includes(post.id) ? "fill-current" : ""}`} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10 -ml-2"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Trending & Suggestions */}
        <div className="hidden lg:block space-y-4">
          {/* Trending Topics */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Trending Topics
            </h3>
            <div className="space-y-3">
              {trendingTopics.map((topic) => (
                <div key={topic.id} className="hover:bg-accent p-2 -mx-2 rounded-lg cursor-pointer transition-smooth">
                  <p className="font-semibold text-primary text-sm">{topic.tag}</p>
                  <p className="text-xs text-muted-foreground">{topic.posts}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Who to Follow */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-bold text-lg mb-4">Who to Follow</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="gradient-primary text-white text-xs">U{i}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">User {i}</p>
                      <p className="text-xs text-muted-foreground">@user{i}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-8">Follow</Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
