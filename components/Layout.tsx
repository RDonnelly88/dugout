"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Settings,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTeam } from "@/contexts/TeamContext";
import { usePermission } from "@/lib/permission-utils";
import TeamSelector from "@/components/TeamSelector";
import TeamSwitcher from "@/components/team/TeamSwitcher";

const menuItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/players", label: "Players", icon: Users },
  { path: "/matches", label: "Matches", icon: CalendarDays },
  { path: "/seasons", label: "Seasons", icon: Trophy },
  { path: "/ratings", label: "Ratings", icon: TrendingUp },
  { path: "/team", label: "Team", icon: UserCog },
  { path: "/settings", label: "Settings", icon: Settings },
];

const quickActions = [
  { path: "/players/add", label: "Add Player" },
  { path: "/matches/create", label: "Create Match" },
  { path: "/seasons/create", label: "Create Season" },
];

/**
 * `/` is only active on an exact match — every other path starts with it, so a
 * prefix test would light up Home on every page.
 */
function isActive(pathname: string, path: string) {
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

const navLinkClass = (active: boolean, collapsed = false) =>
  cn(
    "flex items-center space-x-2 py-3 font-medium transition-colors hover:bg-surface-2/50 focus:outline-none",
    active
      ? "bg-gradient-to-r from-accent/20 to-transparent border-l-2 border-accent text-foreground"
      : "text-muted-foreground border-l-2 border-transparent",
    collapsed ? "justify-center px-0" : "px-4"
  );

function QuickActions({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {quickActions.map((action) => (
        <Button
          key={action.path}
          asChild
          variant="ghost"
          className="w-full justify-start font-normal text-muted-foreground hover:bg-surface-2/50 hover:text-foreground group"
        >
          <Link
            href={action.path}
            onClick={onNavigate}
            className="flex items-center space-x-2 px-4 py-2"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <Plus className="h-4 w-4 text-accent" />
            </span>
            <span>{action.label}</span>
          </Link>
        </Button>
      ))}
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const { currentTeam } = useTeam();
  const { canManage, hasTeam } = usePermission();

  const showActions = canManage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen bg-background text-foreground">
      {/* Mobile drawer */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden absolute top-4 left-4 z-10"
            aria-label="Open navigation"
          >
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="p-0 bg-surface/95 border-border backdrop-blur-xl shadow-2xl shadow-black/50"
        >
          <ScrollArea className="h-screen">
            <div className="py-4">
              <div className="px-4 mb-6">
                <TeamSelector />
              </div>

              {menuItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  href={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={navLinkClass(isActive(pathname, path))}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}

              {currentTeam && showActions && (
                <>
                  <div className="border-t border-border my-4" />
                  <div className="px-4 py-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Actions
                    </h3>
                  </div>
                  <QuickActions onNavigate={() => setIsMenuOpen(false)} />
                </>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border/70 bg-surface/95 backdrop-blur-md transition-all duration-300 overflow-hidden shadow-xl shadow-black/20",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/70 bg-surface/80">
          {isSidebarCollapsed ? <TeamSwitcher variant="minimal" /> : <TeamSelector />}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-surface-2/70"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="py-4">
            {menuItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                href={path}
                className={navLinkClass(isActive(pathname, path), isSidebarCollapsed)}
              >
                <Icon className="h-5 w-5" />
                {!isSidebarCollapsed && <span>{label}</span>}
              </Link>
            ))}

            {hasTeam() && showActions && !isSidebarCollapsed && (
              <>
                <div className="px-4 mt-6 mb-2">
                  <div className="border-t border-border/70 pt-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Actions
                    </h3>
                  </div>
                </div>
                <QuickActions />
              </>
            )}
          </div>
        </ScrollArea>
      </aside>

      <main className="flex flex-col h-full bg-background text-foreground">
        <div className="bg-surface/90 backdrop-blur-md p-4 border-b border-border/70 shadow-md md:hidden">
          <TeamSwitcher variant="minimal" />
        </div>

        {children}
      </main>
    </div>
  );
}
