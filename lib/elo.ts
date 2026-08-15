import { ELO } from "./config";
import { outcomeOf } from "./match-result";
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
  /** Current, after any drift for time away. */
  rating: number;
  /** Games counted. Below `ELO.provisionalGames` the rating is still settling. */
  games: number;
  provisional: boolean;
  peak: number;
  /** Rating before the most recent match, for showing a delta. */
  previous: number;
  /** Whole weeks since their last game. */
  idleWeeks: number;
  /** How much the drift has cost them since that game. Never negative. */
  drift: number;
  history: RatingPoint[];
}

const WEEK = 7 * 24 * 60 * 60 * 1000;

/**
 * A rating pulled back towards the starting mark for time away.
 *
 * Geometric rather than linear, so it approaches `start` and never crosses it
 * — being away should make a strong player ordinary, not weak, and should not
 * make a weak player strong by dragging them upwards past everyone.
 */
export function decayed(rating: number, weeksIdle: number): number {
  const beyondGrace = weeksIdle - ELO.decay.graceWeeks;
  if (beyondGrace <= 0) return rating;
  return (
    ELO.start + (rating - ELO.start) * (1 - ELO.decay.perWeek) ** beyondGrace
  );
}

/**
 * The share of the points a side of rating `a` is expected to take against a
 * side of rating `b`. The classic logistic curve: 400 points of difference is
 * roughly a 10-to-1 favourite.
 */
export function expectedScore(a: number, b: number): number {
  return 1 / (1 + 10 ** ((b - a) / 400));
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
 *
 * Ratings drift back towards the starting mark while a player is away, so
 * every week is comparable to the last whether or not somebody turned out.
 * The drift is applied twice: as each match is replayed, so a returning player
 * is rated on what they carry in, and once more up to `asOf` for the standing
 * as it is now.
 *
 * `asOf` defaults to the present, which does mean the table moves on a Tuesday
 * with no new results. That is the point of it. Pass a fixed time to pin it.
 */
export function computeRatings(
  matches: Match[],
  asOf: number = Date.now()
): Map<string, PlayerRating> {
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
        idleWeeks: 0,
        drift: 0,
        history: [],
      };
      ratings.set(playerId, entry);
    }
    return entry;
  };

  const played = matches
    .filter(
      (m) =>
        outcomeOf(m) !== null &&
        m.teamA.players.length > 0 &&
        m.teamB.players.length > 0
    )
    // Oldest first: a rating is the running total of everything before it.
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // When each player last turned out, so the gap before their next game can be
  // measured. Kept beside the ratings rather than on them: it is scaffolding
  // for the replay, not something a caller needs.
  const lastPlayed = new Map<string, number>();

  for (const match of played) {
    const outcome = outcomeOf(match)!;
    const playedAt = new Date(match.date).getTime();

    const sideA = match.teamA.players.map(ensure);
    const sideB = match.teamB.players.map(ensure);

    // Drift is settled before the match is rated, so somebody back after two
    // months is rated on what they walk in with.
    for (const player of [...sideA, ...sideB]) {
      const previously = lastPlayed.get(player.playerId);
      if (previously !== undefined) {
        player.rating = decayed(player.rating, (playedAt - previously) / WEEK);
      }
      lastPlayed.set(player.playerId, playedAt);
    }

    const ratingA = mean(sideA.map((p) => p.rating));
    const ratingB = mean(sideB.map((p) => p.rating));

    const expectedA = expectedScore(ratingA, ratingB);
    // A win is a win. The margin used to scale the adjustment by up to
    // three-quarters again, which made a 5–0 worth far more than a 1–0 — and
    // in a game where the score is often only half-remembered, and now
    // optional, that was weighting the least reliable thing on the record.
    const actualA = outcome === "a" ? 1 : outcome === "draw" ? 0.5 : 0;

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
        const change = k * (actual - expected);
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

  // Bring everyone up to the present, so two players are comparable whether or
  // not either of them played this week.
  for (const player of ratings.values()) {
    const previously = lastPlayed.get(player.playerId);
    if (previously === undefined) continue;

    const weeks = (asOf - previously) / WEEK;
    const current = decayed(player.rating, weeks);

    player.idleWeeks = Math.max(0, Math.floor(weeks));
    player.drift = player.rating - current;
    player.rating = current;
  }

  return ratings;
}

/** Rounded for display. Ratings are carried at full precision internally. */
export const displayRating = (rating: number): number => Math.round(rating);
