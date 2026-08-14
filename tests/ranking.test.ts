import { describe, expect, it } from "vitest";
import { calculatePlayerRanks, sortPlayersByRank } from "@/lib/ranking-utils";
import type { SeasonPlayerStats } from "@/types";

/** A stats row with everything but the fields under test filled in. */
function player(
  playerId: string,
  stats: Partial<Pick<SeasonPlayerStats, "points" | "played" | "wins">>
): SeasonPlayerStats {
  return {
    seasonId: "s1",
    seasonName: "Season 1",
    playerId,
    playerName: playerId,
    playerImage: null,
    wins: stats.wins ?? 0,
    losses: 0,
    draws: 0,
    played: stats.played ?? 0,
    points: stats.points ?? 0,
  };
}

describe("calculatePlayerRanks", () => {
  it("orders by points, highest first", () => {
    const ranks = calculatePlayerRanks([
      player("a", { points: 3, played: 3 }),
      player("c", { points: 9, played: 3 }),
      player("b", { points: 6, played: 3 }),
    ]);

    expect(ranks).toEqual({ c: 1, b: 2, a: 3 });
  });

  it("breaks a points tie on games played, more first", () => {
    const ranks = calculatePlayerRanks([
      player("fewer", { points: 6, played: 2 }),
      player("more", { points: 6, played: 5 }),
    ]);

    expect(ranks.more).toBe(1);
    expect(ranks.fewer).toBe(2);
  });

  it("breaks a points and played tie on wins", () => {
    const ranks = calculatePlayerRanks([
      player("draws", { points: 6, played: 6, wins: 1 }),
      player("wins", { points: 6, played: 6, wins: 2 }),
    ]);

    expect(ranks.wins).toBe(1);
    expect(ranks.draws).toBe(2);
  });

  it("gives identical records the same rank and skips the one below", () => {
    const ranks = calculatePlayerRanks([
      player("a", { points: 9, played: 3, wins: 3 }),
      player("b", { points: 6, played: 3, wins: 2 }),
      player("c", { points: 6, played: 3, wins: 2 }),
      player("d", { points: 3, played: 3, wins: 1 }),
    ]);

    // Joint second, then fourth — nobody is ranked third.
    expect(ranks).toEqual({ a: 1, b: 2, c: 2, d: 4 });
  });

  it("leaves out anyone who has not played", () => {
    const ranks = calculatePlayerRanks([
      player("played", { points: 3, played: 1 }),
      player("absent", { points: 0, played: 0 }),
    ]);

    expect(ranks).toEqual({ played: 1 });
  });

  it("returns nothing for an empty table", () => {
    expect(calculatePlayerRanks([])).toEqual({});
  });
});

describe("sortPlayersByRank", () => {
  it("does not mutate its argument", () => {
    const input = [
      player("a", { points: 3, played: 1 }),
      player("b", { points: 9, played: 1 }),
    ];

    sortPlayersByRank(input);

    expect(input.map((p) => p.playerId)).toEqual(["a", "b"]);
  });

  it("drops players with no games and orders the rest", () => {
    const sorted = sortPlayersByRank([
      player("absent", { points: 0, played: 0 }),
      player("low", { points: 3, played: 2 }),
      player("high", { points: 9, played: 3 }),
    ]);

    expect(sorted.map((p) => p.playerId)).toEqual(["high", "low"]);
  });
});
