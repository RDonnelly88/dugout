"use client";

import { useRef } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useSideNames } from "@/hooks/useSideNames";
import type { StoryNight } from "@/lib/season-story";
import { cn } from "@/lib/utils";

/** Dates arrive as either a plain day or a full timestamp. */
const day = (value: string) =>
  value.includes("T") ? parseISO(value) : new Date(`${value}T12:00:00`);

/**
 * A season told down a touchline: the nights that made it, in order, with a
 * line that fills as you read down it.
 *
 * The fill follows the scroll rather than playing on its own, so it is a
 * reading position, not a show. Under reduced motion the line is simply full.
 */
export default function SeasonNights({ nights }: { nights: StoryNight[] }) {
  const sides = useSideNames();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 55%"],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  if (nights.length === 0) return null;

  const sideName = (key: "a" | "b") => (key === "a" ? sides.A : sides.B);

  return (
    <ol ref={ref} className="relative space-y-6 pl-11">
      <span aria-hidden className="absolute bottom-3 left-[15px] top-3 w-0.5 rounded-full bg-border" />
      <motion.span
        aria-hidden
        className="absolute bottom-3 left-[15px] top-3 w-0.5 origin-top rounded-full bg-accent"
        style={{ scaleY: reduced ? 1 : fill }}
      />

      {nights.map((night) => {
        const winner = night.outcome === "draw" ? null : night.outcome;
        const drawn = winner === null;
        const loser = winner === "a" ? "b" : "a";

        return (
          <li key={night.matchId} className="reveal relative">
            <span
              aria-hidden
              className={cn(
                "absolute -left-11 top-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-surface",
                drawn ? "border-draw" : "border-win"
              )}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full", drawn ? "bg-draw" : "bg-win")} />
            </span>

            <p className="eyebrow">
              <time dateTime={night.date}>{format(day(night.date), "d MMMM yyyy")}</time>
            </p>
            {night.labels.length > 0 && <h4 className="mt-0.5 font-semibold">{night.labels.join(" · ")}</h4>}

            <Link
              href={`/matches/${night.matchId}`}
              className="focus-ring group mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg"
            >
              <span className="text-sm text-muted-foreground">
                {winner === null ? (
                  <>
                    {sides.A} and {sides.B} drew
                  </>
                ) : (
                  <>
                    <span className="font-medium text-win">{sideName(winner)}</span> beat{" "}
                    {sideName(loser)}
                  </>
                )}
              </span>
              {night.score && (
                <span className="scoreboard text-3xl">
                  {night.score[0]}–{night.score[1]}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-accent group-hover:underline">
                See the match
                <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
            {night.story.length > 0 && (
              <ul className="mt-2 space-y-1">
                {night.story.map((line) => (
                  <li key={line} className="flex items-baseline gap-2 text-sm">
                    <span className="h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full bg-accent" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}
