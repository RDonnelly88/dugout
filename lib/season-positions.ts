import { outcomeOf, resultFor } from "./match-result";
import { calculatePlayerRanks, type Rankable } from "./ranking-utils";
import type { Match } from "@/types";

/**
 * Where everybody stood in a season's table after each of its matches.
 *
 * The table itself comes from the `season_player_stats` view, and this must
 * finish exactly where that does, so it is built from the same things: who won
 * by `outcomeOf`, which honours a result with no score, and the placing by
 * `calculatePlayerRanks`, the one set of ranking rules in the app.
 */

export interface PointValues {
  win: number;
  draw: number;
}

/** A row of the league as the view returns it. */
type TableRow = Pick<Rankable, "points" | "wins"> & { draws: number };

/**
 * What a win and a draw are worth, read off the season's own table.
 *
 * The view owns the points, and a copy of them here would be a second answer
 * to the same question. Every row is points = wins × win + draws × draw, so
 * the two values are solved for from the rows, by least squares in case the
 * view ever rounds. A season without a draw says nothing about what one is
 * worth, and needs not to: no draw then decides anything.
 *
 * Null when there is nothing to read, which is only before anybody has won or
 * drawn — when there is no table to chart either.
 */
export function pointValues(rows: TableRow[]): PointValues | null {
  let ww = 0;
  let wd = 0;
  let dd = 0;
  let wp = 0;
  let dp = 0;
  for (const { wins: w, draws: d, points: p } of rows) {
    ww += w * w;
    wd += w * d;
    dd += d * d;
    wp += w * p;
    dp += d * p;
  }
  if (ww === 0 && dd === 0) return null;

  const det = ww * dd - wd * wd;
  // Every row with the same mix of wins and draws leaves the two values
  // tangled together. Never seen in a real season, but answered all the same:
  // wins first, and draws from whatever wins leave over.
  if (Math.abs(det) < 1e-9) {
    const win = ww > 0 ? wp / ww : 0;
    const draw = dd > 0 ? (dp - win * wd) / dd : 0;
    return { win: tidy(win), draw: tidy(draw) };
  }
  return {
    win: tidy((wp * dd - dp * wd) / det),
    draw: tidy((dp * ww - wp * wd) / det),
  };
}

/** Least squares on whole numbers lands a hair off them. */
const tidy = (value: number) => Math.round(value * 1000) / 1000;

export interface SeasonPositions {
  /** The season's played matches, in order: one step on the chart each. */
  matches: { id: string; date: string }[];
  /**
   * Each player's position after every match, null before they first appear.
   * In the order they finish, top first.
   */
  lines: { playerId: string; positions: (number | null)[] }[];
}

interface Tally extends Rankable {
  draws: number;
}

export function seasonPositions(
  matches: Match[],
  values: PointValues
): SeasonPositions {
  const played = matches
    .filter((m) => outcomeOf(m) !== null)
    // Stable on equal dates, so two games on one night keep the order they
    // were entered in rather than shuffling between renders.
    .map((m, i) => ({ m, i }))
    .sort(
      (a, b) =>
        new Date(a.m.date).getTime() - new Date(b.m.date).getTime() || a.i - b.i
    )
    .map(({ m }) => m);

  const tally = new Map<string, Tally>();
  const positions = new Map<string, (number | null)[]>();

  played.forEach((match, step) => {
    for (const playerId of [...match.teamA.players, ...match.teamB.players]) {
      const result = resultFor(match, playerId);
      if (!result) continue;
      const row =
        tally.get(playerId) ??
        { playerId, points: 0, played: 0, wins: 0, draws: 0 };
      row.played += 1;
      if (result === "win") {
        row.wins += 1;
        row.points += values.win;
      } else if (result === "draw") {
        row.draws += 1;
        row.points += values.draw;
      }
      tally.set(playerId, row);
      if (!positions.has(playerId)) positions.set(playerId, Array(step).fill(null));
    }

    const ranks = calculatePlayerRanks([...tally.values()]);
    for (const [playerId, line] of positions) line.push(ranks[playerId] ?? null);
  });

  const final = (line: (number | null)[]) => line[line.length - 1] ?? Infinity;
  return {
    matches: played.map((m) => ({ id: m.id, date: m.date })),
    lines: [...positions]
      .map(([playerId, line]) => ({ playerId, positions: line }))
      .sort((a, b) => final(a.positions) - final(b.positions)),
  };
}
