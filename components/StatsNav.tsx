"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeftRight, FlaskConical, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGES = [
  { path: "/ratings", label: "Ratings", icon: TrendingUp },
  { path: "/lineups", label: "Line-up lab", icon: FlaskConical },
  { path: "/compare", label: "Head to head", icon: ArrowLeftRight },
];

/** How far a thumb has to travel sideways, in pixels, to turn the page. */
const SWIPE = 70;

/**
 * Whether a touch began somewhere that already has a use for a sideways
 * drag: a chart, the squad web, a field, or anything that scrolls across.
 */
function ownsSideways(target: EventTarget | null): boolean {
  let el = target instanceof Element ? target : null;
  if (el?.closest("svg, input, textarea, select, [role='slider'], [data-no-swipe]")) return true;
  while (el && el !== document.body) {
    const { overflowX } = getComputedStyle(el);
    if ((overflowX === "auto" || overflowX === "scroll") && el.scrollWidth > el.clientWidth) return true;
    el = el.parentElement;
  }
  return false;
}

/**
 * The three ways into the squad's numbers, as one place with three rooms:
 * who is strongest, who plays well together, and how two people measure up.
 *
 * A bar of three big tabs that stays under the top of the screen as the
 * page scrolls, so the other two are always in sight. On a phone a sideways
 * swipe moves to the next room, as it would between pages of a magazine —
 * except where the swipe starts on something that needs it for itself.
 */
export default function StatsNav() {
  const pathname = usePathname();
  const router = useRouter();
  const current = PAGES.findIndex((page) => pathname.startsWith(page.path));

  useEffect(() => {
    let start: { x: number; y: number } | null = null;

    const down = (event: TouchEvent) => {
      const touch = event.touches[0];
      start = event.touches.length === 1 && !ownsSideways(event.target)
        ? { x: touch.clientX, y: touch.clientY }
        : null;
    };
    const up = (event: TouchEvent) => {
      if (!start) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      start = null;
      // Clearly sideways, not a scroll that drifted.
      if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(dy) * 2) return;
      const next = current + (dx < 0 ? 1 : -1);
      if (next >= 0 && next < PAGES.length) router.push(PAGES[next].path);
    };

    window.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("touchend", up, { passive: true });
    return () => {
      window.removeEventListener("touchstart", down);
      window.removeEventListener("touchend", up);
    };
  }, [current, router]);

  return (
    <nav
      aria-label="Stats"
      // Flush under the phone's top bar, and the top of the page on a
      // desktop, where there is no bar.
      className="sticky top-[57px] z-20 -mx-4 -mt-6 mb-6 border-b border-border bg-background/90 px-2 backdrop-blur-md md:top-0 md:-mx-6 md:-mt-8 md:px-4"
    >
      <ul className="relative mx-auto grid max-w-xl grid-cols-3">
        {PAGES.map(({ path, label, icon: Icon }, index) => {
          const active = index === current;
          return (
            <li key={path}>
              <Link
                href={path}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring flex flex-col items-center gap-1 rounded-lg pb-2.5 pt-3 text-sm font-semibold transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-accent")} />
                {label}
              </Link>
            </li>
          );
        })}
        {/* The underline slides to the room you are in. */}
        {current >= 0 && (
          <span
            aria-hidden
            className="absolute bottom-0 h-[3px] w-1/3 rounded-full bg-accent transition-transform duration-300 motion-reduce:transition-none"
            style={{ transform: `translateX(${current * 100}%)` }}
          />
        )}
      </ul>
    </nav>
  );
}
