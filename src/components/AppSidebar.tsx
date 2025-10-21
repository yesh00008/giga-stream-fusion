import { House, Telescope, PlaySquare, Clock3, Heart, TrendingUp, FolderOpen, VideoIcon, CloudUpload, Settings2, Podcast, MessagesSquare, ListVideo, Film, UsersRound, BookmarkCheck, LayoutGrid } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Home", url: "/", icon: House },
  { title: "Explore", url: "/explore", icon: Telescope },
  { title: "Shorts", url: "/shorts", icon: PlaySquare },
  { title: "Live", url: "/live", icon: Podcast },
  { title: "Feed", url: "/feed", icon: LayoutGrid },
  { title: "Subscriptions", url: "/subscriptions", icon: FolderOpen },
];

const libraryItems = [
  { title: "Library", url: "/library", icon: BookmarkCheck },
  { title: "History", url: "/history", icon: Clock3 },
  { title: "Liked Videos", url: "/liked", icon: Heart },
  { title: "Playlists", url: "/playlists", icon: ListVideo },
  { title: "Community", url: "/community", icon: UsersRound },
  { title: "Messages", url: "/messages", icon: MessagesSquare },
  { title: "Trending", url: "/trending", icon: TrendingUp },
];

const studioItems = [
  { title: "Studio", url: "/studio", icon: VideoIcon },
  { title: "Upload", url: "/upload", icon: CloudUpload },
  { title: "Settings", url: "/settings", icon: Settings2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary" : "hover:bg-muted/60 text-foreground/80 hover:text-foreground";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30">
      <SidebarContent className="overflow-y-auto bg-card/30 backdrop-blur-sm">
        <div className="p-4 sm:p-5 flex items-center gap-2 border-b border-border/30">
          {!isCollapsed ? (
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">Giga</span>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
          )}
        </div>

        <SidebarGroup className="px-2 sm:px-3 py-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11 sm:h-12 rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-secondary/80 transition-all">
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon size={20} className="sm:size-5" strokeWidth={2} />
                      <span className="text-sm sm:text-base font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-2 sm:px-3 py-2">
          <SidebarGroupLabel className="text-xs sm:text-sm font-semibold text-muted-foreground px-3 mb-1 uppercase tracking-wider">Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {libraryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11 sm:h-12 rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-secondary/80 transition-all">
                    <NavLink to={item.url} className={getNavClass}>
                      <item.icon size={20} className="sm:size-5" strokeWidth={2} />
                      <span className="text-sm sm:text-base font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-2 sm:px-3 py-2">
          <SidebarGroupLabel className="text-xs sm:text-sm font-semibold text-muted-foreground px-3 mb-1 uppercase tracking-wider">Creator</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {studioItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11 sm:h-12 rounded-lg data-[active=true]:bg-primary/10 data-[active=true]:text-primary hover:bg-secondary/80 transition-all">
                    <NavLink to={item.url} className={getNavClass}>
                      <item.icon size={20} className="sm:size-5" strokeWidth={2} />
                      <span className="text-sm sm:text-base font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
