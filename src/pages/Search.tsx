import { useState } from "react";
import { Search as SearchIcon, Filter, TrendingUp, Clock, Users, Video, Hash, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const trendingSearches = [
  { query: "React Tutorial", count: "2.5M" },
  { query: "JavaScript Tips", count: "1.8M" },
  { query: "Web Development", count: "3.2M" },
  { query: "TypeScript Guide", count: "1.5M" },
  { query: "Next.js 14", count: "890K" },
];

const recentSearches = [
  "Advanced React Patterns",
  "CSS Grid Tutorial",
  "Node.js Best Practices",
  "TypeScript for Beginners",
];

const popularChannels = [
  { name: "Tech Tutorials", subscribers: "1.2M", avatar: "TT", verified: true },
  { name: "Code Masters", subscribers: "890K", avatar: "CM", verified: true },
  { name: "Dev Tips", subscribers: "650K", avatar: "DT", verified: false },
  { name: "Web Dev Pro", subscribers: "2.1M", avatar: "WD", verified: true },
];

const popularHashtags = [
  { tag: "#WebDevelopment", posts: "45.2K" },
  { tag: "#JavaScript", posts: "32.8K" },
  { tag: "#ReactJS", posts: "28.5K" },
  { tag: "#Programming", posts: "51.3K" },
  { tag: "#CodingLife", posts: "18.7K" },
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [recentSearchList, setRecentSearchList] = useState(recentSearches);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Add to recent searches
      setRecentSearchList([searchQuery, ...recentSearchList.slice(0, 9)]);
    }
  };

  const removeRecentSearch = (index: number) => {
    setRecentSearchList(recentSearchList.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Search Header */}
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search for videos, channels, hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-12 text-base border-2 focus-visible:ring-2"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setSearchQuery("")}
              >
                <X size={18} />
              </Button>
            )}
          </form>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("all")}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={activeFilter === "videos" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("videos")}
              className="rounded-full"
            >
              <Video size={14} className="mr-1" />
              Videos
            </Button>
            <Button
              variant={activeFilter === "channels" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("channels")}
              className="rounded-full"
            >
              <Users size={14} className="mr-1" />
              Channels
            </Button>
            <Button
              variant={activeFilter === "hashtags" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("hashtags")}
              className="rounded-full"
            >
              <Hash size={14} className="mr-1" />
              Hashtags
            </Button>
            <Button variant="outline" size="sm" className="rounded-full ml-auto">
              <Filter size={14} className="mr-1" />
              Filters
            </Button>
          </div>
        </div>

        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="discover" className="flex-1">Discover</TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="mt-6 space-y-6">
            {/* Trending Searches */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Trending Searches</h2>
              </div>
              <div className="space-y-2">
                {trendingSearches.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(item.query)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors">
                        {index + 1}
                      </span>
                      <div className="text-left">
                        <p className="font-medium">{item.query}</p>
                        <p className="text-xs text-muted-foreground">{item.count} searches</p>
                      </div>
                    </div>
                    <SearchIcon size={18} className="text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Popular Channels */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Popular Channels</h2>
              </div>
              <div className="space-y-2">
                {popularChannels.map((channel, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {channel.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="font-medium">{channel.name}</p>
                          {channel.verified && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{channel.subscribers} subscribers</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full">
                      Subscribe
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Popular Hashtags */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Hash size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Popular Hashtags</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {popularHashtags.map((hashtag, index) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(hashtag.tag)}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="text-left">
                      <p className="font-medium text-primary">{hashtag.tag}</p>
                      <p className="text-xs text-muted-foreground">{hashtag.posts} posts</p>
                    </div>
                    <TrendingUp size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            {recentSearchList.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={20} className="text-primary" />
                    <h2 className="text-lg font-semibold">Recent Searches</h2>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRecentSearchList([])}
                  >
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2">
                  {recentSearchList.map((search, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors group"
                    >
                      <button
                        onClick={() => setSearchQuery(search)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <Clock size={16} className="text-muted-foreground" />
                        <p className="font-medium">{search}</p>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeRecentSearch(index)}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No recent searches</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
