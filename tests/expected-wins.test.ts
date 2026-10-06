import { describe, expect, it } from "vitest";
import {
  ledger,
  matchExpectations,
  nightsFor,
  playerLedgers,
  signedWins,
  type Night,
} from "@/lib/expected-wins";
import { XW } from "@/lib/config";
import type { Match } from "@/types";

let counter = 0;
function match(a: string[], b: string[], outcome: "a" | "b" | "draw", date?: string): Match {
  const n = ++counter;
  const on = date ?? new Date(Date.UTC(2026, 0, n)).toISOString().slice(0, 10);
  return {
    id: `m${n}`,
    date: on,
    teamA: { name: "A", players: a },
    teamB: { name: "B", players: b },
    status: "completed",
    outcome,
    createdAt: on,
    updatedAt: on,
  };
}

const night = (actual: number, expected: number): Night => ({
  matchId: `n${++counter}`,
  date: "2026-01-01",
  result: actual === 1 ? "win" : actual === 0.5 ? "draw" : "loss",
  actual,
  expected,
});

describe("matchExpectations", () => {
  it("gives two sides who have never played an even chance", () => {
    const first = match(["a"], ["b"], "a");
    expect(matchExpectations([first]).get(first.id)).toBeCloseTo(0.5);
  });

  it("fancies the side whose players have been winning", () => {
    const warmUps = Array.from({ length: 6 }, () => match(["strong"], ["x"], "a"));
    const decider = match(["y"], ["strong"], "b");
    const odds = matchExpectations([...warmUps, decider]);

    // Odds for the first side, so the favourite on the second side shows as
    // a chance below even.
    expect(odds.get(decider.id)).toBeLessThan(0.5);
  });

  it("reads the odds from before the night, not after it", () => {
    const only = match(["a"], ["b"], "a");
    // Had the result leaked in, the winner would be the favourite.
    expect(matchExpectations([only]).get(only.id)).toBeCloseTo(0.5);
  });
});

describe("nightsFor", () => {
  it("finds the nights everybody named shared a side, from their side", () => {
    const together = match(["a", "b", "c"], ["x", "y"], "b");
    const apart = match(["a", "x"], ["b", "c"], "a");
    const odds = matchExpectations([together, apart]);

    const nights = nightsFor([together, apart], odds, { together: ["a", "b", "c"] });

    expect(nights.map((n) => n.matchId)).toEqual([together.id]);
    expect(nights[0].result).toBe("loss");
  });

  it("counts a group that played on the second side from that side", () => {
    const m = match(["x", "y"], ["a", "b"], "b");
    const nights = nightsFor([m], matchExpectations([m]), { together: ["a", "b"] });
    expect(nights[0].result).toBe("win");
    expect(nights[0].actual).toBe(1);
  });

  it("leaves out the nights somebody excluded was on the side", () => {
    const withC = match(["a", "b", "c"], ["x"], "a");
    const withoutC = match(["a", "b"], ["c", "x"], "a");
    const cAway = match(["a", "b"], ["x"], "b");
    const all = [withC, withoutC, cAway];

    const nights = nightsFor(all, matchExpectations(all), {
      together: ["a", "b"],
      without: ["c"],
    });

    expect(nights.map((n) => n.matchId)).toEqual([withoutC.id, cAway.id]);
  });

  it("can ask about two players on opposite sides", () => {
    const facing = match(["a"], ["b"], "b");
    const sameSide = match(["a", "b"], ["x"], "a");
    const all = [facing, sameSide];

    const nights = nightsFor(all, matchExpectations(all), {
      together: ["a"],
      against: ["b"],
    });

    expect(nights.map((n) => n.matchId)).toEqual([facing.id]);
    expect(nights[0].result).toBe("loss");
  });

  it("ignores anything that has not been played", () => {
    const fixture: Match = { ...match(["a", "b"], ["x"], "a"), status: "scheduled" };
    expect(nightsFor([fixture], matchExpectations([fixture]), { together: ["a"] })).toEqual([]);
  });
});

describe("ledger", () => {
  it("measures results against the chances they were given", () => {
    const sheet = ledger([night(1, 0.4), night(0.5, 0.5), night(0, 0.7)]);

    expect(sheet.played).toBe(3);
    expect([sheet.wins, sheet.draws, sheet.losses]).toEqual([1, 1, 1]);
    expect(sheet.actual).toBeCloseTo(1.5);
    expect(sheet.expected).toBeCloseTo(1.6);
    expect(sheet.above).toBeCloseTo(-0.1);
  });

  it("calls it too early under the minimum, however lopsided", () => {
    const sheet = ledger(Array.from({ length: XW.minGames - 1 }, () => night(1, 0.1)));
    expect(sheet.verdict).toBe("early");
  });

  it("puts a run near the odds down to luck", () => {
    const sheet = ledger(
      Array.from({ length: 10 }, (_, i) => night(i % 2 === 0 ? 1 : 0, 0.5))
    );
    expect(sheet.verdict).toBe("luck");
  });

  it("calls a long run far above the odds more than luck", () => {
    const sheet = ledger(Array.from({ length: 12 }, () => night(1, 0.5)));
    expect(sheet.above).toBeGreaterThan(sheet.luck);
    expect(sheet.verdict).toBe("above");
  });

  it("calls a long run far below the odds more than luck too", () => {
    const sheet = ledger(Array.from({ length: 12 }, () => night(0, 0.55)));
    expect(sheet.verdict).toBe("below");
  });

  /** Foregone conclusions leave little room for luck; coin flips leave a lot. */
  it("draws a narrower band of luck round games nobody doubted", () => {
    const coinFlips = ledger(Array.from({ length: 10 }, () => night(1, 0.5)));
    const certainties = ledger(Array.from({ length: 10 }, () => night(1, 0.95)));
    expect(certainties.luck).toBeLessThan(coinFlips.luck);
  });

  it("has nothing to say about no games at all", () => {
    const sheet = ledger([]);
    expect(sheet.played).toBe(0);
    expect(sheet.above).toBe(0);
    expect(sheet.verdict).toBe("early");
  });
});

describe("playerLedgers", () => {
  it("gives everybody who played their own sheet", () => {
    const all = [match(["a", "b"], ["c"], "a"), match(["a"], ["c"], "b")];
    const sheets = playerLedgers(all, matchExpectations(all));

    expect(sheets.get("a")!.played).toBe(2);
    expect(sheets.get("b")!.played).toBe(1);
    expect(sheets.get("c")!.wins).toBe(1);
  });

  /** Every game has a winner's surplus and a loser's shortfall that cancel. */
  it("balances across a match: one side's surplus is the other's shortfall", () => {
    const only = match(["a"], ["b"], "a");
    const sheets = playerLedgers([only], matchExpectations([only]));
    expect(sheets.get("a")!.above + sheets.get("b")!.above).toBeCloseTo(0);
  });
});

describe("signedWins", () => {
  it("writes a figure the way the page shows it", () => {
    expect(signedWins(2.44)).toBe("+2.4");
    expect(signedWins(-0.66)).toBe("−0.7");
    expect(signedWins(0.04)).toBe("0.0");
  });
});
