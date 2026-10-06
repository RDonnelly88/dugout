import { XW } from "./config";
import { computeRatings } from "./elo";
import { outcomeOf } from "./match-result";
import type { Match } from "@/types";

/**
 * Expected wins, or xW: every result measured against the chance the ratings
 * gave it before kick-off.
 *
 * A win counts one and a draw a half, the same as the rating model, so a side
 * given 70% that wins has beaten its expectation by 0.3, and one that loses
 * has fallen 0.7 short. Summed over any set of games — a player's, a pair's,
 * three mates on the same side — the gap between what happened and what was
 * expected is how much better or worse they did than the sides they were in
 * should have.
 *
 * That is the point of it. A raw win rate together says as much about who
 * else was on the team as about the pair; measured against the ratings of
 * everybody on the pitch, the rest of the line-up is already accounted for.
 */

export interface Night {
  matchId: string;
  date: string;
  /** From the point of view of the players being asked about. */
  result: "win" | "draw" | "loss";
  /** One, a half or nought. */
  actual: number;
  /** The chance their side was given before kick-off. */
  expected: number;
}

/**
 * Whether the gap between what happened and what was expected says anything.
 *
 * - `early`: too few games to say.
 * - `luck`: inside the band ordinary luck would produce.
 * - `above` / `below`: outside it, which luck alone rarely manages.
 */
export type Verdict = "early" | "luck" | "above" | "below";

export interface Ledger {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  /** Wins, with a draw counting a half. */
  actual: number;
  /** Expected wins: the sum of the chances they were given. */
  expected: number;
  /** `actual` less `expected`. Positive is beating the odds. */
  above: number;
  /**
   * How far either side of nought `above` could land through luck alone, given
   * the odds of the games actually played. Measured, not assumed: a run of
   * coin-flip games has a wider band than a run of foregone conclusions.
   */
  luck: number;
  verdict: Verdict;
  /** Oldest first. */
  nights: Night[];
}

const computed = new WeakMap<Match[], Map<string, number>>();

/**
 * The chance the first side was given before each match, by match id.
 *
 * Read out of the rating history, so it is the figure the ratings actually
 * held going into that night — later results never leak back into it. Pass
 * the whole history: a rating carries over from one season to the next, and
 * the odds of a match in March depend on everything before it.
 */
export function matchExpectations(matches: Match[]): Map<string, number> {
  const known = computed.get(matches);
  if (known) return known;

  const firstSide = new Map(matches.map((m) => [m.id, new Set(m.teamA?.players ?? [])]));
  const odds = new Map<string, number>();
  for (const rating of computeRatings(matches).values()) {
    for (const point of rating.history) {
      if (odds.has(point.matchId)) continue;
      const inA = firstSide.get(point.matchId)?.has(rating.playerId);
      odds.set(point.matchId, inA ? point.expected : 1 - point.expected);
    }
  }

  computed.set(matches, odds);
  return odds;
}

/**
 * The nights a group of players shared a side, from their point of view.
 *
 * Every one of `together` on the same side; none of `without` on it with
 * them, whether that is because they were absent or on the other team; and
 * every one of `against`, if any, on the other side. A night the ratings have
 * no odds for — not played, or not in the history the odds were read from —
 * is left out rather than guessed at.
 */
export function nightsFor(
  matches: Match[],
  odds: Map<string, number>,
  {
    together,
    without = [],
    against = [],
  }: { together: string[]; without?: string[]; against?: string[] }
): Night[] {
  if (together.length === 0) return [];
  const nights: Night[] = [];

  for (const match of matches) {
    const outcome = outcomeOf(match);
    const chanceA = odds.get(match.id);
    if (outcome === null || chanceA === undefined) continue;

    for (const side of ["a", "b"] as const) {
      const ours = new Set(side === "a" ? match.teamA.players : match.teamB.players);
      const theirs = new Set(side === "a" ? match.teamB.players : match.teamA.players);
      if (!together.every((id) => ours.has(id))) continue;
      if (without.some((id) => ours.has(id))) continue;
      if (!against.every((id) => theirs.has(id))) continue;

      const result =
        outcome === "draw" ? "draw" : outcome === side ? "win" : "loss";
      nights.push({
        matchId: match.id,
        date: match.date,
        result,
        actual: result === "win" ? 1 : result === "draw" ? 0.5 : 0,
        expected: side === "a" ? chanceA : 1 - chanceA,
      });
    }
  }

  return nights.sort((x, y) => new Date(x.date).getTime() - new Date(y.date).getTime());
}

/** The sums, the luck band and what they amount to, for a set of nights. */
export function ledger(nights: Night[]): Ledger {
  let actual = 0;
  let expected = 0;
  let variance = 0;
  let wins = 0;
  let draws = 0;

  for (const night of nights) {
    actual += night.actual;
    expected += night.expected;
    // Each game a weighted coin: its spread is largest at even odds and
    // nothing at all for a certainty.
    variance += night.expected * (1 - night.expected);
    if (night.result === "win") wins += 1;
    else if (night.result === "draw") draws += 1;
  }

  const above = actual - expected;
  const luck = XW.luckWidth * Math.sqrt(variance);
  const verdict: Verdict =
    nights.length < XW.minGames
      ? "early"
      : above > luck
        ? "above"
        : above < -luck
          ? "below"
          : "luck";

  return {
    played: nights.length,
    wins,
    draws,
    losses: nights.length - wins - draws,
    actual,
    expected,
    above,
    luck,
    verdict,
    nights,
  };
}

/** Every player's own ledger over the matches given: their xW, and how they did against it. */
export function playerLedgers(
  matches: Match[],
  odds: Map<string, number>
): Map<string, Ledger> {
  const ids = new Set(
    matches.flatMap((m) => [...(m.teamA?.players ?? []), ...(m.teamB?.players ?? [])])
  );
  return new Map([...ids].map((id) => [id, ledger(nightsFor(matches, odds, { together: [id] }))]));
}

/** Signed, to one decimal place, with a true minus sign: "+2.4", "−0.7", "0.0". */
export const signedWins = (value: number): string => {
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return "0.0";
  return `${rounded > 0 ? "+" : "−"}${Math.abs(rounded).toFixed(1)}`;
};
