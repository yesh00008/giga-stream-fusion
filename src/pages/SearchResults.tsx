import { useSearchParams } from "react-router-dom";
import { PostCard } from "@/components/PostCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const searchResults = {
  posts: [
    { id: "1", title: "React Tutorial for Beginners", content: "Learn React from scratch with this comprehensive beginner-friendly guide...", author: "Code Academy", likes: "1.2K", comments: "89", timestamp: "2 days ago", image: "⚛️" },
    { id: "2", title: "Advanced React Patterns", content: "Master advanced React patterns including hooks, context, and custom implementations...", author: "Tech Master", likes: "850", comments: "67", timestamp: "1 week ago", image: "🚀" },
    { id: "3", title: "React Performance Optimization", content: "Discover techniques to optimize your React applications for better performance...", author: "Developer Pro", likes: "620", comments: "45", timestamp: "3 days ago", image: "⚡" },
  ],
  authors: [
    { id: 1, name: "React Academy", followers: "2.5M", posts: 342, avatar: "RA" },
    { id: 2, name: "Frontend Masters", followers: "1.8M", posts: 215, avatar: "FM" },
  ],
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-3 sm:p-6">
        <h1 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
          Search results for: <span className="text-primary">"{query}"</span>
        </h1>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto grid grid-cols-3 sm:flex">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="videos" className="text-xs sm:text-sm">Posts</TabsTrigger>
            <TabsTrigger value="channels" className="text-xs sm:text-sm">Authors</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 sm:space-y-6">
            {/* Authors */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Authors</h2>
              <div className="space-y-3 sm:space-y-4">
                {searchResults.authors.map((author) => (
                  <div key={author.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg border border-border">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                      <AvatarFallback className="gradient-primary text-white text-lg sm:text-xl">{author.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{author.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {author.followers} followers • {author.posts} posts
                      </p>
                    </div>
                    <Button variant="gradient" size="sm" className="flex-shrink-0 h-8 sm:h-9 text-xs sm:text-sm">
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Posts */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Posts</h2>
              <div className="max-w-3xl mx-auto space-y-1">
                {searchResults.posts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="max-w-3xl mx-auto space-y-1">
              {searchResults.posts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="channels">
            <div className="space-y-3 sm:space-y-4">
              {searchResults.authors.map((author) => (
                <div key={author.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg border border-border">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                    <AvatarFallback className="gradient-primary text-white text-lg sm:text-xl">{author.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">{author.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {author.followers} followers • {author.posts} posts
                    </p>
                  </div>
                  <Button variant="gradient" size="sm" className="flex-shrink-0 h-8 sm:h-9 text-xs sm:text-sm">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
