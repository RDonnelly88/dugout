import type { SeasonChampion } from "@/types";

export interface PodiumPlace {
  /** 1, 2, 3 — the place itself, not an index. */
  rank: number;
  /** Everyone who finished there. More than one when a place is shared. */
  players: SeasonChampion[];
}

/**
 * The top few *places* in a season, rather than the top few players.
 *
 * Those are different things once anybody ties, which in an eleven-game season
 * happens often. `season_champions` ranks golf-style — two players level on
 * points, games and wins both take first, and the next player takes third —
 * so a season can have two winners and no runner-up at all.
 *
 * Both callers used to assume one player per place: the card took
 * `champions[0]` and the summary table took `find(c => c.rank === 1)`, so a
 * shared title showed whichever row the planner happened to return first and
 * quietly dropped the other winner.
 *
 * A place that nobody occupies is absent rather than empty. Where two share
 * first there is genuinely no second, and inventing one would contradict the
 * league table on the season's own page.
 */
export function podium(
  champions: SeasonChampion[],
  places: number = 3
): PodiumPlace[] {
  const byRank = new Map<number, SeasonChampion[]>();

  for (const champion of champions) {
    if (champion.rank > places) continue;
    const existing = byRank.get(champion.rank);
    if (existing) existing.push(champion);
    else byRank.set(champion.rank, [champion]);
  }

  return [...byRank.entries()]
    .sort(([a], [b]) => a - b)
    .map(([rank, players]) => ({
      rank,
      // Stable by name, so a shared place doesn't reorder between renders.
      players: [...players].sort((a, b) => a.playerName.localeCompare(b.playerName)),
    }));
}

/** Everyone who finished top. Empty when the season has no results yet. */
export const winners = (champions: SeasonChampion[]): SeasonChampion[] =>
  podium(champions, 1)[0]?.players ?? [];

/** "1st", "2nd", "3rd" — for labelling a place. */
export const ordinal = (rank: number): string => {
  const lastTwo = rank % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${rank}th`;
  const suffix = { 1: "st", 2: "nd", 3: "rd" }[rank % 10] ?? "th";
  return `${rank}${suffix}`;
};
