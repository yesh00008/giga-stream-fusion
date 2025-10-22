import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, ChevronDown, Home, Search, Compass, Video, TrendingUp, Clock, ThumbsUp, Bookmark, PlaySquare, Upload, MessageSquare, Users, BarChart3, Settings, Bell, Shield, HelpCircle, BookOpen, Info, LogOut, UserPlus, Check, X, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface MobileProfileHeaderProps {
  username: string;
}

export function MobileProfileHeader({ username }: MobileProfileHeaderProps) {
  const navigate = useNavigate();
  const { user, switchAccount, removeAccount, getStoredAccounts } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [accountToRemove, setAccountToRemove] = useState<string | null>(null);
  
  const storedAccounts = getStoredAccounts();
  const currentUserId = user?.id;

  const handleSwitchAccount = async (accountId: string) => {
    if (accountId === currentUserId) return;
    
    try {
      await switchAccount(accountId);
      toast({
        title: "Account switched",
        description: "You've successfully switched accounts.",
      });
      // Reload the page to reflect the new account
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error switching account",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    try {
      await removeAccount(accountId);
      setAccountToRemove(null);
      toast({
        title: "Account removed",
        description: "The account has been removed successfully.",
      });
      
      // If we removed the current account, reload
      if (accountId === currentUserId) {
        window.location.reload();
      }
    } catch (error: any) {
      toast({
        title: "Error removing account",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddAccount = () => {
    // Sign out current session but don't clear stored accounts
    signOut();
    navigate("/login");
    toast({
      title: "Add Account",
      description: "Log in to add another account.",
    });
  };

  const handleLogout = async () => {
    try {
      // Remove current account from storage
      if (currentUserId) {
        await removeAccount(currentUserId);
      }
      
      // If there are other accounts, we'll be switched automatically
      // Otherwise, we'll be logged out
      const remainingAccounts = getStoredAccounts();
      if (remainingAccounts.length === 0) {
        await signOut();
        toast({
          title: "Logged out successfully",
          description: "See you next time!",
        });
        navigate("/login");
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const menuSections = [
    {
      title: "Main",
      items: [
        { icon: Home, label: "Home", path: "/" },
        { icon: LayoutGrid, label: "Feed", path: "/feed" },
        { icon: Search, label: "Search", path: "/search" },
        { icon: Compass, label: "Explore", path: "/explore" },
        { icon: TrendingUp, label: "Trending", path: "/trending" },
      ]
    },
    {
      title: "Content",
      items: [
        { icon: PlaySquare, label: "Shorts", path: "/shorts" },
        { icon: Video, label: "Live", path: "/live" },
        { icon: Upload, label: "Upload", path: "/upload" },
        { icon: BarChart3, label: "Studio", path: "/studio" },
      ]
    },
    {
      title: "Library",
      items: [
        { icon: Clock, label: "History", path: "/history" },
        { icon: ThumbsUp, label: "Liked Videos", path: "/liked" },
        { icon: Bookmark, label: "Saved", path: "/playlists" },
        { icon: Users, label: "Subscriptions", path: "/subscriptions" },
      ]
    },
    {
      title: "Community",
      items: [
        { icon: MessageSquare, label: "Messages", path: "/messages" },
        { icon: Bell, label: "Notifications", path: "/notifications" },
        { icon: Users, label: "Community", path: "/community" },
      ]
    },
    {
      title: "Settings",
      items: [
        { icon: Settings, label: "Settings", path: "/settings" },
        { icon: Shield, label: "Privacy", path: "/settings" },
        { icon: HelpCircle, label: "Help", path: "/help" },
        { icon: Info, label: "About", path: "/about" },
      ]
    }
  ];

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Username with Account Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 h-auto">
              <span className="font-semibold text-lg">@{username}</span>
              <ChevronDown size={16} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            {/* Current Account */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-2">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                  {username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">@{username}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Check className="h-5 w-5 text-primary" />
            </div>

            {/* Other Accounts */}
            {storedAccounts.length > 1 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Switch Account
                </DropdownMenuLabel>
                {storedAccounts
                  .filter(account => account.id !== currentUserId)
                  .map(account => (
                    <div key={account.id} className="flex items-center gap-2 group">
                      <DropdownMenuItem 
                        onClick={() => handleSwitchAccount(account.id)}
                        className="flex-1 cursor-pointer"
                      >
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={account.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/70 to-accent/70 text-white text-xs">
                            {account.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">@{account.username}</p>
                          <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                        </div>
                      </DropdownMenuItem>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity mr-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAccountToRemove(account.id);
                        }}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAddAccount}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Account
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <Users className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log Out {storedAccounts.length > 1 && `@${username}`}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Menu Button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            
            <div className="py-6 space-y-6">
              {menuSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Button
                        key={item.path}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          navigate(item.path);
                          setOpen(false);
                        }}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Remove Account Confirmation Dialog */}
      <AlertDialog open={!!accountToRemove} onOpenChange={(open) => !open && setAccountToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this account? You'll need to log in again to access it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => accountToRemove && handleRemoveAccount(accountToRemove)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
