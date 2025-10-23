import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Repeat2, Share, Bookmark, MoreHorizontal, Image as ImageIcon, Smile, AtSign, Hash, BarChart, MapPin, Calendar, X, Upload, Film, Mic, Edit, Trash2, Send, Save, Paperclip, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";
import { MobileProfileHeader } from "@/components/MobileProfileHeader";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import * as FeedService from "@/lib/feed-service";
import { getPosts } from "@/lib/feed-service";

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
  poll?: {
    options: { text: string; votes: number }[];
    total_votes: number;
    ends_at: string;
  };
  quoted_post?: Post;
  reply_to?: {
    username: string;
    id: string;
  };
  is_liked: boolean;
  is_bookmarked: boolean;
  is_retweeted: boolean;
}

const MAX_CHAR_COUNT = 280;

export default function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  
  // Edit state
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Delete state
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const charCount = (showEditDialog ? editContent : newPost).length;
  const charPercentage = (charCount / MAX_CHAR_COUNT) * 100;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await getPosts(user?.id);

      if (error) {
        // Check if it's a database schema error
        if (error.code === 'PGRST200' || error.message?.includes('relationship')) {
          toast.error('Database setup required', {
            description: 'Please run FEED_TABLES.sql in Supabase. See FEED_SETUP_INSTRUCTIONS.md',
            duration: 10000,
          });
        } else {
          throw error;
        }
        return;
      }

      const formattedPosts = data?.map((post: any) => ({
        id: post.id,
        content: post.content || post.title || '',
        author: {
          id: post.profiles?.id || '',
          name: post.profiles?.full_name || post.profiles?.username || 'Anonymous',
          username: post.profiles?.username || 'user',
          avatar_url: post.profiles?.avatar_url || '',
          badge_type: post.profiles?.badge_type || null,
        },
        created_at: post.created_at,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        retweets_count: post.retweets_count || 0,
        shares_count: post.shares_count || 0,
        views_count: Math.floor(Math.random() * 10000),
        image_url: post.image_url,
        is_liked: post.is_liked || false,
        is_bookmarked: post.is_bookmarked || false,
        is_retweeted: post.is_retweeted || false,
      })) || [];

      setPosts(formattedPosts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (isDraft = false) => {
    if (!newPost.trim() && selectedImages.length === 0) return;
    if (charCount > MAX_CHAR_COUNT) {
      toast.error(`Post is too long! Maximum ${MAX_CHAR_COUNT} characters.`);
      return;
    }

    try {
      setPosting(true);
      
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        const { urls, errors } = await FeedService.uploadImages(selectedImages, user?.id || '');
        if (errors && errors.length > 0) {
          toast.error('Some images failed to upload');
        }
        imageUrls = urls || [];
      }

      const { data, error } = await FeedService.createPost({
        user_id: user?.id || '',
        content: newPost,
        image_urls: imageUrls,
        is_draft: isDraft,
        visibility: 'public',
      });

      if (error) throw error;

      toast.success(isDraft ? 'Saved as draft!' : 'Post published successfully!');
      setNewPost('');
      setSelectedImages([]);
      setImagePreview([]);
      setShowPollCreator(false);
      setPollOptions(['', '']);
      
      if (!isDraft) {
        fetchPosts();
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }

    setSelectedImages([...selectedImages, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);
    toast.success(`${files.length} file(s) attached`);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleLike = async (postId: string) => {
    if (!user?.id) return;
    
    // Optimistic update
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1 }
        : p
    ));

    const { error } = await FeedService.toggleLike(postId, user.id);
    if (error) {
      toast.error('Failed to like post');
      // Revert on error
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, is_liked: !p.is_liked, likes_count: p.is_liked ? p.likes_count + 1 : p.likes_count - 1 }
          : p
      ));
    }
  };

  const handleBookmark = async (postId: string) => {
    if (!user?.id) return;
    
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, is_bookmarked: !p.is_bookmarked }
        : p
    ));

    const { error } = await FeedService.toggleBookmark(postId, user.id);
    if (error) {
      toast.error('Failed to bookmark post');
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, is_bookmarked: !p.is_bookmarked }
          : p
      ));
    } else {
      toast.success(posts.find(p => p.id === postId)?.is_bookmarked ? 'Bookmark removed' : 'Post bookmarked');
    }
  };

  const handleRetweet = async (postId: string) => {
    if (!user?.id) return;
    
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, is_retweeted: !p.is_retweeted, retweets_count: p.is_retweeted ? p.retweets_count - 1 : p.retweets_count + 1 }
        : p
    ));

    const { error } = await FeedService.toggleRetweet(postId, user.id);
    if (error) {
      toast.error('Failed to retweet');
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, is_retweeted: !p.is_retweeted, retweets_count: p.is_retweeted ? p.retweets_count + 1 : p.retweets_count - 1 }
          : p
      ));
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPost || !user?.id) return;
    if (editContent.length > MAX_CHAR_COUNT) {
      toast.error(`Post is too long! Maximum ${MAX_CHAR_COUNT} characters.`);
      return;
    }

    try {
      const { error } = await FeedService.updatePost(editingPost.id, {
        content: editContent,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success('Post updated successfully!');
      setShowEditDialog(false);
      setEditingPost(null);
      setEditContent('');
      fetchPosts();
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleDelete = (postId: string) => {
    setDeletingPostId(postId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingPostId || !user?.id) return;

    try {
      const { error } = await FeedService.deletePost(deletingPostId, user.id);
      
      if (error) throw error;

      toast.success('Post deleted successfully!');
      setPosts(posts.filter(p => p.id !== deletingPostId));
      setShowDeleteDialog(false);
      setDeletingPostId(null);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleShare = async (post: Post) => {
    const url = `${window.location.origin}/post/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.author.username}`,
          text: post.content,
          url: url,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex-1 overflow-y-auto pb-16 sm:pb-20 lg:pb-0">
      {/* Mobile Header */}
      <MobileProfileHeader username={user?.user_metadata?.username || user?.email?.split('@')[0] || 'user'} />

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
        {/* Main Feed */}
        <div className="flex-1 w-full max-w-full lg:max-w-2xl lg:border-r">
            {/* Create Post Section - Twitter/Threads Style */}
            <div className="p-3 sm:p-4 border-b border-border bg-background">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                    {user?.user_metadata?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Textarea
                    placeholder="What's happening?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[60px] sm:min-h-[80px] border-0 focus-visible:ring-0 resize-none p-0 text-base sm:text-xl placeholder:text-muted-foreground/60 bg-transparent shadow-none"
                    maxLength={MAX_CHAR_COUNT}
                  />

                  {/* Attached Files Display */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-foreground flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground flex-shrink-0">{(file.size / 1024).toFixed(1)}KB</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeFile(index)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Image Previews - Styled like Twitter */}
                  {imagePreview.length > 0 && (
                    <div className={`mt-3 rounded-2xl overflow-hidden ${
                      imagePreview.length === 1 ? '' : 
                      imagePreview.length === 2 ? 'grid grid-cols-2 gap-0.5' :
                      imagePreview.length === 3 ? 'grid grid-cols-2 gap-0.5' :
                      'grid grid-cols-2 gap-0.5'
                    }`}>
                      {imagePreview.map((preview, index) => (
                        <div 
                          key={index} 
                          className={`relative bg-muted ${
                            imagePreview.length === 3 && index === 0 ? 'col-span-2' : ''
                          }`}
                          style={{
                            aspectRatio: imagePreview.length === 1 ? '16/9' : 
                                        imagePreview.length === 2 ? '1/1' :
                                        imagePreview.length === 3 && index === 0 ? '2/1' :
                                        '1/1'
                          }}
                        >
                          <img 
                            src={preview} 
                            alt={`Image ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white border-0 backdrop-blur-sm"
                            onClick={() => removeImage(index)}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Poll Creator - Minimal Style */}
                  {showPollCreator && (
                    <div className="mt-3 space-y-2">
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`Choice ${index + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...pollOptions];
                              newOptions[index] = e.target.value;
                              setPollOptions(newOptions);
                            }}
                            className="flex-1 px-4 py-2.5 border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                          />
                          {pollOptions.length > 2 && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 rounded-full"
                              onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== index))}
                            >
                              <X size={14} />
                            </Button>
                          )}
                        </div>
                      ))}
                      {pollOptions.length < 4 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPollOptions([...pollOptions, ''])}
                          className="text-primary hover:bg-primary/5 text-sm"
                        >
                          + Add choice
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPollCreator(false)}
                        className="text-destructive hover:bg-destructive/5 text-sm"
                      >
                        Remove poll
                      </Button>
                    </div>
                  )}

                  {/* Bottom Actions Row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                      <input
                        type="file"
                        ref={attachmentInputRef}
                        onChange={handleAttachmentSelect}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,video/*,audio/*"
                        multiple
                        className="hidden"
                      />
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                        title="Add images"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full"
                        onClick={() => attachmentInputRef.current?.click()}
                        title="Attach files (PDF, PPT, Videos, etc.)"
                      >
                        <Paperclip className="w-5 h-5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full"
                        onClick={() => setShowPollCreator(!showPollCreator)}
                        title="Create a poll"
                      >
                        <BarChart className="w-5 h-5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full hidden sm:flex"
                      >
                        <Smile className="w-5 h-5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full hidden md:flex"
                      >
                        <Calendar className="w-5 h-5" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full hidden md:flex"
                      >
                        <MapPin className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {charCount > 0 && (
                        <div className="relative w-7 h-7">
                          <svg className="transform -rotate-90 w-full h-full">
                            <circle
                              cx="50%"
                              cy="50%"
                              r="11"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              className="text-muted-foreground/20"
                            />
                            <circle
                              cx="50%"
                              cy="50%"
                              r="11"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 11}`}
                              strokeDashoffset={`${2 * Math.PI * 11 * (1 - charPercentage / 100)}`}
                              className={charCount > MAX_CHAR_COUNT ? 'text-red-500' : charPercentage > 90 ? 'text-yellow-500' : 'text-primary'}
                            />
                          </svg>
                          {charPercentage > 90 && (
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
                              {MAX_CHAR_COUNT - charCount}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="h-6 w-px bg-border hidden sm:block" />
                      <Button 
                        onClick={() => handleCreatePost(false)} 
                        disabled={(!newPost.trim() && selectedImages.length === 0) || posting || charCount > MAX_CHAR_COUNT}
                        size="sm"
                        className="rounded-full px-4 sm:px-5 h-9 font-semibold"
                      >
                        {posting ? 'Posting...' : 'Post'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No posts yet. Be the first to post!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="p-0 border-x-0 border-t-0 rounded-none hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    {post.reply_to && (
                      <div className="flex items-center gap-2 px-4 pt-3 text-muted-foreground text-sm">
                        <MessageCircle size={14} />
                        <span>Replying to @{post.reply_to.username}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-3 px-4 pt-4 pb-2">
                      <Avatar 
                        className="w-10 h-10 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${post.author.username}`);
                        }}
                      >
                        <AvatarImage src={post.author.avatar_url} />
                        <AvatarFallback>
                          {post.author.name[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span 
                              className="font-semibold text-sm hover:underline truncate cursor-pointer" 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/profile/${post.author.username}`);
                              }}
                            >
                              {post.author.name}
                            </span>
                            {post.author.badge_type && (
                              <VerificationBadge type={post.author.badge_type} size={14} className="flex-shrink-0" />
                            )}
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {formatTime(post.created_at)}
                            </span>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button size="icon" variant="ghost" className="h-8 w-8 -mr-2">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleBookmark(post.id); }}>
                                <Bookmark className="mr-2 h-4 w-4" />
                                {post.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShare(post); }}>
                                <Share className="mr-2 h-4 w-4" />
                                Share post
                              </DropdownMenuItem>
                              {post.author.id === user?.id && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(post); }}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit post
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                                    className="text-red-500 focus:text-red-500"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete post
                                  </DropdownMenuItem>
                                </>
                              )}
                              {post.author.id !== user?.id && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={(e) => e.stopPropagation()}>
                                    <X className="mr-2 h-4 w-4" />
                                    Report post
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className="text-[15px] leading-normal whitespace-pre-wrap mb-3">
                          {post.content}
                        </p>

                        {post.image_url && (
                          <div className="rounded-xl sm:rounded-2xl overflow-hidden border mb-3">
                            <img 
                              src={post.image_url} 
                              alt="Post content" 
                              className="w-full object-cover max-h-[300px] sm:max-h-[500px]"
                            />
                          </div>
                        )}

                        {post.video_url && (
                          <div className="rounded-2xl overflow-hidden border mb-3">
                            <video 
                              src={post.video_url} 
                              controls 
                              className="w-full max-h-[500px]"
                            />
                          </div>
                        )}

                        {post.poll && (
                          <div className="border rounded-xl p-3 mb-3 space-y-2">
                            {post.poll.options.map((option, index) => (
                              <button
                                key={index}
                                className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors relative overflow-hidden"
                              >
                                <div 
                                  className="absolute inset-0 bg-primary/10"
                                  style={{ width: `${(option.votes / post.poll.total_votes) * 100}%` }}
                                />
                                <div className="relative flex items-center justify-between">
                                  <span className="font-medium">{option.text}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {((option.votes / post.poll.total_votes) * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </button>
                            ))}
                            <div className="text-xs text-muted-foreground pt-2">
                              {post.poll.total_votes} votes · {formatTime(post.poll.ends_at)} left
                            </div>
                          </div>
                        )}

                        {post.quoted_post && (
                          <div className="border rounded-xl p-3 mb-3 hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={post.quoted_post.author.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {post.quoted_post.author.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-sm">{post.quoted_post.author.name}</span>
                              <span className="text-muted-foreground text-xs">@{post.quoted_post.author.username}</span>
                              <span className="text-muted-foreground text-xs">· {formatTime(post.quoted_post.created_at)}</span>
                            </div>
                            <p className="text-sm">{post.quoted_post.content}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interaction buttons row */}
                    <div className="flex items-center px-4 pb-3 gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="hover:text-blue-500 hover:bg-blue-500/10 gap-1.5 h-9 px-2 rounded-lg"
                        onClick={(e) => { e.stopPropagation(); navigate(`/post/${post.id}`); }}
                      >
                        <MessageCircle size={19} strokeWidth={2} />
                        {post.comments_count > 0 && (
                          <span className="text-xs font-medium">{post.comments_count}</span>
                        )}
                      </Button>

                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => { e.stopPropagation(); handleRetweet(post.id); }}
                        className={`hover:text-green-500 hover:bg-green-500/10 gap-1.5 h-9 px-2 rounded-lg ${
                          post.is_retweeted ? 'text-green-500' : ''
                        }`}
                      >
                        <Repeat2 size={19} strokeWidth={2} />
                        {post.retweets_count > 0 && (
                          <span className="text-xs font-medium">{post.retweets_count}</span>
                        )}
                      </Button>

                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                        className={`hover:text-red-500 hover:bg-red-500/10 gap-1.5 h-9 px-2 rounded-lg ${
                          post.is_liked ? 'text-red-500' : ''
                        }`}
                      >
                        <Heart size={19} fill={post.is_liked ? 'currentColor' : 'none'} strokeWidth={2} />
                        {post.likes_count > 0 && (
                          <span className="text-xs font-medium">{post.likes_count}</span>
                        )}
                      </Button>

                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="hover:text-primary hover:bg-primary/10 gap-1.5 h-9 px-2 rounded-lg"
                        onClick={(e) => { e.stopPropagation(); handleShare(post); }}
                      >
                        <Share size={19} strokeWidth={2} />
                        {post.shares_count > 0 && (
                          <span className="text-xs font-medium">{post.shares_count}</span>
                        )}
                      </Button>

                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={(e) => { e.stopPropagation(); handleBookmark(post.id); }}
                        className={`hover:text-primary hover:bg-primary/10 gap-1.5 h-9 px-2 rounded-lg ml-auto ${
                          post.is_bookmarked ? 'text-primary' : ''
                        }`}
                      >
                        <Bookmark size={19} fill={post.is_bookmarked ? 'currentColor' : 'none'} strokeWidth={2} />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
        </div>

        {/* Trending Sidebar - Desktop Only */}
        <div className="hidden xl:block w-80 p-4 space-y-4 sticky top-0 h-screen overflow-y-auto">
          {/* Trending Topics */}
          <Card className="p-4">
            <h3 className="font-bold text-lg mb-4">Trends for you</h3>
            <div className="space-y-4">
              {[
                { category: 'Technology', topic: '#ReactJS', posts: '125K' },
                { category: 'Programming', topic: '#TypeScript', posts: '89K' },
                { category: 'Design', topic: '#UIUXDesign', posts: '67K' },
                { category: 'Trending', topic: '#AI', posts: '234K' },
                { category: 'Web Development', topic: '#Vite', posts: '45K' },
              ].map((trend, index) => (
                <div key={index} className="hover:bg-muted/50 p-2 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{trend.category}</p>
                      <p className="font-semibold">{trend.topic}</p>
                      <p className="text-xs text-muted-foreground">{trend.posts} posts</p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="link" className="w-full text-primary p-0 h-auto">
                Show more
              </Button>
            </div>
          </Card>

          {/* Who to Follow */}
          <Card className="p-4">
            <h3 className="font-bold text-lg mb-4">Who to follow</h3>
            <div className="space-y-3">
              {[
                { name: 'Tech Innovator', username: 'techinnovator', verified: true },
                { name: 'Design Master', username: 'designmaster', verified: false },
                { name: 'Code Wizard', username: 'codewizard', verified: true },
              ].map((suggestion, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                      {suggestion.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm truncate">{suggestion.name}</p>
                      {suggestion.verified && <VerificationBadge type="verified" size={14} />}
                    </div>
                    <p className="text-xs text-muted-foreground">@{suggestion.username}</p>
                  </div>
                  <Button size="sm" className="rounded-full">Follow</Button>
                </div>
              ))}
              <Button variant="link" className="w-full text-primary p-0 h-auto">
                Show more
              </Button>
            </div>
          </Card>

          {/* Footer Links */}
          <div className="text-xs text-muted-foreground space-y-2 px-2">
            <div className="flex flex-wrap gap-2">
              <a href="#" className="hover:underline">Terms of Service</a>
              <span>·</span>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <span>·</span>
              <a href="#" className="hover:underline">Cookie Policy</a>
              <span>·</span>
              <a href="#" className="hover:underline">Accessibility</a>
              <span>·</span>
              <a href="#" className="hover:underline">Ads info</a>
            </div>
            <p>© 2025 GigaStream. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Edit Post Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your post. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[200px] text-base"
              maxLength={MAX_CHAR_COUNT}
              placeholder="What's happening?"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {editContent.length} / {MAX_CHAR_COUNT}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || editContent.length > MAX_CHAR_COUNT}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
