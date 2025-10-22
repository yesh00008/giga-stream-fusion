/**
 * Data Cleanup Utility
 * Removes all hardcoded dummy data and replaces with real database queries
 */

import { supabase } from './supabase';
import { SecureDB } from './secure-api';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  user_id: string;
  likes: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  media_url?: string;
  image_url?: string;
  encrypted?: boolean;
}

export interface Profile {
  id: string;
  username: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  verified: boolean;
}

/**
 * Fetch real posts from database with encryption
 */
export async function fetchPosts(options?: {
  limit?: number;
  userId?: string;
  orderBy?: 'created_at' | 'likes' | 'views';
  encrypted?: boolean;
}): Promise<Post[]> {
  try {
    const { limit = 20, userId, orderBy = 'created_at', encrypted = true } = options || {};

    if (encrypted) {
      // Use encrypted API
      const { data, error } = await SecureDB.select<Post>('posts', userId ? { user_id: userId } : undefined);
      
      if (error) throw error;
      return data || [];
    } else {
      // Regular query with all counts
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url,
            badge_type
          )
        `)
        .order(orderBy, { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Get current user's interactions if userId provided
      let userLikes: string[] = [];
      let userBookmarks: string[] = [];
      let userRetweets: string[] = [];

      if (userId) {
        try {
          const [likesRes, bookmarksRes, retweetsRes] = await Promise.all([
            supabase.from('post_likes').select('post_id').eq('user_id', userId),
            supabase.from('bookmarks').select('post_id').eq('user_id', userId),
            supabase.from('retweets').select('post_id').eq('user_id', userId),
          ]);
          
          userLikes = likesRes.data?.map(l => l.post_id) || [];
          userBookmarks = bookmarksRes.data?.map(b => b.post_id) || [];
          userRetweets = retweetsRes.data?.map(r => r.post_id) || [];
        } catch (e) {
          console.log('Interaction tables not found or error:', e);
        }
      }
      
      // Format the data to match Post interface with proper author field and interactions
      const formattedData = (data || []).map((post: any) => ({
        ...post,
        author: post.profiles?.full_name || post.profiles?.username || 'Anonymous',
        image_url: post.image_url || null,
        likes: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        retweets_count: post.retweets_count || 0,
        is_liked: userLikes.includes(post.id),
        is_bookmarked: userBookmarks.includes(post.id),
        is_retweeted: userRetweets.includes(post.id),
      }));
      
      return formattedData;
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

/**
 * Fetch user profiles
 */
export async function fetchProfiles(options?: {
  userIds?: string[];
  limit?: number;
  encrypted?: boolean;
}): Promise<Profile[]> {
  try {
    const { userIds, limit = 20, encrypted = true } = options || {};

    if (encrypted) {
      const filters = userIds ? { id: userIds } : undefined;
      const { data, error } = await SecureDB.select<Profile>('profiles', filters);
      
      if (error) throw error;
      return data || [];
    } else {
      let query = supabase
        .from('profiles')
        .select('*')
        .limit(limit);

      if (userIds && userIds.length > 0) {
        query = query.in('id', userIds);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
}

/**
 * Delete user post permanently
 */
export async function deletePost(postId: string): Promise<boolean> {
  try {
    const { success, error } = await SecureDB.delete('posts', postId);
    
    if (error) throw error;
    
    console.log('✅ Post permanently deleted:', postId);
    return success;
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    return false;
  }
}

/**
 * Update post (deletes old, inserts new)
 */
export async function updatePost(postId: string, newData: Partial<Post>): Promise<Post | null> {
  try {
    const { data, error } = await SecureDB.update<Post>('posts', postId, newData as Post);
    
    if (error) throw error;
    
    console.log('✅ Post updated (old data deleted):', postId);
    return data;
  } catch (error) {
    console.error('❌ Error updating post:', error);
    return null;
  }
}

/**
 * Clean up all dummy data in database
 */
export async function cleanupDummyData(): Promise<void> {
  try {
    console.log('🧹 Starting dummy data cleanup...');

    // Execute the cleanup function in database
    const { error } = await supabase.rpc('cleanup_dummy_data');
    
    if (error) throw error;
    
    console.log('✅ Dummy data cleanup completed');
  } catch (error) {
    console.error('❌ Error cleaning up dummy data:', error);
  }
}

/**
 * Batch delete posts
 */
export async function deletePostsBatch(postIds: string[]): Promise<number> {
  try {
    const { deleted, error } = await SecureDB.deleteBatch('posts', postIds);
    
    if (error) throw error;
    
    console.log(`✅ Batch deletion: ${deleted}/${postIds.length} posts deleted`);
    return deleted;
  } catch (error) {
    console.error('❌ Error in batch deletion:', error);
    return 0;
  }
}

/**
 * Fetch liked posts for user
 */
export async function fetchLikedPosts(userId: string): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select(`
        post_id,
        posts (
          *,
          profiles:user_id (
            username,
            name,
            avatar_url,
            verified
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data?.map((like: any) => like.posts).filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    return [];
  }
}

/**
 * Fetch user's history
 */
export async function fetchHistory(userId: string): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('views')
      .select(`
        post_id,
        viewed_at,
        posts (
          *,
          profiles:user_id (
            username,
            name,
            avatar_url,
            verified
          )
        )
      `)
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    
    return data?.map((view: any) => view.posts).filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
}

/**
 * Clear user history (permanent deletion)
 */
export async function clearHistory(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('views')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    
    console.log('✅ History permanently cleared for user:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error clearing history:', error);
    return false;
  }
}

/**
 * Delete user account and ALL associated data
 */
export async function deleteUserAccount(userId: string): Promise<boolean> {
  try {
    console.log('🗑️ Initiating complete account deletion...');

    // Delete from auth.users (triggers cascade delete via trigger)
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) throw error;
    
    // Delete storage files
    const buckets = ['avatars', 'banners', 'posts', 'media'];
    for (const bucket of buckets) {
      const { data: files } = await supabase.storage.from(bucket).list(userId);
      
      if (files && files.length > 0) {
        const filePaths = files.map((file) => `${userId}/${file.name}`);
        await supabase.storage.from(bucket).remove(filePaths);
      }
    }
    
    console.log('✅ User account and ALL data permanently deleted');
    return true;
  } catch (error) {
    console.error('❌ Error deleting user account:', error);
    return false;
  }
}

// Export utility functions
export const dataUtils = {
  fetchPosts,
  fetchProfiles,
  deletePost,
  updatePost,
  cleanupDummyData,
  deletePostsBatch,
  fetchLikedPosts,
  fetchHistory,
  clearHistory,
  deleteUserAccount,
};

export default dataUtils;
