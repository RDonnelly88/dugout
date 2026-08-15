import { describe, expect, it } from "vitest";
import { headToHead, rate } from "@/lib/head-to-head";
import type { Match } from "@/types";

let n = 0;
function match(a: string[], b: string[], scoreA: number, scoreB: number): Match {
  n++;
  const date = `2026-01-${String(n).padStart(2, "0")}`;
  return {
    id: `m${n}`,
    date,
    teamA: { name: "A", players: a, score: scoreA },
    teamB: { name: "B", players: b, score: scoreB },
    status: "completed",
    createdAt: date,
    updatedAt: date,
  };
}

describe("headToHead", () => {
  it("counts a win as teammates for both of them", () => {
    const { together, against } = headToHead(
      [match(["a", "b"], ["c"], 3, 1)],
      "a",
      "b"
    );

    expect(together).toEqual({ played: 1, wins: 1, draws: 0, losses: 0 });
    expect(against.played).toBe(0);
  });

  it("counts opponents from the first player's side", () => {
    const { against } = headToHead([match(["a"], ["b"], 4, 2)], "a", "b");

    expect(against).toEqual({ played: 1, wins: 1, draws: 0, losses: 0 });
  });

  it("flips when the pair is asked the other way round", () => {
    const fixtures = [match(["a"], ["b"], 4, 2)];

    expect(headToHead(fixtures, "a", "b").against.wins).toBe(1);
    expect(headToHead(fixtures, "b", "a").against.wins).toBe(0);
    expect(headToHead(fixtures, "b", "a").against.losses).toBe(1);
  });

  it("counts a draw for neither", () => {
    const { together } = headToHead([match(["a", "b"], ["c"], 2, 2)], "a", "b");

    expect(together).toEqual({ played: 1, wins: 0, draws: 1, losses: 0 });
  });

  it("ignores a match only one of them played", () => {
    const { together, against } = headToHead(
      [match(["a"], ["c"], 3, 0), match(["b"], ["c"], 3, 0)],
      "a",
      "b"
    );

    expect(together.played).toBe(0);
    expect(against.played).toBe(0);
  });

  it("ignores a match neither played", () => {
    expect(headToHead([match(["x"], ["y"], 1, 0)], "a", "b").together.played).toBe(0);
  });

  it("keeps the two tallies apart across a mixed history", () => {
    const { together, against } = headToHead(
      [
        match(["a", "b"], ["c", "d"], 3, 1), // together, won
        match(["a", "b"], ["c", "d"], 0, 2), // together, lost
        match(["a", "c"], ["b", "d"], 5, 4), // opposed, a won
        match(["a", "c"], ["b", "d"], 1, 3), // opposed, a lost
        match(["a", "c"], ["b", "d"], 2, 2), // opposed, drew
      ],
      "a",
      "b"
    );

    expect(together).toEqual({ played: 2, wins: 1, draws: 0, losses: 1 });
    expect(against).toEqual({ played: 3, wins: 1, draws: 1, losses: 1 });
  });

  it("skips fixtures that have not been played", () => {
    const pending: Match = { ...match(["a", "b"], ["c"], 0, 0), status: "pending" };

    expect(headToHead([pending], "a", "b").together.played).toBe(0);
  });
});

describe("rate", () => {
  it("is nought when nothing has been played", () => {
    expect(rate({ played: 0, wins: 0, draws: 0, losses: 0 })).toBe(0);
  });

  it("is the share of games won", () => {
    expect(rate({ played: 4, wins: 3, draws: 0, losses: 1 })).toBe(0.75);
  });
});
