/**
 * Round numbers coming up — a fiftieth game, a hundredth win — read off the
 * all-time records, for the front page to make something of.
 *
 * Nothing is stored: a milestone is only ever where a count sits against the
 * next mark, so correcting a result moves it like everything else.
 */

/** The counts worth marking. Ten for a newcomer's first, then the round ones. */
const MARKS = [10, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000];

export interface Milestone {
  playerId: string;
  kind: "games" | "wins";
  mark: number;
  /** Nought for one brought up in the squad's latest match. */
  toGo: number;
}

interface Counts {
  playerId: string;
  played: number;
  wins: number;
}

/**
 * Milestones within `within` of being reached, and any brought up by the
 * latest match — by somebody in `lastLineUp`, since a count sitting on a
 * mark from months ago is old news.
 *
 * Nearest first; among equals, the bigger mark, which is the better story.
 */
export function milestones(
  records: Counts[],
  lastLineUp: ReadonlySet<string>,
  within = 2
): Milestone[] {
  const found: Milestone[] = [];
  for (const record of records) {
    for (const kind of ["games", "wins"] as const) {
      const count = kind === "games" ? record.played : record.wins;
      if (count > 0 && MARKS.includes(count) && lastLineUp.has(record.playerId)) {
        found.push({ playerId: record.playerId, kind, mark: count, toGo: 0 });
        continue;
      }
      const next = MARKS.find((mark) => mark > count);
      if (next !== undefined && next - count <= within) {
        found.push({ playerId: record.playerId, kind, mark: next, toGo: next - count });
      }
    }
  }
  return found.sort((a, b) => a.toGo - b.toGo || b.mark - a.mark);
}
