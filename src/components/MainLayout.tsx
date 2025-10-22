import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Outlet, useLocation } from "react-router-dom";

export function MainLayout() {
  const location = useLocation();
  
  // Show header on mobile ONLY for home page, always show on desktop
  const showHeaderOnMobile = location.pathname === '/';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background overflow-hidden">
        <div className="hidden lg:block">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Show header only on home for mobile, always show on desktop */}
          <div className={showHeaderOnMobile ? "" : "hidden lg:block"}>
            <Header />
          </div>
          <main className="flex-1 overflow-auto w-full">
            <Outlet />
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
