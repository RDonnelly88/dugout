import { FORM_LENGTH } from "./config";
import type { Match } from "@/types";
import { outcomeOf } from "./match-result";

export type FormResult = "win" | "draw" | "loss";

export interface RecentForm {
  playerId: string;
  games: number;
  points: number;
  /** Points per game over the window. Three is a perfect run, nought a wipeout. */
  pointsPerGame: number;
  results: FormResult[];
}

/** What a result is worth. The league's own scoring, and the only copy of it. */
const pointsFor = (result: FormResult): number =>
  result === "win" ? 3 : result === "draw" ? 1 : 0;

/** A perfectly ordinary run: the mark everything else is read against. */
const PAR_POINTS_PER_GAME = 1.5;

/**
 * How many ordinary games to imagine behind a short record.
 *
 * Without this a single win is a flawless run and a single defeat is a
 * collapse, because one game out of one is the whole window. Two par games
 * on the end let form arrive over the first few weeks instead of at full
 * tilt from one result.
 */
const SETTLING_GAMES = 2;

/** Newest first, capped at the window — the shape the rest of this file uses. */
export const rollForm = (
  previous: readonly FormResult[],
  result: FormResult,
  windowSize: number = FORM_LENGTH
): FormResult[] => [result, ...previous].slice(0, windowSize);

/**
 * Where a run sits between a wipeout and a perfect one, as nought to one.
 *
 * Eased towards par while the window is still filling, so this can be leant
 * on from a player's very first game without a single result swinging it to
 * an extreme.
 */
export function formShare(results: readonly FormResult[]): number {
  const points = results.reduce((sum, r) => sum + pointsFor(r), 0);
  const eased =
    (points + SETTLING_GAMES * PAR_POINTS_PER_GAME) /
    (results.length + SETTLING_GAMES);
  return eased / 3;
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
      const points = pointsFor(result);

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
