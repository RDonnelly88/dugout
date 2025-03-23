
import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  Users, 
  CalendarDays, 
  Trophy, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  PanelLeftClose,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getCurrentSeason } from "@/lib/db";

const menuItems = [
  { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
  { path: "/players", label: "Players", icon: <Users className="h-5 w-5" /> },
  { path: "/matches", label: "Matches", icon: <CalendarDays className="h-5 w-5" /> },
  { path: "/seasons", label: "Seasons", icon: <Trophy className="h-5 w-5" /> }
];

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  // Fetch current season for the header
  const { data: currentSeason } = useQuery({
    queryKey: ['currentSeason'],
    queryFn: getCurrentSeason
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen bg-background text-foreground">
      {/* Mobile Menu */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-10 bg-black/50 backdrop-blur-md border border-gray-800">
            <Menu className="h-5 w-5 text-primary" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-sidebar border-sidebar-border w-[280px]">
          <ScrollArea className="h-screen">
            <div className="py-4">
              <div className="flex items-center h-12 px-4 mb-4 border-b border-sidebar-border">
                <h2 className="text-lg font-semibold text-gradient">Football Tracker</h2>
              </div>
              
              {/* Main navigation */}
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-2.5 font-medium transition-all hover:bg-sidebar-accent focus:outline-none",
                      isActive 
                        ? "bg-sidebar-accent text-primary border-l-2 border-primary cyber-glow" 
                        : "text-sidebar-foreground border-l-2 border-transparent"
                    )
                  }
                >
                  <span className={cn(
                    "p-1.5 rounded",
                    location.pathname === item.path ? "bg-primary/20" : "bg-transparent"
                  )}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
              
              <div className="border-t border-sidebar-border my-4"></div>
              
              {/* Actions menu */}
              <div className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </div>
              <Button asChild variant="ghost" className="w-full justify-start font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary group transition-all">
                <NavLink to="/players/add" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="p-1.5 rounded group-hover:bg-primary/20">
                    <Plus className="h-4 w-4" />
                  </span>
                  <span>Add Player</span>
                </NavLink>
              </Button>
              
              <Button asChild variant="ghost" className="w-full justify-start font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary group transition-all">
                <NavLink to="/matches/create" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="p-1.5 rounded group-hover:bg-primary/20">
                    <Plus className="h-4 w-4" />
                  </span>
                  <span>Create Match</span>
                </NavLink>
              </Button>
              
              <Button asChild variant="ghost" className="w-full justify-start font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary group transition-all">
                <NavLink to="/seasons/create" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="p-1.5 rounded group-hover:bg-primary/20">
                    <Plus className="h-4 w-4" />
                  </span>
                  <span>Create Season</span>
                </NavLink>
              </Button>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 overflow-hidden",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          {!isSidebarCollapsed && <h2 className="text-lg font-semibold text-gradient">Football Tracker</h2>}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary hover:bg-sidebar-accent"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="py-4">
            {/* Main navigation */}
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center py-2.5 font-medium transition-all hover:bg-sidebar-accent focus:outline-none",
                    isActive 
                      ? "bg-sidebar-accent text-primary border-l-2 border-primary" 
                      : "text-sidebar-foreground border-l-2 border-transparent",
                    isSidebarCollapsed 
                      ? "justify-center px-0" 
                      : "gap-3 px-4"
                  )
                }
              >
                <span className={cn(
                  "p-1.5 rounded",
                  location.pathname === item.path ? "bg-primary/20" : "bg-transparent"
                )}>
                  {item.icon}
                </span>
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
            
            {!isSidebarCollapsed && (
              <>
                <div className="border-t border-sidebar-border my-4"></div>
                
                <div className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </div>
                
                {/* Actions menu - only show when expanded */}
                <Button asChild variant="ghost" className="w-full justify-start font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary group transition-all">
                  <NavLink to="/players/add" className="flex items-center gap-3 px-4 py-2">
                    <span className="p-1.5 rounded group-hover:bg-primary/20">
                      <Plus className="h-4 w-4" />
                    </span>
                    <span>Add Player</span>
                  </NavLink>
                </Button>
                
                <Button asChild variant="ghost" className="w-full justify-start font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary group transition-all">
                  <NavLink to="/matches/create" className="flex items-center gap-3 px-4 py-2">
                    <span className="p-1.5 rounded group-hover:bg-primary/20">
                      <Plus className="h-4 w-4" />
                    </span>
                    <span>Create Match</span>
                  </NavLink>
                </Button>
                
                <Button asChild variant="ghost" className="w-full justify-start font-normal text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary group transition-all">
                  <NavLink to="/seasons/create" className="flex items-center gap-3 px-4 py-2">
                    <span className="p-1.5 rounded group-hover:bg-primary/20">
                      <Plus className="h-4 w-4" />
                    </span>
                    <span>Create Season</span>
                  </NavLink>
                </Button>
              </>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex flex-col h-full bg-background text-foreground">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
