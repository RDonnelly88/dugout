"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PageTab {
  value: string;
  label: string;
  icon: LucideIcon;
  /** A page of its own. Without one the tab switches part of this page. */
  href?: string;
}

/** How far a thumb has to travel sideways, in pixels, to turn the page. */
const SWIPE = 70;

/** Height of the phone's top bar, which the tabs stick beneath. */
const TOP_BAR = 57;

/**
 * Whether a touch began somewhere that already has a use for a sideways
 * drag: a chart, a web, a field, or anything that scrolls across.
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
 * The one way a page shows its parts: a full-width bar of big tabs with an
 * underline that slides to the one you are on, sticking under the top of
 * the screen as the page scrolls so the others are always in sight.
 *
 * On a phone a sideways swipe moves to the next part or back to the last,
 * unless it starts on something that needs a sideways drag of its own.
 *
 * A tab with an `href` is a page of its own (the three stats pages); one
 * without switches part of the page it sits on, through `onChange`.
 */
export default function PageTabs({
  tabs,
  value,
  onChange,
  label,
  atTop = false,
}: {
  tabs: PageTab[];
  value: string;
  onChange?: (value: string) => void;
  label: string;
  /** First thing on the page, so flush with the top rather than spaced. */
  atTop?: boolean;
}) {
  const router = useRouter();
  const anchor = useRef<HTMLDivElement>(null);
  const current = tabs.findIndex((tab) => tab.value === value);

  const go = (index: number) => {
    const tab = tabs[index];
    if (!tab) return;
    if (tab.href) {
      router.push(tab.href);
      return;
    }
    onChange?.(tab.value);
    // Switching parts from far down the page would leave you somewhere in
    // the middle of the new one; bring its top back up under the bar.
    const top = anchor.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) window.scrollBy({ top: top - (window.innerWidth < 768 ? TOP_BAR : 0) });
  };

  // Read through a ref so the listeners below are added once, not every
  // time the tab changes.
  const goRef = useRef(go);
  goRef.current = go;
  const currentRef = useRef(current);
  currentRef.current = current;

  useEffect(() => {
    let start: { x: number; y: number } | null = null;
    const down = (event: TouchEvent) => {
      const touch = event.touches[0];
      start =
        event.touches.length === 1 && !ownsSideways(event.target)
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
      goRef.current(currentRef.current + (dx < 0 ? 1 : -1));
    };
    window.addEventListener("touchstart", down, { passive: true });
    window.addEventListener("touchend", up, { passive: true });
    return () => {
      window.removeEventListener("touchstart", down);
      window.removeEventListener("touchend", up);
    };
  }, []);

  const cell = (active: boolean) =>
    cn(
      "focus-ring flex w-full flex-col items-center gap-1 rounded-lg pb-2.5 pt-3 text-sm font-semibold transition-colors",
      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    );

  return (
    <>
      <div ref={anchor} aria-hidden />
      <nav
        aria-label={label}
        className={cn(
          // Flush under the phone's top bar, and the top of the page on a
          // desktop, where there is no bar.
          "sticky top-[57px] z-20 -mx-4 mb-6 border-b border-border bg-background/90 px-2 backdrop-blur-md md:top-0 md:-mx-6 md:px-4",
          atTop && "-mt-6 md:-mt-8"
        )}
      >
        <ul className="relative mx-auto grid max-w-2xl" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((tab, index) => {
            const active = index === current;
            const Icon = tab.icon;
            const body = (
              <>
                <Icon className={cn("h-5 w-5", active && "text-accent")} />
                <span className="max-w-full truncate">{tab.label}</span>
              </>
            );
            return (
              <li key={tab.value}>
                {tab.href ? (
                  <Link href={tab.href} aria-current={active ? "page" : undefined} className={cell(active)}>
                    {body}
                  </Link>
                ) : (
                  <button type="button" aria-pressed={active} onClick={() => go(index)} className={cell(active)}>
                    {body}
                  </button>
                )}
              </li>
            );
          })}
          {current >= 0 && (
            <span
              aria-hidden
              className="absolute bottom-0 h-[3px] rounded-full bg-accent transition-transform duration-300 motion-reduce:transition-none"
              style={{ width: `${100 / tabs.length}%`, transform: `translateX(${current * 100}%)` }}
            />
          )}
        </ul>
      </nav>
    </>
  );
}
