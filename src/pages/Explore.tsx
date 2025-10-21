import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "@/components/PostCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Flame, Music, Gamepad2, Film, Newspaper, Lightbulb, Dumbbell, Code, Hash, TrendingUp, Search, Filter, Calendar, Eye } from "lucide-react";
import { useState } from "react";

const categories = [
  { name: "Trending", icon: Flame, color: "text-orange-500" },
  { name: "Music", icon: Music, color: "text-purple-500" },
  { name: "Gaming", icon: Gamepad2, color: "text-green-500" },
  { name: "Movies", icon: Film, color: "text-blue-500" },
  { name: "News", icon: Newspaper, color: "text-red-500" },
  { name: "Learning", icon: Lightbulb, color: "text-yellow-500" },
  { name: "Sports", icon: Dumbbell, color: "text-cyan-500" },
  { name: "Tech", icon: Code, color: "text-pink-500" },
];

const trendingHashtags = [
  { tag: "WebDevelopment", posts: "2.5M", trending: true },
  { tag: "AI", posts: "5.8M", trending: true },
  { tag: "Gaming", posts: "3.2M", trending: false },
  { tag: "Music2024", posts: "1.9M", trending: true },
  { tag: "Tutorial", posts: "4.1M", trending: false },
  { tag: "TechNews", posts: "2.3M", trending: true },
];

const trendingCreators = [
  { name: "Tech Master", followers: "2.1M", avatar: "TM" },
  { name: "Code Wizard", followers: "1.5M", avatar: "CW" },
  { name: "Design Pro", followers: "980K", avatar: "DP" },
];

const trendingPosts = [
  {
    id: "t1",
    title: "Most Viral Post of the Week - You Won't Believe This!",
    content: "This post has taken the internet by storm! Discover why everyone is talking about this incredible story...",
    author: "Viral Posts",
    likes: "5.2K",
    comments: "890",
    timestamp: "1 day ago",
    image: "🔥",
  },
  {
    id: "t2",
    title: "Breaking: Major Tech Announcement Changed Everything",
    content: "The tech world is buzzing with this groundbreaking announcement that will shape the future of development...",
    author: "Tech News Daily",
    likes: "3.8K",
    comments: "567",
    timestamp: "6 hours ago",
    image: "📢",
  },
  {
    id: "t3",
    title: "Epic Gaming Moments Compilation 2024",
    content: "The most incredible gaming moments captured this year. From clutch plays to hilarious fails...",
    author: "Gaming Legends",
    likes: "4.1K",
    comments: "678",
    timestamp: "12 hours ago",
    image: "🎮",
  },
  {
    id: "t4",
    title: "Mind-Blowing Science Experiment Goes Viral",
    content: "This amazing science experiment has captured everyone's attention with its surprising results...",
    author: "Science Hub",
    likes: "2.9K",
    comments: "345",
    timestamp: "2 days ago",
    image: "🔬",
  },
  {
    id: "t5",
    title: "Ultimate Productivity Hacks for Developers",
    content: "Transform your workflow with these essential productivity tips that every developer should know...",
    author: "Developer Tips",
    likes: "1.8K",
    comments: "234",
    timestamp: "3 days ago",
    image: "⚡",
  },
  {
    id: "t6",
    title: "AI Revolution: What's Coming in 2025",
    content: "Explore the future of AI and how it will transform the way we work, create, and innovate...",
    author: "Future Tech",
    likes: "6.2K",
    comments: "1.1K",
    timestamp: "5 hours ago",
    image: "🤖",
  },
];

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Explore</h1>
            <p className="text-muted-foreground">Discover trending content across all categories</p>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search trending topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter size={18} />
            </Button>
            <Button variant="outline">
              <Calendar size={18} className="mr-2" />
              Today
            </Button>
            <Button variant="outline">
              <Eye size={18} className="mr-2" />
              Most Viewed
            </Button>
          </div>

          {/* Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Card
                key={category.name}
                className="p-4 gradient-card cursor-pointer hover:scale-105 transition-smooth group"
              >
                <category.icon className={`mx-auto mb-2 ${category.color} group-hover:scale-110 transition-smooth`} size={32} />
                <p className="text-center text-sm font-medium">{category.name}</p>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="foryou" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="foryou">For You</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
              <TabsTrigger value="gaming">Gaming</TabsTrigger>
              <TabsTrigger value="tech">Tech</TabsTrigger>
            </TabsList>

            <TabsContent value="foryou" className="space-y-4">
              <div className="max-w-3xl mx-auto space-y-1">
                {trendingPosts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trending" className="space-y-4">
              <div className="max-w-3xl mx-auto space-y-1">
                {trendingPosts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="music">
              <div className="max-w-3xl mx-auto space-y-1">
                {trendingPosts.slice(0, 3).map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gaming">
              <div className="max-w-3xl mx-auto space-y-1">
                {trendingPosts.slice(1, 4).map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tech">
              <div className="max-w-3xl mx-auto space-y-1">
                {trendingPosts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block space-y-6">
          {/* Trending Hashtags */}
          <Card className="p-4 gradient-card">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Hash size={18} className="text-primary" />
              Trending Hashtags
            </h3>
            <div className="space-y-3">
              {trendingHashtags.map((hashtag) => (
                <div
                  key={hashtag.tag}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">#{hashtag.tag}</p>
                      {hashtag.trending && (
                        <TrendingUp size={14} className="text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {hashtag.posts} posts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Trending Creators */}
          <Card className="p-4 gradient-card">
            <h3 className="font-semibold mb-4">Trending Creators</h3>
            <div className="space-y-3">
              {trendingCreators.map((creator) => (
                <div
                  key={creator.name}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {creator.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{creator.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {creator.followers} followers
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Categories Quick Access */}
          <Card className="p-4 gradient-card">
            <h3 className="font-semibold mb-4">Quick Access</h3>
            <div className="space-y-2">
              {categories.slice(0, 4).map((category) => (
                <Button
                  key={category.name}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <category.icon className={`mr-2 ${category.color}`} size={18} />
                  {category.name}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
