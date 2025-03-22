import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Home, Users, CalendarDays, Trophy, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

const menuItems = [
  { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
  { path: "/players", label: "Players", icon: <Users className="h-5 w-5" /> },
  { path: "/matches", label: "Matches", icon: <CalendarDays className="h-5 w-5" /> },
  { path: "/seasons", label: "Seasons", icon: <Trophy className="h-5 w-5" /> }
];

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen">
      {/* Mobile Menu */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-10">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <ScrollArea className="h-screen">
            <div className="py-4">
              <div className="px-4 py-2">
                <Button asChild className="w-full justify-start font-normal" variant="ghost">
                  <NavLink to="/players/add" className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Player</span>
                  </NavLink>
                </Button>
              </div>
              <div className="px-4 py-2">
                <Button asChild className="w-full justify-start font-normal" variant="ghost">
                  <NavLink to="/matches/create" className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Create Match</span>
                  </NavLink>
                </Button>
              </div>
              <div className="px-4 py-2">
                <Button asChild className="w-full justify-start font-normal" variant="ghost">
                  <NavLink to="/seasons/create" className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Create Season</span>
                  </NavLink>
                </Button>
              </div>
              <div className="divide-y divide-border mt-2" />
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-2 font-medium transition-colors hover:bg-secondary hover:text-accent-foreground focus:outline-none ${
                      isActive ? "bg-secondary text-accent-foreground" : ""
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Menu */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-secondary">
        <div className="flex items-center justify-center h-16 border-b border-border">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <ScrollArea className="flex-1 py-4">
          <div className="px-4 py-2">
            <Button asChild className="w-full justify-start font-normal" variant="ghost">
              <NavLink to="/players/add" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Player</span>
              </NavLink>
            </Button>
          </div>
          <div className="px-4 py-2">
            <Button asChild className="w-full justify-start font-normal" variant="ghost">
              <NavLink to="/matches/create" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Match</span>
              </NavLink>
            </Button>
          </div>
          <div className="px-4 py-2">
            <Button asChild className="w-full justify-start font-normal" variant="ghost">
              <NavLink to="/seasons/create" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Season</span>
              </NavLink>
            </Button>
          </div>
          <div className="divide-y divide-border mt-2" />
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 font-medium transition-colors hover:bg-secondary hover:text-accent-foreground focus:outline-none ${
                  isActive ? "bg-secondary text-accent-foreground" : ""
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex flex-col h-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
