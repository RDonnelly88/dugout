import { FORM_LENGTH } from "./config";
import type { Match } from "@/types";
import { outcomeOf } from "./match-result";

export interface RecentForm {
  playerId: string;
  games: number;
  points: number;
  /** Points per game over the window. Three is a perfect run, nought a wipeout. */
  pointsPerGame: number;
  results: ("win" | "draw" | "loss")[];
}

/**
 * How everyone has been going lately.
 *
 * The last few results only, because "on form" means recently — a player who
 * carried the team in March and has not turned up since is not someone to
 * build a side around tonight. All-time is what the record is for.
 *
 * Derived from the matches, like everything else here, so it cannot fall out
 * of step with them.
 */
export function recentForm(
  matches: Match[],
  windowSize: number = FORM_LENGTH
): Map<string, RecentForm> {
  const byPlayer = new Map<string, RecentForm>();

  const played = matches
    .filter((m) => outcomeOf(m) !== null)
    // Newest first, so taking the window is just a length check.
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const match of played) {
    const outcome = outcomeOf(match)!;

    const sides = [
      { players: match.teamA.players, key: "a" as const },
      { players: match.teamB.players, key: "b" as const },
    ];

    for (const side of sides) {
      const result =
        outcome === "draw" ? "draw" : outcome === side.key ? "win" : "loss";
      const points = result === "win" ? 3 : result === "draw" ? 1 : 0;

      for (const playerId of side.players) {
        const entry =
          byPlayer.get(playerId) ??
          ({
            playerId,
            games: 0,
            points: 0,
            pointsPerGame: 0,
            results: [],
          } satisfies RecentForm);

        if (entry.games < windowSize) {
          entry.games += 1;
          entry.points += points;
          entry.pointsPerGame = entry.points / entry.games;
          entry.results.push(result);
        }

        byPlayer.set(playerId, entry);
      }
    }
  }

  return byPlayer;
}
