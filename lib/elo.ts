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
  /** Matches the squad has played since this player last turned out. */
  missed: number;
  /** What the drift for those has cost them. Never negative. */
  drift: number;
  /**
   * How the rating moved over the squad's most recent match, whether or not
   * this player was in it.
   *
   * Not the same as the last entry in `history`, which is the last match they
   * played — possibly months ago. Showing that as "the latest change" put a
   * confident +14 beside somebody who had not turned out since March. For
   * anyone who missed the game this is the drift that missing it cost, which
   * is nought while they are still inside the grace.
   */
  lastChange: number;
  history: RatingPoint[];
  /**
   * Where the rating went after their last game — one point per match the
   * squad played without them, carrying the date of each.
   *
   * `history` only holds matches they were in, so a chart drawn from it alone
   * stops dead at whenever they last turned out and shows a rating that has
   * since drifted thirty points as though it were still standing. This is the
   * tail: flat while they are inside the grace, then curving back towards the
   * starting mark.
   */
  drifted: { date: string; rating: number }[];
}

/**
 * A rating pulled back towards the starting mark for matches missed.
 *
 * Geometric rather than linear, so it approaches `start` and never crosses it
 * — being away should make a strong player ordinary, not weak, and should not
 * make a weak player strong by dragging them upwards past everyone.
 */
export function decayed(rating: number, missed: number): number {
  const beyondGrace = missed - ELO.decay.graceMatches;
  if (beyondGrace <= 0) return rating;
  return (
    ELO.start + (rating - ELO.start) * (1 - ELO.decay.perMatch) ** beyondGrace
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
 * How much of a side's pot a player takes, before normalising across the
 * side. Only the ratio between teammates' weights matters — the pot itself
 * is fixed by the match, not by the weights, so nothing here can create or
 * destroy rating.
 */
export type Weigher = (player: PlayerRating, teamMeanRating: number) => number;

/**
 * The default. A player rated below their own side's mean is the underdog
 * within their own team, so they take a bigger share of a win — and a
 * smaller share of a defeat — than a teammate rated above it. Reuses
 * `expectedScore` rather than a second curve: at the mean it is 0.5, exactly
 * even, same as everyone else on a side of equals.
 */
export const spreadWeigher: Weigher = (player, teamMeanRating) =>
  expectedScore(teamMeanRating, player.rating);

/**
 * Weight by how unsettled a rating still is, ignoring where it sits
 * relative to teammates. Not the default — a squad that would rather a new
 * player's rating settle quickly than have results shared out by strength
 * can pass this to `computeRatings` instead.
 */
export const uncertaintyWeigher: Weigher = (player) =>
  player.games < ELO.provisionalGames ? ELO.kProvisional : ELO.kEstablished;

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
 * Ratings drift back towards the starting mark for matches a player missed,
 * counted in games the squad played without them rather than weeks on the
 * calendar — an off-season is not evidence about anybody. The drift is applied
 * twice: as each match is replayed, so a returning player is rated on what they
 * carry in, and once more at the end for the standing as it is now.
 *
 * Depends on nothing outside the matches, so the same history always gives the
 * same table. It used to read the clock, which meant every rating aged
 * overnight and a screenshot taken twice never matched.
 */
export function computeRatings(
  matches: Match[],
  weigh: Weigher = spreadWeigher
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
        missed: 0,
        drift: 0,
        lastChange: 0,
        drifted: [],
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

  // Which match each player last turned out in, by position in the history, so
  // the number they sat out is the difference. Scaffolding for the replay
  // rather than something a caller needs.
  const lastPlayedIndex = new Map<string, number>();

  played.forEach((match, index) => {
    const outcome = outcomeOf(match)!;

    const sideA = match.teamA.players.map(ensure);
    const sideB = match.teamB.players.map(ensure);

    // Drift is settled before the match is rated, so somebody back after a
    // dozen missed games is rated on what they walk in with.
    for (const player of [...sideA, ...sideB]) {
      const previous = lastPlayedIndex.get(player.playerId);
      if (previous !== undefined) {
        player.rating = decayed(player.rating, index - previous - 1);
      }
      lastPlayedIndex.set(player.playerId, index);
    }

    const ratingA = mean(sideA.map((p) => p.rating));
    const ratingB = mean(sideB.map((p) => p.rating));

    const expectedA = expectedScore(ratingA, ratingB);
    // A win is a win. The margin used to scale the adjustment by up to
    // three-quarters again, which made a 5–0 worth far more than a 1–0 — and
    // in a game where the score is often only half-remembered, and now
    // optional, that was weighting the least reliable thing on the record.
    const actualA = outcome === "a" ? 1 : outcome === "draw" ? 0.5 : 0;

    // One pot per side, sized off however many played on the fuller one —
    // not the side actually being paid out — so a team a player short still
    // moves as much as a full one would have, spread across whoever turned
    // out. `potB` is `potA` negated rather than computed afresh from its own
    // expectation, so the two are equal and opposite to the bit, not just to
    // a tolerance: nothing here can leak or mint rating.
    const potSize = Math.max(sideA.length, sideB.length) * ELO.kEstablished;
    const potA = potSize * (actualA - expectedA);
    const potB = -potA;

    const apply = (
      side: PlayerRating[],
      pot: number,
      teamMeanRating: number,
      opponentRating: number,
      result: "win" | "draw" | "loss"
    ) => {
      const weights = side.map((player) => weigh(player, teamMeanRating));
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);

      side.forEach((player, i) => {
        const change = (weights[i] / totalWeight) * pot;
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
          result,
        });
      });
    };

    const resultA = actualA === 1 ? "win" : actualA === 0.5 ? "draw" : "loss";
    const resultB = actualA === 1 ? "loss" : actualA === 0.5 ? "draw" : "win";

    // Both sides are adjusted from the ratings they carried into the match,
    // captured above — updating A first and then reading it for B would let
    // the first result of the evening influence the second.
    apply(sideA, potA, ratingA, ratingB, resultA);
    apply(sideB, potB, ratingB, ratingA, resultB);
  });

  // Bring everyone up to the last match played, so two players are comparable
  // whether or not either was in it.
  for (const player of ratings.values()) {
    const previous = lastPlayedIndex.get(player.playerId);
    if (previous === undefined) continue;

    const missed = played.length - 1 - previous;
    const current = decayed(player.rating, missed);

    // What the rating was before the squad's most recent match: for somebody
    // who played in it, back out that result; for somebody who did not, the
    // same rating carrying one fewer missed game.
    const before =
      missed === 0
        ? player.rating - (player.history.at(-1)?.change ?? 0)
        : decayed(player.rating, missed - 1);

    // One point per match they were not in, so a chart carries on to the
    // present rather than stopping at whenever they last played.
    player.drifted = Array.from({ length: missed }, (_, i) => ({
      date: played[previous + i + 1].date,
      rating: decayed(player.rating, i + 1),
    }));

    player.missed = missed;
    player.drift = player.rating - current;
    player.lastChange = current - before;
    player.rating = current;
  }

  return ratings;
}

/** Rounded for display. Ratings are carried at full precision internally. */
export const displayRating = (rating: number): number => Math.round(rating);
