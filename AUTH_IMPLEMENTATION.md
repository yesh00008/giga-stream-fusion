# Authentication Implementation Guide

This document explains the authentication system implementation in Giga Stream Fusion.

## 🏗️ Architecture Overview

The authentication system is built using Supabase Auth and follows these principles:

- **JWT-based authentication** with automatic token refresh
- **Protected routes** that require authentication
- **Global auth state** using React Context
- **OAuth integration** (Google, GitHub)
- **Email/password authentication** with validation

## 📁 File Structure

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client and auth functions
│   └── auth-context.tsx     # Global auth state management
├── components/
│   ├── ProtectedRoute.tsx   # Route guard component
│   └── Header.tsx           # Updated with user dropdown
├── pages/
│   ├── Login.tsx            # Login page
│   └── Signup.tsx           # Signup page with validation
└── main.tsx                 # Wrapped with AuthProvider
```

## 🔐 Core Components

### 1. Supabase Client (`src/lib/supabase.ts`)

Central configuration for all auth operations:

```typescript
import { supabase } from '@/lib/supabase';

// Sign up new user
await signUp(email, password, username);

// Sign in existing user
await signIn(email, password);

// Sign out
await signOut();

// Get current user
const user = await getCurrentUser();

// OAuth sign in
await signInWithGoogle();
await signInWithGithub();
```

### 2. Auth Context (`src/lib/auth-context.tsx`)

Provides global auth state to the entire application:

```typescript
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { user, session, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;
  
  return <div>Welcome, {user.email}!</div>;
}
```

**Features:**
- Automatically listens for auth state changes
- Handles session refresh
- Provides loading states
- Available in any component via `useAuth()` hook

### 3. Protected Route (`src/components/ProtectedRoute.tsx`)

Wraps routes that require authentication:

```typescript
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>
```

**Behavior:**
- Shows loading spinner while checking auth
- Redirects to `/login` if not authenticated
- Renders children if authenticated

### 4. Updated Header (`src/components/Header.tsx`)

Now displays user info and auth status:

**When logged in:**
- User avatar with dropdown menu
- Profile link
- Settings link
- Logout button

**When logged out:**
- "Sign In" button

## 🛡️ Protected Routes

The following routes require authentication:

- `/profile` - User profile
- `/history` - Watch history
- `/liked` - Liked videos
- `/library` - User library
- `/playlists` - User playlists
- `/studio` - Creator studio
- `/upload` - Upload content
- `/messages` - Direct messages
- `/notifications` - Notifications
- `/settings` - User settings
- `/feed` - Social feed

**Public routes** (no auth required):
- `/` - Home
- `/explore` - Explore content
- `/trending` - Trending videos
- `/watch/:id` - Watch videos
- `/shorts` - Short videos
- `/live` - Live streams
- `/search` - Search
- `/community` - Community posts
- `/channel/:id` - Channel pages

## 🚀 Setup Instructions

### 1. Configure Supabase

Follow the comprehensive guide in `SUPABASE_SETUP.md` to:
- Create a Supabase project
- Get your API keys
- Set up the database schema
- Configure OAuth providers (optional)

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Use `.env.example` as a template.

### 3. Test Authentication

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test signup flow:**
   - Navigate to `/signup`
   - Fill in username, email, and password
   - Check password requirements (green checkmarks)
   - Accept terms and conditions
   - Click "Create Account"
   - Check email for verification (if enabled)

3. **Test login flow:**
   - Navigate to `/login`
   - Enter email and password
   - Click "Sign In"
   - Should redirect to home page

4. **Test protected routes:**
   - While logged out, try to access `/profile`
   - Should redirect to `/login`
   - After logging in, `/profile` should be accessible

5. **Test logout:**
   - Click user avatar in header
   - Click "Log Out"
   - Should redirect to `/login`

## 🔄 Auth Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Actions                         │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Login/Signup Pages                         │
│  - Email/Password validation                            │
│  - OAuth buttons (Google/GitHub)                        │
│  - Error handling with toasts                           │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase Client                            │
│  - Authentication API calls                             │
│  - JWT token management                                 │
│  - Session persistence                                  │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Auth Context                               │
│  - Global user state                                    │
│  - Session monitoring                                   │
│  - Auto token refresh                                   │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│         Components (Header, ProtectedRoute)             │
│  - Access user data via useAuth()                       │
│  - Conditional rendering based on auth state            │
│  - Route protection                                     │
└─────────────────────────────────────────────────────────┘
```

## 💡 Usage Examples

### Check if user is logged in

```typescript
import { useAuth } from '@/lib/auth-context';

function MyComponent() {
  const { user } = useAuth();
  
  return (
    <div>
      {user ? (
        <p>Welcome back, {user.email}!</p>
      ) : (
        <p>Please sign in to continue</p>
      )}
    </div>
  );
}
```

### Get user metadata

```typescript
const { user } = useAuth();

// Username (set during signup)
const username = user?.user_metadata?.username;

// Avatar URL (if set)
const avatarUrl = user?.user_metadata?.avatar_url;

// Email
const email = user?.email;
```

### Manually sign out

```typescript
import { signOut } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

function LogoutButton() {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
  return <button onClick={handleLogout}>Log Out</button>;
}
```

### Protect a custom component

```typescript
import { useAuth } from '@/lib/auth-context';
import { Navigate } from 'react-router-dom';

function PrivateContent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return <div>Secret content only for logged-in users!</div>;
}
```

## 🔒 Security Best Practices

1. **Never expose your Supabase anon key in public repositories**
   - Add `.env` to `.gitignore`
   - Use environment variables

2. **Enable Row Level Security (RLS) in Supabase**
   - Protect user data at the database level
   - See `SUPABASE_SETUP.md` for RLS policies

3. **Validate user input**
   - Password strength requirements
   - Email format validation
   - XSS prevention

4. **Use HTTPS in production**
   - Supabase enforces HTTPS by default
   - Ensure your hosting platform uses HTTPS

5. **Implement proper error handling**
   - Don't expose sensitive error details to users
   - Log errors securely for debugging

## 🐛 Troubleshooting

### "Invalid login credentials" error

- Check that email/password are correct
- Verify email is confirmed (check inbox)
- Check Supabase dashboard for user status

### User not persisting after page refresh

- Check that AuthProvider wraps entire app in `main.tsx`
- Verify Supabase URL and keys are correct in `.env`
- Check browser console for errors

### Protected routes not working

- Ensure `ProtectedRoute` component is imported correctly
- Check that route is wrapped properly in `App.tsx`
- Verify AuthProvider is at root level

### OAuth not working

- Check OAuth configuration in Supabase dashboard
- Verify redirect URLs are correct
- See `SUPABASE_SETUP.md` OAuth section

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Context API](https://react.dev/reference/react/useContext)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/tutorial#protecting-routes)
- [JWT Authentication](https://jwt.io/introduction)

## 🎯 Next Steps

1. **Customize the UI:**
   - Update login/signup page designs
   - Add more form fields (name, avatar, etc.)
   - Customize email templates in Supabase

2. **Add more features:**
   - Password reset flow
   - Email verification reminders
   - Two-factor authentication
   - Social profile integration

3. **Enhance security:**
   - Add rate limiting
   - Implement CAPTCHA
   - Add IP whitelisting
   - Enable MFA

4. **User profile management:**
   - Update profile endpoint
   - Avatar upload
   - Change password
   - Delete account

---

**Need help?** Check `SUPABASE_SETUP.md` for database configuration or reach out to the development team.
