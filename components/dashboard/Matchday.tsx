"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ArrowRight, Shuffle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSideNames } from "@/hooks/useSideNames";
import { outcomeOf } from "@/lib/match-result";
import { cn } from "@/lib/utils";
import type { Match } from "@/types";

/** Dates arrive as either a plain day or a full timestamp. */
const day = (value: string) => (value.includes("T") ? parseISO(value) : new Date(`${value}T12:00:00`));

/** A side's names, first names only, in the order they were picked. */
function Names({ ids, name }: { ids: string[]; name: (id: string) => string }) {
  return (
    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
      {ids.length ? ids.map(name).join(" · ") : "Not picked"}
    </p>
  );
}

/**
 * The first thing on the front page: the next night if one is set up, and
 * the way to set one up if not. It is what the app is opened for on a Monday.
 */
export function NextUp({
  fixture,
  canManage,
  name,
}: {
  fixture: Match | undefined;
  canManage: boolean;
  name: (id: string) => string;
}) {
  const sides = useSideNames();

  if (!fixture) {
    if (!canManage) return null;
    return (
      <section className="grain relative overflow-hidden rounded-2xl border border-accent/40 bg-surface p-5 sm:p-6">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <p className="page-kicker">Next up</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Playing tonight?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tick who has turned up, then split them by rating, by the table or at random.
        </p>
        <Button asChild size="lg" className="mt-4 w-full sm:w-auto">
          <Link href="/matches/create">
            <Shuffle className="mr-2 h-4 w-4" />
            Pick the teams
          </Link>
        </Button>
      </section>
    );
  }

  const picked = fixture.teamA.players.length + fixture.teamB.players.length > 0;
  return (
    <section className="grain relative overflow-hidden rounded-2xl border border-accent/40 bg-surface p-5 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
      <p className="page-kicker">Next up</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
        {format(day(fixture.date), "EEEE d MMMM")}
      </h2>
      {picked ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {(["teamA", "teamB"] as const).map((key) => (
            <div key={key} className="rounded-xl border border-border bg-surface-2/50 p-3">
              <p className="font-semibold">{key === "teamA" ? sides.A : sides.B}</p>
              <Names ids={fixture[key].players} name={name} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">The sides have not been picked yet.</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="lg" className="flex-1 sm:flex-none">
          <Link href={picked ? `/matches/${fixture.id}` : `/matches/edit/${fixture.id}`}>
            {picked ? (canManage ? "Enter the result" : "See the sides") : "Pick the teams"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

/**
 * The last result, as big as a scoreboard at the ground: both sides, the
 * score when somebody wrote it down, and who was in each.
 */
export function LastResult({ match, name }: { match: Match | undefined; name: (id: string) => string }) {
  const sides = useSideNames();
  if (!match) return null;
  const outcome = outcomeOf(match);
  const a = match.teamA.score;
  const b = match.teamB.score;
  const scored = typeof a === "number" && typeof b === "number";

  const side = (key: "a" | "b") => {
    const won = outcome === key;
    const team = key === "a" ? match.teamA : match.teamB;
    return (
      <div className={cn("min-w-0", key === "b" && "text-right")}>
        <p className={cn("text-sm font-semibold", won ? "text-win" : outcome === "draw" ? "text-draw" : "text-muted-foreground")}>
          {key === "a" ? sides.A : sides.B}
          {won && <Trophy className="ml-1 inline h-3.5 w-3.5 align-[-2px]" />}
        </p>
        <Names ids={team.players} name={name} />
      </div>
    );
  };

  return (
    <Link
      href={`/matches/${match.id}`}
      className="focus-ring grain block rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong sm:p-6"
    >
      <p className="eyebrow flex justify-between">
        <span>Last time out</span>
        <time dateTime={match.date}>{format(day(match.date), "EEE d MMM")}</time>
      </p>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        {side("a")}
        <p className="scoreboard whitespace-nowrap pt-1 text-4xl leading-none sm:text-5xl">
          {scored ? (
            <>
              <span className={outcome === "b" ? "text-muted-foreground" : undefined}>{a}</span>
              <span className="mx-1.5 text-muted-foreground">–</span>
              <span className={outcome === "a" ? "text-muted-foreground" : undefined}>{b}</span>
            </>
          ) : (
            <span className="text-2xl">{outcome === "draw" ? "Drawn" : "FT"}</span>
          )}
        </p>
        {side("b")}
      </div>
    </Link>
  );
}
