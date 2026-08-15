import { describe, expect, it } from "vitest";
import { chemistryFor, pick, share, SHRINKAGE } from "@/lib/chemistry";
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

const find = <T extends { playerId: string }>(entries: T[], id: string): T =>
  entries.find((e) => e.playerId === id)!;

describe("share", () => {
  it("counts a draw as half a win", () => {
    expect(share({ played: 2, wins: 1, draws: 0, losses: 1 })).toBe(0.5);
    expect(share({ played: 2, wins: 0, draws: 2, losses: 0 })).toBe(0.5);
  });

  it("is nought for nobody, not a divide by zero", () => {
    expect(share({ played: 0, wins: 0, draws: 0, losses: 0 })).toBe(0);
  });
});

describe("chemistryFor", () => {
  it("splits teammates from opponents", () => {
    const report = chemistryFor([match(["a", "b"], ["c"], 3, 1)], "a");

    expect(report.withPlayers.map((e) => e.playerId)).toEqual(["b"]);
    expect(report.againstPlayers.map((e) => e.playerId)).toEqual(["c"]);
  });

  it("counts the same pair on both sides of the pitch", () => {
    const report = chemistryFor(
      [match(["a", "b"], ["c"], 3, 1), match(["a"], ["b"], 1, 2)],
      "a"
    );

    expect(find(report.withPlayers, "b").tally.played).toBe(1);
    expect(find(report.againstPlayers, "b").tally).toEqual({
      played: 1,
      wins: 0,
      draws: 0,
      losses: 1,
    });
  });

  it("ignores matches that never finished", () => {
    const unplayed: Match = { ...match(["a", "b"], ["c"], 0, 0), status: "pending" };
    expect(chemistryFor([unplayed], "a").played).toBe(0);
  });

  /**
   * The whole point. One game together used to read as a hundred per cent and
   * be presented as the player's best partnership.
   */
  it("barely moves off the baseline for a single game together", () => {
    const report = chemistryFor(
      [
        match(["a", "b"], ["c"], 3, 1), // a and b together, won
        match(["a"], ["c"], 0, 1),
        match(["a"], ["c"], 0, 1), // a wins 1 of 3 overall
      ],
      "a"
    );

    const b = find(report.withPlayers, "b");
    expect(b.observed).toBe(1);
    expect(report.baseline).toBeCloseTo(1 / 3);
    // One game of evidence against four of prior: a fifth of the way up.
    expect(b.confidence).toBeCloseTo(1 / (1 + SHRINKAGE));
    expect(b.adjusted).toBeCloseTo(1 / 3 + (1 - 1 / 3) * 0.2);
    expect(b.adjusted).toBeLessThan(0.5);
  });

  it("lets a well-evidenced partnership move most of the way", () => {
    const together = Array.from({ length: 12 }, () => match(["a", "b"], ["c"], 3, 1));
    const alone = Array.from({ length: 12 }, () => match(["a"], ["c"], 0, 1));
    const b = find(chemistryFor([...together, ...alone], "a").withPlayers, "b");

    expect(b.confidence).toBeCloseTo(12 / 16);
    expect(b.adjusted).toBeGreaterThan(0.8);
  });

  it("orders teammates by lift, best first", () => {
    const report = chemistryFor(
      [
        match(["a", "good"], ["x"], 3, 0),
        match(["a", "good"], ["x"], 3, 0),
        match(["a", "bad"], ["x"], 0, 3),
        match(["a", "bad"], ["x"], 0, 3),
      ],
      "a"
    );

    expect(report.withPlayers.map((e) => e.playerId)).toEqual(["good", "bad"]);
    expect(find(report.withPlayers, "good").lift).toBeGreaterThan(0);
    expect(find(report.withPlayers, "bad").lift).toBeLessThan(0);
  });
});

describe("pick", () => {
  const entries = [
    { playerId: "plenty", tally: { played: 6, wins: 6, draws: 0, losses: 0 } },
    { playerId: "some", tally: { played: 3, wins: 1, draws: 0, losses: 2 } },
    { playerId: "barely", tally: { played: 1, wins: 1, draws: 0, losses: 0 } },
  ] as Parameters<typeof pick>[0];

  it("drops anyone without enough games", () => {
    expect(pick(entries).map((e) => e.playerId)).toEqual(["plenty", "some"]);
  });

  it("takes the other end of the same eligible list", () => {
    expect(pick(entries, { worst: true }).map((e) => e.playerId)).toEqual([
      "some",
      "plenty",
    ]);
  });
});
