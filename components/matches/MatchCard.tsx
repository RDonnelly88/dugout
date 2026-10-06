import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useSideNames } from "@/hooks/useSideNames";
import { outcomeOf } from "@/lib/match-result";
import { cn } from "@/lib/utils";
import type { Match } from "@/types";

/** Dates arrive as either a plain day or a full timestamp. */
const day = (value: string) =>
  value.includes("T") ? parseISO(value) : new Date(`${value}T12:00:00`);

/**
 * One match as a small scoreboard, for a rail of them.
 *
 * The list row says who beat whom in a sentence; this says it the way a board
 * at the ground would — two lines, the winner lit, the score in board figures
 * when somebody wrote it down and a plain result when they did not.
 */
export default function MatchCard({ match }: { match: Match }) {
  const sides = useSideNames();
  const outcome = outcomeOf(match);
  const a = match.teamA?.score;
  const b = match.teamB?.score;
  const scored = typeof a === "number" && typeof b === "number";

  const line = (key: "a" | "b", name: string, score: number | undefined) => {
    const won = outcome === key;
    return (
      // Held to the height of a score, so a card with none lines up with
      // its neighbours on the rail.
      <div className="flex min-h-8 items-center justify-between gap-3">
        <span className={cn("flex min-w-0 items-center gap-2", won ? "font-semibold" : "text-muted-foreground")}>
          <span
            aria-hidden
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              won ? "bg-win glow-win" : outcome === "draw" ? "bg-draw" : "bg-border"
            )}
          />
          <span className="truncate">{name}</span>
        </span>
        {scored && (
          <span className={cn("scoreboard text-3xl", !won && outcome !== "draw" && "text-muted-foreground")}>
            {score}
          </span>
        )}
      </div>
    );
  };

  return (
    <Link
      href={`/matches/${match.id}`}
      className="focus-ring grain flex w-[min(15rem,75vw)] shrink-0 snap-start flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
    >
      <span className="eyebrow flex justify-between gap-2">
        <time dateTime={match.date}>{format(day(match.date), "EEE d MMM")}</time>
        <span>{outcome === null ? "Fixture" : outcome === "draw" ? "Drawn" : "Full time"}</span>
      </span>
      {line("a", sides.A, a)}
      {line("b", sides.B, b)}
    </Link>
  );
}
