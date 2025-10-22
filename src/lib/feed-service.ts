import { supabase } from './supabase';

export interface FeedPost {
  id?: string;
  user_id: string;
  content: string;
  image_urls?: string[];
  video_url?: string;
  poll_data?: {
    options: string[];
    ends_at: string;
    duration_hours: number;
  };
  quoted_post_id?: string;
  reply_to_post_id?: string;
  is_draft?: boolean;
  scheduled_at?: string;
  visibility?: 'public' | 'followers' | 'private';
  created_at?: string;
  updated_at?: string;
}

export interface FeedInteraction {
  post_id: string;
  user_id: string;
  interaction_type: 'like' | 'retweet' | 'bookmark';
}

// Create a new post
export const createPost = async (post: FeedPost) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        user_id: post.user_id,
        title: post.content.substring(0, 100),
        content: post.content,
        content_type: 'post',
        image_url: post.image_urls?.[0] || null,
        video_url: post.video_url || null,
        metadata: {
          image_urls: post.image_urls || [],
          poll_data: post.poll_data || null,
          quoted_post_id: post.quoted_post_id || null,
          reply_to_post_id: post.reply_to_post_id || null,
          visibility: post.visibility || 'public',
          scheduled_at: post.scheduled_at || null,
        },
        is_draft: post.is_draft || false,
      }])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error creating post:', error);
    return { data: null, error };
  }
};

// Get single post by ID with all details
export const getPostById = async (postId: string) => {
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
      .maybeSingle();

    return { data: data ? [data] : [], error };
  } catch (error: any) {
    console.error('Error fetching post:', error);
    return { data: null, error };
  }
};

// Get comments for a post
export const getComments = async (postId: string) => {
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
      .order('created_at', { ascending: true });

    return { data, error };
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return { data: null, error };
  }
};

// Create a comment
export const createComment = async (comment: {
  post_id: string;
  user_id: string;
  content: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([comment])
      .select()
      .single();

    return { data, error };
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return { data: null, error };
  }
};

// Get retweets for a post
export const getRetweets = async (postId: string) => {
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
        ),
        posts:post_id (
          content
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error: any) {
    console.error('Error fetching retweets:', error);
    return { data: null, error };
  }
};

// Increment share count
export const incrementShareCount = async (postId: string) => {
  try {
    const { data, error } = await supabase.rpc('increment_shares_count', {
      post_id: postId,
    });

    if (!error) return { data, error };
    
    // If function doesn't exist, update manually
    const { data: post } = await supabase
      .from('posts')
      .select('shares_count')
      .eq('id', postId)
      .single();

    if (post) {
      const { data: updateData, error: updateError } = await supabase
        .from('posts')
        .update({ shares_count: (post.shares_count || 0) + 1 })
        .eq('id', postId);

      return { data: updateData, error: updateError };
    }

    return { data: null, error };
  } catch (error: any) {
    console.error('Error incrementing share count:', error);
    return { data: null, error };
  }
};

// Update a post
export const updatePost = async (postId: string, updates: Partial<FeedPost>) => {
  try {
    const updateData: any = {};
    
    if (updates.content !== undefined) {
      updateData.content = updates.content;
      updateData.title = updates.content.substring(0, 100);
    }
    
    if (updates.is_draft !== undefined) {
      updateData.is_draft = updates.is_draft;
    }

    if (updates.image_urls || updates.poll_data || updates.quoted_post_id || updates.visibility) {
      // Get existing metadata first
      const { data: existingPost } = await supabase
        .from('posts')
        .select('metadata')
        .eq('id', postId)
        .single();

      updateData.metadata = {
        ...(existingPost?.metadata || {}),
        ...(updates.image_urls && { image_urls: updates.image_urls }),
        ...(updates.poll_data && { poll_data: updates.poll_data }),
        ...(updates.quoted_post_id && { quoted_post_id: updates.quoted_post_id }),
        ...(updates.visibility && { visibility: updates.visibility }),
      };
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error updating post:', error);
    return { data: null, error };
  }
};

// Delete a post
export const deletePost = async (postId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return { error };
  }
};

// Toggle like on a post with optimistic updates
export const toggleLike = async (postId: string, userId: string) => {
  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingLike) {
      // Unlike - delete the like
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Decrement count (use RPC or fallback to manual update)
      try {
        await supabase.rpc('decrement_likes_count', { post_id: postId });
      } catch {
        const { data: post } = await supabase
          .from('posts')
          .select('likes_count')
          .eq('id', postId)
          .single();
        
        if (post) {
          await supabase
            .from('posts')
            .update({ likes_count: Math.max((post.likes_count || 0) - 1, 0) })
            .eq('id', postId);
        }
      }

      return { liked: false, error: null };
    } else {
      // Like - insert the like
      const { error: insertError } = await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: userId }]);

      if (insertError) throw insertError;

      // Increment count (use RPC or fallback to manual update)
      try {
        await supabase.rpc('increment_likes_count', { post_id: postId });
      } catch {
        const { data: post } = await supabase
          .from('posts')
          .select('likes_count')
          .eq('id', postId)
          .single();
        
        if (post) {
          await supabase
            .from('posts')
            .update({ likes_count: (post.likes_count || 0) + 1 })
            .eq('id', postId);
        }
      }

      return { liked: true, error: null };
    }
  } catch (error: any) {
    console.error('Error toggling like:', error);
    return { liked: false, error };
  }
};

// Toggle bookmark on a post
export const toggleBookmark = async (postId: string, userId: string) => {
  try {
    const { data: existing, error: checkError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) throw error;
      return { bookmarked: false, error: null };
    } else {
      const { error } = await supabase
        .from('bookmarks')
        .insert([{ post_id: postId, user_id: userId }]);

      if (error) throw error;
      return { bookmarked: true, error: null };
    }
  } catch (error: any) {
    console.error('Error toggling bookmark:', error);
    return { bookmarked: false, error };
  }
};

// Toggle retweet on a post
export const toggleRetweet = async (postId: string, userId: string) => {
  try {
    const { data: existing, error: checkError } = await supabase
      .from('retweets')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      const { error } = await supabase
        .from('retweets')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);

      if (error) throw error;
      return { retweeted: false, error: null };
    } else {
      const { error } = await supabase
        .from('retweets')
        .insert([{ post_id: postId, user_id: userId }]);

      if (error) throw error;
      return { retweeted: true, error: null };
    }
  } catch (error: any) {
    console.error('Error toggling retweet:', error);
    return { retweeted: false, error };
  }
};

// Get posts with user interactions and accurate counts
export const getPosts = async (userId?: string, limit = 50) => {
  try {
    // First, get all posts with accurate counts from database
    const { data: postsData, error: postsError } = await supabase
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
      .eq('content_type', 'post')
      .or('is_draft.eq.false,is_draft.is.null')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (postsError) throw postsError;

    // If no user is logged in, return posts without interaction data but with counts
    if (!userId || !postsData) {
      const formattedPosts = (postsData || []).map(post => ({
        ...post,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        retweets_count: post.retweets_count || 0,
        is_liked: false,
        is_bookmarked: false,
        is_retweeted: false,
      }));
      return { data: formattedPosts, error: null };
    }

    // Get user interactions in parallel for better performance
    let userLikes: string[] = [];
    let userBookmarks: string[] = [];
    let userRetweets: string[] = [];

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

    // Format posts with user interactions and accurate counts
    const formattedPosts = postsData?.map(post => ({
      ...post,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      retweets_count: post.retweets_count || 0,
      is_liked: userLikes.includes(post.id),
      is_bookmarked: userBookmarks.includes(post.id),
      is_retweeted: userRetweets.includes(post.id),
    }));

    return { data: formattedPosts, error: null };
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return { data: null, error };
  }
};

// Get user's draft posts
export const getDraftPosts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .eq('content_type', 'post')
      .eq('is_draft', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching drafts:', error);
    return { data: null, error };
  }
};

// Publish a draft post
export const publishDraft = async (postId: string, userId: string) => {
  return updatePost(postId, { is_draft: false });
};

// Upload image to storage
export const uploadImage = async (file: File, userId: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `posts/${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return { url: null, error };
  }
};

// Upload multiple images
export const uploadImages = async (files: File[], userId: string) => {
  const uploadPromises = files.map(file => uploadImage(file, userId));
  const results = await Promise.all(uploadPromises);
  
  const urls = results
    .filter(result => result.url !== null)
    .map(result => result.url as string);
  
  const errors = results
    .filter(result => result.error !== null)
    .map(result => result.error);
  
  return { urls, errors: errors.length > 0 ? errors : null };
};
