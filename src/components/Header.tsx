import { BellDot, Mail, Plus, PlaySquare, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { signOut, supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchNotificationCount();
      
      // Set up real-time subscription for follow requests
      const subscription = supabase
        .channel('follow_requests_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'follow_requests',
            filter: `target_id=eq.${user.id}`
          },
          () => {
            fetchNotificationCount();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id]);

  const fetchNotificationCount = async () => {
    if (!user?.id) return;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch all notification counts in parallel for speed
      const [
        followRequestsCount,
        likesCount,
        commentsCount,
        retweetsCount
      ] = await Promise.all([
        // Follow requests count
        supabase
          .from('follow_requests')
          .select('*', { count: 'exact', head: true })
          .eq('target_id', user.id)
          .eq('status', 'pending'),

        // Likes count (on user's posts)
        supabase
          .from('post_likes')
          .select('post_id', { count: 'exact', head: true })
          .neq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .then(async (result) => {
            // Get user's post IDs to filter
            const userPosts = await supabase
              .from('posts')
              .select('id')
              .eq('user_id', user.id);
            
            if (!userPosts.data) return { count: 0 };
            
            const postIds = userPosts.data.map(p => p.id);
            if (postIds.length === 0) return { count: 0 };
            
            // Count likes on user's posts
            return supabase
              .from('post_likes')
              .select('*', { count: 'exact', head: true })
              .in('post_id', postIds)
              .neq('user_id', user.id)
              .gte('created_at', thirtyDaysAgo.toISOString());
          }),

        // Comments count (on user's posts)
        supabase
          .from('comments')
          .select('post_id', { count: 'exact', head: true })
          .neq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .then(async (result) => {
            const userPosts = await supabase
              .from('posts')
              .select('id')
              .eq('user_id', user.id);
            
            if (!userPosts.data) return { count: 0 };
            
            const postIds = userPosts.data.map(p => p.id);
            if (postIds.length === 0) return { count: 0 };
            
            return supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .in('post_id', postIds)
              .neq('user_id', user.id)
              .gte('created_at', thirtyDaysAgo.toISOString());
          }),

        // Retweets count (of user's posts)
        supabase
          .from('retweets')
          .select('post_id', { count: 'exact', head: true })
          .neq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .then(async (result) => {
            const userPosts = await supabase
              .from('posts')
              .select('id')
              .eq('user_id', user.id);
            
            if (!userPosts.data) return { count: 0 };
            
            const postIds = userPosts.data.map(p => p.id);
            if (postIds.length === 0) return { count: 0 };
            
            return supabase
              .from('retweets')
              .select('*', { count: 'exact', head: true })
              .in('post_id', postIds)
              .neq('user_id', user.id)
              .gte('created_at', thirtyDaysAgo.toISOString());
          })
      ]);

      const totalCount = 
        (followRequestsCount.count || 0) +
        (likesCount.count || 0) +
        (commentsCount.count || 0) +
        (retweetsCount.count || 0);

      setNotificationCount(totalCount);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="glass h-14 flex items-center px-4 gap-4 sticky top-0 z-50">
      <div className="flex items-center gap-3 flex-1">
        <div 
          className="lg:hidden flex items-center cursor-pointer transition-transform hover:scale-105" 
          onClick={() => navigate("/")}
        >
          <span className="logo-instagram-style text-3xl text-foreground">
            Giga
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full hover:bg-accent/50 transition-all"
            >
              <Plus size={24} strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/upload")}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
              Upload Photo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/shorts")}>
              <PlaySquare className="mr-2 h-4 w-4" />
              Create Short
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/upload")}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              Write Post
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => navigate("/notifications")}
          className="relative h-10 w-10 rounded-full hover:bg-secondary"
        >
          <BellDot size={20} />
          {notificationCount > 0 && (
            <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 flex items-center justify-center bg-primary text-[10px] rounded-full border-2 border-background">
              {notificationCount > 9 ? '9+' : notificationCount}
            </Badge>
          )}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => navigate("/messages")}
          className="relative h-10 w-10 rounded-full hover:bg-secondary"
        >
          <Mail size={20} />
          <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 flex items-center justify-center bg-primary text-[10px] rounded-full border-2 border-background">
            3
          </Badge>
        </Button>

        <div className="hidden lg:block">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                      {user.user_metadata?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                      {user.user_metadata?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">
                      {user.user_metadata?.username || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Your Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/login")}
              className="ml-2"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
