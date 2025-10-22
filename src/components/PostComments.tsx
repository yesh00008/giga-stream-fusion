import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send, MoreVertical } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { VerificationBadge } from "./VerificationBadge";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  is_liked?: boolean;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    badge_type: string | null;
  };
}

interface PostCommentsProps {
  postId: string;
  commentsCount: number;
  onCommentAdded?: () => void;
}

export function PostComments({ postId, commentsCount, onCommentAdded }: PostCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id, likes_count')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(commentsData.map(c => c.user_id))];

      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, badge_type')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user profiles
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Check which comments the current user has liked
      let likedCommentIds: string[] = [];
      if (user?.id) {
        const { data: likes } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentsData.map(c => c.id));

        likedCommentIds = likes?.map(l => l.comment_id) || [];
      }

      // Combine data
      const commentsWithUsers = commentsData
        .map(comment => ({
          ...comment,
          user: profilesMap.get(comment.user_id),
          is_liked: likedCommentIds.includes(comment.id)
        }))
        .filter(c => c.user !== undefined) as Comment[];

      setComments(commentsWithUsers);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setSubmitting(true);

      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: newComment.trim()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Fetch the user profile for the new comment
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, badge_type')
        .eq('id', user.id)
        .single();

      if (profile) {
        const newCommentWithUser: Comment = {
          ...data,
          likes_count: 0,
          is_liked: false,
          user: profile
        };

        setComments([newCommentWithUser, ...comments]);
        setNewComment("");
        toast.success('Comment added');
        
        if (onCommentAdded) {
          onCommentAdded();
        }
      }
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast.error('Please sign in to like comments');
      return;
    }

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    const wasLiked = comment.is_liked;

    // Optimistic update
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          is_liked: !wasLiked,
          likes_count: wasLiked ? c.likes_count - 1 : c.likes_count + 1
        };
      }
      return c;
    }));

    try {
      if (wasLiked) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);

        if (error) throw error;

        // Decrement likes count
        await supabase.rpc('decrement_comment_likes', { comment_id: commentId });
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert([{ comment_id: commentId, user_id: user.id }]);

        if (error) throw error;

        // Increment likes count
        await supabase.rpc('increment_comment_likes', { comment_id: commentId });
      }
    } catch (error: any) {
      console.error('Error toggling comment like:', error);
      
      // Revert optimistic update
      setComments(comments.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            is_liked: wasLiked,
            likes_count: comment.likes_count
          };
        }
        return c;
      }));
      
      toast.error('Failed to update like');
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      {user && (
        <div className="flex gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user.user_metadata?.full_name?.[0] || user.user_metadata?.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] resize-none"
              disabled={submitting}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleAddComment();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleAddComment}
              disabled={submitting || !newComment.trim()}
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <AnimatePresence mode="popLayout">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-3"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.user.avatar_url || undefined} />
                  <AvatarFallback>
                    {comment.user.full_name?.[0] || comment.user.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm flex items-center gap-1">
                      {comment.user.full_name || comment.user.username}
                      {comment.user.badge_type && (
                        <VerificationBadge type={comment.user.badge_type} size="sm" />
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-auto p-0 hover:bg-transparent ${
                        comment.is_liked ? 'text-red-500' : 'text-muted-foreground'
                      }`}
                      onClick={() => handleLikeComment(comment.id)}
                    >
                      <Heart
                        size={14}
                        className={comment.is_liked ? 'fill-current' : ''}
                      />
                      {comment.likes_count > 0 && (
                        <span className="ml-1 text-xs">{comment.likes_count}</span>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
