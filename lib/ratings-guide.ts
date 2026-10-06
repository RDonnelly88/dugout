import { ELO } from "./config";
import { expectedScore, gameWeight } from "./elo";
import { matchImpact } from "./match-impact";
import { outcomeOf } from "./match-result";

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
  change: number;
  after: number;
}

interface GuideSide {
  name: string;
  /** Mean rating of the side going into the match. */
  ratingBefore: number;
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

  const side = (
    which: "A" | "B",
    name: string
  ): GuideSide => ({
    name,
    ratingBefore: impact[which].ratingBefore,
    players: impact[which].players.map((p) => ({
      playerId: p.playerId,
      counted: p.counted,
      change: p.change,
      after: p.after,
    })),
  });

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
