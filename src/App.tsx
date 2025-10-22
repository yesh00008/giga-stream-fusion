import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Studio from "./pages/Studio";
import Upload from "./pages/Upload";
import Shorts from "./pages/Shorts";
import Explore from "./pages/Explore";
import Subscriptions from "./pages/Subscriptions";
import History from "./pages/History";
import Liked from "./pages/Liked";
import Trending from "./pages/Trending";
import Settings from "./pages/Settings";
import Channel from "./pages/Channel";
import Live from "./pages/Live";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Playlists from "./pages/Playlists";
import SearchResults from "./pages/SearchResults";
import Search from "./pages/Search";
import Community from "./pages/Community";
import Library from "./pages/Library";
import Feed from "./pages/Feed";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DebugSupabase from "./pages/DebugSupabase";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./lib/auth-context";
import { EncryptionProvider } from "./lib/encryption-context";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <EncryptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Auth Routes - No Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Debug Route */}
            <Route path="/debug" element={<DebugSupabase />} />
            
            {/* Main App Routes - With Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/shorts" element={<Shorts />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/live" element={<Live />} />
            <Route path="/search" element={<Search />} />
            <Route path="/results" element={<SearchResults />} />
            <Route path="/community" element={<Community />} />
            <Route path="/channel/:id" element={<Channel />} />
            
            {/* Protected Routes - Require Authentication */}
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/liked" element={<ProtectedRoute><Liked /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
            <Route path="/studio" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:username" element={<Profile />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </EncryptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
