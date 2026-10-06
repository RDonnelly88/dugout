import React from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ChevronRight, Trash2 } from "lucide-react";
import { Match } from "@/types";
import { useSideNames } from "@/hooks/useSideNames";
import { outcomeOf } from "@/lib/match-result";
import { displayRating } from "@/lib/elo";
import type { SideSwing } from "@/lib/match-impact";
import { cn } from "@/lib/utils";
import { usePlayerNames } from "@/hooks/usePlayerNames";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MatchListItemProps {
  match: Match;
  /** Omitted where deleting is not on offer, such as a player's own page. */
  onDeleteClick?: (match: Match) => void;
  /** What the two sides were rated going in, and what the result did to them. */
  swing?: { A: SideSwing; B: SideSwing };
  /**
   * The side a player was on and how it went for them, when the row is read
   * from their page. Their side then reads first and the row takes the colour
   * of their result, so a loss looks like a loss even though the winners are
   * somebody else.
   */
  viewpoint?: { side: "a" | "b"; result: Result | null };
}

type Result = "win" | "draw" | "loss";

const RESULT_STYLE: Record<Result, { pill: string; row: string; name: string }> = {
  win: { pill: "bg-win/15 text-win", row: "border-l-win bg-win/5", name: "text-win" },
  draw: { pill: "bg-draw/15 text-draw", row: "border-l-draw bg-draw/5", name: "text-draw" },
  loss: { pill: "bg-loss/15 text-loss", row: "border-l-loss bg-loss/5", name: "text-loss" },
};

const RESULT_LETTER: Record<Result, string> = { win: "W", draw: "D", loss: "L" };

const RESULT_VERB: Record<Result, string> = { win: "beat", draw: "drew", loss: "lost to" };

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

/**
 * Who was on a side, in first names on one small line under the side's name.
 *
 * Five names rarely fit beside another five on a phone, so the line truncates
 * and the whole side, in full names, is a hover away. The match itself lists
 * them properly on a tap.
 */
function Lineup({
  side,
  playerIds,
  align,
}: {
  side: string;
  playerIds: string[];
  align: "start" | "end";
}) {
  const { fullName, shortName } = usePlayerNames();
  if (playerIds.length === 0) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              // Two lines on a phone, where one holds barely two names; one line
              // from there up, where it holds the lot.
              "line-clamp-2 w-full text-[11px] leading-tight text-muted-foreground sm:line-clamp-1",
              align === "end" ? "text-right" : "text-left"
            )}
          >
            {playerIds.map(shortName).join(", ")}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-64 text-xs">
          <span className="font-semibold">{side}</span>
          <span className="block">{playerIds.map(fullName).join(", ")}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
  viewpoint,
}: MatchListItemProps) => {
  const sides = useSideNames();
  // A result is a result whether or not anyone wrote the score down.
  const winner = outcomeOf(match);
  const played = winner !== null;
  const result = viewpoint?.result ?? null;

  // The row is a sentence. Read for the squad, the winner goes first: "Bibs
  // beat No bibs". Read for one player, their side goes first and the verb
  // bends to fit: "No bibs lost to Bibs".
  const flipped = viewpoint ? viewpoint.side === "b" : winner === "b";
  const left = {
    name: flipped ? sides.B : sides.A,
    players: (flipped ? match.teamB?.players : match.teamA?.players) ?? [],
    swing: flipped ? swing?.B : swing?.A,
    strong: viewpoint ? true : played && winner !== "draw",
  };
  const right = {
    name: flipped ? sides.A : sides.B,
    players: (flipped ? match.teamA?.players : match.teamB?.players) ?? [],
    swing: flipped ? swing?.A : swing?.B,
  };
  const verb = result ? RESULT_VERB[result] : winner === "draw" ? "drew" : played ? "beat" : "v";

  return (
    <li className="relative">
      <Link
        href={`/matches/${match.id}`}
        // The right padding is clearance for the delete button, which is not
        // always there.
        className={cn(
          "focus-ring flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 transition-colors hover:border-border-strong sm:gap-4 sm:px-4",
          result && ["border-l-4", RESULT_STYLE[result].row],
          onDeleteClick && "pr-12 sm:pr-12"
        )}
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
              className={cn(
                "w-full truncate text-right text-sm sm:text-base",
                left.strong ? "font-semibold" : "text-muted-foreground",
                result && RESULT_STYLE[result].name
              )}
            >
              {left.name}
            </span>
            <Lineup side={left.name} playerIds={left.players} align="end" />
            {left.swing && <Swing side={left.swing} />}
          </span>

          {/* Who won, not what it finished. Most results carry no score at
              all, and the ones that do were rarely the point — the list is for
              scanning who beat whom. The score is on the match itself. */}
          <span className="shrink-0 text-xs uppercase tracking-wider text-muted-foreground">
            {verb}
          </span>

          <span className="flex min-w-0 flex-1 flex-col items-start">
            <span className="w-full truncate text-sm text-muted-foreground sm:text-base">
              {right.name}
            </span>
            <Lineup side={right.name} playerIds={right.players} align="start" />
            {right.swing && <Swing side={right.swing} />}
          </span>
        </span>

        {result ? (
          // On a phone too: on someone's own page this is the one thing the
          // row is for. A letter there, the word where it fits.
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
              RESULT_STYLE[result].pill
            )}
          >
            <span className="sm:hidden">{RESULT_LETTER[result]}</span>
            <span className="hidden sm:inline">{result}</span>
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
