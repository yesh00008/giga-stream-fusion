import { useState, useEffect } from "react";
import { Search as SearchIcon, User, Hash, FileText, Video, Loader2, UserPlus, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { VerificationBadge } from "@/components/VerificationBadge";
import { PostCard } from "@/components/PostCard";

export default function Search() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [postResults, setPostResults] = useState<any[]>([]);
  const [hashtagResults, setHashtagResults] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [followingUsers, setFollowingUsers] = useState<string[]>([]);

  useEffect(() => {
    loadTrendingContent();
    if (user?.id) {
      loadFollowingUsers();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setUserResults([]);
      setPostResults([]);
      setHashtagResults([]);
    }
  }, [searchQuery]);

  const loadFollowingUsers = async () => {
    if (!user?.id) return;
    
    try {
      const { data } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', user.id);
      
      setFollowingUsers(data?.map(f => f.following_id) || []);
    } catch (error) {
      console.error('Error loading following:', error);
    }
  };

  const loadTrendingContent = async () => {
    try {
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url,
            badge_type
          )
        `)
        .order('likes_count', { ascending: false })
        .limit(10);

      if (posts) {
        setTrendingPosts(posts);
      }
    } catch (error) {
      console.error('Error loading trending:', error);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const query = searchQuery.toLowerCase().trim();

      // Search Users by username and full_name
      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20);

      setUserResults(users || []);

      // Search Posts by content
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url,
            badge_type
          )
        `)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      setPostResults(posts || []);

      // Search for hashtags
      if (query.startsWith('#')) {
        const hashtagQuery = query.substring(1);
        const { data: hashtagPosts } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (
              id,
              username,
              full_name,
              avatar_url,
              badge_type
            )
          `)
          .ilike('content', `%#${hashtagQuery}%`)
          .order('created_at', { ascending: false })
          .limit(20);

        setHashtagResults(hashtagPosts || []);
      } else {
        // Find hashtags in content
        const { data: allPosts } = await supabase
          .from('posts')
          .select('content')
          .ilike('content', `%#%`)
          .limit(100);

        const hashtags = new Map<string, number>();
        allPosts?.forEach(post => {
          const tags = post.content.match(/#\w+/g);
          tags?.forEach(tag => {
            const normalizedTag = tag.toLowerCase();
            if (normalizedTag.includes(query)) {
              hashtags.set(normalizedTag, (hashtags.get(normalizedTag) || 0) + 1);
            }
          });
        });

        const hashtagArray = Array.from(hashtags.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setHashtagResults(hashtagArray as any);
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    if (!user?.id) {
      toast.error('Please sign in to follow users');
      return;
    }

    try {
      const isFollowing = followingUsers.includes(targetUserId);

      if (isFollowing) {
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        setFollowingUsers(prev => prev.filter(id => id !== targetUserId));
        toast.success('Unfollowed');
      } else {
        await supabase
          .from('followers')
          .insert([{
            follower_id: user.id,
            following_id: targetUserId
          }]);

        setFollowingUsers(prev => [...prev, targetUserId]);
        toast.success('Following');
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
      toast.error('Action failed. Please try again.');
    }
  };

  const renderUserResult = (profile: any) => {
    const isFollowing = followingUsers.includes(profile.id);
    const isOwnProfile = user?.id === profile.id;

    return (
      <Card 
        key={profile.id}
        className="p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-b-0 rounded-none"
        onClick={() => navigate(`/profile/${profile.username}`)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="w-12 h-12 flex-shrink-0">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                {profile.full_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-sm truncate">{profile.full_name || profile.username}</p>
                {profile.badge_type && (
                  <VerificationBadge type={profile.badge_type} size={14} />
                )}
              </div>
              <p className="text-xs text-muted-foreground">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{profile.bio}</p>
              )}
            </div>
          </div>
          {!isOwnProfile && (
            <Button
              size="sm"
              variant={isFollowing ? "outline" : "default"}
              onClick={(e) => {
                e.stopPropagation();
                handleFollow(profile.id);
              }}
              className="flex-shrink-0"
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20 lg:pb-0">
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search users, posts, hashtags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" size={20} />
            )}
          </div>
        </div>

        {/* Search Results or Trending Content */}
        {searchQuery.trim() ? (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent sticky top-[73px] z-10 bg-background">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
                >
                  <User className="w-4 h-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="posts" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Posts
                </TabsTrigger>
                <TabsTrigger 
                  value="hashtags" 
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
                >
                  <Hash className="w-4 h-4 mr-2" />
                  Tags
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {userResults.length === 0 && postResults.length === 0 && hashtagResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No results found for "{searchQuery}"</p>
                    <p className="text-sm mt-2">Try searching for users, posts, or hashtags</p>
                  </div>
                ) : (
                  <>
                    {userResults.length > 0 && (
                      <div>
                        <div className="px-4 py-3 bg-muted/30">
                          <h3 className="font-semibold text-sm">People</h3>
                        </div>
                        {userResults.slice(0, 5).map(renderUserResult)}
                        {userResults.length > 5 && (
                          <Button
                            variant="ghost"
                            className="w-full rounded-none border-b"
                            onClick={() => setActiveTab('users')}
                          >
                            View all {userResults.length} users
                          </Button>
                        )}
                      </div>
                    )}
                    {postResults.length > 0 && (
                      <div>
                        <div className="px-4 py-3 bg-muted/30">
                          <h3 className="font-semibold text-sm">Posts</h3>
                        </div>
                        {postResults.slice(0, 5).map((post) => (
                          <PostCard
                            key={post.id}
                            id={post.id}
                            title=""
                            content={post.content}
                            author={post.profiles?.full_name || post.profiles?.username || 'Unknown'}
                            authorUsername={post.profiles?.username}
                            authorAvatar={post.profiles?.avatar_url}
                            authorBadge={post.profiles?.badge_type}
                            likes={(post.likes_count || 0).toString()}
                            comments={(post.comments_count || 0).toString()}
                            retweets={(post.retweets_count || 0).toString()}
                            shares={(post.shares_count || 0).toString()}
                            timestamp={new Date(post.created_at).toLocaleDateString()}
                            image={post.image_url}
                          />
                        ))}
                        {postResults.length > 5 && (
                          <Button
                            variant="ghost"
                            className="w-full rounded-none border-b"
                            onClick={() => setActiveTab('posts')}
                          >
                            View all {postResults.length} posts
                          </Button>
                        )}
                      </div>
                    )}
                    {hashtagResults.length > 0 && Array.isArray(hashtagResults) && hashtagResults[0]?.tag && (
                      <div>
                        <div className="px-4 py-3 bg-muted/30">
                          <h3 className="font-semibold text-sm">Hashtags</h3>
                        </div>
                        {hashtagResults.slice(0, 5).map((item: any, index: number) => (
                          <Card
                            key={index}
                            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer border-x-0 border-t-0 last:border-b-0 rounded-none"
                            onClick={() => setSearchQuery(item.tag)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Hash className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">{item.tag}</p>
                                <p className="text-sm text-muted-foreground">{item.count} posts</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                {userResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No users found</p>
                  </div>
                ) : (
                  userResults.map(renderUserResult)
                )}
              </TabsContent>

              <TabsContent value="posts" className="mt-0">
                {postResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No posts found</p>
                  </div>
                ) : (
                  postResults.map((post) => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      title=""
                      content={post.content}
                      author={post.profiles?.full_name || post.profiles?.username || 'Unknown'}
                      authorUsername={post.profiles?.username}
                      authorAvatar={post.profiles?.avatar_url}
                      authorBadge={post.profiles?.badge_type}
                      likes={(post.likes_count || 0).toString()}
                      comments={(post.comments_count || 0).toString()}
                      retweets={(post.retweets_count || 0).toString()}
                      shares={(post.shares_count || 0).toString()}
                      timestamp={new Date(post.created_at).toLocaleDateString()}
                      image={post.image_url}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="hashtags" className="mt-0">
                {hashtagResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Hash className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hashtags found</p>
                  </div>
                ) : Array.isArray(hashtagResults) && hashtagResults[0]?.tag ? (
                  hashtagResults.map((item: any, index: number) => (
                    <Card
                      key={index}
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer border-x-0 border-t-0 last:border-b-0 rounded-none"
                      onClick={() => setSearchQuery(item.tag)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Hash className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{item.tag}</p>
                          <p className="text-sm text-muted-foreground">{item.count} posts</p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  hashtagResults.map((post: any) => (
                    <PostCard
                      key={post.id}
                      id={post.id}
                      title=""
                      content={post.content}
                      author={post.profiles?.full_name || post.profiles?.username || 'Unknown'}
                      authorUsername={post.profiles?.username}
                      authorAvatar={post.profiles?.avatar_url}
                      authorBadge={post.profiles?.badge_type}
                      likes={(post.likes_count || 0).toString()}
                      comments={(post.comments_count || 0).toString()}
                      retweets={(post.retweets_count || 0).toString()}
                      shares={(post.shares_count || 0).toString()}
                      timestamp={new Date(post.created_at).toLocaleDateString()}
                      image={post.image_url}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* Trending Content When No Search */
          <div className="space-y-4">
            <div className="px-4 py-3 bg-muted/30 border-b">
              <h2 className="text-lg font-bold">Trending Posts</h2>
            </div>
            {trendingPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No trending posts yet</p>
              </div>
            ) : (
              trendingPosts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title=""
                  content={post.content}
                  author={post.profiles?.full_name || post.profiles?.username || 'Unknown'}
                  authorUsername={post.profiles?.username}
                  authorAvatar={post.profiles?.avatar_url}
                  authorBadge={post.profiles?.badge_type}
                  likes={(post.likes_count || 0).toString()}
                  comments={(post.comments_count || 0).toString()}
                  retweets={(post.retweets_count || 0).toString()}
                  shares={(post.shares_count || 0).toString()}
                  timestamp={new Date(post.created_at).toLocaleDateString()}
                  image={post.image_url}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
