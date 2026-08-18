import { FORM_LENGTH } from "./config";
import type { Match, PlayerFormResult } from "@/types";
import { outcomeOf, resultFor } from "./match-result";

export type FormResult = "win" | "draw" | "loss";

export interface RecentForm {
  playerId: string;
  /** Of the window, the ones they actually turned out for. */
  games: number;
  points: number;
  /**
   * Points per match in the window — over the squad's last few nights, not
   * over the ones this player chose to appear at. Three is a perfect run,
   * nought a wipeout, and a night missed is a nought like any other.
   */
  pointsPerGame: number;
  /** Newest first, with `dnp` where they were not there. */
  results: PlayerFormResult[];
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
 * The window is the squad's last few matches, the same few for everybody, and
 * a night missed counts as nought. Measuring each player over their own last
 * five instead made the table incomparable: three wins out of three read as a
 * perfect run and outranked five games of four wins, and the card promising
 * "points a game over the last five" was quietly dividing one player's by
 * three. Turning up is part of being in form.
 *
 * Derived from the matches, like everything else here, so it cannot fall out
 * of step with them.
 */
export function recentForm(
  matches: Match[],
  windowSize: number = FORM_LENGTH
): Map<string, RecentForm> {
  const window = matches
    .filter((m) => outcomeOf(m) !== null)
    // Newest first, so taking the window is just a slice.
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, windowSize);

  // Anybody who turned out at least once in the window. Somebody who has not
  // played in any of it has no recent form to speak of, rather than a stale
  // one carried forward from March.
  const appeared = new Set(
    window.flatMap((match) => [...match.teamA.players, ...match.teamB.players])
  );

  const byPlayer = new Map<string, RecentForm>();

  for (const playerId of appeared) {
    const results: PlayerFormResult[] = [];
    let points = 0;
    let games = 0;

    for (const match of window) {
      const result = resultFor(match, playerId);
      if (result === null) {
        results.push("dnp");
        continue;
      }
      results.push(result);
      points += pointsFor(result);
      games += 1;
    }

    byPlayer.set(playerId, {
      playerId,
      games,
      points,
      pointsPerGame: points / window.length,
      results,
    });
  }

  return byPlayer;
}
