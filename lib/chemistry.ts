import type { Match } from "@/types";
import { ledger, type Ledger, type Night } from "./expected-wins";
import { outcomeOf, sideOf } from "./match-result";

/**
 * Who a player does well with, and against — measured in expected wins.
 *
 * Every game shared with a team-mate is set against the chance the ratings
 * gave their side before kick-off, so a pairing is judged on how far it beat
 * or fell short of the odds, not on how good the rest of the team happened
 * to be. Whether the gap means anything is the ledger's verdict: too few
 * games, the kind of gap luck makes, or more than luck usually manages.
 */

export interface ChemistryEntry {
  playerId: string;
  ledger: Ledger;
}

export interface ChemistryReport {
  /** The subject's own games over the same stretch. */
  own: Ledger;
  /** Best against the odds first. */
  withPlayers: ChemistryEntry[];
  /**
   * The subject's results with this player on the other side, best first —
   * a high figure here means the subject tends to get the better of them.
   */
  againstPlayers: ChemistryEntry[];
}

/**
 * Every pairing the subject has, in one pass.
 *
 * `matches` is the stretch being asked about; `odds` comes from the whole
 * history, since the chance a side was given depends on everything before.
 */
export function chemistryFor(
  matches: Match[],
  odds: Map<string, number>,
  playerId: string
): ChemistryReport {
  const own: Night[] = [];
  const withNights = new Map<string, Night[]>();
  const againstNights = new Map<string, Night[]>();

  const push = (map: Map<string, Night[]>, id: string, night: Night) => {
    const list = map.get(id);
    if (list) list.push(night);
    else map.set(id, [night]);
  };

  const ordered = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const match of ordered) {
    const outcome = outcomeOf(match);
    const chanceA = odds.get(match.id);
    if (!outcome || chanceA === undefined) continue;

    const side = sideOf(match, playerId);
    if (!side) continue;

    const result = outcome === "draw" ? "draw" : outcome === side ? "win" : "loss";
    const night: Night = {
      matchId: match.id,
      date: match.date,
      result,
      actual: result === "win" ? 1 : result === "draw" ? 0.5 : 0,
      expected: side === "a" ? chanceA : 1 - chanceA,
    };
    own.push(night);

    const mine = side === "a" ? match.teamA.players : match.teamB.players;
    const theirs = side === "a" ? match.teamB.players : match.teamA.players;
    for (const id of mine) if (id !== playerId) push(withNights, id, night);
    for (const id of theirs) push(againstNights, id, night);
  }

  const rank = (map: Map<string, Night[]>) =>
    [...map.entries()]
      .map(([id, nights]) => ({ playerId: id, ledger: ledger(nights) }))
      .sort((a, b) => b.ledger.above - a.ledger.above || b.ledger.played - a.ledger.played);

  return {
    own: ledger(own),
    withPlayers: rank(withNights),
    againstPlayers: rank(againstNights),
  };
}

/**
 * The best few, only where there are games enough to say anything.
 *
 * `worst` flips the order rather than sorting separately, so the two ends of
 * the same list can never disagree about what counts as enough.
 */
export const pick = (
  entries: ChemistryEntry[],
  { count = 4, worst = false } = {}
): ChemistryEntry[] => {
  const eligible = entries.filter((e) => e.ledger.verdict !== "early");
  return (worst ? [...eligible].reverse() : eligible).slice(0, count);
};
