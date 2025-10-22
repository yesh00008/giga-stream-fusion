-- Giga Stream Fusion Database Schema
-- Copy and paste this entire file into Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  location TEXT,
  website TEXT,
  verified BOOLEAN DEFAULT FALSE,
  character_data JSONB DEFAULT '{}'::jsonb,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio', 'gif')),
  thumbnail_url TEXT,
  duration INTEGER,
  post_type TEXT DEFAULT 'post' CHECK (post_type IN ('post', 'short', 'live', 'story')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  location TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'reply', 'share')),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CHECK (sender_id != receiver_id)
);

-- Playlists table
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  videos_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Playlist items table
CREATE TABLE IF NOT EXISTS public.playlist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(playlist_id, post_id)
);

-- Watch history table
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  watch_duration INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subscriber_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  channel_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(subscriber_id, channel_id),
  CHECK (subscriber_id != channel_id)
);

-- Stories table
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  duration INTEGER DEFAULT 5,
  views_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + interval '24 hours') NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Channels table (for creator channels)
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  channel_name TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  subscribers_count INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_videos INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories table (for organizing content)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Post categories junction table
CREATE TABLE IF NOT EXISTS public.post_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, category_id)
);

-- Hashtags table
CREATE TABLE IF NOT EXISTS public.hashtags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  post_count INTEGER DEFAULT 0,
  trending_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Post hashtags junction table
CREATE TABLE IF NOT EXISTS public.post_hashtags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  hashtag_id UUID REFERENCES public.hashtags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, hashtag_id)
);

-- Bookmarks table (saved posts)
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  collection_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Shares table (track post shares)
CREATE TABLE IF NOT EXISTS public.shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  platform TEXT CHECK (platform IN ('twitter', 'facebook', 'whatsapp', 'email', 'copy_link', 'internal')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reports table (content moderation)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'hate_speech', 'violence', 'nudity', 'misinformation', 'copyright', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Blocks table (user blocking)
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blocker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Featured content table (homepage/trending sections)
CREATE TABLE IF NOT EXISTS public.featured_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('hero', 'trending', 'recommended', 'editors_pick')),
  priority INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Analytics table (track user engagement)
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'share', 'download', 'search', 'profile_view')),
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Settings table (user preferences)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en',
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  private_account BOOLEAN DEFAULT FALSE,
  show_activity_status BOOLEAN DEFAULT TRUE,
  allow_messages_from TEXT DEFAULT 'everyone' CHECK (allow_messages_from IN ('everyone', 'following', 'none')),
  content_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pages table (for CMS - static pages)
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  featured_image TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'password_protected')),
  password TEXT,
  template TEXT DEFAULT 'default',
  parent_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
  order_index INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sections table (homepage sections, banners, etc.)
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('hero', 'banner', 'video_grid', 'carousel', 'text_block', 'cta', 'features', 'testimonials', 'faq', 'stats')),
  title TEXT,
  subtitle TEXT,
  content TEXT,
  media_url TEXT,
  button_text TEXT,
  button_link TEXT,
  background_color TEXT,
  background_image TEXT,
  layout TEXT DEFAULT 'default',
  order_index INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Menus table (navigation menus)
CREATE TABLE IF NOT EXISTS public.menus (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL CHECK (location IN ('header', 'footer', 'sidebar', 'mobile')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Menu items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  icon TEXT,
  target TEXT DEFAULT '_self' CHECK (target IN ('_self', '_blank', '_parent', '_top')),
  order_index INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Site settings table (global website settings)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'number', 'boolean', 'json', 'image', 'color')),
  group_name TEXT DEFAULT 'general',
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- FAQ table
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  avatar_url TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  featured BOOLEAN DEFAULT FALSE,
  approved BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Banners table (promotional banners)
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  link_url TEXT,
  button_text TEXT,
  position TEXT CHECK (position IN ('top', 'middle', 'bottom', 'sidebar', 'modal')),
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'promo', 'announcement')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'authenticated', 'guests', 'premium')),
  click_count INTEGER DEFAULT 0,
  impression_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Advertisements table
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  advertiser_name TEXT,
  advertiser_email TEXT,
  image_url TEXT,
  video_url TEXT,
  link_url TEXT NOT NULL,
  ad_type TEXT CHECK (ad_type IN ('banner', 'video', 'native', 'popup', 'overlay')),
  placement TEXT CHECK (placement IN ('header', 'sidebar', 'content', 'footer', 'video_pre_roll', 'video_mid_roll', 'video_post_roll')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  budget DECIMAL(10, 2),
  cost_per_click DECIMAL(10, 2),
  cost_per_impression DECIMAL(10, 2),
  max_impressions INTEGER,
  max_clicks INTEGER,
  current_impressions INTEGER DEFAULT 0,
  current_clicks INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tags table (for content organization)
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT,
  icon TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Post tags junction table
CREATE TABLE IF NOT EXISTS public.post_tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, tag_id)
);

-- Collections table (curated content collections)
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'unlisted')),
  posts_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Collection items junction table
CREATE TABLE IF NOT EXISTS public.collection_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(collection_id, post_id)
);

-- Badges table (user achievements)
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  criteria JSONB,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User badges junction table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- Email templates table
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '{}'::jsonb,
  type TEXT CHECK (type IN ('welcome', 'verification', 'reset_password', 'notification', 'marketing', 'transactional')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Polls table
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  description TEXT,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  multiple_choice BOOLEAN DEFAULT FALSE,
  anonymous BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  total_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Poll options table
CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  votes_count INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Poll votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(poll_id, user_id, option_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_channels_user_id ON public.channels(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_hashtags_name ON public.hashtags(name);
CREATE INDEX IF NOT EXISTS idx_hashtags_trending ON public.hashtags(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_post_id ON public.shares(post_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON public.pages(status);
CREATE INDEX IF NOT EXISTS idx_sections_page_id ON public.sections(page_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON public.menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_polls_user_id ON public.polls(user_id);
CREATE INDEX IF NOT EXISTS idx_polls_expires_at ON public.polls(expires_at);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public posts viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Likes viewable by everyone" ON public.likes;
DROP POLICY IF EXISTS "Users can like posts" ON public.likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;
DROP POLICY IF EXISTS "Comments viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Follows viewable by everyone" ON public.follows;
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Public playlists viewable" ON public.playlists;
DROP POLICY IF EXISTS "Users create own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users update own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users delete own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users view own history" ON public.watch_history;
DROP POLICY IF EXISTS "Users manage own history" ON public.watch_history;
DROP POLICY IF EXISTS "Subscriptions viewable" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can subscribe" ON public.subscriptions;
DROP POLICY IF EXISTS "Users manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Active stories viewable" ON public.stories;
DROP POLICY IF EXISTS "Users create own stories" ON public.stories;
DROP POLICY IF EXISTS "Users delete own stories" ON public.stories;

-- Profiles policies
CREATE POLICY "Public profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Public posts viewable by everyone" ON public.posts FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Notifications policies
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users view own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Playlists policies
CREATE POLICY "Public playlists viewable" ON public.playlists FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());
CREATE POLICY "Users create own playlists" ON public.playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own playlists" ON public.playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own playlists" ON public.playlists FOR DELETE USING (auth.uid() = user_id);

-- Watch history policies
CREATE POLICY "Users view own history" ON public.watch_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own history" ON public.watch_history FOR ALL USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Subscriptions viewable" ON public.subscriptions FOR SELECT USING (true);
CREATE POLICY "Users can subscribe" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = subscriber_id);
CREATE POLICY "Users manage subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = subscriber_id);

-- Stories policies
CREATE POLICY "Active stories viewable" ON public.stories FOR SELECT USING (expires_at > now());
CREATE POLICY "Users create own stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own stories" ON public.stories FOR DELETE USING (auth.uid() = user_id);

-- Channels policies
DROP POLICY IF EXISTS "Channels viewable by everyone" ON public.channels;
DROP POLICY IF EXISTS "Users can create own channel" ON public.channels;
DROP POLICY IF EXISTS "Users can update own channel" ON public.channels;
CREATE POLICY "Channels viewable by everyone" ON public.channels FOR SELECT USING (true);
CREATE POLICY "Users can create own channel" ON public.channels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own channel" ON public.channels FOR UPDATE USING (auth.uid() = user_id);

-- Categories policies
DROP POLICY IF EXISTS "Categories viewable by everyone" ON public.categories;
CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Post categories policies
DROP POLICY IF EXISTS "Post categories viewable" ON public.post_categories;
DROP POLICY IF EXISTS "Users can categorize own posts" ON public.post_categories;
CREATE POLICY "Post categories viewable" ON public.post_categories FOR SELECT USING (true);
CREATE POLICY "Users can categorize own posts" ON public.post_categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
);

-- Hashtags policies
DROP POLICY IF EXISTS "Hashtags viewable by everyone" ON public.hashtags;
CREATE POLICY "Hashtags viewable by everyone" ON public.hashtags FOR SELECT USING (true);

-- Post hashtags policies
DROP POLICY IF EXISTS "Post hashtags viewable" ON public.post_hashtags;
DROP POLICY IF EXISTS "Users can tag own posts" ON public.post_hashtags;
CREATE POLICY "Post hashtags viewable" ON public.post_hashtags FOR SELECT USING (true);
CREATE POLICY "Users can tag own posts" ON public.post_hashtags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
);

-- Bookmarks policies
DROP POLICY IF EXISTS "Users view own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.bookmarks;
CREATE POLICY "Users view own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

-- Shares policies
DROP POLICY IF EXISTS "Users can share posts" ON public.shares;
CREATE POLICY "Users can share posts" ON public.shares FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reports policies
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Users view own reports" ON public.reports;
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users view own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);

-- Blocks policies
DROP POLICY IF EXISTS "Users view own blocks" ON public.blocks;
DROP POLICY IF EXISTS "Users manage own blocks" ON public.blocks;
CREATE POLICY "Users view own blocks" ON public.blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users manage own blocks" ON public.blocks FOR ALL USING (auth.uid() = blocker_id);

-- Featured content policies
DROP POLICY IF EXISTS "Featured content viewable" ON public.featured_content;
CREATE POLICY "Featured content viewable" ON public.featured_content FOR SELECT USING (active = true);

-- Analytics policies
DROP POLICY IF EXISTS "Users can log analytics" ON public.analytics;
CREATE POLICY "Users can log analytics" ON public.analytics FOR INSERT WITH CHECK (true);

-- User settings policies
DROP POLICY IF EXISTS "Users view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users manage own settings" ON public.user_settings;
CREATE POLICY "Users view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- Pages policies
DROP POLICY IF EXISTS "Published pages viewable by everyone" ON public.pages;
DROP POLICY IF EXISTS "Authors can manage own pages" ON public.pages;
CREATE POLICY "Published pages viewable by everyone" ON public.pages FOR SELECT USING (status = 'published' AND visibility = 'public');
CREATE POLICY "Authors can manage own pages" ON public.pages FOR ALL USING (auth.uid() = author_id);

-- Sections policies
DROP POLICY IF EXISTS "Visible sections viewable" ON public.sections;
CREATE POLICY "Visible sections viewable" ON public.sections FOR SELECT USING (visible = true);

-- Menus policies
DROP POLICY IF EXISTS "Active menus viewable" ON public.menus;
CREATE POLICY "Active menus viewable" ON public.menus FOR SELECT USING (active = true);

-- Menu items policies
DROP POLICY IF EXISTS "Visible menu items viewable" ON public.menu_items;
CREATE POLICY "Visible menu items viewable" ON public.menu_items FOR SELECT USING (visible = true);

-- Site settings policies
DROP POLICY IF EXISTS "Public settings viewable" ON public.site_settings;
CREATE POLICY "Public settings viewable" ON public.site_settings FOR SELECT USING (is_public = true);

-- FAQs policies
DROP POLICY IF EXISTS "Visible FAQs viewable" ON public.faqs;
CREATE POLICY "Visible FAQs viewable" ON public.faqs FOR SELECT USING (visible = true);

-- Testimonials policies
DROP POLICY IF EXISTS "Approved testimonials viewable" ON public.testimonials;
DROP POLICY IF EXISTS "Users can create testimonials" ON public.testimonials;
CREATE POLICY "Approved testimonials viewable" ON public.testimonials FOR SELECT USING (approved = true);
CREATE POLICY "Users can create testimonials" ON public.testimonials FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Banners policies
DROP POLICY IF EXISTS "Active banners viewable" ON public.banners;
CREATE POLICY "Active banners viewable" ON public.banners FOR SELECT USING (
  active = true AND 
  (start_date IS NULL OR start_date <= now()) AND 
  (end_date IS NULL OR end_date >= now())
);

-- Advertisements policies
DROP POLICY IF EXISTS "Active ads viewable" ON public.advertisements;
CREATE POLICY "Active ads viewable" ON public.advertisements FOR SELECT USING (
  active = true AND 
  approved = true AND
  (start_date IS NULL OR start_date <= now()) AND 
  (end_date IS NULL OR end_date >= now())
);

-- Tags policies
DROP POLICY IF EXISTS "Tags viewable by everyone" ON public.tags;
CREATE POLICY "Tags viewable by everyone" ON public.tags FOR SELECT USING (true);

-- Post tags policies
DROP POLICY IF EXISTS "Post tags viewable" ON public.post_tags;
CREATE POLICY "Post tags viewable" ON public.post_tags FOR SELECT USING (true);

-- Collections policies
DROP POLICY IF EXISTS "Public collections viewable" ON public.collections;
DROP POLICY IF EXISTS "Users manage own collections" ON public.collections;
CREATE POLICY "Public collections viewable" ON public.collections FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());
CREATE POLICY "Users manage own collections" ON public.collections FOR ALL USING (auth.uid() = user_id);

-- Collection items policies
DROP POLICY IF EXISTS "Collection items viewable" ON public.collection_items;
CREATE POLICY "Collection items viewable" ON public.collection_items FOR SELECT USING (true);

-- Badges policies
DROP POLICY IF EXISTS "Badges viewable by everyone" ON public.badges;
CREATE POLICY "Badges viewable by everyone" ON public.badges FOR SELECT USING (true);

-- User badges policies
DROP POLICY IF EXISTS "User badges viewable" ON public.user_badges;
CREATE POLICY "User badges viewable" ON public.user_badges FOR SELECT USING (true);

-- Email templates policies
DROP POLICY IF EXISTS "Active email templates viewable" ON public.email_templates;
CREATE POLICY "Active email templates viewable" ON public.email_templates FOR SELECT USING (active = true);

-- Polls policies
DROP POLICY IF EXISTS "Active polls viewable" ON public.polls;
DROP POLICY IF EXISTS "Users can create polls" ON public.polls;
CREATE POLICY "Active polls viewable" ON public.polls FOR SELECT USING (expires_at IS NULL OR expires_at > now());
CREATE POLICY "Users can create polls" ON public.polls FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Poll options policies
DROP POLICY IF EXISTS "Poll options viewable" ON public.poll_options;
CREATE POLICY "Poll options viewable" ON public.poll_options FOR SELECT USING (true);

-- Poll votes policies
DROP POLICY IF EXISTS "Users can vote on polls" ON public.poll_votes;
DROP POLICY IF EXISTS "Users view own votes" ON public.poll_votes;
CREATE POLICY "Users can vote on polls" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own votes" ON public.poll_votes FOR SELECT USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_posts_updated_at ON public.posts;
CREATE TRIGGER handle_posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_comments_updated_at ON public.comments;
CREATE TRIGGER handle_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_playlists_updated_at ON public.playlists;
CREATE TRIGGER handle_playlists_updated_at BEFORE UPDATE ON public.playlists
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_channels_updated_at ON public.channels;
CREATE TRIGGER handle_channels_updated_at BEFORE UPDATE ON public.channels
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER handle_user_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_pages_updated_at ON public.pages;
CREATE TRIGGER handle_pages_updated_at BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_sections_updated_at ON public.sections;
CREATE TRIGGER handle_sections_updated_at BEFORE UPDATE ON public.sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_menus_updated_at ON public.menus;
CREATE TRIGGER handle_menus_updated_at BEFORE UPDATE ON public.menus
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER handle_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_faqs_updated_at ON public.faqs;
CREATE TRIGGER handle_faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER handle_testimonials_updated_at BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_banners_updated_at ON public.banners;
CREATE TRIGGER handle_banners_updated_at BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_advertisements_updated_at ON public.advertisements;
CREATE TRIGGER handle_advertisements_updated_at BEFORE UPDATE ON public.advertisements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_collections_updated_at ON public.collections;
CREATE TRIGGER handle_collections_updated_at BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER handle_email_templates_updated_at BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert default categories
INSERT INTO public.categories (name, slug, description, icon, color) VALUES
  ('Gaming', 'gaming', 'Video games and gaming content', '🎮', '#9146FF'),
  ('Music', 'music', 'Music videos and performances', '🎵', '#FF6B6B'),
  ('Sports', 'sports', 'Sports highlights and analysis', '⚽', '#4ECDC4'),
  ('Education', 'education', 'Educational and tutorial content', '📚', '#FFE66D'),
  ('Entertainment', 'entertainment', 'Movies, TV shows, and entertainment', '🎬', '#FF6B9D'),
  ('Technology', 'technology', 'Tech reviews and tutorials', '💻', '#00D9FF'),
  ('Cooking', 'cooking', 'Cooking and food content', '🍳', '#FF8C42'),
  ('Travel', 'travel', 'Travel vlogs and destinations', '✈️', '#00BFA5'),
  ('Fashion', 'fashion', 'Fashion and style content', '👗', '#E91E63'),
  ('News', 'news', 'News and current events', '📰', '#F44336')
ON CONFLICT (slug) DO NOTHING;

-- Insert default site settings
INSERT INTO public.site_settings (key, value, type, group_name, description, is_public) VALUES
  ('site_name', 'Giga Stream Fusion', 'text', 'general', 'Website name', true),
  ('site_description', 'The ultimate video streaming and social platform', 'text', 'general', 'Website description', true),
  ('site_logo', '', 'image', 'general', 'Main logo URL', true),
  ('site_favicon', '', 'image', 'general', 'Favicon URL', true),
  ('contact_email', 'contact@gigastreamfusion.com', 'text', 'contact', 'Contact email', true),
  ('support_email', 'support@gigastreamfusion.com', 'text', 'contact', 'Support email', true),
  ('primary_color', '#3B82F6', 'color', 'theme', 'Primary brand color', true),
  ('secondary_color', '#8B5CF6', 'color', 'theme', 'Secondary brand color', true),
  ('max_upload_size', '500', 'number', 'uploads', 'Max upload size in MB', false),
  ('allowed_video_formats', '["mp4", "webm", "mov"]', 'json', 'uploads', 'Allowed video formats', false),
  ('enable_comments', 'true', 'boolean', 'features', 'Enable comments', true),
  ('enable_likes', 'true', 'boolean', 'features', 'Enable likes', true),
  ('enable_shares', 'true', 'boolean', 'features', 'Enable sharing', true),
  ('enable_stories', 'true', 'boolean', 'features', 'Enable stories', true),
  ('enable_live', 'true', 'boolean', 'features', 'Enable live streaming', true),
  ('maintenance_mode', 'false', 'boolean', 'system', 'Maintenance mode', false),
  ('registration_enabled', 'true', 'boolean', 'system', 'Allow new registrations', false),
  ('google_analytics_id', '', 'text', 'analytics', 'Google Analytics ID', false),
  ('facebook_pixel_id', '', 'text', 'analytics', 'Facebook Pixel ID', false)
ON CONFLICT (key) DO NOTHING;

-- Insert default menus
INSERT INTO public.menus (name, location, active) VALUES
  ('Main Menu', 'header', true),
  ('Footer Menu', 'footer', true),
  ('Mobile Menu', 'mobile', true)
ON CONFLICT DO NOTHING;

-- Insert default badges
INSERT INTO public.badges (name, description, icon, color, rarity, points) VALUES
  ('Early Adopter', 'Joined in the first month', '🌟', '#FFD700', 'legendary', 100),
  ('Verified Creator', 'Verified content creator', '✓', '#3B82F6', 'epic', 50),
  ('100 Followers', 'Reached 100 followers', '👥', '#10B981', 'rare', 25),
  ('1K Subscribers', 'Reached 1,000 subscribers', '📈', '#8B5CF6', 'epic', 50),
  ('Viral Video', 'Posted a video with 1M+ views', '🔥', '#EF4444', 'legendary', 100),
  ('Consistent Creator', 'Posted for 30 days in a row', '📅', '#F59E0B', 'rare', 30),
  ('Community Builder', 'Received 1000+ comments', '💬', '#06B6D4', 'rare', 35),
  ('Trendsetter', 'Created a trending hashtag', '#️⃣', '#EC4899', 'epic', 60)
ON CONFLICT (name) DO NOTHING;
