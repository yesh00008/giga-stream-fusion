import { Bell, Heart, MessageCircle, UserPlus, Check, X, UserCheck, Repeat2, Share2, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface FollowRequest {
  id: string;
  requester_id: string;
  target_id: string;
  status: string;
  created_at: string;
  requester: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    badge_type: string | null;
  };
}

interface Follower {
  id: string;
  follower_id: string;
  created_at: string;
  follower: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    badge_type: string | null;
  };
}

interface LikeNotification {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    badge_type: string | null;
  };
  post: {
    id: string;
    content: string;
    image_url: string | null;
  };
}

interface CommentNotification {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    badge_type: string | null;
  };
  post: {
    id: string;
    content: string;
    image_url: string | null;
  };
}

interface RetweetNotification {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    badge_type: string | null;
  };
  post: {
    id: string;
    content: string;
    image_url: string | null;
  };
}

type AllNotification = {
  type: 'follow_request' | 'follower' | 'like' | 'comment' | 'retweet';
  id: string;
  created_at: string;
  data: FollowRequest | Follower | LikeNotification | CommentNotification | RetweetNotification;
};

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([]);
  const [recentFollowers, setRecentFollowers] = useState<Follower[]>([]);
  const [likes, setLikes] = useState<LikeNotification[]>([]);
  const [comments, setComments] = useState<CommentNotification[]>([]);
  const [retweets, setRetweets] = useState<RetweetNotification[]>([]);
  const [allNotifications, setAllNotifications] = useState<AllNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Fetch all notifications in parallel for speed
      const [
        requestsResult,
        followersResult,
        likesResult,
        commentsResult,
        retweetsResult
      ] = await Promise.all([
        // Follow requests - fetch manually to ensure profiles are loaded
        supabase
          .from('follow_requests')
          .select('*')
          .eq('target_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(50)
          .then(async (result) => {
            if (!result.data || result.data.length === 0) {
              return { ...result, data: [] };
            }
            
            // Manually fetch requester profiles
            const requesterIds = result.data.map(r => r.requester_id);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url, badge_type')
              .in('id', requesterIds);
            
            const profilesMap = new Map(
              (profiles || []).map(p => [p.id, p])
            );
            
            // Attach profiles to requests
            const requestsWithProfiles = result.data.map(request => ({
              ...request,
              requester: profilesMap.get(request.requester_id) || null
            })).filter(r => r.requester !== null);
            
            return { ...result, data: requestsWithProfiles };
          }),

        // Recent followers - fetch manually
        supabase
          .from('followers')
          .select('*')
          .eq('following_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(50)
          .then(async (result) => {
            if (!result.data || result.data.length === 0) {
              return { ...result, data: [] };
            }
            
            // Manually fetch follower profiles
            const followerIds = result.data.map(f => f.follower_id);
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url, badge_type')
              .in('id', followerIds);
            
            const profilesMap = new Map(
              (profiles || []).map(p => [p.id, p])
            );
            
            // Attach profiles to followers
            const followersWithProfiles = result.data.map(follower => ({
              ...follower,
              follower: profilesMap.get(follower.follower_id) || null
            })).filter(f => f.follower !== null);
            
            return { ...result, data: followersWithProfiles };
          }),

        // Likes on user's posts - fetch manually
        supabase
          .from('post_likes')
          .select('*')
          .neq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(100)
          .then(async (result) => {
            if (!result.data || result.data.length === 0) {
              return { ...result, data: [] };
            }
            
            // Get user's posts
            const { data: userPosts } = await supabase
              .from('posts')
              .select('id, content, image_url')
              .eq('user_id', user.id);
            
            const userPostsMap = new Map(
              (userPosts || []).map(p => [p.id, p])
            );
            
            // Filter likes on user's posts
            const likesOnUserPosts = result.data.filter(like => 
              userPostsMap.has(like.post_id)
            );
            
            if (likesOnUserPosts.length === 0) {
              return { ...result, data: [] };
            }
            
            // Fetch user profiles
            const likerIds = [...new Set(likesOnUserPosts.map(l => l.user_id))];
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url, badge_type')
              .in('id', likerIds);
            
            const profilesMap = new Map(
              (profiles || []).map(p => [p.id, p])
            );
            
            // Attach profiles and posts
            const likesWithData = likesOnUserPosts.map(like => ({
              ...like,
              user: profilesMap.get(like.user_id) || null,
              post: userPostsMap.get(like.post_id) || null
            })).filter(l => l.user !== null && l.post !== null);
            
            return { ...result, data: likesWithData.slice(0, 50) };
          }),

        // Comments on user's posts - fetch manually
        supabase
          .from('comments')
          .select('*')
          .neq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(100)
          .then(async (result) => {
            if (!result.data || result.data.length === 0) {
              return { ...result, data: [] };
            }
            
            // Get user's posts
            const { data: userPosts } = await supabase
              .from('posts')
              .select('id, content, image_url')
              .eq('user_id', user.id);
            
            const userPostsMap = new Map(
              (userPosts || []).map(p => [p.id, p])
            );
            
            // Filter comments on user's posts
            const commentsOnUserPosts = result.data.filter(comment => 
              userPostsMap.has(comment.post_id)
            );
            
            if (commentsOnUserPosts.length === 0) {
              return { ...result, data: [] };
            }
            
            // Fetch commenter profiles
            const commenterIds = [...new Set(commentsOnUserPosts.map(c => c.user_id))];
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url, badge_type')
              .in('id', commenterIds);
            
            const profilesMap = new Map(
              (profiles || []).map(p => [p.id, p])
            );
            
            // Attach profiles and posts
            const commentsWithData = commentsOnUserPosts.map(comment => ({
              ...comment,
              user: profilesMap.get(comment.user_id) || null,
              post: userPostsMap.get(comment.post_id) || null
            })).filter(c => c.user !== null && c.post !== null);
            
            return { ...result, data: commentsWithData.slice(0, 50) };
          }),

        // Retweets of user's posts - fetch manually
        supabase
          .from('retweets')
          .select('*')
          .neq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(100)
          .then(async (result) => {
            if (!result.data || result.data.length === 0) {
              return { ...result, data: [] };
            }
            
            // Get user's posts
            const { data: userPosts } = await supabase
              .from('posts')
              .select('id, content, image_url')
              .eq('user_id', user.id);
            
            const userPostsMap = new Map(
              (userPosts || []).map(p => [p.id, p])
            );
            
            // Filter retweets of user's posts
            const retweetsOfUserPosts = result.data.filter(retweet => 
              userPostsMap.has(retweet.post_id)
            );
            
            if (retweetsOfUserPosts.length === 0) {
              return { ...result, data: [] };
            }
            
            // Fetch retweeter profiles
            const retweeterIds = [...new Set(retweetsOfUserPosts.map(r => r.user_id))];
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url, badge_type')
              .in('id', retweeterIds);
            
            const profilesMap = new Map(
              (profiles || []).map(p => [p.id, p])
            );
            
            // Attach profiles and posts
            const retweetsWithData = retweetsOfUserPosts.map(retweet => ({
              ...retweet,
              user: profilesMap.get(retweet.user_id) || null,
              post: userPostsMap.get(retweet.post_id) || null
            })).filter(r => r.user !== null && r.post !== null);
            
            return { ...result, data: retweetsWithData.slice(0, 50) };
          })
      ]);

      // Process results
      const requests = requestsResult.data || [];
      const followers = followersResult.data || [];
      const likesData = likesResult.data || [];
      const commentsData = commentsResult.data || [];
      const retweetsData = retweetsResult.data || [];

      setFollowRequests(requests);
      setRecentFollowers(followers);
      setLikes(likesData);
      setComments(commentsData);
      setRetweets(retweetsData);

      // Combine all notifications and sort by date
      const combined: AllNotification[] = [
        ...requests.map(r => ({ type: 'follow_request' as const, id: r.id, created_at: r.created_at, data: r })),
        ...followers.map(f => ({ type: 'follower' as const, id: f.id, created_at: f.created_at, data: f })),
        ...likesData.map(l => ({ type: 'like' as const, id: l.id, created_at: l.created_at, data: l })),
        ...commentsData.map(c => ({ type: 'comment' as const, id: c.id, created_at: c.created_at, data: c })),
        ...retweetsData.map(r => ({ type: 'retweet' as const, id: r.id, created_at: r.created_at, data: r }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAllNotifications(combined);
      setTotalCount(combined.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleAcceptRequest = async (requestId: string, requesterId: string) => {
    if (!user?.id) return;

    setProcessingRequest(requestId);
    try {
      const { error: updateError } = await supabase
        .from('follow_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      setFollowRequests(prev => prev.filter(req => req.id !== requestId));
      setAllNotifications(prev => prev.filter(n => !(n.type === 'follow_request' && n.id === requestId)));
      toast.success('Follow request accepted');

      await fetchNotifications();
    } catch (error: any) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!user?.id) return;

    setProcessingRequest(requestId);
    try {
      const { error } = await supabase
        .from('follow_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;

      setFollowRequests(prev => prev.filter(req => req.id !== requestId));
      setAllNotifications(prev => prev.filter(n => !(n.type === 'follow_request' && n.id === requestId)));
      toast.success('Follow request rejected');
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleProfileClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const handlePostClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  const renderNotification = (notification: AllNotification) => {
    const { type, data, created_at } = notification;

    switch (type) {
      case 'follow_request': {
        const request = data as FollowRequest;
        return (
          <div
            key={`request-${request.id}`}
            className="flex items-center gap-3 p-3 sm:p-4 bg-card rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-in fade-in slide-in-from-bottom-4"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <UserPlus size={18} className="text-primary" />
            </div>
            <Avatar
              className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 cursor-pointer"
              onClick={() => handleProfileClick(request.requester.username)}
            >
              <AvatarImage src={request.requester.avatar_url} />
              <AvatarFallback className="gradient-primary text-white text-xs sm:text-sm">
                {request.requester.full_name?.[0] || request.requester.username?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base text-foreground">
                <span
                  className="font-semibold hover:underline cursor-pointer"
                  onClick={() => handleProfileClick(request.requester.username)}
                >
                  {request.requester.full_name || request.requester.username}
                </span>
                {' '}requested to follow you
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getTimeAgo(created_at)}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
              <Button
                size="sm"
                onClick={() => handleAcceptRequest(request.id, request.requester_id)}
                disabled={processingRequest === request.id}
                className="h-8 px-3 text-xs sm:text-sm w-full sm:w-auto"
              >
                <Check size={14} className="mr-1" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRejectRequest(request.id)}
                disabled={processingRequest === request.id}
                className="h-8 px-3 text-xs sm:text-sm w-full sm:w-auto"
              >
                <X size={14} className="mr-1" />
                Reject
              </Button>
            </div>
          </div>
        );
      }

      case 'follower': {
        const follower = data as Follower;
        return (
          <div
            key={`follower-${follower.id}`}
            className="flex items-center gap-3 p-3 sm:p-4 bg-card rounded-lg border border-border hover:border-primary transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer animate-in fade-in slide-in-from-bottom-4"
            onClick={() => handleProfileClick(follower.follower.username)}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <UserCheck size={18} className="text-green-500" />
            </div>
            <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
              <AvatarImage src={follower.follower.avatar_url} />
              <AvatarFallback className="gradient-primary text-white text-xs sm:text-sm">
                {follower.follower.full_name?.[0] || follower.follower.username?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base text-foreground">
                <span className="font-semibold">
                  {follower.follower.full_name || follower.follower.username}
                </span>
                {' '}started following you
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getTimeAgo(created_at)}
              </p>
            </div>
          </div>
        );
      }

      case 'like': {
        const like = data as LikeNotification;
        return (
          <div
            key={`like-${like.id}`}
            className="flex items-center gap-3 p-3 sm:p-4 bg-card rounded-lg border border-border hover:border-primary transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer animate-in fade-in slide-in-from-bottom-4"
            onClick={() => handlePostClick(like.post_id)}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Heart size={18} className="text-red-500 fill-red-500" />
            </div>
            <Avatar
              className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleProfileClick(like.user.username);
              }}
            >
              <AvatarImage src={like.user.avatar_url} />
              <AvatarFallback className="gradient-primary text-white text-xs sm:text-sm">
                {like.user.full_name?.[0] || like.user.username?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base text-foreground">
                <span
                  className="font-semibold hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileClick(like.user.username);
                  }}
                >
                  {like.user.full_name || like.user.username}
                </span>
                {' '}liked your post
              </p>
              {like.post.content && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  "{like.post.content}"
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {getTimeAgo(created_at)}
              </p>
            </div>
            {like.post.image_url && (
              <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                <img src={like.post.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        );
      }

      case 'comment': {
        const comment = data as CommentNotification;
        return (
          <div
            key={`comment-${comment.id}`}
            className="flex items-center gap-3 p-3 sm:p-4 bg-card rounded-lg border border-border hover:border-primary transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer animate-in fade-in slide-in-from-bottom-4"
            onClick={() => handlePostClick(comment.post_id)}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={18} className="text-blue-500" />
            </div>
            <Avatar
              className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleProfileClick(comment.user.username);
              }}
            >
              <AvatarImage src={comment.user.avatar_url} />
              <AvatarFallback className="gradient-primary text-white text-xs sm:text-sm">
                {comment.user.full_name?.[0] || comment.user.username?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base text-foreground">
                <span
                  className="font-semibold hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileClick(comment.user.username);
                  }}
                >
                  {comment.user.full_name || comment.user.username}
                </span>
                {' '}commented on your post
              </p>
              {comment.content && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  "{comment.content}"
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {getTimeAgo(created_at)}
              </p>
            </div>
            {comment.post.image_url && (
              <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                <img src={comment.post.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        );
      }

      case 'retweet': {
        const retweet = data as RetweetNotification;
        return (
          <div
            key={`retweet-${retweet.id}`}
            className="flex items-center gap-3 p-3 sm:p-4 bg-card rounded-lg border border-border hover:border-primary transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer animate-in fade-in slide-in-from-bottom-4"
            onClick={() => handlePostClick(retweet.post_id)}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Repeat2 size={18} className="text-green-500" />
            </div>
            <Avatar
              className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleProfileClick(retweet.user.username);
              }}
            >
              <AvatarImage src={retweet.user.avatar_url} />
              <AvatarFallback className="gradient-primary text-white text-xs sm:text-sm">
                {retweet.user.full_name?.[0] || retweet.user.username?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base text-foreground">
                <span
                  className="font-semibold hover:underline cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileClick(retweet.user.username);
                  }}
                >
                  {retweet.user.full_name || retweet.user.username}
                </span>
                {' '}retweeted your post
              </p>
              {retweet.post.content && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  "{retweet.post.content}"
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {getTimeAgo(created_at)}
              </p>
            </div>
            {retweet.post.image_url && (
              <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                <img src={retweet.post.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="flex-1 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Bell className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
            Notifications
            {totalCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {totalCount}
              </span>
            )}
          </h1>
          {!loading && totalCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNotifications}
              className="text-xs sm:text-sm"
            >
              Refresh
            </Button>
          )}
        </div>

                <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full sm:w-auto mb-4 sm:mb-6 grid grid-cols-2 sm:flex gap-2">
            <TabsTrigger value="all" className="text-xs sm:text-sm transition-all duration-300 hover:scale-105">
              All
              {totalCount > 0 && (
                <span className="ml-2 text-[10px] bg-muted px-2 py-0.5 rounded-full transition-all duration-300 animate-pulse">
                  {totalCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-xs sm:text-sm transition-all duration-300 hover:scale-105">
              Requests
              {followRequests.length > 0 && (
                <span className="ml-2 text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full transition-all duration-300 animate-pulse">
                  {followRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* All Notifications Tab */}
          <TabsContent value="all" className="space-y-2 sm:space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground text-sm">Loading notifications...</p>
              </div>
            ) : allNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No new notifications</p>
                <p className="text-xs text-muted-foreground mt-1">We'll let you know when something happens!</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {allNotifications.map((notification) => (
                  <motion.div
                    key={`${notification.type}-${notification.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ 
                      opacity: 0, 
                      x: -100,
                      height: 0,
                      marginBottom: 0,
                      overflow: 'hidden'
                    }}
                    transition={{ 
                      duration: 0.3,
                      ease: 'easeInOut'
                    }}
                    layout
                  >
                    {renderNotification(notification)}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </TabsContent>

          {/* Follow Requests Tab */}
          <TabsContent value="requests" className="space-y-2 sm:space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground text-sm">Loading requests...</p>
              </div>
            ) : followRequests.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No pending follow requests</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {followRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20, height: 'auto' }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ 
                      opacity: 0, 
                      x: -100, 
                      height: 0,
                      marginBottom: 0,
                      overflow: 'hidden'
                    }}
                    transition={{ 
                      duration: 0.3,
                      ease: 'easeInOut'
                    }}
                    layout
                  >
                    {renderNotification({ type: 'follow_request', id: request.id, created_at: request.created_at, data: request })}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </TabsContent>


        </Tabs>
      </div>
    </motion.div>
  );
}
