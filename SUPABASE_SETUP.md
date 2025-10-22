# Supabase Setup Guide

This application uses Supabase for authentication and database management.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project in your Supabase dashboard

## Setup Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (found under "Project URL")
   - **Anon/Public Key** (found under "Project API keys")

### 2. Configure Environment Variables

1. Create a `.env` file in the root directory of the project
2. Copy the contents from `.env.example`
3. Replace the placeholder values with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Schema

Create the following tables in your Supabase project:

#### Users Profile Table

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  character_data JSONB,
  location TEXT,
  website TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create a function to automatically create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call function on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

#### Posts Table

```sql
-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Posts are viewable by everyone" 
  ON posts FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own posts" 
  ON posts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON posts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON posts FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX posts_user_id_idx ON posts(user_id);
CREATE INDEX posts_created_at_idx ON posts(created_at DESC);
```

#### Likes Table

```sql
-- Create likes table
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Likes are viewable by everyone" 
  ON likes FOR SELECT 
  USING (true);

CREATE POLICY "Users can like posts" 
  ON likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" 
  ON likes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX likes_user_id_idx ON likes(user_id);
CREATE INDEX likes_post_id_idx ON likes(post_id);
```

#### Comments Table

```sql
-- Create comments table
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Comments are viewable by everyone" 
  ON comments FOR SELECT 
  USING (true);

CREATE POLICY "Users can create comments" 
  ON comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON comments FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX comments_user_id_idx ON comments(user_id);
CREATE INDEX comments_post_id_idx ON comments(post_id);
CREATE INDEX comments_created_at_idx ON comments(created_at DESC);
```

### 4. Configure Authentication Providers

#### Email Authentication
Email authentication is enabled by default in Supabase.

#### Google OAuth (Optional)

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable Google provider
3. Follow the instructions to set up Google OAuth credentials
4. Add your authorized redirect URLs

#### GitHub OAuth (Optional)

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable GitHub provider
3. Follow the instructions to set up GitHub OAuth credentials
4. Add your authorized redirect URLs

### 5. Email Templates (Optional)

Customize your email templates in **Authentication** → **Email Templates**:
- Confirm signup
- Magic link
- Change email address
- Reset password

## Usage

### Authentication Functions

The application provides the following authentication functions in `src/lib/supabase.ts`:

```typescript
// Sign up
signUp(email, password, username)

// Sign in
signIn(email, password)

// Sign out
signOut()

// Get current user
getCurrentUser()

// Get session
getSession()

// OAuth sign in
signInWithGoogle()
signInWithGithub()
```

### Protected Routes

To protect routes and require authentication:

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '@/lib/supabase';

function ProtectedComponent() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  return <div>Protected Content</div>;
}
```

## Security Best Practices

1. **Never commit your `.env` file** - It contains sensitive credentials
2. **Use Row Level Security (RLS)** - Always enable RLS on your tables
3. **Validate user input** - Always validate and sanitize user input on both client and server
4. **Use HTTPS** - Always use HTTPS in production
5. **Rotate keys regularly** - Periodically rotate your API keys in production

## Troubleshooting

### Common Issues

**Issue:** "Invalid API key"
- **Solution:** Verify your `.env` file has the correct credentials

**Issue:** "Failed to create profile"
- **Solution:** Make sure you've run all the SQL commands to create tables and triggers

**Issue:** "OAuth redirect not working"
- **Solution:** Check that your redirect URLs are correctly configured in Supabase and OAuth provider settings

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
