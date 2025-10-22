import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Repeat2, Share, Bookmark, ArrowLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import * as InteractionService from "@/lib/interaction-service";

interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar_url: string;
    badge_type: BadgeType;
  };
  created_at: string;
  likes_count: number;
  comments_count: number;
  retweets_count: number;
  shares_count: number;
  views_count?: number;
  image_url?: string;
  video_url?: string;
  is_liked: boolean;
  is_bookmarked: boolean;
  is_retweeted: boolean;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar_url: string;
    badge_type: BadgeType;
  };
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  edited: boolean;
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [retweets, setRetweets] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPostDetails();
    }
  }, [id]);

  const loadPostDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch the main post
      const postData = await InteractionService.getPostById(id!, user?.id);
      
      if (postData) {
        setPost({
          id: postData.id,
          content: postData.content || '',
          author: {
            id: postData.profiles?.id || '',
            name: postData.profiles?.full_name || postData.profiles?.username || 'Anonymous',
            username: postData.profiles?.username || 'user',
            avatar_url: postData.profiles?.avatar_url || '',
            badge_type: postData.profiles?.badge_type || null,
          },
          created_at: postData.created_at,
          likes_count: postData.likes_count || 0,
          comments_count: postData.comments_count || 0,
          retweets_count: postData.retweets_count || 0,
          shares_count: postData.shares_count || 0,
          views_count: Math.floor(Math.random() * 10000),
          image_url: postData.image_url,
          is_liked: postData.is_liked || false,
          is_bookmarked: postData.is_bookmarked || false,
          is_retweeted: postData.is_retweeted || false,
        });
      }

      // Fetch comments
      const commentsData = await InteractionService.getComments(id!, user?.id);
      setComments(commentsData.map((c: any) => ({
        id: c.id,
        content: c.content,
        author: {
          id: c.profiles?.id || '',
          name: c.profiles?.full_name || c.profiles?.username || 'Anonymous',
          username: c.profiles?.username || 'user',
          avatar_url: c.profiles?.avatar_url || '',
          badge_type: c.profiles?.badge_type || null,
        },
        created_at: c.created_at,
        likes_count: c.likes_count || 0,
        is_liked: c.is_liked || false,
        edited: c.edited || false,
      })));

      // Fetch retweets
      const retweetsData = await InteractionService.getRetweets(id!, user?.id);
      if (retweetsData) {
        setRetweets(retweetsData.map((r: any) => ({
          id: r.id,
          content: r.posts?.content || '',
          author: {
            id: r.profiles?.id || '',
            name: r.profiles?.full_name || r.profiles?.username || 'Anonymous',
            username: r.profiles?.username || 'user',
            avatar_url: r.profiles?.avatar_url || '',
            badge_type: r.profiles?.badge_type || null,
          },
          created_at: r.created_at,
          likes_count: 0,
          comments_count: 0,
          retweets_count: 0,
          shares_count: 0,
          is_liked: false,
          is_bookmarked: false,
          is_retweeted: false,
        })));
      }

    } catch (error) {
      console.error('Error loading post:', error);
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user?.id || !post) return;
    
    const wasLiked = post.is_liked;
    const previousPost = { ...post };
    setPost({
      ...post,
      is_liked: !wasLiked,
      likes_count: wasLiked ? post.likes_count - 1 : post.likes_count + 1,
    });

    try {
      await InteractionService.toggleLike(post.id, user.id);
    } catch (error) {
      toast.error('Failed to like post');
      setPost(previousPost);
    }
  };

  const handleRetweet = async () => {
    if (!user?.id || !post) return;
    
    const wasRetweeted = post.is_retweeted;
    const previousPost = { ...post };
    setPost({
      ...post,
      is_retweeted: !wasRetweeted,
      retweets_count: wasRetweeted ? post.retweets_count - 1 : post.retweets_count + 1,
    });

    try {
      await InteractionService.toggleRetweet(post.id, user.id);
      loadPostDetails(); // Reload to get updated retweets
    } catch (error) {
      toast.error('Failed to retweet');
      setPost(previousPost);
    }
  };

  const handleBookmark = async () => {
    if (!user?.id || !post) return;
    
    const wasBookmarked = post.is_bookmarked;
    const previousPost = { ...post };
    setPost({
      ...post,
      is_bookmarked: !wasBookmarked,
    });

    try {
      await InteractionService.toggleBookmark(post.id, user.id);
      toast.success(wasBookmarked ? 'Bookmark removed' : 'Post bookmarked');
    } catch (error) {
      toast.error('Failed to bookmark');
      setPost(previousPost);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !user?.id || !post) return;

    try {
      setCommenting(true);
      await InteractionService.createComment(post.id, user.id, newComment);

      toast.success('Comment added!');
      setNewComment('');
      loadPostDetails();
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setCommenting(false);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    
    const url = `${window.location.origin}/post/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.author.username}`,
          text: post.content,
          url: url,
        });
        
        // Increment share count
        await InteractionService.incrementShareCount(post.id);
        setPost({ ...post, shares_count: post.shares_count + 1 });
      } catch (error) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
      await InteractionService.incrementShareCount(post.id);
      setPost({ ...post, shares_count: post.shares_count + 1 });
    }
  };

  // Comment interaction handlers
  const handleCommentLike = async (commentId: string) => {
    if (!user?.id) return;

    const previousComments = [...comments];
    setComments(comments.map(c => {
      if (c.id === commentId) {
        const wasLiked = c.is_liked;
        return {
          ...c,
          is_liked: !wasLiked,
          likes_count: wasLiked ? c.likes_count - 1 : c.likes_count + 1
        };
      }
      return c;
    }));

    try {
      await InteractionService.toggleCommentLike(commentId, user.id);
    } catch (error) {
      setComments(previousComments);
      toast.error('Failed to like comment');
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  const handleSaveEditComment = async () => {
    if (!editingCommentId || !editCommentText.trim() || !user?.id) return;

    try {
      await InteractionService.updateComment(editingCommentId, user.id, editCommentText);
      setComments(comments.map(c => 
        c.id === editingCommentId 
          ? { ...c, content: editCommentText, edited: true }
          : c
      ));
      setEditingCommentId(null);
      setEditCommentText('');
      toast.success('Comment updated');
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user?.id) return;

    try {
      await InteractionService.deleteComment(commentId, user.id);
      setComments(comments.filter(c => c.id !== commentId));
      setDeletingCommentId(null);
      if (post) {
        setPost({ ...post, comments_count: post.comments_count - 1 });
      }
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleProfileClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto pb-16 sm:pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto border-x">
          <div className="p-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-1 overflow-y-auto pb-16 sm:pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto border-x">
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Post not found</p>
            <Button onClick={() => navigate('/feed')} className="mt-4">
              Go to Feed
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-16 sm:pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto border-x min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center gap-4 p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-bold text-xl">Post</h1>
          </div>
        </div>

        {/* Main Post */}
        <div className="p-4 border-b">
          <div className="flex gap-3 mb-3">
            <Avatar 
              className="w-12 h-12 cursor-pointer"
              onClick={() => handleProfileClick(post.author.username)}
            >
              <AvatarImage src={post.author.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                {post.author.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span 
                  className="font-semibold hover:underline cursor-pointer"
                  onClick={() => handleProfileClick(post.author.username)}
                >
                  {post.author.name}
                </span>
                {post.author.badge_type && (
                  <VerificationBadge type={post.author.badge_type} size={16} />
                )}
              </div>
              <p 
                className="text-sm text-muted-foreground cursor-pointer hover:underline"
                onClick={() => handleProfileClick(post.author.username)}
              >
                @{post.author.username}
              </p>
            </div>
            <Button size="icon" variant="ghost" className="rounded-full">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-2xl leading-normal mb-4 whitespace-pre-wrap">
            {post.content}
          </p>

          {post.image_url && (
            <div className="rounded-2xl overflow-hidden border mb-4">
              <img
                src={post.image_url}
                alt="Post content"
                className="w-full object-cover max-h-[600px]"
              />
            </div>
          )}

          <div className="text-sm text-muted-foreground mb-4">
            {formatFullDate(post.created_at)}
          </div>

          {/* Stats */}
          <div className="flex gap-4 py-3 border-y text-sm">
            <div className="hover:underline cursor-pointer">
              <span className="font-bold">{post.retweets_count}</span>
              <span className="text-muted-foreground ml-1">Retweets</span>
            </div>
            <div className="hover:underline cursor-pointer">
              <span className="font-bold">{post.likes_count}</span>
              <span className="text-muted-foreground ml-1">Likes</span>
            </div>
            <div className="hover:underline cursor-pointer">
              <span className="font-bold">{post.comments_count}</span>
              <span className="text-muted-foreground ml-1">Replies</span>
            </div>
            <div className="hover:underline cursor-pointer">
              <span className="font-bold">{post.shares_count}</span>
              <span className="text-muted-foreground ml-1">Shares</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-around py-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              className="hover:text-blue-500 hover:bg-blue-500/10 gap-2"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetweet}
              className={`hover:text-green-500 hover:bg-green-500/10 gap-2 ${
                post.is_retweeted ? 'text-green-500' : ''
              }`}
            >
              <Repeat2 className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`hover:text-red-500 hover:bg-red-500/10 gap-2 ${
                post.is_liked ? 'text-red-500' : ''
              }`}
            >
              <Heart
                className="w-5 h-5"
                fill={post.is_liked ? 'currentColor' : 'none'}
              />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={`hover:text-primary hover:bg-primary/10 ${
                post.is_bookmarked ? 'text-primary' : ''
              }`}
            >
              <Bookmark
                className="w-5 h-5"
                fill={post.is_bookmarked ? 'currentColor' : 'none'}
              />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="hover:text-primary hover:bg-primary/10"
            >
              <Share className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Comment Input */}
        {user && (
          <div className="p-4 border-b">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                  {user?.user_metadata?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Post your reply"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none border-0 focus-visible:ring-0 p-0"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleComment}
                    disabled={!newComment.trim() || commenting}
                    size="sm"
                    className="rounded-full px-4"
                  >
                    {commenting ? 'Posting...' : 'Reply'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          {comments.map((comment) => (
            <Card key={comment.id} className="p-4 border-x-0 border-t-0 rounded-none hover:bg-muted/30 transition-colors">
              <div className="flex gap-3">
                <Avatar 
                  className="w-10 h-10 flex-shrink-0 cursor-pointer" 
                  onClick={() => handleProfileClick(comment.author.username)}
                >
                  <AvatarImage src={comment.author.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                    {comment.author.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span 
                        className="font-semibold text-sm cursor-pointer hover:underline"
                        onClick={() => handleProfileClick(comment.author.username)}
                      >
                        {comment.author.name}
                      </span>
                      {comment.author.badge_type && (
                        <VerificationBadge type={comment.author.badge_type} size={14} />
                      )}
                      <span 
                        className="text-muted-foreground text-sm cursor-pointer hover:underline"
                        onClick={() => handleProfileClick(comment.author.username)}
                      >
                        @{comment.author.username}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground text-sm">
                        {formatTime(comment.created_at)}
                      </span>
                      {comment.edited && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground text-xs">Edited</span>
                        </>
                      )}
                    </div>
                    
                    {/* Comment actions dropdown */}
                    {user?.id === comment.author.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditComment(comment)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit comment
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setDeletingCommentId(comment.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete comment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  
                  {/* Comment content or edit form */}
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2 mt-2">
                      <Textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSaveEditComment}
                          size="sm"
                          disabled={!editCommentText.trim()}
                        >
                          Save
                        </Button>
                        <Button 
                          onClick={handleCancelEditComment}
                          size="sm"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap mb-2">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCommentLike(comment.id)}
                          className={`gap-1 px-2 h-8 ${comment.is_liked ? 'text-red-500 hover:bg-red-500/10' : 'hover:text-red-500 hover:bg-red-500/10'}`}
                        >
                          <Heart className={`w-4 h-4 ${comment.is_liked ? 'fill-current' : ''}`} />
                          {comment.likes_count > 0 && (
                            <span className="text-xs">{comment.likes_count}</span>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {comments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No replies yet</p>
              <p className="text-sm mt-1">Be the first to reply!</p>
            </div>
          )}
        </div>

        {/* Delete Comment Dialog */}
        <AlertDialog open={!!deletingCommentId} onOpenChange={(open) => !open && setDeletingCommentId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete comment?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your comment.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingCommentId && handleDeleteComment(deletingCommentId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Retweets Section */}
        {retweets.length > 0 && (
          <div className="border-t mt-4">
            <div className="p-4 font-semibold border-b">
              Retweets ({retweets.length})
            </div>
            {retweets.map((retweet) => (
              <Card key={retweet.id} className="p-4 border-x-0 border-t-0 rounded-none hover:bg-muted/30 transition-colors">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={retweet.author.avatar_url} />
                    <AvatarFallback>
                      {retweet.author.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {retweet.author.name}
                      </span>
                      {retweet.author.badge_type && (
                        <VerificationBadge type={retweet.author.badge_type} size={14} />
                      )}
                      <span className="text-muted-foreground text-sm">
                        @{retweet.author.username}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground text-sm">
                        {formatTime(retweet.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Retweeted this post</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
