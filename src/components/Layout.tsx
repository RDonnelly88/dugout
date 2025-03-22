
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Home, Users, Trophy, Menu, X, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel
} from "@/components/ui/sidebar";

const Layout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const navItems = [
    { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { path: "/players", label: "Players", icon: <Users className="h-5 w-5" /> },
    { path: "/matches", label: "Matches", icon: <Trophy className="h-5 w-5" /> },
  ];

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <div className="flex h-16 items-center px-4">
              <h1 className="text-xl font-semibold tracking-tight">
                <span className="flex items-center gap-2 text-foreground">
                  <Trophy className="h-6 w-6" />
                  5-A-Side Tracker
                </span>
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === item.path || 
                          (item.path !== "/" && location.pathname.startsWith(item.path))}
                        tooltip={item.label}
                      >
                        <NavLink to={item.path}>
                          {item.icon}
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  5-A-Side Tracker v1.0
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header for small screens */}
          {isMobile && (
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">
                  <NavLink to="/">5-A-Side</NavLink>
                </h1>
              </div>
            </header>
          )}

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
