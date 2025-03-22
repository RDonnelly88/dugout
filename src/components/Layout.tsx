
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
  PanelLeftClose 
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
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen bg-gray-950 text-white">
      {/* Mobile Menu */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-10">
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-gray-900 border-gray-800">
          <ScrollArea className="h-screen">
            <div className="py-4">
              <div className="flex items-center h-12 px-4 mb-4">
                <h2 className="text-lg font-semibold">Football Tracker</h2>
              </div>
              
              {/* Main navigation */}
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 font-medium transition-colors hover:bg-gray-800 focus:outline-none ${
                      isActive ? "bg-gray-800 text-white" : "text-gray-300"
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
              
              <div className="border-t border-gray-800 my-4"></div>
              
              {/* Actions menu */}
              <Button asChild variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:bg-gray-800 hover:text-white">
                <NavLink to="/players/add" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 px-4 py-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Player</span>
                </NavLink>
              </Button>
              
              <Button asChild variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:bg-gray-800 hover:text-white">
                <NavLink to="/matches/create" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 px-4 py-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Match</span>
                </NavLink>
              </Button>
              
              <Button asChild variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:bg-gray-800 hover:text-white">
                <NavLink to="/seasons/create" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 px-4 py-2">
                  <Plus className="h-4 w-4" />
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
          "hidden md:flex flex-col border-r border-gray-800 bg-gray-900 transition-all duration-300 overflow-hidden",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
          {!isSidebarCollapsed && <h2 className="text-lg font-semibold">Football Tracker</h2>}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-800"
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
                    "flex items-center space-x-2 py-2 font-medium transition-colors hover:bg-gray-800 focus:outline-none",
                    isActive ? "bg-gray-800 text-white" : "text-gray-300",
                    isSidebarCollapsed ? "justify-center px-0" : "px-4"
                  )
                }
              >
                {item.icon}
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
            
            {!isSidebarCollapsed && <div className="border-t border-gray-800 my-4"></div>}
            
            {/* Actions menu - only show when expanded */}
            {!isSidebarCollapsed && (
              <>
                <Button asChild variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:bg-gray-800 hover:text-white">
                  <NavLink to="/players/add" className="flex items-center space-x-2 px-4 py-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Player</span>
                  </NavLink>
                </Button>
                
                <Button asChild variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:bg-gray-800 hover:text-white">
                  <NavLink to="/matches/create" className="flex items-center space-x-2 px-4 py-2">
                    <Plus className="h-4 w-4" />
                    <span>Create Match</span>
                  </NavLink>
                </Button>
                
                <Button asChild variant="ghost" className="w-full justify-start font-normal text-gray-300 hover:bg-gray-800 hover:text-white">
                  <NavLink to="/seasons/create" className="flex items-center space-x-2 px-4 py-2">
                    <Plus className="h-4 w-4" />
                    <span>Create Season</span>
                  </NavLink>
                </Button>
              </>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex flex-col h-full bg-gray-950 text-white">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
