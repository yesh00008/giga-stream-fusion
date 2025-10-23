/**
 * Complete Interaction Service
 * Handles all user interactions: posts, comments, retweets, likes, bookmarks
 */

import { supabase } from './supabase';

// ============================================================
// TYPES
// ============================================================

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  edited: boolean;
  profiles?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    badge_type: string | null;
  };
  is_liked?: boolean;
}

export interface RetweetComment {
  id: string;
  retweet_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  edited: boolean;
  profiles?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    badge_type: string | null;
  };
  is_liked?: boolean;
}

// ============================================================
// POST INTERACTIONS
// ============================================================

/**
 * Toggle like on a post (with duplicate prevention)
 */
export async function toggleLike(postId: string, userId: string): Promise<void> {
  try {
    // Check if already liked
    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      // Decrement count
      try {
        await supabase.rpc('decrement_likes_count', { post_id: postId });
      } catch {
        await supabase.rpc('update_post_likes_count', { 
          p_post_id: postId, 
          p_increment: false 
        });
      }
    } else {
      // Like
      await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: userId }]);

      // Increment count
      try {
        await supabase.rpc('increment_likes_count', { post_id: postId });
      } catch {
        await supabase.rpc('update_post_likes_count', { 
          p_post_id: postId, 
          p_increment: true 
        });
      }
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

/**
 * Toggle retweet (with duplicate prevention)
 */
export async function toggleRetweet(postId: string, userId: string): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('retweets')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase
        .from('retweets')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('retweets')
        .insert([{ post_id: postId, user_id: userId }]);
    }
  } catch (error) {
    console.error('Error toggling retweet:', error);
    throw error;
  }
}

/**
 * Toggle bookmark
 */
export async function toggleBookmark(postId: string, userId: string): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('bookmarks')
        .insert([{ post_id: postId, user_id: userId }]);
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
}

/**
 * Increment share count
 */
export async function incrementShareCount(postId: string): Promise<void> {
  try {
    await supabase.rpc('increment_shares_count', { post_id: postId });
  } catch (error) {
    console.error('Error incrementing share count:', error);
    throw error;
  }
}

// ============================================================
// COMMENT INTERACTIONS
// ============================================================

/**
 * Get comments for a post
 */
export async function getComments(postId: string, userId?: string): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
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
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get user's liked comments
    let userLikedComments: string[] = [];
    if (userId) {
      const { data: likes } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', userId);
      
      userLikedComments = likes?.map(l => l.comment_id) || [];
    }

    return (data || []).map(comment => ({
      ...comment,
      is_liked: userLikedComments.includes(comment.id)
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

/**
 * Create a comment on a post
 */
export async function createComment(postId: string, userId: string, content: string): Promise<Comment | null> {
  try {
    // Insert the comment
    const { data: comment, error: insertError } = await supabase
      .from('comments')
      .insert([{
        post_id: postId,
        user_id: userId,
        content: content.trim()
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    
    // Fetch the user profile separately
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, badge_type')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Combine comment with profile
    return {
      ...comment,
      profiles: profile
    };
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

/**
 * Update a comment
 */
export async function updateComment(commentId: string, userId: string, content: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('comments')
      .update({ 
        content: content.trim(), 
        updated_at: new Date().toISOString(),
        edited: true
      })
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

/**
 * Toggle like on a comment
 */
export async function toggleCommentLike(commentId: string, userId: string): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike
      await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);
    } else {
      // Like
      await supabase
        .from('comment_likes')
        .insert([{ comment_id: commentId, user_id: userId }]);
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw error;
  }
}

// ============================================================
// RETWEET INTERACTIONS
// ============================================================

/**
 * Get retweets with user details and original post
 */
export async function getRetweets(postId: string, userId?: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('retweets')
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
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get user's retweeted status
    let userRetweeted = false;
    if (userId) {
      const { data: userRetweet } = await supabase
        .from('retweets')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
      
      userRetweeted = !!userRetweet;
    }

    return (data || []).map(retweet => ({
      ...retweet,
      is_user_retweet: userId ? retweet.user_id === userId : false
    }));
  } catch (error) {
    console.error('Error fetching retweets:', error);
    return [];
  }
}

/**
 * Get comments for a retweet
 */
export async function getRetweetComments(retweetId: string, userId?: string): Promise<RetweetComment[]> {
  try {
    const { data, error } = await supabase
      .from('retweet_comments')
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
      .eq('retweet_id', retweetId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get user's liked retweet comments
    let userLikedComments: string[] = [];
    if (userId) {
      const { data: likes } = await supabase
        .from('retweet_comment_likes')
        .select('retweet_comment_id')
        .eq('user_id', userId);
      
      userLikedComments = likes?.map(l => l.retweet_comment_id) || [];
    }

    return (data || []).map(comment => ({
      ...comment,
      is_liked: userLikedComments.includes(comment.id)
    }));
  } catch (error) {
    console.error('Error fetching retweet comments:', error);
    return [];
  }
}

/**
 * Create a comment on a retweet
 */
export async function createRetweetComment(retweetId: string, userId: string, content: string): Promise<RetweetComment | null> {
  try {
    const { data, error } = await supabase
      .from('retweet_comments')
      .insert([{
        retweet_id: retweetId,
        user_id: userId,
        content: content.trim()
      }])
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
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating retweet comment:', error);
    throw error;
  }
}

/**
 * Update a retweet comment
 */
export async function updateRetweetComment(commentId: string, userId: string, content: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('retweet_comments')
      .update({ 
        content: content.trim(), 
        updated_at: new Date().toISOString(),
        edited: true
      })
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating retweet comment:', error);
    throw error;
  }
}

/**
 * Delete a retweet comment
 */
export async function deleteRetweetComment(commentId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('retweet_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting retweet comment:', error);
    throw error;
  }
}

/**
 * Toggle like on a retweet comment
 */
export async function toggleRetweetCommentLike(commentId: string, userId: string): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from('retweet_comment_likes')
      .select('id')
      .eq('retweet_comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike
      await supabase
        .from('retweet_comment_likes')
        .delete()
        .eq('retweet_comment_id', commentId)
        .eq('user_id', userId);
    } else {
      // Like
      await supabase
        .from('retweet_comment_likes')
        .insert([{ retweet_comment_id: commentId, user_id: userId }]);
    }
  } catch (error) {
    console.error('Error toggling retweet comment like:', error);
    throw error;
  }
}

// ============================================================
// POST FETCHING (Enhanced with all interactions)
// ============================================================

/**
 * Get single post by ID with all interaction data
 */
export async function getPostById(postId: string, userId?: string): Promise<any> {
  try {
    const { data, error } = await supabase
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
      .eq('id', postId)
      .single();

    if (error) throw error;

    // Get user's interaction status
    let isLiked = false;
    let isBookmarked = false;
    let isRetweeted = false;

    if (userId) {
      const [likesRes, bookmarksRes, retweetsRes] = await Promise.all([
        supabase.from('post_likes').select('id').eq('post_id', postId).eq('user_id', userId).maybeSingle(),
        supabase.from('bookmarks').select('id').eq('post_id', postId).eq('user_id', userId).maybeSingle(),
        supabase.from('retweets').select('id').eq('post_id', postId).eq('user_id', userId).maybeSingle(),
      ]);

      isLiked = !!likesRes.data;
      isBookmarked = !!bookmarksRes.data;
      isRetweeted = !!retweetsRes.data;
    }

    return {
      ...data,
      is_liked: isLiked,
      is_bookmarked: isBookmarked,
      is_retweeted: isRetweeted,
    };
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
}

/**
 * Get all posts with user interaction status
 */
export async function getPosts(userId?: string, limit = 50): Promise<any[]> {
  try {
    // Use explicit foreign key constraint to ensure proper profile join
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
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Get user's interactions
    let userLikes: string[] = [];
    let userBookmarks: string[] = [];
    let userRetweets: string[] = [];

    if (userId) {
      const [likesRes, bookmarksRes, retweetsRes] = await Promise.all([
        supabase.from('post_likes').select('post_id').eq('user_id', userId),
        supabase.from('bookmarks').select('post_id').eq('user_id', userId),
        supabase.from('retweets').select('post_id').eq('user_id', userId),
      ]);

      userLikes = likesRes.data?.map(l => l.post_id) || [];
      userBookmarks = bookmarksRes.data?.map(b => b.post_id) || [];
      userRetweets = retweetsRes.data?.map(r => r.post_id) || [];
    }

    return (data || []).map(post => ({
      ...post,
      is_liked: userLikes.includes(post.id),
      is_bookmarked: userBookmarks.includes(post.id),
      is_retweeted: userRetweets.includes(post.id),
    }));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

/**
 * Get user profile by username or ID
 */
export async function getUserProfile(usernameOrId: string): Promise<any> {
  try {
    let query = supabase
      .from('profiles')
      .select('*');

    // Check if it's a UUID (ID) or username
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(usernameOrId);
    
    if (isUUID) {
      query = query.eq('id', usernameOrId);
    } else {
      query = query.eq('username', usernameOrId);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Get user's posts
 */
export async function getUserPosts(userId: string, viewerId?: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get viewer's interactions
    let viewerLikes: string[] = [];
    let viewerBookmarks: string[] = [];
    let viewerRetweets: string[] = [];

    if (viewerId) {
      const [likesRes, bookmarksRes, retweetsRes] = await Promise.all([
        supabase.from('post_likes').select('post_id').eq('user_id', viewerId),
        supabase.from('bookmarks').select('post_id').eq('user_id', viewerId),
        supabase.from('retweets').select('post_id').eq('user_id', viewerId),
      ]);

      viewerLikes = likesRes.data?.map(l => l.post_id) || [];
      viewerBookmarks = bookmarksRes.data?.map(b => b.post_id) || [];
      viewerRetweets = retweetsRes.data?.map(r => r.post_id) || [];
    }

    return (data || []).map(post => ({
      ...post,
      is_liked: viewerLikes.includes(post.id),
      is_bookmarked: viewerBookmarks.includes(post.id),
      is_retweeted: viewerRetweets.includes(post.id),
    }));
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
}
