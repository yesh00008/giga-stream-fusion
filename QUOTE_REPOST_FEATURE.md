# Quote & Repost Feature - Implementation Guide

## 📋 Overview

This feature adds Twitter/X-style retweet functionality with two options:
1. **Repost**: Simple retweet (existing functionality)
2. **Quote**: Retweet with added comment and optional image

## 🎨 UI Components Created

### 1. RetweetMenu Component (`src/components/RetweetMenu.tsx`)
- Dropdown menu that appears when clicking the retweet button
- Two options: "Repost" and "Quote"
- Each option has an icon, title, and description
- Styled to match the existing app theme

### 2. QuoteDialog Component (`src/components/QuoteDialog.tsx`)
- Modal dialog for creating quote posts
- Features:
  - Text input with 500 character limit
  - Optional image upload
  - Preview of the original post being quoted
  - Shows author details with verification badge
  - Image preview with remove option

### 3. Updated PostCard Component (`src/components/PostCard.tsx`)
- Replaced simple retweet button with RetweetMenu
- Integrated QuoteDialog
- Added quote posting logic with image upload
- Includes proper error handling and toast notifications

## 🗄️ Database Schema

Run the `SETUP_QUOTES.sql` file in your Supabase SQL Editor to add:

### New Columns Added to `posts` Table:
```sql
quoted_post_id UUID      -- References the original post being quoted
quote_count INTEGER      -- Number of times this post has been quoted
```

### Features:
- **Foreign Key**: `quoted_post_id` references `posts(id)` with ON DELETE SET NULL
- **Index**: Created on `quoted_post_id` for better query performance
- **Trigger**: Auto-updates `quote_count` when quotes are created/deleted
- **RLS Policies**: Security policies for viewing quoted posts
- **View**: `posts_with_quotes` for easy querying of posts with their quoted content

## 🔧 How It Works

### 1. User Clicks Retweet Button
```tsx
<RetweetMenu
  isRetweeted={localRetweeted}
  retweetCount={localRetweets}
  onRepost={handleRetweetClick}  // Simple repost
  onQuote={handleQuoteClick}      // Opens quote dialog
/>
```

### 2. Quote Post Creation Flow
```typescript
handleQuotePosted = async (content: string, imageFile?: File) => {
  // 1. Upload image if provided
  const { url } = await uploadImage(imageFile, user.id);
  
  // 2. Create post with quoted_post_id reference
  await createPost({
    user_id: user.id,
    content,
    image_urls: url ? [url] : [],
    quoted_post_id: originalPostId  // Links to original post
  });
  
  // 3. Trigger automatically increments quote_count on original post
}
```

### 3. Database Trigger Magic ✨
When a quote post is created:
```sql
-- Trigger automatically runs:
UPDATE posts 
SET quote_count = quote_count + 1 
WHERE id = NEW.quoted_post_id;
```

## 📊 Querying Quoted Posts

### Get a post with its quoted post details:
```sql
SELECT * FROM posts_with_quotes 
WHERE id = 'your-post-id';
```

### Get all quotes of a specific post:
```sql
SELECT p.*, pr.username, pr.full_name
FROM posts p
JOIN profiles pr ON p.user_id = pr.id
WHERE p.quoted_post_id = 'original-post-id'
ORDER BY p.created_at DESC;
```

### Feed query with quoted posts:
```typescript
const { data } = await supabase
  .from('posts')
  .select(`
    *,
    profiles(*),
    quoted_post:quoted_post_id(
      id,
      content,
      image_url,
      profiles(*)
    )
  `)
  .order('created_at', { ascending: false });
```

## 🚀 Setup Instructions

### Step 1: Run Database Migration
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy the contents of `SETUP_QUOTES.sql`
4. Run the script
5. Verify columns were added:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns
   WHERE table_name = 'posts' 
     AND column_name IN ('quoted_post_id', 'quote_count');
   ```

### Step 2: Update Feed Query (Optional)
To display quoted posts in your feed, update your feed fetching logic:

```typescript
// In Home.tsx or wherever you fetch posts
const fetchPosts = async () => {
  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      profiles(*),
      quoted_post:posts!quoted_post_id(
        id,
        content,
        image_url,
        created_at,
        profiles(*)
      )
    `)
    .order('created_at', { ascending: false });
    
  setPosts(data);
};
```

### Step 3: Render Quoted Posts (Optional)
Add this to your PostCard component to show quoted posts:

```tsx
{/* Show quoted post if exists */}
{post.quoted_post && (
  <div className="mt-3 border border-border rounded-lg p-3 bg-muted/30">
    <div className="flex items-center gap-2 mb-2">
      <Avatar className="w-6 h-6">
        <AvatarImage src={post.quoted_post.profiles.avatar_url} />
      </Avatar>
      <span className="text-sm font-semibold">
        {post.quoted_post.profiles.full_name}
      </span>
      <span className="text-xs text-muted-foreground">
        @{post.quoted_post.profiles.username}
      </span>
    </div>
    <p className="text-sm">{post.quoted_post.content}</p>
    {post.quoted_post.image_url && (
      <img 
        src={post.quoted_post.image_url} 
        className="mt-2 rounded-lg max-h-48 object-cover"
      />
    )}
  </div>
)}
```

## 🎯 Features Implemented

✅ Dropdown menu on retweet button with two options
✅ Quote dialog with text input and image upload
✅ Original post preview in quote dialog
✅ Image upload and preview functionality
✅ Character limit (500) for quote text
✅ Database schema with triggers for auto-counting
✅ Proper error handling and user feedback
✅ Toast notifications for success/error
✅ Integration with existing feed service
✅ RLS policies for security
✅ Optimized queries with indexes

## 🔒 Security Considerations

- **RLS Policies**: Quote posts respect the same visibility rules as regular posts
- **Authentication**: Must be logged in to quote posts
- **Validation**: Character limits enforced on client and should be on server
- **Image Upload**: Uses Supabase Storage with user-specific folders
- **Cascading Deletes**: If original post is deleted, `quoted_post_id` is set to NULL

## 📱 User Experience Flow

1. User sees a post they want to quote
2. Clicks the retweet button (Repeat2 icon)
3. Dropdown appears with "Repost" and "Quote" options
4. Clicks "Quote"
5. Modal opens showing:
   - Text input for their thoughts
   - Option to add an image
   - Preview of the original post
6. User adds their comment (required) and/or image
7. Clicks "Quote Post"
8. Post is created with reference to original
9. Success toast appears
10. Modal closes
11. Original post's quote_count increments automatically

## 🐛 Troubleshooting

### Issue: Quote count not updating
**Solution**: Make sure you ran the SETUP_QUOTES.sql script which creates the trigger.

### Issue: "Failed to post quote" error
**Solution**: Check that:
- User is authenticated
- `quoted_post_id` column exists in posts table
- RLS policies allow INSERT on posts table

### Issue: Quoted post not showing in feed
**Solution**: Update your feed query to include the joined quoted post data (see Step 2 above).

### Issue: Image upload fails
**Solution**: Verify:
- Supabase Storage bucket 'posts' exists
- RLS policies allow uploads
- User has proper authentication

## 🔄 Future Enhancements

- [ ] Add quote count display on posts
- [ ] Show "X people quoted this" indicator
- [ ] View all quotes of a post in a separate page
- [ ] Add analytics for quote engagement
- [ ] Support nested quotes (quote of a quote)
- [ ] Add quote notifications
- [ ] Rich text editor for quote content
- [ ] GIF support in quotes
- [ ] Poll support in quotes

## 📝 Notes

- The `quoted_post_id` is stored in the `metadata` field of the posts table in the current implementation
- The trigger automatically handles quote count increments/decrements
- Quote posts are treated as regular posts with an additional reference
- Users can quote their own posts
- There's no limit on how many times a post can be quoted

## 💡 Tips for Developers

1. **Testing**: Create a test post and try quoting it to verify everything works
2. **Monitoring**: Check Supabase logs for any database errors
3. **Performance**: The index on `quoted_post_id` helps with query performance
4. **Cleanup**: The trigger handles count updates, but you may want to add a cron job to verify counts periodically
5. **UI/UX**: Consider adding animations when the quote is posted successfully

---

## 🎉 That's It!

You now have a fully functional quote/repost feature similar to Twitter/X! Users can:
- See the retweet dropdown menu
- Choose between simple repost or quote
- Add their thoughts and images to quoted posts
- See proper counts and attribution

Need help? Check the console logs for detailed error messages or refer to the Supabase documentation for RLS and trigger setup.
