import type { PlayerRating } from "./elo";
import { winRate } from "./player-record";
import type { PlayerFormResult } from "@/types";

export type PlayerSort = "rank" | "form" | "played" | "winRate" | "name";

export const SORT_LABELS: Record<PlayerSort, string> = {
  rank: "Rating",
  form: "Form",
  played: "Games",
  winRate: "Win rate",
  name: "Name",
};

/** What each way of ordering needs to know about a player. */
export interface Sortable {
  id: string;
  name: string;
  rating?: PlayerRating;
  form: PlayerFormResult[];
  played: number;
  wins: number;
}

/** Points a game over whatever form is to hand, on the league's own scoring. */
const formScore = (results: PlayerFormResult[]): number => {
  if (results.length === 0) return 0;
  const points = results.reduce(
    (sum, r) => sum + (r === "win" ? 3 : r === "draw" ? 1 : 0),
    0
  );
  // Over the window rather than over the nights they turned out for, which is
  // how form is counted everywhere else: three wins from three is not a better
  // run than four wins from five.
  return points / results.length;
};

/**
 * The squad in whatever order was asked for.
 *
 * Every order but name is descending, because every one of them is a "who is
 * best at this" question and the answer belongs at the top. Ties fall back to
 * the name so the grid does not reshuffle itself between renders — two
 * players on nought games and no rating are otherwise in whichever order the
 * sort happened to leave them.
 *
 * Anybody without a rating sorts last rather than as nought: a player with no
 * games has not been measured, which is a different thing from having been
 * measured badly.
 */
export function orderPlayers<T extends Sortable>(
  players: T[],
  sort: PlayerSort
): T[] {
  const byName = (a: T, b: T) => a.name.localeCompare(b.name);

  return [...players].sort((a, b) => {
    switch (sort) {
      case "name":
        return byName(a, b);
      case "rank": {
        const ra = a.rating?.rating;
        const rb = b.rating?.rating;
        if (ra === undefined && rb === undefined) return byName(a, b);
        if (ra === undefined) return 1;
        if (rb === undefined) return -1;
        return rb - ra || byName(a, b);
      }
      case "form":
        return formScore(b.form) - formScore(a.form) || byName(a, b);
      case "played":
        return b.played - a.played || byName(a, b);
      case "winRate":
        return winRate(b) - winRate(a) || byName(a, b);
    }
  });
}
