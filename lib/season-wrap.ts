import { computeRatings, expectedScore } from "./elo";
import { outcomeOf } from "./match-result";
import type { Match } from "@/types";

/**
 * The story a season tells once it is over.
 *
 * Everything here is worked out from the matches, like the rest of the app —
 * the awards are not decided or stored anywhere, they are read off the same
 * history the table is. A season replayed twice gives the same answers, and
 * correcting a scoreline from March changes them, which is right.
 */

interface Mover {
  playerId: string;
  from: number;
  to: number;
  change: number;
}

interface Streak {
  playerId: string;
  length: number;
}

interface Turnout {
  playerId: string;
  played: number;
  /** Of the matches the squad played in this season. */
  share: number;
}

interface Upset {
  matchId: string;
  date: string;
  /** The side nobody fancied, and what the table gave them beforehand. */
  expected: number;
  winnerIds: string[];
  loserIds: string[];
  drawn: boolean;
}

interface Partnership {
  playerIds: [string, string];
  played: number;
  /** Share of results won together, eased towards even by how little proof there is. */
  lift: number;
}

export interface SeasonWrap {
  matches: number;
  /** Whose rating climbed furthest across the season. */
  climber: Mover | null;
  /** The longest run of wins anybody put together. */
  streak: Streak | null;
  /** Who turned out most. */
  everPresent: Turnout | null;
  /** The result the table least expected. */
  upset: Upset | null;
  /** The two who win most when they are on the same side. */
  partnership: Partnership | null;
}

const played = (matches: Match[]) =>
  matches
    .filter((m) => outcomeOf(m) !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

/** Games needed before a season is long enough to have improved across. */
const CLIMB_GAMES = 4;

/**
 * Whoever improved most over the season.
 *
 * The two halves of a player's own season compared, not their first rating
 * against their last. Everybody starts a season on the same mark, so
 * measuring from there makes the biggest climber whoever finished highest —
 * which is the table, and the table already exists. Halves ask a different
 * question: were they better by the end than they were at the start.
 */
function climber(matches: Match[]): Mover | null {
  const ratings = computeRatings(matches);
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  let best: Mover | null = null;

  for (const rating of ratings.values()) {
    const line = rating.history.map((point) => point.rating);
    if (line.length < CLIMB_GAMES) continue;

    const half = Math.floor(line.length / 2);
    const from = mean(line.slice(0, half));
    const to = mean(line.slice(-half));
    const change = to - from;

    if (!best || change > best.change)
      best = { playerId: rating.playerId, from, to, change };
  }

  return best && best.change > 0 ? best : null;
}

/** The longest run of wins, counted over the games each player was in. */
function longestStreak(matches: Match[]): Streak | null {
  const running = new Map<string, number>();
  let best: Streak | null = null;

  for (const match of played(matches)) {
    const outcome = outcomeOf(match)!;
    for (const [side, key] of [
      [match.teamA.players, "a"],
      [match.teamB.players, "b"],
    ] as const) {
      const won = outcome === key;
      for (const id of side) {
        const next = won ? (running.get(id) ?? 0) + 1 : 0;
        running.set(id, next);
        if (next > 1 && (!best || next > best.length))
          best = { playerId: id, length: next };
      }
    }
  }

  return best;
}

/** Who turned out most often. */
function everPresent(matches: Match[]): Turnout | null {
  const fixtures = played(matches);
  if (fixtures.length === 0) return null;

  const counts = new Map<string, number>();
  for (const match of fixtures)
    for (const id of [...match.teamA.players, ...match.teamB.players])
      counts.set(id, (counts.get(id) ?? 0) + 1);

  let best: Turnout | null = null;
  for (const [playerId, count] of counts) {
    if (!best || count > best.played)
      best = { playerId, played: count, share: count / fixtures.length };
  }
  return best;
}

/**
 * The night the table got most wrong.
 *
 * Read from the ratings the two sides carried in, so it is the result that
 * was least expected at the time rather than one that looks odd in
 * hindsight. A draw counts by how far it fell from a foregone conclusion.
 */
function biggestUpset(matches: Match[]): Upset | null {
  const fixtures = played(matches);
  const ratings = computeRatings(matches);
  let best: (Upset & { surprise: number }) | null = null;

  for (const match of fixtures) {
    const before = (ids: string[]) => {
      const values = ids.flatMap((id) => {
        const moment = ratings
          .get(id)
          ?.history.find((point) => point.matchId === match.id);
        return moment ? [moment.rating - moment.change] : [];
      });
      return values.length
        ? values.reduce((a, b) => a + b, 0) / values.length
        : null;
    };

    const a = before(match.teamA.players);
    const b = before(match.teamB.players);
    if (a === null || b === null) continue;

    const outcome = outcomeOf(match)!;
    const actualA = outcome === "a" ? 1 : outcome === "draw" ? 0.5 : 0;
    const expectedA = expectedScore(a, b);
    const surprise = Math.abs(actualA - expectedA);

    if (!best || surprise > best.surprise) {
      const aWon = actualA >= 0.5;
      best = {
        surprise,
        matchId: match.id,
        date: match.date,
        expected: aWon ? expectedA : 1 - expectedA,
        winnerIds: aWon ? match.teamA.players : match.teamB.players,
        loserIds: aWon ? match.teamB.players : match.teamA.players,
        drawn: outcome === "draw",
      };
    }
  }

  if (!best) return null;
  const { surprise: _surprise, ...upset } = best;
  return upset;
}

/** Nights together before a pair counts as a partnership rather than a night. */
const PAIR_GAMES = 3;
/** Imagined even results, so three good nights cannot top thirty decent ones. */
const PAIR_SHRINKAGE = 4;

/**
 * The two who win most when they are on the same side.
 *
 * Read from the pair itself rather than from either player's point of view.
 * The chemistry page measures a partner against the subject's own average,
 * which is the right question there and the wrong one here: it makes the
 * best partnership a poor player standing next to a good one, since their
 * lift is enormous and their partner's is nought.
 *
 * Pulled towards an even record by the weight of evidence, so a pair with
 * three wins together does not beat a pair with thirty games behind them.
 */
function partnership(matches: Match[]): Partnership | null {
  const together = new Map<string, { played: number; points: number }>();

  for (const match of played(matches)) {
    const outcome = outcomeOf(match)!;
    for (const [side, key] of [
      [match.teamA.players, "a"],
      [match.teamB.players, "b"],
    ] as const) {
      const got = outcome === key ? 1 : outcome === "draw" ? 0.5 : 0;
      const ordered = [...side].sort();
      for (let i = 0; i < ordered.length; i++) {
        for (let j = i + 1; j < ordered.length; j++) {
          const pair = `${ordered[i]}|${ordered[j]}`;
          const tally = together.get(pair) ?? { played: 0, points: 0 };
          tally.played += 1;
          tally.points += got;
          together.set(pair, tally);
        }
      }
    }
  }

  let best: Partnership | null = null;
  for (const [pair, tally] of together) {
    if (tally.played < PAIR_GAMES) continue;
    const adjusted =
      (tally.points + PAIR_SHRINKAGE * 0.5) / (tally.played + PAIR_SHRINKAGE);
    if (!best || adjusted > best.lift) {
      const [one, two] = pair.split("|");
      best = { playerIds: [one, two], played: tally.played, lift: adjusted };
    }
  }

  return best && best.lift > 0.5 ? best : null;
}

export function seasonWrap(matches: Match[]): SeasonWrap {
  const fixtures = played(matches);
  return {
    matches: fixtures.length,
    climber: climber(matches),
    streak: longestStreak(matches),
    everPresent: everPresent(matches),
    upset: biggestUpset(matches),
    partnership: partnership(matches),
  };
}
