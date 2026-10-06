import { outcomeOf, resultFor } from "./match-result";
import { seasonPositions, type PointValues } from "./season-positions";
import type { Match, Season } from "@/types";

/** One season of a player's, as a line on their page. */
export interface PlayerSeason {
  season: Season;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  /** Null without the table's values to count them in. */
  points: number | null;
  /** Where they finished — or stand, in a season still running. */
  place: { position: number; of: number } | null;
}

/**
 * Every season a player turned out in, newest first, read off the matches.
 *
 * The place comes from `seasonPositions`, the same rules the season's own
 * table and their wrapped use, so all three name the same finish.
 */
export function playerSeasons(
  matches: Match[],
  seasons: Season[],
  playerId: string,
  values: PointValues | null
): PlayerSeason[] {
  const rows: PlayerSeason[] = [];
  for (const season of seasons) {
    const played = matches.filter((m) => m.seasonId === season.id && outcomeOf(m) !== null);
    const results = played.map((m) => resultFor(m, playerId)).filter((r) => r !== null);
    if (results.length === 0) continue;

    const wins = results.filter((r) => r === "win").length;
    const draws = results.filter((r) => r === "draw").length;
    let place: PlayerSeason["place"] = null;
    if (values) {
      const { lines } = seasonPositions(played, values);
      const last = lines.find((line) => line.playerId === playerId)?.positions.at(-1);
      if (typeof last === "number") place = { position: last, of: lines.length };
    }
    rows.push({
      season,
      played: results.length,
      wins,
      draws,
      losses: results.length - wins - draws,
      points: values ? wins * values.win + draws * values.draw : null,
      place,
    });
  }
  return rows.sort(
    (a, b) => new Date(b.season.startDate).getTime() - new Date(a.season.startDate).getTime()
  );
}
