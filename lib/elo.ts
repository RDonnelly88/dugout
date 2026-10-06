import { ELO } from "./config";
import { rollResults, type Result } from "./recent-results";
import { outcomeOf } from "./match-result";
import type { Match, RecentResult } from "@/types";

interface RatingPoint {
  matchId: string;
  date: string;
  /** Rating after this match. */
  rating: number;
  /**
   * How far this night moved it: the result itself, plus every older game
   * fading by one more match.
   */
  change: number;
  /**
   * What the result alone was worth to them: `ELO.k` times what their side
   * took less what it was expected to. The same for everybody on the side,
   * fixed on the night, and only ever faded afterwards.
   */
  settled: number;
  /**
   * Which of the squad's matches this was, counting from its first, so the
   * game's age — and so how much it still counts — can be read off later.
   */
  night: number;
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
   * How many of their games were still counting going in. Team-mates take
   * the same verdict from a result; what differs is how much their older
   * games faded on the same night, and that depends on how many there were.
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
   * Their games still inside the window. Nought means nothing of theirs still
   * counts: they are back on `ELO.start`, and the number says nothing about
   * them.
   */
  counted: number;
  /**
   * How the rating moved over the squad's most recent match, whether or not
   * this player was in it.
   *
   * Not the same as the last entry in `history`, which is the last match they
   * played — possibly months ago. For anyone who missed the game it is only
   * the easing back towards `ELO.start` that comes from every one of their
   * games being a match older: a game's verdict never changes once it is in.
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

const mean = (xs: number[]) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : ELO.start;

/**
 * What one game did to one player, worked out on the night and never again:
 * `ELO.k` times how far the result beat or fell short of what their side was
 * expected to take, from the ratings as they stood going in.
 */
interface Contribution {
  /** Which of the squad's matches it was, counting from their first. */
  night: number;
  delta: number;
}

/**
 * A rating as it stands after `night`: the start, plus every game's
 * contribution still in the window, each faded by how many of the squad's
 * matches have been played since.
 *
 * The contributions are fixed. Nothing that happens later changes what a
 * game was worth — only how much it still counts as it ages.
 */
function ratingAt(contributions: Contribution[], night: number): number {
  let rating = ELO.start;
  for (const c of contributions) {
    const age = night - c.night;
    if (age >= 0 && age < ELO.window) rating += c.delta * WEIGHTS[age];
  }
  return rating;
}

/**
 * Ratings for every player, as they stood after each match in turn.
 *
 * Each game is settled on the night: the ratings going in say what each side
 * was expected to take, and every player on a side moves by the same
 * `ELO.k` times the gap between that and what they took. That amount is
 * locked in. Afterwards it only fades, counting less with every match the
 * squad plays and nothing once it is `ELO.window` matches old (see
 * `gameWeight`), so a rating is "what the recent games said at the time",
 * never a running total that a good spell two years ago is still propping
 * up, and never a re-reading of an old game in the light of later ones.
 *
 * Derived rather than stored, for the same reason the win/loss record is:
 * a stored rating is a second copy of something the matches already say, and
 * the two drift the moment a result is edited. Correcting a scoreline from
 * three weeks ago re-rates everything after it, which is what should happen.
 *
 * Only completed matches with a result count. Anything else is a fixture.
 * Runs over the whole history, from the squad's first match, never reset by
 * a season, and depends on nothing outside the matches, so the same history
 * always gives the same table.
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
    // Oldest first: each night is settled on what came before it.
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Positions in debut order, so a player keeps one index throughout.
  const index = new Map<string, number>();
  const ids: string[] = [];
  const contributions: Contribution[][] = [];

  // The nights each player turned out for, oldest first.
  const appearances: number[][] = [];
  const lastPlayedIndex = new Map<string, number>();

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
      contributions.push([]);
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

    // Going in: where everybody stood after last night, which is what the
    // night is judged against and what the match card says "they faced".
    const before = Float64Array.from(ids, (_, i) => ratingAt(contributions[i], night - 1));
    const at = (playerId: string) => before[index.get(playerId)!];
    const ratingA = mean(sideA.map(at));
    const ratingB = mean(sideB.map(at));
    const countedBefore = new Map(
      [...sideA, ...sideB].map((id) => [id, inWindow(index.get(id)!, night - 1)])
    );

    const lineUp = [...sideA, ...sideB];
    for (const playerId of lineUp) appearances[index.get(playerId)!].push(night);

    // The night's verdict, the same for everybody on a side and settled for
    // good: a side given 70% that wins takes K × 0.3, and one that loses
    // gives up K × 0.7.
    const delta = ELO.k * (actualA - expectedScore(ratingA, ratingB));
    for (const playerId of sideA) contributions[index.get(playerId)!].push({ night, delta });
    for (const playerId of sideB) contributions[index.get(playerId)!].push({ night, delta: -delta });

    // Where everybody stands after it: tonight's verdict at full weight, and
    // every older game a match further faded, played tonight or not.
    const next = Float64Array.from(ids, (_, i) => ratingAt(contributions[i], night));

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
        settled: sideA.includes(playerId) ? delta : -delta,
        night,
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
