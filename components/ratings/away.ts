import { ELO } from "@/lib/config";

/**
 * Why a rating moved on a night its player sat out, said once for every
 * place that shows it.
 *
 * Nothing is given or taken for missing a game, but the number does move: the
 * whole table is refitted after every match, so their games age and the
 * people in them are re-rated. Shown bare beside "missed one", a rise read as
 * a reward for not turning up.
 */
export function awayExplanation(missed: number): string {
  const nights = missed === 1 ? "the squad's last match" : `the squad's last ${missed} matches`;
  return `Not in ${nights}. Nothing is given or taken away for missing a game: as their games get older the rating eases towards ${ELO.start}, and it moves when the people in those games are re-rated.`;
}
