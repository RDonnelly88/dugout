import React from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ChevronRight, Trash2 } from "lucide-react";
import { Match } from "@/types";

interface MatchListItemProps {
  match: Match;
  onDeleteClick: (match: Match) => void;
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
const MatchListItem = ({ match, onDeleteClick }: MatchListItemProps) => {
  const played =
    match.status === "completed" &&
    typeof match.teamA?.score === "number" &&
    typeof match.teamB?.score === "number";

  const scoreA = match.teamA?.score ?? 0;
  const scoreB = match.teamB?.score ?? 0;
  const winner = !played
    ? null
    : scoreA === scoreB
      ? "draw"
      : scoreA > scoreB
        ? "a"
        : "b";

  return (
    <li className="relative">
      <Link
        href={`/matches/${match.id}`}
        className="focus-ring flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 pr-12 transition-colors hover:border-border-strong sm:gap-4 sm:px-4"
      >
        <time
          dateTime={match.date}
          className="w-14 shrink-0 text-xs text-muted-foreground sm:w-20 sm:text-sm"
        >
          {format(matchDate(match.date), "d MMM")}
        </time>

        <span className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:gap-3">
          <span
            className={`min-w-0 flex-1 truncate text-right text-sm sm:text-base ${
              winner === "a" ? "font-semibold" : "text-muted-foreground"
            }`}
          >
            {match.teamA?.name || "Team A"}
          </span>

          {played ? (
            <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 text-sm font-bold tabular sm:text-base">
              {scoreA}
              <span className="mx-0.5 text-muted-foreground">–</span>
              {scoreB}
            </span>
          ) : (
            <span className="shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
              vs
            </span>
          )}

          <span
            className={`min-w-0 flex-1 truncate text-sm sm:text-base ${
              winner === "b" ? "font-semibold" : "text-muted-foreground"
            }`}
          >
            {match.teamB?.name || "Team B"}
          </span>
        </span>

        {winner === "draw" && (
          <span className="hidden shrink-0 text-xs text-draw sm:block">Draw</span>
        )}
        {!played && (
          <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
            Not played
          </span>
        )}

        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Link>

      {/* Outside the link: a button inside an anchor is invalid markup. */}
      <button
        type="button"
        onClick={() => onDeleteClick(match)}
        aria-label={`Delete the match on ${format(matchDate(match.date), "d MMMM")}`}
        className="focus-ring absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-loss/15 hover:text-loss"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
};

export default MatchListItem;
