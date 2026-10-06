import { XW } from "./config";
import type { Ledger } from "./expected-wins";
import type { PointValues } from "./season-positions";

/**
 * Two ways to read a link between players, for the webs that draw them.
 *
 * `record` is what happened: points a game together, against a baseline — the
 * squad's own average across the stretch, or the player's own when the web is
 * about one player. It is the question most people are asking ("what's my
 * record with him?"), so it is the one a web opens on.
 *
 * `odds` is the same games against the chance the ratings gave each side,
 * which strips out how good the rest of the team was. Fairer, and the one to
 * reach for when the question is whether a pairing is any good rather than
 * how it went.
 *
 * Points are what the views say a win and a draw are worth, read off a table
 * by `pointValues` rather than written down here a second time.
 */
export type WebMeasure = "record" | "odds";

type Games = Pick<Ledger, "played" | "wins" | "draws">;

export function pointsPerGame(games: Games, values: PointValues): number {
  return games.played > 0 ? (games.wins * values.win + games.draws * values.draw) / games.played : 0;
}

/** Points a game across many sets of games: everybody's, for a squad average. */
export function averagePointsPerGame(all: Games[], values: PointValues): number {
  const played = all.reduce((sum, g) => sum + g.played, 0);
  const points = all.reduce((sum, g) => sum + g.wins * values.win + g.draws * values.draw, 0);
  return played > 0 ? points / played : 0;
}

/** Enough games to rank a link at all. The same line the luck verdict draws. */
export const enoughGames = (ledger: Ledger) => ledger.played >= XW.minGames;

/**
 * How far a link leans, in the measure's own units: points a game above the
 * baseline, or wins above expected.
 */
export function lean(
  ledger: Ledger,
  measure: WebMeasure,
  values: PointValues,
  baseline: number
): number {
  return measure === "odds" ? ledger.above : pointsPerGame(ledger, values) - baseline;
}

/**
 * Whether a lean is worth a colour. A twentieth of a win either way for the
 * odds; for the record, a twelfth of what a win is worth — a quarter of a
 * point a game on three for a win — since a handful of games moves points a
 * game in big steps.
 */
export function tone(
  ledger: Ledger,
  measure: WebMeasure,
  values: PointValues,
  baseline: number
): "ahead" | "behind" | "level" {
  const by = lean(ledger, measure, values, baseline);
  const level = measure === "odds" ? 0.05 : values.win / 12;
  return by > level ? "ahead" : by < -level ? "behind" : "level";
}

/** How firmly to draw a link, from nought to one. */
export function firmness(ledger: Ledger, measure: WebMeasure, most: number): number {
  if (measure === "odds") {
    return { early: 0.08, luck: 0.22, above: 0.95, below: 0.95 }[ledger.verdict];
  }
  // The record has no verdict, so the number of games is the thing: a pair
  // with two games together is drawn faintly whatever the result.
  return enoughGames(ledger) ? 0.4 + 0.55 * Math.min(1, ledger.played / Math.max(most, 1)) : 0.1;
}

/** Points a game to two places, which is how a table would print it. */
export const ppg = (value: number) => value.toFixed(2);
