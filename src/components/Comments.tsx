import { useState, useEffect } from "react";
import { Heart, Send, Trash2, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  user_id: string;
  post_id: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  is_liked?: boolean;
}

interface CommentsProps {
  postId: string;
  onCommentCountChange?: (count: number) => void;
}

export function Comments({ postId, onCommentCountChange }: CommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();

    // Subscribe to real-time comment changes
    const subscription = supabase
      .channel(`comments_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [postId, user?.id]);

  const fetchComments = async () => {
    try {
      // Fetch comments
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        onCommentCountChange?.(0);
        return;
      }

      // Fetch user profiles
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Check which comments current user has liked
      let likedCommentIds = new Set<string>();
      if (user?.id) {
        const { data: likes } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentsData.map(c => c.id));

        likedCommentIds = new Set(likes?.map(l => l.comment_id) || []);
      }

      // Map comments with profiles
      const commentsWithProfiles = commentsData
        .map(comment => ({
          ...comment,
          user: profilesMap.get(comment.user_id),
          is_liked: likedCommentIds.has(comment.id)
        }))
        .filter(c => c.user !== undefined) as Comment[];

      setComments(commentsWithProfiles);
      onCommentCountChange?.(commentsWithProfiles.length);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user?.id) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        }]);

      if (error) throw error;

      setNewComment("");
      toast.success('Comment posted!');
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!user?.id) {
      toast.error('Please sign in to like comments');
      return;
    }

    try {
      if (isLiked) {
        await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('comment_likes')
          .insert([{
            comment_id: commentId,
            user_id: user.id
          }]);
      }

      // Update local state
      setComments(prev => prev.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              is_liked: !isLiked,
              likes_count: isLiked ? comment.likes_count - 1 : comment.likes_count + 1
            }
          : comment
      ));
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to like comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <div className="flex gap-3 items-start">
        <Avatar className="w-9 h-9">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {user?.user_metadata?.full_name?.[0] || user?.user_metadata?.username?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmitComment();
              }
            }}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              size="sm"
              className="gap-2"
            >
              <Send size={14} />
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3 group"
              >
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarImage src={comment.user.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {comment.user.full_name?.[0] || comment.user.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-muted/50 rounded-2xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">
                        {comment.user.full_name || comment.user.username}
                      </span>
                      {user?.id === comment.user_id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-destructive"
                            >
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 px-2">
                    <button
                      onClick={() => handleLikeComment(comment.id, comment.is_liked || false)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Heart
                        size={14}
                        className={comment.is_liked ? 'fill-primary text-primary' : ''}
                      />
                      {comment.likes_count > 0 && (
                        <span className="font-medium">{comment.likes_count}</span>
                      )}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(comment.created_at)}
                    </span>
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
