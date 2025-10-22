import { useState, useEffect } from "react";
import { PostCard } from "@/components/PostCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { toggleLike, toggleRetweet, toggleBookmark, incrementShareCount, getPosts } from "@/lib/interaction-service";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = ["All", "Music", "Gaming", "Tech", "Cooking", "Sports", "News", "Education"];

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  retweets_count: number;
  shares_count: number;
  profiles: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    badge_type: string | null;
  };
  is_liked?: boolean;
  is_retweeted?: boolean;
  is_bookmarked?: boolean;
}

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    loadPosts();
  }, [user]); // Remove activeCategory dependency for now

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch latest posts from database using interaction-service
      const data = await getPosts(user?.id, 50);
      
      setPosts(data);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }

    // Optimistic update
    const previousPosts = [...posts];
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const wasLiked = post.is_liked;
        return {
          ...post,
          is_liked: !wasLiked,
          likes_count: wasLiked ? post.likes_count - 1 : post.likes_count + 1
        };
      }
      return post;
    }));

    try {
      await toggleLike(postId, user.id);
    } catch (error) {
      // Rollback on error
      setPosts(previousPosts);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRetweet = async (postId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to retweet",
        variant: "destructive",
      });
      return;
    }

    // Optimistic update
    const previousPosts = [...posts];
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const wasRetweeted = post.is_retweeted;
        return {
          ...post,
          is_retweeted: !wasRetweeted,
          retweets_count: wasRetweeted ? post.retweets_count - 1 : post.retweets_count + 1
        };
      }
      return post;
    }));

    try {
      await toggleRetweet(postId, user.id);
    } catch (error) {
      // Rollback on error
      setPosts(previousPosts);
      toast({
        title: "Error",
        description: "Failed to update retweet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to bookmark posts",
        variant: "destructive",
      });
      return;
    }

    // Optimistic update
    const previousPosts = [...posts];
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          is_bookmarked: !post.is_bookmarked
        };
      }
      return post;
    }));

    try {
      await toggleBookmark(postId, user.id);
    } catch (error) {
      // Rollback on error
      setPosts(previousPosts);
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      const shareUrl = `${window.location.origin}/post/${postId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post?.profiles.full_name}`,
          text: post?.content,
          url: shareUrl,
        });
        
        // Increment share count after successful share
        await incrementShareCount(postId);
        
        // Update local state
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, shares_count: p.shares_count + 1 }
            : p
        ));
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Post link copied to clipboard",
        });
        
        // Still increment share count
        await incrementShareCount(postId);
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, shares_count: p.shares_count + 1 }
            : p
        ));
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="px-3 sm:px-4 md:px-6 py-4 pb-6">
        <div className="mb-4 sm:mb-6 overflow-x-auto scrollbar-hide">
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="mb-4 sm:mb-6 bg-transparent justify-start w-max gap-1 p-0 h-auto border-b border-border rounded-none">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground text-sm px-4 py-2 font-medium transition-all rounded-none bg-transparent shadow-none"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="max-w-3xl mx-auto space-y-1">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
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
                <div className="flex gap-4 pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No posts yet</p>
              <p className="text-sm mt-2">Be the first to create content!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                title=""
                content={post.content}
                author={post.profiles.full_name || 'Anonymous'}
                authorUsername={post.profiles.username}
                authorAvatar={post.profiles.avatar_url || undefined}
                likes={(post.likes_count || 0).toString()}
                comments={(post.comments_count || 0).toString()}
                retweets={(post.retweets_count || 0).toString()}
                shares={(post.shares_count || 0).toString()}
                timestamp={new Date(post.created_at).toLocaleDateString()}
                image={post.image_url || undefined}
                isLiked={post.is_liked}
                isRetweeted={post.is_retweeted}
                isBookmarked={post.is_bookmarked}
                onLike={handleLike}
                onRetweet={handleRetweet}
                onBookmark={handleBookmark}
                onShare={handleShare}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
