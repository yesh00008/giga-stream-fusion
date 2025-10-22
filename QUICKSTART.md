# 🚀 Quick Start - Authentication Setup

Get your authentication system up and running in **5 minutes**!

## Prerequisites
- ✅ Node.js installed
- ✅ Supabase account (free tier works)

## Step 1: Create Supabase Project (2 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign in
3. Click "New Project"
4. Choose a name, database password, and region
5. Wait for project to be ready (~1 minute)

## Step 2: Get Your API Keys (1 minute)

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Configure Environment (30 seconds)

1. In your project root, create a `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Replace with your actual values from Step 2

## Step 4: Set Up Database (1 minute)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Allow anyone to read profiles
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select 
  using (true);

-- Allow users to update their own profile
create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile automatically
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

4. Click **Run** (bottom right)
5. Should see "Success. No rows returned"

## Step 5: Start the App (30 seconds)

```bash
npm run dev
```

## 🎉 You're Done!

Test your authentication:

1. **Navigate to:** http://localhost:5173/signup
2. **Create an account:**
   - Choose a username
   - Enter your email
   - Create a password (8+ chars, uppercase, lowercase, number)
   - Accept terms
   - Click "Create Account"

3. **Sign in:** http://localhost:5173/login
   - Use the credentials you just created
   - Click "Sign In"

4. **Check it works:**
   - You should be redirected to the home page
   - Your avatar should appear in the top right
   - Click it to see the dropdown menu
   - Try visiting `/profile` - it should work now!

## 🔒 Optional: Enable OAuth (5 minutes)

### Google Sign-In

1. In Supabase dashboard: **Authentication** → **Providers**
2. Find **Google** and toggle it ON
3. Follow the instructions to:
   - Create OAuth credentials in Google Cloud Console
   - Add authorized redirect URIs
   - Copy Client ID and Secret to Supabase

### GitHub Sign-In

1. In Supabase dashboard: **Authentication** → **Providers**
2. Find **GitHub** and toggle it ON
3. Follow the instructions to:
   - Create OAuth App in GitHub Settings
   - Add callback URL
   - Copy Client ID and Secret to Supabase

## 📝 What Just Happened?

You now have:

✅ Full email/password authentication  
✅ User profile automatically created on signup  
✅ Protected routes (try `/profile` when logged out)  
✅ User avatar in header  
✅ Logout functionality  
✅ Session persistence (refresh the page - you stay logged in!)  

## 🐛 Having Issues?

### Can't create account?
- Check the browser console for errors
- Verify your `.env` file has the correct values
- Make sure the SQL ran successfully in Step 4

### Not staying logged in?
- Check that `.env` is in your project root
- Restart the dev server after creating `.env`
- Clear browser cookies and try again

### Protected routes not working?
- Make sure you're logged in
- Check browser console for errors
- Verify you ran all the SQL from Step 4

## 📚 Learn More

- **Full Setup Guide:** See `SUPABASE_SETUP.md` for detailed database schema
- **Implementation Details:** See `AUTH_IMPLEMENTATION.md` for architecture
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)

---

**Questions?** Check the troubleshooting sections in the other docs!
