import type { PlayerRating } from "./elo";
import { winRate } from "./player-record";

export type PlayerSort = "rank" | "odds" | "played" | "winRate" | "name";

export const SORT_LABELS: Record<PlayerSort, string> = {
  rank: "Rating",
  odds: "Above xW",
  played: "Games",
  winRate: "Win rate",
  name: "Name",
};

/** What each way of ordering needs to know about a player. */
export interface Sortable {
  id: string;
  name: string;
  rating?: PlayerRating;
  /**
   * Wins above expected over the recent stretch the caller chose. Absent for
   * anybody with no games in it, who sorts last rather than as nought.
   */
  aboveXw?: number;
  played: number;
  wins: number;
}

/**
 * The squad in whatever order was asked for.
 *
 * Every order but name is descending, because every one of them is a "who is
 * best at this" question and the answer belongs at the top. Ties fall back to
 * the name so the grid does not reshuffle itself between renders — two
 * players on nought games and no rating are otherwise in whichever order the
 * sort happened to leave them.
 *
 * Anybody without a rating, or without games in the stretch xW is read over,
 * sorts last rather than as nought: a player with no games has not been
 * measured, which is a different thing from having been measured badly.
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
      case "odds": {
        if (a.aboveXw === undefined && b.aboveXw === undefined) return byName(a, b);
        if (a.aboveXw === undefined) return 1;
        if (b.aboveXw === undefined) return -1;
        return b.aboveXw - a.aboveXw || byName(a, b);
      }
      case "played":
        return b.played - a.played || byName(a, b);
      case "winRate":
        return winRate(b) - winRate(a) || byName(a, b);
    }
  });
}
