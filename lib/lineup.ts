import { ledger, nightsFor, type Ledger } from "./expected-wins";
import type { Match } from "@/types";

/** The most players a line-up can be asked about at once: a full side. */
export const LINEUP_MAX = 5;

export interface LineupReport {
  /** Every one of them on the same side. */
  together: Ledger;
  /**
   * The rest of the group together with each one missing from their side —
   * which is how to see who is making the difference. Empty for one player.
   */
  without: { playerId: string; ledger: Ledger }[];
  /** Each of them on their own, over the same stretch. */
  alone: { playerId: string; ledger: Ledger }[];
  /**
   * Everybody else who has shared a side with the whole group, by how the
   * group did with them added. Best first; the ones with too few games after
   * the rest, so a single lucky night cannot top it.
   */
  additions: { playerId: string; ledger: Ledger }[];
}

/**
 * How a set of players does on the same side, and what each of them brings.
 *
 * `matches` is the stretch being asked about; `odds` comes from the whole
 * history, since the chance a side was given in March depends on everything
 * before it. `candidates` is who may be suggested as an addition — the active
 * squad, usually, so the best fourth man is not somebody who moved away.
 */
export function lineupReport(
  matches: Match[],
  odds: Map<string, number>,
  playerIds: string[],
  candidates: string[]
): LineupReport {
  const ids = [...new Set(playerIds)].slice(0, LINEUP_MAX);
  const sheet = (together: string[], without: string[] = []) =>
    ledger(nightsFor(matches, odds, { together, without }));

  const together = sheet(ids);

  const without =
    ids.length < 2
      ? []
      : ids.map((playerId) => ({
          playerId,
          ledger: sheet(
            ids.filter((id) => id !== playerId),
            [playerId]
          ),
        }));

  const alone = ids.map((playerId) => ({ playerId, ledger: sheet([playerId]) }));

  const additions =
    ids.length === 0 || ids.length >= LINEUP_MAX
      ? []
      : candidates
          .filter((id) => !ids.includes(id))
          .map((playerId) => ({ playerId, ledger: sheet([...ids, playerId]) }))
          .filter((entry) => entry.ledger.played > 0)
          .sort(
            (a, b) =>
              Number(a.ledger.verdict === "early") - Number(b.ledger.verdict === "early") ||
              b.ledger.above - a.ledger.above ||
              b.ledger.played - a.ledger.played
          );

  return { together, without, alone, additions };
}
