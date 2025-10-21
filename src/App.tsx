import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
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
import Feed from "./pages/Twitter";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/shorts" element={<Shorts />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/history" element={<History />} />
            <Route path="/liked" element={<Liked />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/channel/:id" element={<Channel />} />
            <Route path="/live" element={<Live />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/search" element={<Search />} />
            <Route path="/results" element={<SearchResults />} />
            <Route path="/community" element={<Community />} />
            <Route path="/library" element={<Library />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
