import { ELO } from "./config";
import { expectedScore } from "./elo";
import { matchImpact } from "./match-impact";
import { outcomeOf } from "./match-result";
import type { FormResult } from "./form";
import type { Match, Player } from "@/types";

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
  /** The run they walked in on, newest first. */
  form: FormResult[];
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
  /** Everyone who played, which is what sizes the pot. */
  headcount: number;
  /** The whole swing the winning side shared out. Negated for the losers. */
  pot: number;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/**
 * The most recent result, broken into the three steps the guide describes.
 *
 * Every figure is read back out of the rating history, so the walkthrough
 * cannot disagree with the match card it is explaining. Returns nothing for
 * a squad with no results yet — there is no worked example without a match.
 */
export function workedExample(
  matches: Match[],
  players: Player[],
  sideNames: { A: string; B: string }
): WorkedExample | null {
  const played = matches
    .filter((m) => outcomeOf(m) !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const match = played[0];
  if (!match) return null;

  const impact = matchImpact(matches, match, players);
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
      form: p.form,
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
    headcount: Math.max(a.players.length, b.players.length),
    // Read back from what actually happened rather than recomputed, so a
    // rounding difference cannot make the sum of the rows disagree with the
    // total the guide prints above them.
    pot: sum(winner.players.map((p) => p.change)),
  };
}

/**
 * What a rating of `from` falls to after a run of matches missed, one entry
 * per match, for drawing the shape of the drift rather than asserting it.
 */
export function driftCurve(from: number, upTo: number): { missed: number; rating: number }[] {
  return Array.from({ length: upTo + 1 }, (_, missed) => {
    const beyond = missed - ELO.decay.graceMatches;
    return {
      missed,
      rating:
        beyond <= 0
          ? from
          : ELO.start + (from - ELO.start) * (1 - ELO.decay.perMatch) ** beyond,
    };
  });
}
