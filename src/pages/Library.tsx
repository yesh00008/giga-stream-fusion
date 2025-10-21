import { Clock, ThumbsUp, PlaySquare, Download, Folder } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const recentPosts = [
  { id: "1", title: "React Advanced Patterns", content: "Deep dive into advanced React patterns including render props, HOCs, and compound components...", author: "Tech Master", likes: "1.2K", comments: "89", timestamp: "2 days ago", image: "⚛️" },
  { id: "2", title: "CSS Grid Complete Guide", content: "Master CSS Grid with this comprehensive guide covering all properties and real-world examples...", author: "Design Pro", likes: "850", comments: "45", timestamp: "1 week ago", image: "🎨" },
  { id: "3", title: "TypeScript Best Practices", content: "Learn the best practices for TypeScript including type safety, generics, and advanced types...", author: "Code Academy", likes: "620", comments: "34", timestamp: "3 days ago", image: "📘" },
];

const savedPosts = [
  { id: "4", title: "Build a Full Stack App", content: "Complete guide to building a full stack application with React, Node.js, and MongoDB...", author: "Developer Hub", likes: "2.1K", comments: "156", timestamp: "4 days ago", image: "🚀" },
  { id: "5", title: "Advanced Node.js", content: "Explore advanced Node.js concepts including streams, clusters, and performance optimization...", author: "Backend Pro", likes: "1.5K", comments: "98", timestamp: "5 days ago", image: "💚" },
];

const bookmarkedPosts = [
  { id: "6", title: "JavaScript ES2024 Features", content: "Discover the latest JavaScript features and how to use them in your projects...", author: "JS Expert", likes: "920", comments: "67", timestamp: "1 week ago", image: "✨" },
  { id: "7", title: "Docker Tutorial", content: "Complete Docker tutorial from basics to advanced containerization techniques...", author: "DevOps Master", likes: "780", comments: "52", timestamp: "2 weeks ago", image: "🐳" },
];

export default function Library() {
  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Library</h1>

        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto grid grid-cols-2 sm:flex gap-1">
            <TabsTrigger value="recent" className="text-xs sm:text-sm gap-1 sm:gap-2">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Recent</span>
            </TabsTrigger>
            <TabsTrigger value="watchlater" className="text-xs sm:text-sm gap-1 sm:gap-2">
              <PlaySquare className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Saved</span>
            </TabsTrigger>
            <TabsTrigger value="liked" className="text-xs sm:text-sm gap-1 sm:gap-2">
              <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Liked</span>
            </TabsTrigger>
            <TabsTrigger value="downloads" className="text-xs sm:text-sm gap-1 sm:gap-2">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Bookmarked</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Recently Viewed
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {recentPosts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="watchlater">
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <PlaySquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Saved Posts ({savedPosts.length})
              </h2>
              <div className="max-w-3xl mx-auto space-y-1">
                {savedPosts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="liked">
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Liked Posts
              </h2>
              <div className="max-w-3xl mx-auto space-y-1">
                {recentPosts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="downloads">
            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Bookmarked Posts ({bookmarkedPosts.length})
              </h2>
              <div className="max-w-3xl mx-auto space-y-1">
                {bookmarkedPosts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
