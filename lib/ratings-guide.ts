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
  /** How many games they had played going in; nought on a debut. */
  gamesBefore: number;
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
        gamesBefore: p.gamesBefore,
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

/** How far back the fade is drawn: four halvings, by when a game counts a sixteenth. */
export const FADE_DRAWN = ELO.halfLife * 4;

/**
 * How much each of a player's games counts, newest first, out to where it is
 * all but gone — for drawing the fade rather than describing it.
 */
export function fadeCurve(): { age: number; weight: number }[] {
  return Array.from({ length: FADE_DRAWN }, (_, age) => ({
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
  /**
   * What the squad's next match does to it before a ball is kicked: the
   * same share of what it has left as every other game gives up.
   */
  next: number;
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
        next: point.settled * (gameWeight(age + 1) - weight),
      };
    })
    .reverse();
}

/** One column of `fadingSummary`: a set of games, added up four ways. */
export interface FadingColumn {
  games: number;
  /** What they were worth on their nights. */
  night: number;
  /** What fading has taken off that since: `now − night`. */
  faded: number;
  /** What they add to the start today. */
  now: number;
  /** What the next match does to them before anybody plays. */
  next: number;
}

/**
 * A rating's games added up three ways: the games that put points on, the
 * games that took points off, and all of them; each worth so much on the
 * night, faded by so much since, worth so much today, and moved by so much
 * at the next match. Every step of a rating's waterfall is one of these
 * figures, so they add up along the way and to the rating at the end.
 *
 * Fading is a share of each game's worth, so across a player it is a share
 * of what their games add up to, not of how big any one of them is: the same
 * share of the way back to the start every match. The games that gained
 * points shrink, which costs; the games that cost points shrink too, which
 * gives some back. Somebody whose games roughly cancel out has next to
 * nothing to fade, however many games they have.
 */
export function fadingSummary(pieces: Piece[]): {
  gained: FadingColumn;
  cost: FadingColumn;
  all: FadingColumn;
} {
  const column = (list: Piece[]): FadingColumn => {
    const night = list.reduce((sum, p) => sum + p.settled, 0);
    const now = list.reduce((sum, p) => sum + p.now, 0);
    return {
      games: list.length,
      night,
      faded: now - night,
      now,
      next: list.reduce((sum, p) => sum + p.next, 0),
    };
  };
  return {
    gained: column(pieces.filter((p) => p.settled > 0)),
    cost: column(pieces.filter((p) => p.settled < 0)),
    all: column(pieces),
  };
}
