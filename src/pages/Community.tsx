import { useState } from "react";
import { Heart, MessageCircle, Share2, MoreVertical, Image, Video, Smile, BarChart2, Repeat2, Quote, Bookmark, TrendingUp, Verified, Eye, Pin, Calendar, Link2, Mic, Users, List, Filter, Volume2, Bell, BellOff, UserX, Flag, Lock, Globe, AtSign, FileText, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const trendingTopics = [
  { id: 1, tag: "#WebDev", posts: "12.5K posts" },
  { id: 2, tag: "#AI", posts: "8.9K posts" },
  { id: 3, tag: "#React", posts: "15.2K posts" },
  { id: 4, tag: "#JavaScript", posts: "25.1K posts" },
];

const spaces = [
  { id: 1, title: "Tech Talk Live", host: "Tech Master", listeners: 234, isLive: true },
  { id: 2, title: "Design Reviews", host: "Design Hub", listeners: 89, isLive: true },
];

const lists = [
  { id: 1, name: "Tech Leaders", members: 45, isPrivate: false },
  { id: 2, name: "My Circle", members: 12, isPrivate: true },
  { id: 3, name: "Design Inspiration", members: 234, isPrivate: false },
];

const posts = [
  {
    id: 1,
    author: "Tech Master",
    handle: "techmaster",
    avatar: "TM",
    time: "2h ago",
    content: "Just dropped a new tutorial on React Server Components! Check it out and let me know what you think 🚀",
    likes: 1245,
    comments: 89,
    shares: 34,
    retweets: 156,
    views: 12453,
    type: "text",
    isVerified: true,
    isPinned: false
  },
  {
    id: 2,
    author: "Design Hub",
    handle: "designhub",
    avatar: "DH",
    time: "5h ago",
    content: "Which color scheme do you prefer for our next project?",
    likes: 892,
    comments: 156,
    shares: 23,
    retweets: 89,
    views: 8921,
    type: "poll",
    isVerified: true,
    isPinned: false,
    poll: {
      options: ["Dark Mode", "Light Mode", "Auto"],
      votes: [450, 320, 122]
    }
  },
  {
    id: 3,
    author: "Gaming Zone",
    handle: "gamingzone",
    avatar: "GZ",
    time: "1d ago",
    content: "Epic gaming session tonight! Who's ready? 🎮",
    likes: 2341,
    comments: 234,
    shares: 67,
    retweets: 421,
    views: 23410,
    type: "image",
    isVerified: false,
    isPinned: true
  },
  {
    id: 4,
    author: "Code Ninja",
    handle: "codeninja",
    avatar: "CN",
    time: "3h ago",
    content: "This is how you properly structure a React app 👇",
    likes: 3421,
    comments: 312,
    shares: 892,
    retweets: 1234,
    views: 45231,
    type: "thread",
    isThread: true,
    isVerified: true,
    isPinned: false
  },
  {
    id: 5,
    author: "AI Researcher",
    handle: "airesearcher",
    avatar: "AR",
    time: "30m ago",
    content: "Breaking: New AI model achieves human-level performance on reasoning tasks!",
    likes: 5234,
    comments: 891,
    shares: 1234,
    retweets: 2341,
    views: 67891,
    type: "quote",
    quotedPost: {
      author: "Research Lab",
      handle: "researchlab",
      content: "We're excited to announce our latest research breakthrough...",
      isVerified: true
    },
    isVerified: true,
    isPinned: false
  }
];

export default function Community() {
  const [liked, setLiked] = useState<number[]>([]);
  const [retweeted, setRetweeted] = useState<number[]>([]);
  const [saved, setSaved] = useState<number[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [postVisibility, setPostVisibility] = useState<"everyone" | "followers">("everyone");
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [threadPosts, setThreadPosts] = useState<string[]>([""]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [muted, setMuted] = useState<number[]>([]);
  const [followed, setFollowed] = useState<number[]>([]);

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
        {/* Create Post - Advanced Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <div className="bg-card rounded-xl border border-border p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex gap-2 sm:gap-3 mb-3">
              <Avatar className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
                <AvatarFallback className="gradient-primary text-white text-xs sm:text-sm">U</AvatarFallback>
              </Avatar>
              <DialogTrigger asChild>
                <Textarea
                  placeholder="Share something with your community..."
                  className="min-h-[80px] sm:min-h-[100px] resize-none text-sm sm:text-base cursor-pointer"
                  readOnly
                />
              </DialogTrigger>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1 sm:gap-2">
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 sm:h-9 gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Image className="w-4 h-4" />
                    <span className="hidden sm:inline">Photo</span>
                  </Button>
                </DialogTrigger>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 sm:h-9 gap-1 sm:gap-2 text-xs sm:text-sm">
                    <Video className="w-4 h-4" />
                    <span className="hidden sm:inline">Video</span>
                  </Button>
                </DialogTrigger>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 sm:h-9 gap-1 sm:gap-2 text-xs sm:text-sm">
                    <BarChart2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Poll</span>
                  </Button>
                </DialogTrigger>
              </div>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="h-8 sm:h-9 bg-primary hover:bg-primary/90 text-xs sm:text-sm">
                  Post
                </Button>
              </DialogTrigger>
            </div>
          </div>

          {/* Advanced Post Creation Modal */}
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Create Post</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsThreadMode(!isThreadMode)}>
                    <FileText className="w-4 h-4 mr-2" />
                    {isThreadMode ? "Single Post" : "Thread"}
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="gradient-primary text-white">U</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  {isThreadMode ? (
                    threadPosts.map((post, idx) => (
                      <div key={idx} className="space-y-2">
                        <Textarea
                          placeholder={`Post ${idx + 1}`}
                          value={post}
                          onChange={(e) => {
                            const newThreads = [...threadPosts];
                            newThreads[idx] = e.target.value;
                            setThreadPosts(newThreads);
                          }}
                          className="min-h-[100px] resize-none"
                        />
                        {idx === threadPosts.length - 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setThreadPosts([...threadPosts, ""])}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add to thread
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <Textarea
                      placeholder="What's happening?"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="min-h-[150px] resize-none"
                    />
                  )}
                  
                  {/* Media Upload Area */}
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-accent/50 transition-smooth cursor-pointer">
                    <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload media or drag and drop</p>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="visibility" className="text-sm">Who can reply</Label>
                      <Select value={postVisibility} onValueChange={(v: any) => setPostVisibility(v)}>
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="everyone">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              Everyone
                            </div>
                          </SelectItem>
                          <SelectItem value="followers">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Followers
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Image className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <BarChart2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Smile className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Calendar className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <AtSign className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Link2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">Post</Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

          {/* Filter Tabs with Advanced Filters */}
          <div className="mb-4 sm:mb-6 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Tabs value={activeFilter} onValueChange={setActiveFilter} className="flex-1">
                <TabsList className="w-full grid grid-cols-4 sm:w-auto sm:inline-flex h-auto">
                  <TabsTrigger value="all" className="text-xs sm:text-sm py-2">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    For You
                  </TabsTrigger>
                  <TabsTrigger value="following" className="text-xs sm:text-sm py-2">Following</TabsTrigger>
                  <TabsTrigger value="trending" className="text-xs sm:text-sm py-2">Trending</TabsTrigger>
                  <TabsTrigger value="recent" className="text-xs sm:text-sm py-2">Recent</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="w-4 h-4 mr-1" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Image className="w-4 h-4 mr-2" />
                    Media only
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link2 className="w-4 h-4 mr-2" />
                    Links only
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Replies only
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Verified className="w-4 h-4 mr-2" />
                    Verified only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Posts Feed - Twitter Style */}
          <div className="space-y-0">
            {posts.map((post) => (
              <div key={post.id} className="bg-card border-b border-border hover:bg-accent/50 transition-smooth cursor-pointer">
                {/* Pinned Badge */}
                {post.isPinned && (
                  <div className="flex items-center gap-2 px-4 pt-3 text-muted-foreground text-xs">
                    <Pin className="w-3 h-3 ml-10" />
                    <span>Pinned post</span>
                  </div>
                )}
                
                {/* Post Header - Twitter Style */}
                <div className="flex gap-3 p-4">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="gradient-primary text-white text-sm">
                      {post.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <p className="font-bold text-foreground text-sm">{post.author}</p>
                        {post.isVerified && (
                          <Verified className="w-4 h-4 text-primary fill-primary" />
                        )}
                        <span className="text-muted-foreground text-sm">@{post.handle}</span>
                        <span className="text-muted-foreground text-sm">·</span>
                        <span className="text-muted-foreground text-sm">{post.time}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {!followed.includes(post.id) && (
                            <DropdownMenuItem onClick={() => setFollowed([...followed, post.id])}>
                              <Users className="w-4 h-4 mr-2" />
                              Follow @{post.handle}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <List className="w-4 h-4 mr-2" />
                            Add to List
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setMuted([...muted, post.id])}>
                            {muted.includes(post.id) ? (
                              <>
                                <Bell className="w-4 h-4 mr-2" />
                                Unmute @{post.handle}
                              </>
                            ) : (
                              <>
                                <BellOff className="w-4 h-4 mr-2" />
                                Mute @{post.handle}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserX className="w-4 h-4 mr-2" />
                            Block @{post.handle}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Flag className="w-4 h-4 mr-2" />
                            Report post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

                    {/* Quote Retweet */}
                    {post.type === "quote" && post.quotedPost && (
                      <div className="border border-border rounded-2xl p-3 mb-3 hover:bg-accent/50 transition-smooth">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-xs">RL</AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-sm">{post.quotedPost.author}</span>
                          {post.quotedPost.isVerified && (
                            <Verified className="w-3 h-3 text-primary fill-primary" />
                          )}
                          <span className="text-muted-foreground text-sm">@{post.quotedPost.handle}</span>
                        </div>
                        <p className="text-sm text-foreground">{post.quotedPost.content}</p>
                      </div>
                    )}

                    {/* Post Analytics */}
                    <div className="flex items-center gap-3 text-muted-foreground text-xs mb-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{(post.views / 1000).toFixed(1)}K views</span>
                      </div>
                    </div>

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
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`gap-2 h-8 hover:bg-green-500/10 -ml-2 ${
                              retweeted.includes(post.id) ? "text-green-500" : "text-muted-foreground hover:text-green-500"
                            }`}
                          >
                            <Repeat2 className="w-4 h-4" />
                            <span className="text-sm">{post.retweets + (retweeted.includes(post.id) ? 1 : 0)}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleRetweet(post.id)}>
                            <Repeat2 className="w-4 h-4 mr-2" />
                            Repost
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Quote className="w-4 h-4 mr-2" />
                            Quote
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
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
          {/* Live Spaces */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Volume2 size={20} className="text-primary" />
              Live Spaces
            </h3>
            <div className="space-y-3">
              {spaces.map((space) => (
                <div key={space.id} className="hover:bg-accent p-3 -mx-2 rounded-lg cursor-pointer transition-smooth">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="destructive" className="text-xs">LIVE</Badge>
                    <span className="text-xs text-muted-foreground">{space.listeners} listening</span>
                  </div>
                  <p className="font-semibold text-sm mb-1">{space.title}</p>
                  <p className="text-xs text-muted-foreground">Hosted by {space.host}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Your Lists */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <List size={20} className="text-primary" />
              Your Lists
            </h3>
            <div className="space-y-3">
              {lists.map((list) => (
                <div key={list.id} className="hover:bg-accent p-2 -mx-2 rounded-lg cursor-pointer transition-smooth flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{list.name}</p>
                      {list.isPrivate && <Lock className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{list.members} members</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                <List className="w-4 h-4 mr-2" />
                Create new list
              </Button>
            </div>
          </div>

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
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-sm">User {i}</p>
                        {i === 1 && <Verified className="w-3 h-3 text-primary fill-primary" />}
                      </div>
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
