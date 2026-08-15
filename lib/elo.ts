import { ELO } from "./config";
import type { Match } from "@/types";

interface RatingPoint {
  matchId: string;
  date: string;
  /** Rating after this match. */
  rating: number;
  /** How far this result moved it. */
  change: number;
  /** The mean rating of the side they faced, going in. */
  opponentRating: number;
  result: "win" | "draw" | "loss";
}

export interface PlayerRating {
  playerId: string;
  rating: number;
  /** Games counted. Below `ELO.provisionalGames` the rating is still settling. */
  games: number;
  provisional: boolean;
  peak: number;
  /** Rating before the most recent match, for showing a delta. */
  previous: number;
  history: RatingPoint[];
}

/**
 * The share of the points a side of rating `a` is expected to take against a
 * side of rating `b`. The classic logistic curve: 400 points of difference is
 * roughly a 10-to-1 favourite.
 */
export function expectedScore(a: number, b: number): number {
  return 1 / (1 + 10 ** ((b - a) / 400));
}

/**
 * How much a scoreline counts, beyond who won.
 *
 * Steps up per goal of margin and then stops, because a 9–0 is not nine times
 * the evidence of a 1–0 — it is one team having a night.
 */
export function marginMultiplier(goalDifference: number): number {
  const margin = Math.abs(goalDifference);
  if (margin <= 1) return 1;
  return Math.min(
    ELO.maxMarginMultiplier,
    1 + (margin - 1) * ELO.marginStep
  );
}

const mean = (xs: number[]) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : ELO.start;

/**
 * Ratings for every player, replayed from the match history in order.
 *
 * Derived rather than stored, for the same reason the win/loss record is:
 * a stored rating is a second copy of something the matches already say, and
 * the two drift the moment a result is edited. Correcting a scoreline from
 * three weeks ago re-rates everything after it, which is what should happen.
 *
 * Only completed matches with a score on both sides count. Anything else is a
 * fixture, not a result.
 */
export function computeRatings(matches: Match[]): Map<string, PlayerRating> {
  const ratings = new Map<string, PlayerRating>();

  const ensure = (playerId: string): PlayerRating => {
    let entry = ratings.get(playerId);
    if (!entry) {
      entry = {
        playerId,
        rating: ELO.start,
        games: 0,
        provisional: true,
        peak: ELO.start,
        previous: ELO.start,
        history: [],
      };
      ratings.set(playerId, entry);
    }
    return entry;
  };

  const played = matches
    .filter(
      (m) =>
        m.status === "completed" &&
        typeof m.teamA.score === "number" &&
        typeof m.teamB.score === "number" &&
        m.teamA.players.length > 0 &&
        m.teamB.players.length > 0
    )
    // Oldest first: a rating is the running total of everything before it.
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const match of played) {
    const scoreA = match.teamA.score as number;
    const scoreB = match.teamB.score as number;

    const sideA = match.teamA.players.map(ensure);
    const sideB = match.teamB.players.map(ensure);

    const ratingA = mean(sideA.map((p) => p.rating));
    const ratingB = mean(sideB.map((p) => p.rating));

    const expectedA = expectedScore(ratingA, ratingB);
    const actualA = scoreA > scoreB ? 1 : scoreA === scoreB ? 0.5 : 0;
    const multiplier = marginMultiplier(scoreA - scoreB);

    const apply = (
      side: PlayerRating[],
      opponentRating: number,
      expected: number,
      actual: number
    ) => {
      for (const player of side) {
        const k =
          player.games < ELO.provisionalGames
            ? ELO.kProvisional
            : ELO.kEstablished;
        const change = k * multiplier * (actual - expected);
        const next = player.rating + change;

        player.previous = player.rating;
        player.rating = next;
        player.games += 1;
        player.provisional = player.games < ELO.provisionalGames;
        player.peak = Math.max(player.peak, next);
        player.history.push({
          matchId: match.id,
          date: match.date,
          rating: next,
          change,
          opponentRating,
          result: actual === 1 ? "win" : actual === 0.5 ? "draw" : "loss",
        });
      }
    };

    // Both sides are adjusted from the ratings they carried into the match,
    // captured above — updating A first and then reading it for B would let
    // the first result of the evening influence the second.
    apply(sideA, ratingB, expectedA, actualA);
    apply(sideB, ratingA, 1 - expectedA, 1 - actualA);
  }

  return ratings;
}

/** Rounded for display. Ratings are carried at full precision internally. */
export const displayRating = (rating: number): number => Math.round(rating);
