import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageCircle, Repeat2, Share2, Image as ImageIcon, Smile, Calendar, MapPin, MoreHorizontal, Bookmark, BarChart3, CheckCircle, Crown, Verified, Home, Compass, PlaySquare, Bell, User, Plus, Search, TrendingUp, Video, Mic, Film, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const tweets = [
  {
    id: 1,
    author: "Tech Tutorials",
    username: "@techtutorials",
    avatar: "TT",
    verified: true,
    isPremium: true,
    content: "Just released a new video on Advanced React Patterns! 🚀 Check it out and let me know what you think. Link in bio 👇",
    timestamp: "2h ago",
    likes: 1234,
    retweets: 456,
    replies: 89,
    views: 15600,
    image: null,
  },
  {
    id: 2,
    author: "Sarah Dev",
    username: "@sarahdev",
    avatar: "SD",
    verified: true,
    isPremium: false,
    content: "The new JavaScript features in ES2024 are game-changing! 🔥\n\nAsync generators + pattern matching = 💯\n\n#JavaScript #WebDev",
    timestamp: "4h ago",
    likes: 892,
    retweets: 234,
    replies: 67,
    views: 12400,
    image: null,
  },
  {
    id: 3,
    author: "Code Academy",
    username: "@codeacademy",
    avatar: "CA",
    verified: true,
    isPremium: true,
    content: "🎉 Exciting news! We're launching a new course on Full-Stack Development with Next.js 14.\n\nEarly bird discount available for the next 48 hours! 🚀\n\n#NextJS #WebDev #Coding",
    timestamp: "6h ago",
    likes: 2341,
    retweets: 789,
    replies: 156,
    views: 28900,
    image: null,
  },
  {
    id: 4,
    author: "Dev Daily",
    username: "@devdaily",
    avatar: "DD",
    verified: false,
    isPremium: false,
    content: "Hot take: TypeScript is not just 'JavaScript with types'. It's a completely different way of thinking about code architecture.\n\nChange my mind. 🧠",
    timestamp: "8h ago",
    likes: 567,
    retweets: 123,
    replies: 234,
    views: 8900,
    image: null,
  },
];

const trendingTopics = [
  { topic: "#WebDevelopment", tweets: "45.2K" },
  { topic: "#JavaScript", tweets: "32.8K" },
  { topic: "#ReactJS", tweets: "28.5K" },
  { topic: "#TypeScript", tweets: "21.3K" },
  { topic: "#NextJS", tweets: "18.7K" },
];

const stories = [
  { id: 1, user: "Your Story", avatar: "U", hasStory: false, isYou: true },
  { id: 2, user: "Tech News", avatar: "TN", hasStory: true, isYou: false },
  { id: 3, user: "Code Tips", avatar: "CT", hasStory: true, isYou: false },
  { id: 4, user: "Design Hub", avatar: "DH", hasStory: true, isYou: false },
  { id: 5, user: "Dev Daily", avatar: "DD", hasStory: true, isYou: false },
];

export default function Feed() {
  const [tweetText, setTweetText] = useState("");
  const [activeTab, setActiveTab] = useState("for-you");
  const [showPostDialog, setShowPostDialog] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Main Feed */}
          <div className="lg:col-span-7 xl:col-span-6 border-x border-border/50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full rounded-none bg-transparent border-0 h-auto p-0">
                  <TabsTrigger
                    value="for-you"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-14 font-semibold"
                  >
                    For you
                  </TabsTrigger>
                  <TabsTrigger
                    value="following"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-14 font-semibold"
                  >
                    Following
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Stories Bar */}
            <div className="border-b border-border/50 p-3 overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 min-w-max">
                {stories.map((story) => (
                  <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className={`relative ${
                      story.hasStory ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                    } rounded-full transition-all`}>
                      <Avatar className="w-14 h-14">
                        <AvatarFallback className={story.isYou ? "bg-gradient-to-br from-primary to-accent text-white" : "bg-card"}>
                          {story.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {story.isYou && (
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                          <Plus size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-center max-w-[64px] truncate">{story.user}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tweet Composer */}
            <div className="border-b border-border/50 p-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">U</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <textarea
                    placeholder="What's happening?!"
                    value={tweetText}
                    onChange={(e) => setTweetText(e.target.value)}
                    className="w-full min-h-24 bg-transparent border-0 focus:outline-none resize-none text-lg placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10">
                        <ImageIcon size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10">
                        <Smile size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10">
                        <Calendar size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-primary hover:bg-primary/10">
                        <MapPin size={18} />
                      </Button>
                    </div>
                    <Button
                      disabled={!tweetText.trim()}
                      className="rounded-full px-6 font-semibold"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed */}
            <div className="divide-y divide-border/50">
              {tweets.map((tweet) => (
                  <div key={tweet.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-card">{tweet.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 flex-wrap mb-1">
                          <span className="font-semibold hover:underline">{tweet.author}</span>
                          {tweet.verified && (
                            <CheckCircle size={16} className="text-primary" fill="currentColor" />
                          )}
                          {tweet.isPremium && (
                            <Badge className="h-4 px-1 text-[9px] bg-gradient-to-r from-yellow-500 to-amber-600">
                              <Crown size={10} />
                            </Badge>
                          )}
                          <span className="text-muted-foreground text-sm">
                            {tweet.username} · {tweet.timestamp}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base mb-3 whitespace-pre-wrap leading-relaxed">
                          {tweet.content}
                        </p>
                        {tweet.image && (
                          <div className="rounded-2xl overflow-hidden border border-border/50 mb-3">
                            <div className="w-full aspect-video bg-muted" />
                          </div>
                        )}
                        <div className="flex items-center justify-between max-w-md text-muted-foreground">
                          <button className="flex items-center gap-2 hover:text-primary group transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                              <MessageCircle size={16} />
                            </div>
                            <span className="text-xs">{tweet.replies}</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-green-600 group transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-green-600/10 transition-colors">
                              <Repeat2 size={16} />
                            </div>
                            <span className="text-xs">{tweet.retweets}</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-red-600 group transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-red-600/10 transition-colors">
                              <ThumbsUp size={16} />
                            </div>
                            <span className="text-xs">{tweet.likes}</span>
                          </button>
                          <button className="flex items-center gap-2 hover:text-gray-600 group transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-gray-600/10 transition-colors">
                              <ThumbsDown size={16} />
                            </div>
                          </button>
                          <button className="flex items-center gap-2 hover:text-primary group transition-colors">
                            <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                              <BarChart3 size={16} />
                            </div>
                            <span className="text-xs">{tweet.views.toLocaleString()}</span>
                          </button>
                          <div className="flex items-center gap-1">
                            <button className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                              <Bookmark size={16} />
                            </button>
                            <button className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                              <Share2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 p-4 space-y-4">
            {/* Search */}
            <div className="sticky top-0 bg-background pb-4">
              <div className="relative">
                <Input
                  placeholder="Search Twitter"
                  className="pl-12 bg-muted/50 border-0 rounded-full h-11 focus-visible:ring-1"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Subscribe */}
            <div className="border border-border/50 rounded-2xl p-4 bg-muted/20">
              <h2 className="text-xl font-bold mb-3">Subscribe to Premium</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Subscribe to unlock new features and if eligible, receive a share of ads revenue.
              </p>
              <Button className="rounded-full font-semibold">
                <Crown size={16} className="mr-2" />
                Subscribe
              </Button>
            </div>

            {/* Trending */}
            <div className="border border-border/50 rounded-2xl overflow-hidden bg-muted/20">
              <div className="p-4">
                <h2 className="text-xl font-bold">Trends for you</h2>
              </div>
              <div className="divide-y divide-border/50">
                {trendingTopics.map((trend, index) => (
                  <div
                    key={index}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-0.5">Trending in Tech</p>
                        <p className="font-semibold text-sm mb-0.5">{trend.topic}</p>
                        <p className="text-xs text-muted-foreground">{trend.tweets} posts</p>
                      </div>
                      <button className="h-8 w-8 -mt-1 flex items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full p-4 text-sm text-primary hover:bg-muted/50 transition-colors text-left">
                Show more
              </button>
            </div>

            {/* Who to follow */}
            <div className="border border-border/50 rounded-2xl overflow-hidden bg-muted/20">
              <div className="p-4">
                <h2 className="text-xl font-bold">Who to follow</h2>
              </div>
              <div className="divide-y divide-border/50">
                {[
                  { name: "React Dev", username: "@reactdev", avatar: "RD", verified: true },
                  { name: "TypeScript", username: "@typescript", avatar: "TS", verified: true },
                  { name: "Next.js", username: "@nextjs", avatar: "NJ", verified: true },
                ].map((user, index) => (
                  <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-card">{user.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="font-semibold text-sm hover:underline cursor-pointer">
                              {user.name}
                            </p>
                            {user.verified && (
                              <CheckCircle size={14} className="text-primary" fill="currentColor" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{user.username}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-full px-4">
                        Follow
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full p-4 text-sm text-primary hover:bg-muted/50 transition-colors text-left">
                Show more
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
