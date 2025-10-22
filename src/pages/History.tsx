import { useState, useEffect } from "react";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Search, AlertCircle, History as HistoryIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchHistory, clearHistory, type Post } from "@/lib/data-utils";
import { getCurrentUser } from "@/lib/supabase";
import { toast } from "sonner";

export default function History() {
  const [historyPosts, setHistoryPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await getCurrentUser();
      if (!user) {
        setError('Please sign in to view history');
        return;
      }
      
      const data = await fetchHistory(user.id);
      setHistoryPosts(data);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to permanently delete all your browsing history? This action cannot be undone.')) {
      return;
    }

    try {
      setClearing(true);
      const user = await getCurrentUser();
      if (!user) {
        toast.error('Please sign in first');
        return;
      }

      const success = await clearHistory(user.id);
      if (success) {
        setHistoryPosts([]);
        toast.success('History permanently cleared');
      } else {
        toast.error('Failed to clear history');
      }
    } catch (err) {
      console.error('Error clearing history:', err);
      toast.error('Failed to clear history');
    } finally {
      setClearing(false);
    }
  };

  const filteredPosts = historyPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">View History</h1>
            <p className="text-muted-foreground">
              {loading ? 'Loading...' : `${historyPosts.length} items in history`}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search history..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={handleClearAll}
              disabled={clearing || historyPosts.length === 0}
            >
              <Trash2 size={18} className="mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            <div className="max-w-3xl mx-auto space-y-1">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 bg-card rounded-lg space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <HistoryIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">No history found</p>
                  <p className="text-sm mt-2">Your viewing history will appear here</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    content={post.content}
                    author={post.author}
                    likes={post.likes.toString()}
                    comments={post.comments_count.toString()}
                    timestamp={new Date(post.created_at).toLocaleDateString()}
                    image={post.media_url}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="today">
            <div className="max-w-3xl mx-auto space-y-1">
              {/* Implement time-based filtering */}
              <p className="text-center text-muted-foreground py-8">Today's history</p>
            </div>
          </TabsContent>

          <TabsContent value="week">
            <div className="max-w-3xl mx-auto space-y-1">
              <p className="text-center text-muted-foreground py-8">This week's history</p>
            </div>
          </TabsContent>

          <TabsContent value="month">
            <div className="max-w-3xl mx-auto space-y-1">
              <p className="text-center text-muted-foreground py-8">This month's history</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
