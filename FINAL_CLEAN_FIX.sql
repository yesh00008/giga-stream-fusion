-- ============================================
-- FINAL FIX - Manual schema cache reload
-- ============================================

-- Step 1: Drop all problematic tables and recreate from scratch
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS retweet_comment_likes CASCADE;
DROP TABLE IF EXISTS retweet_comments CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS retweets CASCADE;

-- ============================================
-- RETWEETS - Clean recreation
-- ============================================
CREATE TABLE retweets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    comments_count INTEGER DEFAULT 0,
    CONSTRAINT retweets_post_fkey FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT retweets_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT retweets_unique UNIQUE(post_id, user_id)
);

ALTER TABLE retweets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "retweets_select_policy" ON retweets FOR SELECT USING (true);
CREATE POLICY "retweets_insert_policy" ON retweets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "retweets_delete_policy" ON retweets FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_retweets_post ON retweets(post_id);
CREATE INDEX idx_retweets_user ON retweets(user_id);

-- ============================================
-- POST_LIKES - Clean recreation
-- ============================================
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT post_likes_post_fkey FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT post_likes_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT post_likes_unique UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_likes_select_policy" ON post_likes FOR SELECT USING (true);
CREATE POLICY "post_likes_insert_policy" ON post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_likes_delete_policy" ON post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_user ON post_likes(user_id);

-- ============================================
-- BOOKMARKS - Clean recreation
-- ============================================
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT bookmarks_post_fkey FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT bookmarks_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT bookmarks_unique UNIQUE(post_id, user_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookmarks_select_policy" ON bookmarks FOR SELECT USING (true);
CREATE POLICY "bookmarks_insert_policy" ON bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete_policy" ON bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_bookmarks_post ON bookmarks(post_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

-- ============================================
-- COMMENTS - Clean recreation
-- ============================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    edited BOOLEAN DEFAULT false,
    CONSTRAINT comments_post_fkey FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT comments_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_policy" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_policy" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update_policy" ON comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete_policy" ON comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- ============================================
-- COMMENT_LIKES - Clean recreation
-- ============================================
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT comment_likes_comment_fkey FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    CONSTRAINT comment_likes_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT comment_likes_unique UNIQUE(comment_id, user_id)
);

ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comment_likes_select_policy" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "comment_likes_insert_policy" ON comment_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_likes_delete_policy" ON comment_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user ON comment_likes(user_id);

-- ============================================
-- Fix profiles table relationship
-- ============================================
DO $$
BEGIN
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
    tc.table_name, 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name IN ('retweets', 'post_likes', 'bookmarks', 'comments', 'comment_likes')
AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;
