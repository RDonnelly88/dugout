import type { PlayerRating } from "./elo";

export interface SeriesPoint {
  date: string;
  /** Where the rating stood after this. */
  rating: number;
  /** Whether they were in this one, or it went ahead without them. */
  played: boolean;
  result?: "win" | "draw" | "loss";
  /** The mean rating of the side they faced. Only for a match they played. */
  opponentRating?: number;
  /**
   * How far this moved them: what the result was worth, or what the week away
   * cost. Nought while a missed week is still inside the grace.
   */
  change: number;
}

/**
 * One line's worth of a player's rating, matches and misses together.
 *
 * The two halves are kept apart on `PlayerRating` because they are different
 * facts — one is a result, the other is the absence of one — but a chart
 * draws a single line through both, and hovering a point should say which
 * kind it was. A missed week carries no change of its own, so it is worked
 * out here as the step from wherever the line was before it.
 */
export function ratingSeries(rating: PlayerRating): SeriesPoint[] {
  const played: SeriesPoint[] = rating.history.map((point) => ({
    date: point.date,
    rating: point.rating,
    played: true,
    result: point.result,
    opponentRating: point.opponentRating,
    change: point.change,
  }));

  const missed: SeriesPoint[] = rating.drifted.map((point) => ({
    date: point.date,
    rating: point.rating,
    played: false,
    change: 0,
  }));

  const all = [...played, ...missed].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // A miss says only where the rating ended up, so the step is the distance
  // from the point before it.
  for (let i = 0; i < all.length; i++) {
    if (all[i].played) continue;
    const previous = i === 0 ? all[i].rating : all[i - 1].rating;
    all[i].change = all[i].rating - previous;
  }

  return all;
}
