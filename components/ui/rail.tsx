"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A horizontal run of cards that snaps as it scrolls. Swipe it on a phone,
 * scroll it with a trackpad, or use the arrows; the edges fade only while
 * there is more to see that way.
 */
export function Rail({
  label,
  children,
  className,
}: {
  /** What the run is, for anyone who cannot see it. */
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const track = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () =>
      setEdges({
        start: el.scrollLeft <= 4,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
      });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      resize.disconnect();
    };
  }, []);

  const move = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <section
        ref={track}
        aria-label={label}
        // A scrolling region has to take focus for a keyboard to scroll it.
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className="rail-track focus-ring flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-lg pb-1"
      >
        {children}
      </section>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-card transition-opacity",
          edges.start && "opacity-0"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-card transition-opacity",
          edges.end && "opacity-0"
        )}
      />
      {!(edges.start && edges.end) && (
        <div className="mt-3 flex justify-end gap-2">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => move(d)}
              disabled={d < 0 ? edges.start : edges.end}
              aria-label={d < 0 ? `Back through ${label}` : `On through ${label}`}
              className="focus-ring tap rounded-full border border-border text-foreground transition-opacity hover:border-border-strong disabled:opacity-30"
            >
              {d < 0 ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
