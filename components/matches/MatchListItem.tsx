import React from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ChevronRight, Trash2 } from "lucide-react";
import { Match } from "@/types";
import { useSideNames } from "@/hooks/useSideNames";
import { outcomeOf } from "@/lib/match-result";
import { displayRating } from "@/lib/elo";
import type { SideSwing } from "@/lib/match-impact";

interface MatchListItemProps {
  match: Match;
  /** Omitted where deleting is not on offer, such as a player's own page. */
  onDeleteClick?: (match: Match) => void;
  /** What the two sides were rated going in, and what the result did to them. */
  swing?: { A: SideSwing; B: SideSwing };
  /** How it went for the player whose page this is, when that is the question. */
  result?: "win" | "draw" | "loss" | null;
}

const RESULT_STYLE = {
  win: "bg-win/15 text-win",
  draw: "bg-draw/15 text-draw",
  loss: "bg-loss/15 text-loss",
} as const;

/** The side's rating before the game, and what it moved. */
function Swing({ side }: { side: SideSwing }) {
  const change = Math.round(side.change);
  return (
    <span className="tabular mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
      {displayRating(side.before)}
      <span
        className={
          change > 0 ? "text-win" : change < 0 ? "text-loss" : "text-muted-foreground"
        }
      >
        {change > 0 ? "+" : change < 0 ? "−" : "±"}
        {Math.abs(change)}
      </span>
    </span>
  );
}

/** Dates arrive as either a plain day or a full timestamp. */
function matchDate(value: string): Date {
  return value.includes("T") ? parseISO(value) : new Date(`${value}T12:00:00`);
}

/**
 * One match, one row.
 *
 * Deliberately compact. This used to be a card with the two sides stacked
 * vertically on a phone, which made a season of results tall enough that the
 * browser could not render the page in one piece — a list is for scanning, and
 * the detail is a tap away.
 */
const MatchListItem = ({
  match,
  onDeleteClick,
  swing,
  result,
}: MatchListItemProps) => {
  const sides = useSideNames();
  // A result is a result whether or not anyone wrote the score down.
  const winner = outcomeOf(match);
  const played = winner !== null;

  // The winner reads first, so the row is a sentence: "Bibs beat No bibs". A
  // fixed left-hand side would have it saying the opposite half the time.
  const flipped = winner === "b";
  const left = {
    name: flipped ? sides.B : sides.A,
    swing: flipped ? swing?.B : swing?.A,
    won: played && winner !== "draw",
  };
  const right = {
    name: flipped ? sides.A : sides.B,
    swing: flipped ? swing?.A : swing?.B,
  };

  return (
    <li className="relative">
      <Link
        href={`/matches/${match.id}`}
        // The right padding is clearance for the delete button, which is not
        // always there.
        className={`focus-ring flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 transition-colors hover:border-border-strong sm:gap-4 sm:px-4 ${
          onDeleteClick ? "pr-12 sm:pr-12" : ""
        }`}
      >
        <time
          dateTime={match.date}
          className="w-14 shrink-0 text-xs text-muted-foreground sm:w-20 sm:text-sm"
        >
          {format(matchDate(match.date), "d MMM")}
        </time>

        <span className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:gap-3">
          <span className="flex min-w-0 flex-1 flex-col items-end">
            <span
              className={`w-full truncate text-right text-sm sm:text-base ${
                left.won ? "font-semibold" : "text-muted-foreground"
              }`}
            >
              {left.name}
            </span>
            {left.swing && <Swing side={left.swing} />}
          </span>

          {/* Who won, not what it finished. Most results carry no score at
              all, and the ones that do were rarely the point — the list is for
              scanning who beat whom. The score is on the match itself. */}
          <span className="shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
            {winner === "draw" ? "drew" : played ? "beat" : "v"}
          </span>

          <span className="flex min-w-0 flex-1 flex-col items-start">
            <span className="w-full truncate text-sm text-muted-foreground sm:text-base">
              {right.name}
            </span>
            {right.swing && <Swing side={right.swing} />}
          </span>
        </span>

        {result ? (
          <span
            className={`hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize sm:block ${RESULT_STYLE[result]}`}
          >
            {result}
          </span>
        ) : winner === "draw" ? (
          <span className="hidden shrink-0 text-xs text-draw sm:block">Draw</span>
        ) : !played ? (
          <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
            Not played
          </span>
        ) : null}

        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>

      {/* Outside the link: a button inside an anchor is invalid markup. */}
      {onDeleteClick && (
        <button
          type="button"
          onClick={() => onDeleteClick(match)}
          aria-label={`Delete the match on ${format(matchDate(match.date), "d MMMM")}`}
          className="focus-ring absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-loss/15 hover:text-loss"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </li>
  );
};

export default MatchListItem;
