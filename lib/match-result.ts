import type { Match } from "@/types";

export type Outcome = "a" | "b" | "draw";

/**
 * Reading the result of a match.
 *
 * Who won is `outcome`. The score is optional detail, kept because it is worth
 * having on the record, but it decides nothing beyond itself — a win is a win,
 * and most people remember that they won rather than that it was 6–4.
 *
 * Every module that needed a result used to compare the two scores itself, so
 * making the score optional would have meant four separate places quietly
 * deciding a scoreless win had never happened.
 */

/** Who won, or null if it has not been played yet. */
export function outcomeOf(match: Match): Outcome | null {
  if (match.status !== "completed") return null;

  if (match.outcome) return match.outcome;

  // Matches recorded before the outcome was stored carry only a score.
  const a = match.teamA?.score;
  const b = match.teamB?.score;
  if (typeof a !== "number" || typeof b !== "number") return null;
  return a > b ? "a" : a < b ? "b" : "draw";
}

/** Which side a player was on, or null if they did not feature. */
export function sideOf(match: Match, playerId: string): "a" | "b" | null {
  if (match.teamA?.players?.includes(playerId)) return "a";
  if (match.teamB?.players?.includes(playerId)) return "b";
  return null;
}

/** How the match went for one player, or null if they were not in it. */
export function resultFor(
  match: Match,
  playerId: string
): "win" | "draw" | "loss" | null {
  const outcome = outcomeOf(match);
  const side = sideOf(match, playerId);
  if (!outcome || !side) return null;
  if (outcome === "draw") return "draw";
  return outcome === side ? "win" : "loss";
}
