import { FORM_LENGTH } from "./config";
import type { Match, PlayerFormResult } from "@/types";
import { outcomeOf, resultFor } from "./match-result";

export type FormResult = "win" | "draw" | "loss";

/**
 * A run, newest first, with `dnp` for a night the squad played without them.
 *
 * One shape for form everywhere: what the table shows beside a name and what
 * a match card shows beside a result are the same list.
 */
export type FormRun = readonly PlayerFormResult[];

export interface RecentForm {
  playerId: string;
  /** Of the window, the ones they actually turned out for. */
  games: number;
  /** Newest first, with `dnp` where they were not there. */
  results: PlayerFormResult[];
}

/** Newest first, capped at the window — the shape the rest of this file uses. */
export const rollForm = (
  previous: FormRun,
  result: PlayerFormResult,
  windowSize: number = FORM_LENGTH
): PlayerFormResult[] => [result, ...previous].slice(0, windowSize);

/**
 * Everyone's run of recent results: the W/D/L strip drawn beside a name.
 *
 * The window is the squad's last few matches, the same few for everybody,
 * with the nights a player missed marked — from their first game onwards.
 * It is a record of what happened, not a measure of anybody; how a player is
 * going against the odds is expected wins' job.
 *
 * Derived from the matches, like everything else here, so it cannot fall out
 * of step with them.
 */
export function recentForm(
  matches: Match[],
  windowSize: number = FORM_LENGTH
): Map<string, RecentForm> {
  const played = matches
    .filter((m) => outcomeOf(m) !== null)
    // Newest first, so taking the window is just a slice.
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // A night is only missed if the player was around to miss it. Counting the
  // weeks before somebody's debut would hand every newcomer a run of blanks.
  const debut = new Map<string, number>();
  played.forEach((match, index) => {
    for (const id of [...match.teamA.players, ...match.teamB.players]) {
      // Newest first, so the last index seen is the earliest match.
      debut.set(id, index);
    }
  });

  const window = played.slice(0, windowSize);

  // Anybody who turned out at least once in the window. Somebody who has not
  // played in any of it has no recent run to show, rather than a stale one
  // carried forward from March.
  const appeared = new Set(
    window.flatMap((match) => [...match.teamA.players, ...match.teamB.players])
  );

  const byPlayer = new Map<string, RecentForm>();

  for (const playerId of appeared) {
    const results: PlayerFormResult[] = [];
    let games = 0;

    window.forEach((match, index) => {
      if (index > (debut.get(playerId) ?? 0)) return;

      const result = resultFor(match, playerId);
      if (result === null) {
        results.push("dnp");
        return;
      }
      results.push(result);
      games += 1;
    });

    byPlayer.set(playerId, { playerId, games, results });
  }

  return byPlayer;
}
