import { ledger, type Ledger, type Night } from "./expected-wins";
import { outcomeOf } from "./match-result";
import type { Match } from "@/types";

export interface WebLink {
  /** The pair, in a fixed order so a link has one identity. */
  a: string;
  b: string;
  /** The two of them on the same side, against the odds they were given. */
  ledger: Ledger;
}

export interface SquadWeb {
  /** Everybody who played in the stretch, with their own sheet. */
  players: { playerId: string; ledger: Ledger }[];
  /** Every pair who shared a side at least once. */
  links: WebLink[];
}

const key = (x: string, y: string) => (x < y ? `${x}|${y}` : `${y}|${x}`);

/**
 * The whole squad as a web: who has played beside whom, and how those games
 * went against the odds.
 *
 * One pass over the matches, filing every night under each player and each
 * pair on the same side, so a squad of twenty costs the same as a single
 * line-up. `odds` comes from the whole history; `among`, when given, limits
 * the web to those players — the active squad, usually.
 */
export function squadWeb(
  matches: Match[],
  odds: Map<string, number>,
  among?: Set<string>
): SquadWeb {
  const own = new Map<string, Night[]>();
  const pairs = new Map<string, Night[]>();
  const file = (map: Map<string, Night[]>, id: string, night: Night) => {
    const list = map.get(id);
    if (list) list.push(night);
    else map.set(id, [night]);
  };

  const ordered = [...matches].sort(
    (x, y) => new Date(x.date).getTime() - new Date(y.date).getTime()
  );

  for (const match of ordered) {
    const outcome = outcomeOf(match);
    const chanceA = odds.get(match.id);
    if (outcome === null || chanceA === undefined) continue;

    for (const side of ["a", "b"] as const) {
      const ids = (side === "a" ? match.teamA.players : match.teamB.players).filter(
        (id) => !among || among.has(id)
      );
      const result = outcome === "draw" ? "draw" : outcome === side ? "win" : "loss";
      const night: Night = {
        matchId: match.id,
        date: match.date,
        result,
        actual: result === "win" ? 1 : result === "draw" ? 0.5 : 0,
        expected: side === "a" ? chanceA : 1 - chanceA,
      };
      for (let i = 0; i < ids.length; i++) {
        file(own, ids[i], night);
        for (let j = i + 1; j < ids.length; j++) file(pairs, key(ids[i], ids[j]), night);
      }
    }
  }

  return {
    players: [...own.entries()]
      .map(([playerId, nights]) => ({ playerId, ledger: ledger(nights) }))
      .sort((x, y) => y.ledger.played - x.ledger.played || x.playerId.localeCompare(y.playerId)),
    links: [...pairs.entries()].map(([pair, nights]) => {
      const [a, b] = pair.split("|");
      return { a, b, ledger: ledger(nights) };
    }),
  };
}

/**
 * The order to seat the squad round the ring.
 *
 * Starting from whoever played most, each next seat goes to the player who
 * has shared the most games with whoever was seated last, so regular
 * team-mates sit side by side and the lines between them stay short instead
 * of every one crossing the middle. Ties fall to games played and then the
 * id, so the same squad is always drawn the same way.
 */
export function ringOrder(web: SquadWeb): string[] {
  const together = new Map(web.links.map((l) => [key(l.a, l.b), l.ledger.played]));
  const played = new Map(web.players.map((p) => [p.playerId, p.ledger.played]));
  const left = new Set(web.players.map((p) => p.playerId));
  const order: string[] = [];

  let current: string | undefined = web.players[0]?.playerId;
  while (current !== undefined) {
    order.push(current);
    left.delete(current);
    let next: string | undefined;
    let best = -1;
    for (const id of left) {
      const shared = together.get(key(current, id)) ?? 0;
      if (
        shared > best ||
        (shared === best &&
          ((played.get(id) ?? 0) > (played.get(next!) ?? 0) ||
            ((played.get(id) ?? 0) === (played.get(next!) ?? 0) && id < next!)))
      ) {
        best = shared;
        next = id;
      }
    }
    current = next;
  }

  return order;
}
