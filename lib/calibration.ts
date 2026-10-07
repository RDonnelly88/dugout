import { XW } from "./config";
import { ledger, type Ledger, type Night } from "./expected-wins";
import { outcomeOf } from "./match-result";
import type { Match } from "@/types";

export interface CalibrationBand {
  /** The favourite's chance in the band's closest game and its clearest, nought to one. */
  from: number;
  to: number;
  /** The favourites' nights in this band, measured against their chances. */
  ledger: Ledger;
}

/**
 * How many bands to split the games into, at most. Thirds: the closest
 * games, the middle and the clearest, each with enough games in it to say
 * something about.
 */
const BANDS = 3;

/**
 * Whether the odds the ratings gave come true: every played match from the
 * point of view of the side the ratings favoured, grouped by how strongly,
 * with what the favourites were expected to take against what they did.
 *
 * Read off the odds as they stood before each kick-off, so a result never
 * vouches for the prediction made with it. A band whose favourites beat
 * their chances by more than luck would explain says the ratings were too
 * timid there; falling short of them, too sure.
 *
 * The bands hold equal numbers of games rather than fixed stretches of
 * odds. Sides picked by rating are close by design, so nearly every game is
 * near a coin-flip, and fixed bands would put almost all of them in one.
 * Fewer bands for fewer games, so none is too small to judge.
 *
 * A dead-even game has no favourite and is read from the first side's point
 * of view: a coin that lands either way is still a coin, and leaving them
 * out would hide the nights with nothing to go on.
 */
export function calibration(
  matches: Match[],
  odds: Map<string, number>
): { all: Ledger; bands: CalibrationBand[] } {
  const nights: Night[] = [];
  for (const match of matches) {
    const outcome = outcomeOf(match);
    const chanceA = odds.get(match.id);
    if (outcome === null || chanceA === undefined) continue;
    const favourite = chanceA >= 0.5 ? "a" : "b";
    const result = outcome === "draw" ? "draw" : outcome === favourite ? "win" : "loss";
    nights.push({
      matchId: match.id,
      date: match.date,
      result,
      actual: result === "win" ? 1 : result === "draw" ? 0.5 : 0,
      expected: favourite === "a" ? chanceA : 1 - chanceA,
    });
  }

  // A ledger's nights run oldest first; the bands are cut by odds.
  const time = (night: Night) => new Date(night.date).getTime();
  nights.sort((x, y) => time(x) - time(y));
  const ranked = [...nights].sort((x, y) => x.expected - y.expected);
  const count = Math.max(1, Math.min(BANDS, Math.floor(ranked.length / XW.minGames)));
  const bands = Array.from({ length: count }, (_, i) => {
    const slice = ranked.slice(
      Math.round((i * ranked.length) / count),
      Math.round(((i + 1) * ranked.length) / count)
    );
    return {
      from: slice[0]?.expected ?? 0.5,
      to: slice.at(-1)?.expected ?? 0.5,
      ledger: ledger([...slice].sort((x, y) => time(x) - time(y))),
    };
  });

  return { all: ledger(nights), bands: bands.filter((band) => band.ledger.played > 0) };
}
