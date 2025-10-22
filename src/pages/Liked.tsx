import { useState, useEffect } from "react";
import { PostCard } from "@/components/PostCard";
import { Heart, PlayCircle, Share2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchLikedPosts, type Post } from "@/lib/data-utils";
import { getCurrentUser } from "@/lib/supabase";

export default function Liked() {
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLikedPosts();
  }, []);

  const loadLikedPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await getCurrentUser();
      if (!user) {
        setError('Please sign in to view liked posts');
        return;
      }
      
      const data = await fetchLikedPosts(user.id);
      setLikedPosts(data);
    } catch (err) {
      console.error('Error loading liked posts:', err);
      setError('Failed to load liked posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <Heart className="text-red-500 fill-current" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Liked Posts</h1>
              <p className="text-muted-foreground">
                {loading ? 'Loading...' : `${likedPosts.length} posts`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={likedPosts.length === 0}>
              <Share2 className="mr-2" size={18} />
              Share
            </Button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-1">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 bg-card rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))
          ) : likedPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">No liked posts yet</p>
              <p className="text-sm mt-2">Posts you like will appear here</p>
            </div>
          ) : (
            likedPosts.map((post) => (
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
      </div>
    </div>
  );
}
