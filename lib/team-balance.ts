/**
 * Splitting a group into two sides.
 *
 * Three ways, because they answer different questions: a shuffle when the
 * point is that nobody chose, and a weighted split when the point is a game
 * worth playing. The weighted ones take a number per player and try to make
 * the two totals meet in the middle.
 */

export type BalanceMethod = "random" | "rating" | "form" | "skill";

export interface Split<T> {
  teamA: T[];
  teamB: T[];
  /** Mean weight of each side, and the gap between them. */
  strengthA: number;
  strengthB: number;
  difference: number;
}

/**
 * Above this, every arrangement is no longer worth enumerating and the greedy
 * pass takes over. Twenty players is 92,378 arrangements, which is nothing;
 * twenty-four is 1.35 million, which is a stutter on a phone.
 */
const EXHAUSTIVE_LIMIT = 20;

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const mean = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0);

function describe<T>(
  teamA: T[],
  teamB: T[],
  weightOf: (item: T) => number
): Split<T> {
  const strengthA = mean(teamA.map(weightOf));
  const strengthB = mean(teamB.map(weightOf));
  return {
    teamA,
    teamB,
    strengthA,
    strengthB,
    difference: Math.abs(strengthA - strengthB),
  };
}

/**
 * Fisher-Yates, then cut down the middle.
 *
 * `random` is injected so a test can pin the sequence. Nothing else passes it.
 */
export function randomSplit<T>(
  players: T[],
  weightOf: (item: T) => number = () => 0,
  random: () => number = Math.random
): Split<T> {
  const shuffled = [...players];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const half = Math.ceil(shuffled.length / 2);
  return describe(shuffled.slice(0, half), shuffled.slice(half), weightOf);
}

/**
 * The most even split there is.
 *
 * Every way of dealing the group into two sides of nearly equal size is tried,
 * and the one whose mean weights are closest wins. Sides differ by at most one
 * player, so an odd number gives the extra body to A.
 */
function exhaustiveSplit<T>(
  players: T[],
  weightOf: (item: T) => number
): Split<T> {
  const n = players.length;
  const sizeA = Math.ceil(n / 2);
  const weights = players.map(weightOf);

  let best: { mask: number; difference: number } | null = null;

  // Bit i set means player i is on side A. Only masks with the right number of
  // bits are considered, and fixing player 0 to side A halves the search —
  // every arrangement is otherwise found twice, once from each side.
  for (let mask = 0; mask < 1 << n; mask++) {
    if (!(mask & 1)) continue;

    let count = 0;
    let totalA = 0;
    let totalB = 0;
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        count++;
        totalA += weights[i];
      } else {
        totalB += weights[i];
      }
    }
    if (count !== sizeA) continue;

    const difference = Math.abs(totalA / count - totalB / (n - count));
    if (!best || difference < best.difference) best = { mask, difference };
  }

  const teamA: T[] = [];
  const teamB: T[] = [];
  players.forEach((player, i) => {
    (best!.mask & (1 << i) ? teamA : teamB).push(player);
  });

  return describe(teamA, teamB, weightOf);
}

/**
 * Strongest first, each one to whichever side is behind.
 *
 * Not optimal, but close, and it stays quick however many turn up.
 */
function greedySplit<T>(
  players: T[],
  weightOf: (item: T) => number
): Split<T> {
  const ordered = [...players].sort((a, b) => weightOf(b) - weightOf(a));
  const sizeA = Math.ceil(ordered.length / 2);

  const teamA: T[] = [];
  const teamB: T[] = [];
  let totalA = 0;
  let totalB = 0;

  for (const player of ordered) {
    const toA =
      teamB.length >= ordered.length - sizeA ||
      (teamA.length < sizeA && totalA <= totalB);
    if (toA) {
      teamA.push(player);
      totalA += weightOf(player);
    } else {
      teamB.push(player);
      totalB += weightOf(player);
    }
  }

  return describe(teamA, teamB, weightOf);
}

/**
 * Split a group by the chosen method.
 *
 * A weighted split is deterministic: the same players and the same ratings
 * produce the same teams every time. That is the point — it is meant to be
 * the fairest arrangement, not a different one each tap. Use `random` when you
 * want a surprise.
 */
export function splitTeams<T>(
  players: T[],
  method: BalanceMethod,
  weightOf: (item: T) => number,
  random: () => number = Math.random
): Split<T> {
  if (players.length < 2) {
    return describe(players, [], weightOf);
  }

  if (method === "random") return randomSplit(players, weightOf, random);

  return players.length <= EXHAUSTIVE_LIMIT
    ? exhaustiveSplit(players, weightOf)
    : greedySplit(players, weightOf);
}
