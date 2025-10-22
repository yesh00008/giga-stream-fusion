-- ============================================
-- FIX 406 ERRORS - Allow PUBLIC and AUTHENTICATED access
-- The issue: Policies are only for 'authenticated' but queries might use 'anon' role
-- ============================================

-- Drop and recreate with broader permissions

-- ============================================
-- POST_LIKES: Allow both public and authenticated
-- ============================================

DROP POLICY IF EXISTS "Anyone can view post likes" ON post_likes;
DROP POLICY IF EXISTS "Users can create their own post likes" ON post_likes;
DROP POLICY IF EXISTS "Users can delete their own post likes" ON post_likes;

-- Public can view (anyone can see likes)
CREATE POLICY "Public can view post likes"
ON post_likes
FOR SELECT
USING (true);

-- Authenticated can insert
CREATE POLICY "Authenticated can create post likes"
ON post_likes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own
CREATE POLICY "Users can delete own post likes"
ON post_likes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- RETWEETS: Allow both public and authenticated
-- ============================================

DROP POLICY IF EXISTS "Anyone can view retweets" ON retweets;
DROP POLICY IF EXISTS "Users can create their own retweets" ON retweets;
DROP POLICY IF EXISTS "Users can delete their own retweets" ON retweets;

-- Public can view (anyone can see retweets)
CREATE POLICY "Public can view retweets"
ON retweets
FOR SELECT
USING (true);

-- Authenticated can insert
CREATE POLICY "Authenticated can create retweets"
ON retweets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own
CREATE POLICY "Users can delete own retweets"
ON retweets
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- BOOKMARKS: Allow both public and authenticated
-- ============================================

DROP POLICY IF EXISTS "Anyone can view bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;

-- Public can view (anyone can see bookmarks)
CREATE POLICY "Public can view bookmarks"
ON bookmarks
FOR SELECT
USING (true);

-- Authenticated can insert
CREATE POLICY "Authenticated can create bookmarks"
ON bookmarks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own
CREATE POLICY "Users can delete own bookmarks"
ON bookmarks
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- VERIFY
-- ============================================

SELECT 
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('post_likes', 'retweets', 'bookmarks')
ORDER BY tablename, cmd;
