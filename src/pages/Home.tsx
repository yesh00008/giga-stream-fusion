import { useState, useEffect } from "react";
import { PostCard } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { toggleLike, toggleRetweet, toggleBookmark, incrementShareCount, getPosts } from "@/lib/interaction-service";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Sparkles, Video, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

interface Post {
  id: string;
  content: string;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  retweets_count: number;
  shares_count: number;
  views_count?: number;
  post_type?: string;
  profiles: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    badge_type: string | null;
    verified?: boolean;
  };
  is_liked?: boolean;
  is_retweeted?: boolean;
  is_bookmarked?: boolean;
}

interface Reel {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  shares_count: number;
  user_id: string;
  profiles: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string | null;
    verified?: boolean;
  };
  is_liked?: boolean;
}

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [followingPosts, setFollowingPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [reelsLoading, setReelsLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("for-you");

  useEffect(() => {
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch posts with explicit profile join to avoid Anonymous users
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            badge_type,
            verified
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      // Get user's interactions if logged in
      let userLikes: string[] = [];
      let userBookmarks: string[] = [];
      let userRetweets: string[] = [];
      
      if (user?.id) {
        const [likes, bookmarks, retweets] = await Promise.all([
          supabase.from('post_likes').select('post_id').eq('user_id', user.id),
          supabase.from('bookmarks').select('post_id').eq('user_id', user.id),
          supabase.from('retweets').select('post_id').eq('user_id', user.id),
        ]);
        
        userLikes = likes.data?.map(l => l.post_id) || [];
        userBookmarks = bookmarks.data?.map(b => b.post_id) || [];
        userRetweets = retweets.data?.map(r => r.post_id) || [];
      }

      const postsWithStatus = (postsData || []).map(post => ({
        ...post,
        is_liked: userLikes.includes(post.id),
        is_bookmarked: userBookmarks.includes(post.id),
        is_retweeted: userRetweets.includes(post.id),
      }));
      
      setPosts(postsWithStatus);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadReels = async () => {
    if (reels.length > 0) return; // Already loaded
    
    try {
      setReelsLoading(true);
      
      const { data, error } = await supabase
        .from('reels')
        .select(`
          *,
          profiles!reels_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            verified
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get user's liked reels if logged in
      let likedReelIds: string[] = [];
      if (user?.id) {
        const { data: likes } = await supabase
          .from('reel_likes')
          .select('reel_id')
          .eq('user_id', user.id);
        
        likedReelIds = likes?.map(l => l.reel_id) || [];
      }

      const reelsWithStatus = data?.map(reel => ({
        ...reel,
        is_liked: likedReelIds.includes(reel.id)
      })) || [];

      setReels(reelsWithStatus);
    } catch (err) {
      console.error('Error loading reels:', err);
      toast({
        title: "Error",
        description: "Failed to load reels",
        variant: "destructive",
      });
    } finally {
      setReelsLoading(false);
    }
  };

  const loadTrendingPosts = async () => {
    if (trendingPosts.length > 0) return; // Already loaded
    
    try {
      setTrendingLoading(true);
      
      // Fetch posts with highest engagement (likes + comments + retweets)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            badge_type,
            verified
          )
        `)
        .order('likes_count', { ascending: false })
        .limit(30);

      if (error) throw error;

      // Get user's interactions if logged in
      let userLikes: string[] = [];
      let userBookmarks: string[] = [];
      let userRetweets: string[] = [];
      
      if (user?.id) {
        const [likes, bookmarks, retweets] = await Promise.all([
          supabase.from('post_likes').select('post_id').eq('user_id', user.id),
          supabase.from('bookmarks').select('post_id').eq('user_id', user.id),
          supabase.from('retweets').select('post_id').eq('user_id', user.id),
        ]);
        
        userLikes = likes.data?.map(l => l.post_id) || [];
        userBookmarks = bookmarks.data?.map(b => b.post_id) || [];
        userRetweets = retweets.data?.map(r => r.post_id) || [];
      }

      const postsWithStatus = data?.map(post => ({
        ...post,
        is_liked: userLikes.includes(post.id),
        is_bookmarked: userBookmarks.includes(post.id),
        is_retweeted: userRetweets.includes(post.id),
      })) || [];

      setTrendingPosts(postsWithStatus);
    } catch (err) {
      console.error('Error loading trending posts:', err);
      toast({
        title: "Error",
        description: "Failed to load trending posts",
        variant: "destructive",
      });
    } finally {
      setTrendingLoading(false);
    }
  };

  const loadFollowingPosts = async () => {
    if (!user) return;
    if (followingPosts.length > 0) return; // Already loaded
    
    try {
      setFollowingLoading(true);
      
      // Get list of users the current user follows
      const { data: following } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = following?.map(f => f.following_id) || [];

      if (followingIds.length === 0) {
        setFollowingPosts([]);
        return;
      }

      // Fetch posts from followed users
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            badge_type,
            verified
          )
        `)
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get user's interactions
      const [likes, bookmarks, retweets] = await Promise.all([
        supabase.from('post_likes').select('post_id').eq('user_id', user.id),
        supabase.from('bookmarks').select('post_id').eq('user_id', user.id),
        supabase.from('retweets').select('post_id').eq('user_id', user.id),
      ]);
      
      const userLikes = likes.data?.map(l => l.post_id) || [];
      const userBookmarks = bookmarks.data?.map(b => b.post_id) || [];
      const userRetweets = retweets.data?.map(r => r.post_id) || [];

      const postsWithStatus = data?.map(post => ({
        ...post,
        is_liked: userLikes.includes(post.id),
        is_bookmarked: userBookmarks.includes(post.id),
        is_retweeted: userRetweets.includes(post.id),
      })) || [];

      setFollowingPosts(postsWithStatus);
    } catch (err) {
      console.error('Error loading following posts:', err);
      toast({
        title: "Error",
        description: "Failed to load posts from people you follow",
        variant: "destructive",
      });
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Lazy load content when tab is opened
    if (value === "reels" && reels.length === 0) {
      loadReels();
    } else if (value === "trending" && trendingPosts.length === 0) {
      loadTrendingPosts();
    } else if (value === "following" && followingPosts.length === 0) {
      loadFollowingPosts();
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
  
  const renderPostsList = (postsList: Post[], isLoading: boolean) => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="p-4 border-b border-border/50 space-y-3">
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
      ));
    }

    if (postsList.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground border-b border-border/50">
          <p className="text-lg">No posts yet</p>
          <p className="text-sm mt-2">Be the first to create content!</p>
        </div>
      );
    }

    return postsList.map((post, index) => (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.2, 
          delay: Math.min(index * 0.02, 0.15),
          ease: 'easeOut'
        }}
      >
        <PostCard
          id={post.id}
          title=""
          content={post.content}
          author={post.profiles?.full_name || post.profiles?.username || 'User'}
          authorUsername={post.profiles?.username || ''}
          authorAvatar={post.profiles?.avatar_url || undefined}
          authorBadge={post.profiles?.badge_type}
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
      </motion.div>
    ));
  };

  const renderReelCard = (reel: Reel) => (
    <motion.div
      key={reel.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
      onClick={() => navigate(`/reels/${reel.id}`)}
    >
      <div className="relative aspect-[9/16] bg-muted">
        {reel.thumbnail_url ? (
          <img 
            src={reel.thumbnail_url} 
            alt={reel.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={reel.profiles.avatar_url || '/default-avatar.png'}
              alt={reel.profiles.username}
              className="w-8 h-8 rounded-full border-2 border-white"
            />
            <span className="text-white text-sm font-medium truncate">
              {reel.profiles.username}
            </span>
          </div>
          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
            {reel.title}
          </h3>
          <div className="flex items-center gap-4 text-white/90 text-xs">
            <span>{(reel.views_count || 0).toLocaleString()} views</span>
            <span>{(reel.likes_count || 0).toLocaleString()} likes</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      className="flex-1 overflow-y-auto pb-20 lg:pb-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="px-3 sm:px-4 md:px-6 py-4 pb-6">
        <div className="max-w-2xl mx-auto border-x border-border/50">
          {/* Header */}
          <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
            <h1 className="text-2xl font-bold">Home</h1>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive border-b border-border/50">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="for-you" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full grid grid-cols-4 h-auto bg-background border-b border-border/50 rounded-none">
              <TabsTrigger 
                value="for-you" 
                className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">For You</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reels"
                className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Reels</span>
              </TabsTrigger>
              <TabsTrigger 
                value="trending"
                className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Trending</span>
              </TabsTrigger>
              <TabsTrigger 
                value="following"
                className="flex items-center gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                disabled={!user}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Following</span>
              </TabsTrigger>
            </TabsList>

            {/* For You Tab */}
            <TabsContent value="for-you" className="mt-0">
              {renderPostsList(posts, loading)}
            </TabsContent>

            {/* Reels Tab */}
            <TabsContent value="reels" className="mt-0">
              {reelsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-[9/16] rounded-lg" />
                    ))}
                  </div>
                ) : reels.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No reels yet</p>
                    <p className="text-sm mt-2">Check back later for video content!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
                    {reels.map(renderReelCard)}
                  </div>
                )}
            </TabsContent>

            {/* Trending Tab */}
            <TabsContent value="trending" className="mt-0">
              {renderPostsList(trendingPosts, trendingLoading)}
            </TabsContent>

            {/* Following Tab */}
            <TabsContent value="following" className="mt-0">
              {!user ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Sign in to see posts from people you follow</p>
                    <Button 
                      className="mt-4"
                      onClick={() => navigate('/login')}
                    >
                      Sign In
                    </Button>
                  </div>
                ) : followingPosts.length === 0 && !followingLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No posts from people you follow</p>
                    <p className="text-sm mt-2">Follow users to see their content here!</p>
                    <Button 
                      className="mt-4"
                      onClick={() => navigate('/explore')}
                    >
                      Discover People
                    </Button>
                  </div>
                ) : (
                  renderPostsList(followingPosts, followingLoading)
                )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
