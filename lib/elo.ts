import { ELO } from "./config";
import { rollResults, type Result } from "./recent-results";
import { outcomeOf } from "./match-result";
import type { Match, RecentResult } from "@/types";

interface RatingPoint {
  matchId: string;
  date: string;
  /** Rating after this match. */
  rating: number;
  /** How far this night moved it. */
  change: number;
  /** The mean rating of the side they faced, going in. */
  opponentRating: number;
  /**
   * What their side was expected to take from the night before kick-off:
   * nought to one, a draw counting a half. Summed over games this is
   * expected wins, the yardstick results are measured against.
   */
  expected: number;
  result: Result;
  /** The run they walked in on, newest first, for showing beside the result. */
  resultsBefore: RecentResult[];
  /**
   * How many of their games were still counting going in, which is most of
   * why two team-mates in the same result move by different amounts: one more
   * result says more about somebody with four recent games behind them than
   * about somebody with forty.
   */
  countedBefore: number;
}

export interface PlayerRating {
  playerId: string;
  rating: number;
  /** Games played, ever. Below `ELO.settledAfter` the rating is still a rough guess. */
  games: number;
  /**
   * Whether the rating rests on too few games to lean on yet. A caveat on
   * the number, not a change to it.
   */
  unsettled: boolean;
  peak: number;
  /** Matches the squad has played since this player last turned out. */
  missed: number;
  /**
   * Their games still inside the window. Nought means the rating rests on
   * nothing but the pull towards `ELO.start`, and says nothing about them.
   */
  counted: number;
  /**
   * How the rating moved over the squad's most recent match, whether or not
   * this player was in it.
   *
   * Not the same as the last entry in `history`, which is the last match they
   * played — possibly months ago. For anyone who missed the game this is the
   * small easing back towards `ELO.start` that comes from every one of their
   * games being a match older, plus any re-rating of the people they played
   * with and against.
   */
  lastChange: number;
  history: RatingPoint[];
  /**
   * Every match the squad played without them since their debut, with the
   * date and where the rating stood once that night had been counted.
   *
   * `history` only holds matches they were in, so a chart drawn from it alone
   * stops dead at whenever they last turned out. This carries the line on
   * through the weeks away, easing back towards the start as their games age.
   */
  absent: { date: string; rating: number }[];
}

/**
 * How much a game counts towards a rating, by how many matches the squad has
 * played since it. The newest counts in full, each one older counts a little
 * less, halving every `ELO.halfLife` matches, and from `ELO.window` back it
 * counts for nothing at all.
 *
 * Counted in the squad's matches, whoever played in them, so a game ages the
 * same for everybody: somebody back after five weeks away finds their last
 * game five matches older, not one. A long absence therefore leaves less and
 * less evidence behind, and the rating eases back towards `ELO.start` until
 * they play again.
 */
export function gameWeight(age: number): number {
  if (age < 0 || age >= ELO.window) return 0;
  return 0.5 ** (age / ELO.halfLife);
}

/** `gameWeight` for every age inside the window, worked out once. */
const WEIGHTS = Array.from({ length: ELO.window }, (_, age) => gameWeight(age));

/**
 * The share of the points a side of rating `a` is expected to take against a
 * side of rating `b`. The classic logistic curve: 400 points of difference is
 * roughly a 10-to-1 favourite.
 */
export function expectedScore(a: number, b: number): number {
  return 1 / (1 + 10 ** ((b - a) / 400));
}

/** The slope of `expectedScore`, per rating point, at an even match. */
const SCALE = Math.LN10 / 400;

/**
 * Newton's method stops once nobody is moving by more than this. Each step
 * squares the error, so what is left after a step this small is far below
 * anything a rounded rating could show.
 */
const TOLERANCE = 1e-4;
const MAX_STEPS = 50;
/**
 * A cap on any one step of the solve. A warm start is never far from the
 * answer, but a lopsided first night can be, and a capped step cannot
 * overshoot into nonsense.
 */
const MAX_STEP = 200;

const mean = (xs: number[]) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : ELO.start;

interface Night {
  /** Fit positions of everyone who played, the first side first. */
  players: Int32Array;
  /** Each player's part in the gap between the sides: plus or minus one over side size. */
  share: Float64Array;
  /** How much the night counts, in the fit being solved. The same for everyone in it. */
  weight: number;
  /** 1 if the first side won, ½ for a draw, 0 if it lost. */
  actual: number;
}

/**
 * The ratings that best explain everybody's recent results, all at once.
 *
 * Each player's rating has to answer for their games in the squad's last
 * `ELO.window` matches, the recent ones counting most, given the ratings of
 * the people they played
 * with and against. Those people are being fitted at the same time, which is
 * what credits a win alongside a strong team-mate less than a win alongside
 * a weak one — and goes on doing so as the team-mate's own rating settles.
 *
 * Everybody is also pulled gently towards `ELO.start`, so a rating has to be
 * argued for by results; without it a single win would be an infinite one.
 *
 * Solved by Newton's method from `ratings`, which it overwrites: a weighted
 * logistic regression, settling in a handful of steps from a warm start.
 */
function solve(ratings: Float64Array, nights: Night[]) {
  const n = ratings.length;
  const width = n + 1;
  const pull = 1 / (ELO.spread * ELO.spread);
  // One row per player, flat, with the right-hand side in the last column.
  const system = new Float64Array(n * width);

  for (let step = 0; step < MAX_STEPS; step++) {
    system.fill(0);
    for (let i = 0; i < n; i++) {
      system[i * width + i] = -pull;
      system[i * width + n] = (ratings[i] - ELO.start) * pull;
    }

    for (const night of nights) {
      const { players, share, weight: w } = night;
      let gap = 0;
      for (let k = 0; k < players.length; k++) gap += share[k] * ratings[players[k]];
      const expected = 1 / (1 + Math.exp(-SCALE * gap));
      const surprise = SCALE * (night.actual - expected);
      const slope = SCALE * SCALE * expected * (1 - expected);

      for (let k = 0; k < players.length; k++) {
        const row = players[k] * width;
        const wx = w * share[k];
        system[row + n] -= wx * surprise;
        const curve = wx * slope;
        for (let l = 0; l < players.length; l++) {
          system[row + players[l]] -= curve * share[l];
        }
      }
    }

    const delta = gaussianSolve(system, n);
    let largest = 0;
    for (let i = 0; i < n; i++) {
      const move = Math.max(-MAX_STEP, Math.min(MAX_STEP, delta[i]));
      ratings[i] += move;
      largest = Math.max(largest, Math.abs(move));
    }
    if (largest < TOLERANCE) return;
  }
}

/**
 * Solves an `n` by `n` system held flat with its right-hand side as an extra
 * column, in place, with partial pivoting.
 */
function gaussianSolve(m: Float64Array, n: number): Float64Array {
  const width = n + 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(m[r * width + col]) > Math.abs(m[pivot * width + col])) pivot = r;
    }
    if (pivot !== col) {
      for (let c = col; c < width; c++) {
        const t = m[col * width + c];
        m[col * width + c] = m[pivot * width + c];
        m[pivot * width + c] = t;
      }
    }
    const top = col * width;
    for (let r = col + 1; r < n; r++) {
      const factor = m[r * width + col] / m[top + col];
      if (factor === 0) continue;
      for (let c = col; c < width; c++) m[r * width + c] -= factor * m[top + c];
    }
  }
  const out = new Float64Array(n);
  for (let r = n - 1; r >= 0; r--) {
    let sum = m[r * width + n];
    for (let c = r + 1; c < n; c++) sum -= m[r * width + c] * out[c];
    out[r] = sum / m[r * width + r];
  }
  return out;
}

/**
 * Ratings for every player, as they stood after each match in turn.
 *
 * Derived rather than stored, for the same reason the win/loss record is:
 * a stored rating is a second copy of something the matches already say, and
 * the two drift the moment a result is edited. Correcting a scoreline from
 * three weeks ago re-rates everything after it, which is what should happen.
 *
 * Only completed matches with a result count. Anything else is a fixture.
 *
 * Runs over the whole history, from the squad's first match, never reset by
 * a season. After every match the whole table is fitted afresh from the
 * squad's recent matches (see `solve` and `gameWeight`), so a rating is
 * always "what the last year or so says", never a running total that a good
 * spell two years ago is still propping up.
 *
 * Depends on nothing outside the matches, so the same history always gives
 * the same table.
 */
export function computeRatings(matches: Match[]): Map<string, PlayerRating> {
  // Half the app asks for the same list of matches — the one the query cache
  // hands every component — so it is worked out once per list rather than
  // once per component that wants it.
  const known = computed.get(matches);
  if (known) return known;
  const ratings = replay(matches);
  computed.set(matches, ratings);
  return ratings;
}

const computed = new WeakMap<Match[], Map<string, PlayerRating>>();

function replay(matches: Match[]): Map<string, PlayerRating> {
  const ratings = new Map<string, PlayerRating>();

  const played = matches
    .filter(
      (m) =>
        outcomeOf(m) !== null &&
        m.teamA.players.length > 0 &&
        m.teamB.players.length > 0
    )
    // Oldest first: each night is fitted on what came before it.
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Fit positions, in debut order, so a player keeps one index throughout.
  const index = new Map<string, number>();
  const ids: string[] = [];
  let current = new Float64Array(0);

  // The nights each player turned out for, oldest first.
  const appearances: number[][] = [];
  const lastPlayedIndex = new Map<string, number>();

  // Built as each night is reached, since a fit position is only handed out
  // on a player's debut.
  const nights: Night[] = [];
  // Of a player's nights, the ones still inside the window after `night`.
  const inWindow = (player: number, night: number) =>
    appearances[player].filter((g) => night - g < ELO.window).length;

  // The run each player carries into the next match, newest first, with the
  // nights the squad played without them marked — the same strip the table
  // shows beside a name.
  const runs = new Map<string, RecentResult[]>();

  played.forEach((match, night) => {
    const outcome = outcomeOf(match)!;
    const actualA = outcome === "a" ? 1 : outcome === "draw" ? 0.5 : 0;
    const sideA = match.teamA.players;
    const sideB = match.teamB.players;

    for (const playerId of [...sideA, ...sideB]) {
      if (index.has(playerId)) continue;
      index.set(playerId, ids.length);
      ids.push(playerId);
      appearances.push([]);
      ratings.set(playerId, {
        playerId,
        rating: ELO.start,
        games: 0,
        unsettled: true,
        peak: ELO.start,
        missed: 0,
        counted: 0,
        lastChange: 0,
        history: [],
        absent: [],
      });
    }

    // Going in, for the record and for the match card's "they faced".
    const before = new Float64Array(ids.length).fill(ELO.start);
    before.set(current);
    const at = (playerId: string) => before[index.get(playerId)!];
    const ratingA = mean(sideA.map(at));
    const ratingB = mean(sideB.map(at));
    const countedBefore = new Map(
      [...sideA, ...sideB].map((id) => [id, inWindow(index.get(id)!, night - 1)])
    );

    const lineUp = [...sideA, ...sideB];
    nights.push({
      players: Int32Array.from(lineUp, (id) => index.get(id)!),
      share: Float64Array.from(lineUp, (_, k) =>
        k < sideA.length ? 1 / sideA.length : -1 / sideB.length
      ),
      weight: 0,
      actual: actualA,
    });
    for (const playerId of lineUp) appearances[index.get(playerId)!].push(night);

    // The squad's last `ELO.window` matches, each weighted by how many have
    // been played since.
    const fitted = nights.slice(Math.max(0, night - ELO.window + 1));
    fitted.forEach((entry, k) => (entry.weight = WEIGHTS[fitted.length - 1 - k]));

    const next = Float64Array.from(before);
    solve(next, fitted);
    current = next;

    const resultA: Result =
      actualA === 1 ? "win" : actualA === 0.5 ? "draw" : "loss";
    const resultB: Result =
      actualA === 1 ? "loss" : actualA === 0.5 ? "draw" : "win";
    const resultOf = new Map<string, Result>([
      ...sideA.map((id) => [id, resultA] as const),
      ...sideB.map((id) => [id, resultB] as const),
    ]);

    ids.forEach((playerId, i) => {
      const entry = ratings.get(playerId)!;
      const rating = next[i];
      entry.peak = Math.max(entry.peak, rating);
      entry.rating = rating;

      const result = resultOf.get(playerId);
      if (!result) {
        entry.absent.push({ date: match.date, rating });
        // A night is only missed by somebody who was around to miss it,
        // which everyone in `ids` was: they joined on or before tonight.
        runs.set(playerId, rollResults(runs.get(playerId) ?? [], "dnp"));
        return;
      }

      const run = runs.get(playerId) ?? [];
      entry.games += 1;
      entry.unsettled = entry.games < ELO.settledAfter;
      entry.history.push({
        matchId: match.id,
        date: match.date,
        rating,
        change: rating - before[i],
        opponentRating: sideA.includes(playerId) ? ratingB : ratingA,
        expected: sideA.includes(playerId)
          ? expectedScore(ratingA, ratingB)
          : expectedScore(ratingB, ratingA),
        result,
        resultsBefore: run,
        countedBefore: countedBefore.get(playerId)!,
      });
      runs.set(playerId, rollResults(run, result));
      lastPlayedIndex.set(playerId, night);
    });

    // Only the last night's movement is kept: what the squad's most recent
    // match did to everybody, in it or not.
    ids.forEach((playerId, i) => {
      ratings.get(playerId)!.lastChange = next[i] - before[i];
    });
  });

  for (const player of ratings.values()) {
    player.missed = played.length - 1 - lastPlayedIndex.get(player.playerId)!;
    player.counted = inWindow(index.get(player.playerId)!, played.length - 1);
  }

  return ratings;
}

/** Rounded for display. Ratings are carried at full precision internally. */
export const displayRating = (rating: number): number => Math.round(rating);
