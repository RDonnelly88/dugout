
import { Outlet, NavLink } from "react-router-dom";
import { Home, Users, Trophy, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Close menu when changing route on mobile
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close menu when resizing from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  const navItems = [
    { path: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { path: "/players", label: "Players", icon: <Users className="h-5 w-5" /> },
    { path: "/matches", label: "Matches", icon: <Trophy className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold tracking-tight">
            <NavLink to="/" className="flex items-center gap-2">
              <span className="hidden sm:inline-block">5-A-Side Tracker</span>
              <span className="sm:hidden">5-A-Side</span>
            </NavLink>
          </h1>
        </div>

        {/* Mobile menu button */}
        {isMobile && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-foreground"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}

        {/* Desktop navigation */}
        {!isMobile && (
          <nav className="flex items-center space-x-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Mobile navigation */}
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 animate-fade-in bg-background">
          <nav className="flex flex-col space-y-2 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-3 text-base font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
