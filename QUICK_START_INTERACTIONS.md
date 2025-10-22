# Quick Start: Adding Interactions to Any Page

This guide shows how to quickly add the complete interaction system (like, retweet, bookmark, share) to any new or existing page in under 5 minutes.

## Step 1: Import Required Functions

```typescript
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { 
  toggleLike, 
  toggleRetweet, 
  toggleBookmark, 
  incrementShareCount 
} from '@/lib/feed-service';
import { PostCard } from '@/components/PostCard';
```

## Step 2: Set Up Component State

```typescript
function YourPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // ... rest of component
}
```

## Step 3: Copy-Paste Interaction Handlers

```typescript
// Like Handler
const handleLike = async (postId: string) => {
  if (!user) {
    toast({
      title: "Sign in required",
      description: "Please sign in to like posts",
      variant: "destructive",
    });
    return;
  }

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
    setPosts(previousPosts);
    toast({
      title: "Error",
      description: "Failed to update like. Please try again.",
      variant: "destructive",
    });
  }
};

// Retweet Handler
const handleRetweet = async (postId: string) => {
  if (!user) {
    toast({
      title: "Sign in required",
      description: "Please sign in to retweet",
      variant: "destructive",
    });
    return;
  }

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
    setPosts(previousPosts);
    toast({
      title: "Error",
      description: "Failed to update retweet. Please try again.",
      variant: "destructive",
    });
  }
};

// Bookmark Handler
const handleBookmark = async (postId: string) => {
  if (!user) {
    toast({
      title: "Sign in required",
      description: "Please sign in to bookmark posts",
      variant: "destructive",
    });
    return;
  }

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
    setPosts(previousPosts);
    toast({
      title: "Error",
      description: "Failed to update bookmark. Please try again.",
      variant: "destructive",
    });
  }
};

// Share Handler
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
      
      await incrementShareCount(postId);
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
```

## Step 4: Render PostCard with Handlers

```typescript
return (
  <div>
    {posts.map((post) => (
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
    ))}
  </div>
);
```

## Complete Example: New Page Template

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { 
  toggleLike, 
  toggleRetweet, 
  toggleBookmark, 
  incrementShareCount,
  getPosts 
} from '@/lib/feed-service';
import { PostCard } from '@/components/PostCard';

export default function NewPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await getPosts(user?.id);
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // PASTE ALL 4 HANDLERS HERE (handleLike, handleRetweet, handleBookmark, handleShare)

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-4 p-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          id={post.id}
          content={post.content}
          author={post.author_name}
          authorUsername={post.author_username}
          authorAvatar={post.author_avatar}
          likes={post.likes_count.toString()}
          comments={post.comments_count.toString()}
          retweets={post.retweets_count.toString()}
          shares={post.shares_count.toString()}
          timestamp={new Date(post.created_at).toLocaleDateString()}
          image={post.image_url}
          isLiked={post.is_liked}
          isRetweeted={post.is_retweeted}
          isBookmarked={post.is_bookmarked}
          onLike={handleLike}
          onRetweet={handleRetweet}
          onBookmark={handleBookmark}
          onShare={handleShare}
        />
      ))}
    </div>
  );
}
```

## That's It! 🎉

You now have:
- ✅ Real-time like/unlike with accurate counts
- ✅ Retweet functionality
- ✅ Bookmark functionality
- ✅ Share with tracking
- ✅ Optimistic UI updates
- ✅ Automatic error rollback
- ✅ User authentication checks
- ✅ Toast notifications

## Customization Tips

### Change Toast Messages
```typescript
toast({
  title: "Your custom title",
  description: "Your custom message",
  variant: "destructive", // or "default"
});
```

### Add Loading States
```typescript
const [isLiking, setIsLiking] = useState(false);

const handleLike = async (postId: string) => {
  setIsLiking(true);
  try {
    // ... existing code
  } finally {
    setIsLiking(false);
  }
};
```

### Add Animations
```typescript
<PostCard
  className={isLiking ? 'animate-pulse' : ''}
  // ... other props
/>
```

### Custom Error Handling
```typescript
} catch (error) {
  setPosts(previousPosts);
  
  if (error.message.includes('network')) {
    toast({
      title: "Network Error",
      description: "Check your internet connection",
    });
  } else if (error.message.includes('auth')) {
    toast({
      title: "Session Expired",
      description: "Please sign in again",
    });
  } else {
    toast({
      title: "Error",
      description: "Something went wrong",
    });
  }
}
```

## Common Issues

### Issue: Counts not updating after interaction
**Solution:** Make sure SQL triggers are installed
```sql
-- Run COMMENTS_AND_SHARES.sql
```

### Issue: "User not authenticated" error
**Solution:** Check if user is logged in
```typescript
if (!user) {
  // Redirect to login or show message
  return;
}
```

### Issue: Optimistic update not reverting on error
**Solution:** Make sure you're copying state correctly
```typescript
const previousPosts = [...posts]; // Create new array
// NOT: const previousPosts = posts; // This creates reference, not copy
```

### Issue: PostCard props type errors
**Solution:** Make sure all required props are provided
```typescript
// Required props:
id, content, author, likes, comments, retweets, shares, timestamp

// Optional props:
title, authorUsername, authorAvatar, image, isLiked, isRetweeted, 
isBookmarked, onLike, onRetweet, onBookmark, onShare
```

---

**Time to implement:** ~5 minutes  
**Lines of code:** ~150 (mostly copy-paste)  
**Result:** Fully functional interaction system 🚀
