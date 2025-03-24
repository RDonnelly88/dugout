
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
  UserCog,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getCurrentSeason } from "@/lib/db";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "@/contexts/TeamContext";
import { usePermission } from "@/lib/permission-utils";
import TeamSelector from "@/components/TeamSelector";
import TeamSwitcher from "@/components/team/TeamSwitcher";

const menuItems = [
  { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
  { path: "/players", label: "Players", icon: <Users className="h-5 w-5" /> },
  { path: "/matches", label: "Matches", icon: <CalendarDays className="h-5 w-5" /> },
  { path: "/seasons", label: "Seasons", icon: <Trophy className="h-5 w-5" /> },
  { path: "/team", label: "Team", icon: <UserCog className="h-5 w-5" /> }
];

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const { canManage, hasTeam } = usePermission();
  const navigate = useNavigate();
  
  // Fetch current season for the header
  const { data: currentSeason } = useQuery({
    queryKey: ['currentSeason', currentTeam?.id],
    queryFn: getCurrentSeason,
    enabled: !!currentTeam
  });
  
  const showActions = canManage();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen bg-background text-foreground">
      {/* Mobile Menu */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-10">
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-gray-900/95 border-gray-800 backdrop-blur-xl shadow-2xl shadow-black/50">
          <ScrollArea className="h-screen">
            <div className="py-4">
              <div className="px-4 mb-6">
                <TeamSelector />
              </div>
              
              {/* Main navigation */}
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center space-x-2 px-4 py-3 font-medium transition-all hover:bg-gray-800/70 focus:outline-none",
                      isActive 
                        ? "bg-gradient-to-r from-accent/20 to-transparent border-l-2 border-accent text-white" 
                        : "text-gray-300 border-l-2 border-transparent"
                    )
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
              
              {currentTeam && showActions && (
                <>
                  <div className="border-t border-gray-800 my-4"></div>
                  
                  {/* Actions menu */}
                  <div className="px-4 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Actions</h3>
                  </div>
                  
                  <Button asChild variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:bg-gray-800/70 hover:text-white group">
                    <NavLink to="/players/add" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 px-4 py-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                        <Plus className="h-4 w-4 text-accent" />
                      </span>
                      <span>Add Player</span>
                    </NavLink>
                  </Button>
                  
                  <Button asChild variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:bg-gray-800/70 hover:text-white group">
                    <NavLink to="/matches/create" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 px-4 py-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                        <Plus className="h-4 w-4 text-accent" />
                      </span>
                      <span>Create Match</span>
                    </NavLink>
                  </Button>
                  
                  <Button asChild variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:bg-gray-800/70 hover:text-white group">
                    <NavLink to="/seasons/create" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 px-4 py-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                        <Plus className="h-4 w-4 text-accent" />
                      </span>
                      <span>Create Season</span>
                    </NavLink>
                  </Button>
                </>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r border-gray-800/70 bg-gray-900/95 backdrop-blur-md transition-all duration-300 overflow-hidden shadow-xl shadow-black/20",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800/70 bg-gray-900/80">
          {!isSidebarCollapsed ? (
            <TeamSelector />
          ) : (
            <TeamSwitcher variant="minimal" />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800/70"
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
                    "flex items-center space-x-2 py-3 font-medium transition-colors hover:bg-gray-800/50 focus:outline-none",
                    isActive 
                      ? "bg-gradient-to-r from-accent/20 to-transparent border-l-2 border-accent text-white" 
                      : "text-gray-300 border-l-2 border-transparent",
                    isSidebarCollapsed 
                      ? "justify-center px-0" 
                      : "px-4"
                  )
                }
              >
                {item.icon}
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
            
            {hasTeam() && showActions && (
              <>
                {!isSidebarCollapsed && (
                  <div className="px-4 mt-6 mb-2">
                    <div className="border-t border-gray-800/70 pt-4">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Actions</h3>
                    </div>
                  </div>
                )}
                
                {/* Actions menu - only show when expanded and user is admin */}
                {!isSidebarCollapsed && (
                  <>
                    <Button asChild variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:bg-gray-800/50 hover:text-white group">
                      <NavLink to="/players/add" className="flex items-center space-x-2 px-4 py-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                          <Plus className="h-4 w-4 text-accent" />
                        </span>
                        <span>Add Player</span>
                      </NavLink>
                    </Button>
                    
                    <Button asChild variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:bg-gray-800/50 hover:text-white group">
                      <NavLink to="/matches/create" className="flex items-center space-x-2 px-4 py-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                          <Plus className="h-4 w-4 text-accent" />
                        </span>
                        <span>Create Match</span>
                      </NavLink>
                    </Button>
                    
                    <Button asChild variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:bg-gray-800/50 hover:text-white group">
                      <NavLink to="/seasons/create" className="flex items-center space-x-2 px-4 py-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                          <Plus className="h-4 w-4 text-accent" />
                        </span>
                        <span>Create Season</span>
                      </NavLink>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex flex-col h-full bg-background text-foreground">
        {/* Header with team info - visible on all pages */}
        <div className="bg-gray-900/90 backdrop-blur-md p-4 border-b border-gray-800/70 shadow-md md:hidden">
          <TeamSwitcher variant="minimal" />
        </div>
        
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
