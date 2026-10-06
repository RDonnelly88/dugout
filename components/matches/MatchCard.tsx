import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useSideNames } from "@/hooks/useSideNames";
import { outcomeOf } from "@/lib/match-result";
import { cn } from "@/lib/utils";
import type { Match } from "@/types";

type Result = "win" | "draw" | "loss";

const DOT: Record<Result, string> = { win: "bg-win glow-win", draw: "bg-draw", loss: "bg-loss" };
const TEXT: Record<Result, string> = { win: "text-win", draw: "text-draw", loss: "text-loss" };
const EDGE: Record<Result, string> = { win: "border-t-win", draw: "border-t-draw", loss: "border-t-loss" };
const LABEL: Record<Result, string> = { win: "Won", draw: "Drew", loss: "Lost" };

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
export default function MatchCard({
  match,
  side,
}: {
  match: Match;
  /**
   * Whose card this is, when it is somebody's. Their side is then lit in the
   * colour of their result rather than the winners being lit, so a defeat
   * reads red instead of showing the other side glowing.
   */
  side?: "a" | "b";
}) {
  const sides = useSideNames();
  const outcome = outcomeOf(match);
  const a = match.teamA?.score;
  const b = match.teamB?.score;
  const scored = typeof a === "number" && typeof b === "number";
  const result =
    side && outcome ? (outcome === "draw" ? "draw" : outcome === side ? "win" : "loss") : null;

  const line = (key: "a" | "b", name: string, score: number | undefined) => {
    const won = outcome === key;
    const theirs = side === key && result !== null;
    const lit = side ? theirs : won;
    return (
      // Held to the height of a score, so a card with none lines up with
      // its neighbours on the rail.
      <div className="flex min-h-8 items-center justify-between gap-3">
        <span className={cn("flex min-w-0 items-center gap-2", lit ? "font-semibold" : "text-muted-foreground")}>
          <span
            aria-hidden
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              theirs
                ? DOT[result!]
                : side
                  ? "bg-border"
                  : won
                    ? "bg-win glow-win"
                    : outcome === "draw"
                      ? "bg-draw"
                      : "bg-border"
            )}
          />
          <span className={cn("truncate", theirs && TEXT[result!])}>{name}</span>
        </span>
        {scored && (
          <span className={cn("scoreboard text-3xl", !lit && outcome !== "draw" && "text-muted-foreground")}>
            {score}
          </span>
        )}
      </div>
    );
  };

  return (
    <Link
      href={`/matches/${match.id}`}
      className={cn(
        "focus-ring grain flex w-[min(15rem,75vw)] shrink-0 snap-start flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong",
        result && ["border-t-4", EDGE[result]]
      )}
    >
      <span className="eyebrow flex justify-between gap-2">
        <time dateTime={match.date}>{format(day(match.date), "EEE d MMM")}</time>
        {result ? (
          <span className={TEXT[result]}>{LABEL[result]}</span>
        ) : (
          <span>{outcome === null ? "Fixture" : outcome === "draw" ? "Drawn" : "Full time"}</span>
        )}
      </span>
      {line("a", sides.A, a)}
      {line("b", sides.B, b)}
    </Link>
  );
}
