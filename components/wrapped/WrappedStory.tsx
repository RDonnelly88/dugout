"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Slide {
  key: string;
  /** Read out as the slide changes, and on its progress segment. */
  label: string;
  /** What sits behind it: the grass, a printed sheet, or the plain page. */
  tone: "pitch" | "sheet" | "plain";
  content: ReactNode;
}

const TONE: Record<Slide["tone"], string> = {
  pitch: "pitch text-chalk",
  sheet: "grain bg-surface text-foreground",
  plain: "bg-surface-2 text-foreground",
};

/**
 * A season told one card at a time, the way a phone tells a story.
 *
 * Nothing moves on by itself: every card is read for as long as the reader
 * wants, and moved on by a tap on its right two-thirds, a tap on the left to
 * go back, the arrow keys, or the buttons along the bottom. Escape closes it.
 * Links and buttons inside a card are left to do their own thing — a tap on
 * them is not a tap to turn the page.
 */
export default function WrappedStory({
  slides,
  closeHref,
}: {
  slides: Slide[];
  /** Where closing goes. */
  closeHref: string;
}) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  // Which way the last move went, so a card leaves the way it was pushed.
  const [direction, setDirection] = useState(1);

  const go = useCallback(
    (to: number) => {
      const next = Math.max(0, Math.min(slides.length - 1, to));
      setDirection(next >= index ? 1 : -1);
      setIndex(next);
    },
    [index, slides.length]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(index + 1);
      else if (event.key === "ArrowLeft") go(index - 1);
      else if (event.key === "Escape") router.push(closeHref);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, router, closeHref]);

  const slide = slides[index];

  return (
    <section
      className="fixed inset-0 z-50 flex justify-center bg-background md:items-center md:py-6"
      aria-label="Season wrapped"
    >
      <div className="relative flex h-full w-full max-w-md flex-col overflow-hidden md:h-[min(52rem,100%)] md:rounded-3xl md:border md:border-border md:shadow-2xl">
        {/* Progress along the top, one segment a card, each a way straight
            to it. */}
        {/* On a backing of its own, so the segments read on the grass as
            well as on the plain cards. */}
        <div className="absolute inset-x-2 top-2 z-10 flex items-center gap-1 rounded-full bg-background/75 px-2 backdrop-blur">
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => go(i)}
              aria-label={`${i + 1} of ${slides.length}: ${s.label}`}
              aria-current={i === index ? "step" : undefined}
              className="focus-ring group flex-1 py-2"
            >
              <span
                className={cn(
                  "block h-1 rounded-full transition-colors",
                  i <= index ? "bg-accent" : "bg-border-strong/60 group-hover:bg-border-strong"
                )}
              />
            </button>
          ))}
          <Link
            href={closeHref}
            aria-label="Close"
            className="focus-ring ml-1 rounded-full bg-background/70 p-1.5 text-foreground backdrop-blur hover:bg-background"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative flex-1 select-none">
          {/* The tap zones, under the card: a third to go back, the rest to go
              on. Out of the tab order and hidden from screen readers, which
              have the buttons along the bottom and the arrow keys. The card
              above lets taps through except on its own links and buttons. */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={() => go(index - 1)}
            className="absolute inset-y-0 left-0 z-0 w-1/3 cursor-w-resize"
          />
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={() => go(index + 1)}
            className="absolute inset-y-0 right-0 z-0 w-2/3 cursor-e-resize"
          />
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.section
              key={slide.key}
              aria-label={slide.label}
              custom={direction}
              initial={{ opacity: 0, x: 28 * direction }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 * direction }}
              transition={reduced ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
              className={cn(
                "pointer-events-none absolute inset-0 z-[1] flex flex-col justify-center px-7 pb-20 pt-16 [&_a]:pointer-events-auto [&_button]:pointer-events-auto",
                TONE[slide.tone]
              )}
            >
              {slide.content}
            </motion.section>
          </AnimatePresence>
          {/* Says which card is showing to a screen reader, which cannot see
              the slide move. */}
          <p className="sr-only" aria-live="polite">
            {index + 1} of {slides.length}: {slide.label}
          </p>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-4 pb-4">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Previous"
            className="focus-ring rounded-full bg-background/80 p-2.5 text-foreground shadow backdrop-blur transition-opacity disabled:opacity-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="tabular rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            {index + 1} / {slides.length}
          </span>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === slides.length - 1}
            aria-label="Next"
            className="focus-ring rounded-full bg-background/80 p-2.5 text-foreground shadow backdrop-blur transition-opacity disabled:opacity-0"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
