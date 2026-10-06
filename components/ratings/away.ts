import { ELO } from "@/lib/config";

/**
 * Why a rating moved on a night its player sat out, said once for every
 * place that shows it.
 *
 * Nothing is given or taken for missing a game, but the number does move:
 * every game a player has counts for less as the squad plays on without them.
 * Shown bare beside "missed one", a rise read as a reward for not turning up.
 */
export function awayExplanation(missed: number): string {
  const nights = missed === 1 ? "the squad's last match" : `the squad's last ${missed} matches`;
  return `Not in ${nights}. Nothing is given or taken away for missing a game, and no game is re-judged — but each of their games is now a match older and counts for a little less, which eases the rating towards ${ELO.start}.`;
}
