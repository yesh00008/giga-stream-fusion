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
            <Route path="/studio" element={<Studio />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/explore" element={<Home />} />
            <Route path="/shorts" element={<Home />} />
            <Route path="/history" element={<Home />} />
            <Route path="/liked" element={<Home />} />
            <Route path="/trending" element={<Home />} />
            <Route path="/subscriptions" element={<Home />} />
            <Route path="/settings" element={<Home />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
