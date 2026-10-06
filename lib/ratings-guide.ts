import { ELO } from "./config";
import { expectedScore, gameWeight, type PlayerRating } from "./elo";
import { matchImpact } from "./match-impact";
import { outcomeOf } from "./match-result";
import type { Result } from "./recent-results";

import type { Match } from "@/types";

/**
 * A real result, taken apart, for the guide to walk through.
 *
 * Worked from the squad's own last match rather than invented numbers,
 * because a made-up example is a countable fact that will drift the first
 * time a setting changes — and because the answer to "why did I get that"
 * is far more convincing when it is that player's own night.
 */
interface GuidePlayer {
  playerId: string;
  /** How many of their games the rating rested on going in. */
  counted: number;
  /** The whole night's movement: the side's result plus `faded`. */
  change: number;
  /**
   * What their older games gave up by each counting one match less. The
   * only part of the night that differs between team-mates.
   */
  faded: number;
  after: number;
}

interface GuideSide {
  name: string;
  /** Mean rating of the side going into the match. */
  ratingBefore: number;
  /** What the result alone was worth to every one of them. */
  settled: number;
  players: GuidePlayer[];
}

export interface WorkedExample {
  matchId: string;
  date: string;
  /** The side that took the points, and the side that did not. */
  winner: GuideSide;
  loser: GuideSide;
  drawn: boolean;
  /** What the ratings gave the winning side before a ball was kicked. */
  expected: number;
}

/**
 * The most recent result, broken into the steps the guide describes.
 *
 * Every figure is read back out of the rating history, so the walkthrough
 * cannot disagree with the match card it is explaining. Returns nothing for
 * a squad with no results yet — there is no worked example without a match.
 */
export function workedExample(
  matches: Match[],
  sideNames: { A: string; B: string }
): WorkedExample | null {
  const played = matches
    .filter((m) => outcomeOf(m) !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const match = played[0];
  if (!match) return null;

  const impact = matchImpact(matches, match);
  if (!impact) return null;

  const outcome = outcomeOf(match)!;
  const aWon = outcome !== "b";

  const actualA = outcome === "a" ? 1 : outcome === "draw" ? 0.5 : 0;
  const settledA = ELO.k * (actualA - expectedScore(impact.A.ratingBefore, impact.B.ratingBefore));

  const side = (
    which: "A" | "B",
    name: string
  ): GuideSide => {
    const settled = which === "A" ? settledA : -settledA;
    return {
      name,
      ratingBefore: impact[which].ratingBefore,
      settled,
      players: impact[which].players.map((p) => ({
        playerId: p.playerId,
        counted: p.counted,
        change: p.change,
        faded: p.change - settled,
        after: p.after,
      })),
    };
  };

  const a = side("A", sideNames.A);
  const b = side("B", sideNames.B);
  const winner = aWon ? a : b;
  const loser = aWon ? b : a;

  return {
    matchId: match.id,
    date: match.date,
    winner,
    loser,
    drawn: outcome === "draw",
    expected: expectedScore(winner.ratingBefore, loser.ratingBefore),
  };
}

/**
 * How much each of a player's games counts, newest first, out to the last
 * one that counts at all — for drawing the fade rather than describing it.
 */
export function fadeCurve(): { age: number; weight: number }[] {
  return Array.from({ length: ELO.window }, (_, age) => ({
    age,
    weight: gameWeight(age),
  }));
}

/**
 * One night between two sides a hundred points apart, played out three ways.
 *
 * The only invented numbers in the guide, and only the two ratings: what
 * each result is worth is worked out from `ELO`, so the example moves with
 * the settings rather than going stale beside them.
 */
export function threeWays(favourite = ELO.start + 50, underdog = ELO.start - 50) {
  const chance = expectedScore(favourite, underdog);
  const worth = (took: number) => ELO.k * (took - chance);
  return {
    favourite,
    underdog,
    chance,
    outcomes: [
      { result: "win" as Result, change: worth(1) },
      { result: "draw" as Result, change: worth(0.5) },
      { result: "loss" as Result, change: worth(0) },
    ],
  };
}

interface Piece {
  matchId: string;
  date: string;
  result: Result;
  /** What the result was worth on the night. */
  settled: number;
  /** The squad's matches played since. */
  age: number;
  weight: number;
  /** What it adds to the rating today: `settled` × `weight`. */
  now: number;
}

/**
 * A player's rating taken apart into the games it is made of, newest first:
 * what each was worth on the night, and how much of that it still counts
 * for. The start plus every `now` is the rating, to the last decimal, so the
 * guide can show the sum add up rather than claim it does.
 */
export function ratingBreakdown(rating: PlayerRating): Piece[] {
  const last = rating.history.at(-1);
  if (!last) return [];
  // The squad's latest match: their last game, plus every one they have
  // missed since.
  const latest = last.night + rating.missed;
  return rating.history
    .map((point) => {
      const age = latest - point.night;
      const weight = gameWeight(age);
      return {
        matchId: point.matchId,
        date: point.date,
        result: point.result,
        settled: point.settled,
        age,
        weight,
        now: point.settled * weight,
      };
    })
    .filter((piece) => piece.weight > 0)
    .reverse();
}
