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
  Menu,
  UserCog,
  Settings,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTeam } from "@/contexts/TeamContext";
import { usePermission } from "@/lib/permission-utils";
import TeamSelector from "@/components/TeamSelector";
import TeamSwitcher from "@/components/team/TeamSwitcher";
import DemoBanner from "@/components/team/DemoBanner";

/**
 * Where the app goes, in the order people reach for it. The first five are
 * the tab bar on a phone; `also` lists the other paths that light a tab up,
 * so the three stats pages share one.
 */
const menuItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/seasons", label: "Seasons", icon: Trophy },
  { path: "/matches", label: "Results", icon: CalendarDays },
  { path: "/players", label: "Squad", icon: Users },
  { path: "/ratings", label: "Stats", icon: TrendingUp, also: ["/lineups", "/compare"] },
  { path: "/team", label: "Team", icon: UserCog },
  { path: "/settings", label: "Settings", icon: Settings },
];

const TABS = menuItems.slice(0, 5);

const quickActions = [
  { path: "/matches/create", label: "Pick the teams" },
  { path: "/players/add", label: "Add a player" },
  { path: "/seasons/create", label: "New season" },
];

/**
 * `/` is only active on an exact match — every other path starts with it, so a
 * prefix test would light up Home on every page.
 */
function isActive(pathname: string, path: string, also: string[] = []) {
  if (path === "/") return pathname === "/";
  return [path, ...also].some((p) => pathname.startsWith(p));
}

/**
 * The phone's way round the app: five tabs a thumb can reach, rather than a
 * menu behind a button. Team and Settings stay in the drawer, being visited
 * once a season.
 */
function TabBar({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map(({ path, label, icon: Icon, also }) => {
          const active = isActive(pathname, path, also);
          return (
            <li key={path}>
              <Link
                href={path}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring flex flex-col items-center gap-0.5 pb-2 pt-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-accent" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    active && "bg-accent/15"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
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
        <SheetContent
          side="left"
          className="p-0 bg-surface/95 border-border backdrop-blur-xl shadow-2xl shadow-black/50"
        >
          <ScrollArea className="h-screen">
            <div className="py-4">
              <div className="px-4 mb-6">
                <TeamSelector />
              </div>

              {menuItems.map(({ path, label, icon: Icon, also }) => (
                <Link
                  key={path}
                  href={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={navLinkClass(isActive(pathname, path, also))}
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
            {menuItems.map(({ path, label, icon: Icon, also }) => (
              <Link
                key={path}
                href={path}
                className={navLinkClass(isActive(pathname, path, also), isSidebarCollapsed)}
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

      {/* min-w-0, because a grid track is otherwise as wide as its widest
          content: one chart or nowrap row was enough to push the whole page
          past the edge of a phone. */}
      <main className="flex h-full min-w-0 flex-col bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] text-foreground md:pb-0">
        {/* One bar, one row: the menu button and the team sit together with the
            same gap as everything else, rather than the button floating over
            the bar at a fixed offset. */}
        <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-surface/90 px-3 py-2 backdrop-blur-md md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <TeamSwitcher variant="minimal" />
        </div>

        <DemoBanner />

        {children}
      </main>

      <TabBar pathname={pathname} />
    </div>
  );
}
