import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const historyPosts = [
  {
    id: "h1",
    title: "Building a Modern Social Platform with React",
    content: "Complete guide to building a modern social media platform using React, TypeScript, and Tailwind CSS...",
    author: "Tech Tutorials",
    likes: "1.2K",
    comments: "89",
    timestamp: "Viewed 2 hours ago",
    image: "💻",
  },
  {
    id: "h2",
    title: "CSS Grid vs Flexbox - Complete Guide",
    content: "Deep dive into the differences between CSS Grid and Flexbox with practical examples...",
    author: "Design Hub",
    likes: "850",
    comments: "45",
    timestamp: "Viewed yesterday",
    image: "🎨",
  },
  {
    id: "h3",
    title: "TypeScript Advanced Patterns",
    content: "Learn advanced TypeScript patterns including generics, utility types, and type guards...",
    author: "Code Masters",
    likes: "2.1K",
    comments: "156",
    timestamp: "Viewed 2 days ago",
    image: "📘",
  },
];

export default function History() {
  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">View History</h1>
            <p className="text-muted-foreground">Track your browsing activity</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Search history..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Trash2 size={18} className="mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            <div className="max-w-3xl mx-auto space-y-1">
              {historyPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="today">
            <div className="max-w-3xl mx-auto space-y-1">
              {historyPosts.slice(0, 1).map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="week">
            <div className="max-w-3xl mx-auto space-y-1">
              {historyPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="month">
            <div className="max-w-3xl mx-auto space-y-1">
              {historyPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
