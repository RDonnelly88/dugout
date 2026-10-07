import { describe, expect, it } from "vitest";
import { computeRatings } from "@/lib/elo";
import { ELO } from "@/lib/config";
import { matchStakes } from "@/lib/stakes";
import type { Match } from "@/types";

let counter = 0;
function match(a: string[], b: string[], scoreA: number, scoreB: number): Match {
  const n = ++counter;
  const on = `2026-03-${String(n).padStart(2, "0")}`;
  return {
    id: `s${n}`,
    date: on,
    teamA: { name: "A", players: a, score: scoreA },
    teamB: { name: "B", players: b, score: scoreB },
    status: "completed",
    createdAt: on,
    updatedAt: on,
  };
}

// A few nights with some players in and out, so ratings, fading and a
// player who has missed games all come into it.
const history = [
  match(["ann", "bob"], ["cat", "dan"], 5, 3),
  match(["ann", "cat"], ["bob", "eve"], 2, 2),
  match(["bob", "dan"], ["ann", "eve"], 4, 1),
  match(["ann", "eve"], ["cat", "bob"], 6, 2),
];

describe("matchStakes", () => {
  it("says exactly what the ratings will do once the result is in", () => {
    const teamA = ["ann", "dan", "zed"];
    const teamB = ["bob", "cat", "eve"];
    const stakes = matchStakes(computeRatings(history), teamA, teamB)!;

    for (const [result, score] of [
      ["win", [3, 1]],
      ["draw", [2, 2]],
      ["loss", [0, 4]],
    ] as const) {
      const after = computeRatings([...history, match(teamA, teamB, score[0], score[1])]);
      for (const stake of stakes.players) {
        // The first side's result is the second side's opposite.
        const theirs = stake.side === "a" ? result : result === "win" ? "loss" : result === "loss" ? "win" : "draw";
        expect(after.get(stake.playerId)!.rating - stake.rating).toBeCloseTo(stake.change[theirs], 9);
      }
    }
  });

  it("starts a newcomer on the start and gives them nothing to fade", () => {
    const stakes = matchStakes(computeRatings(history), ["zed"], ["ann"])!;
    const zed = stakes.players.find((p) => p.playerId === "zed")!;
    expect(zed.rating).toBe(ELO.start);
    expect(zed.change.win - zed.change.loss).toBeCloseTo(ELO.k, 9);
  });

  it("gives an underdog more to win than to lose", () => {
    const ratings = computeRatings(history);
    expect(ratings.get("ann")!.rating).toBeGreaterThan(ELO.start);
    // A newcomer has nothing to fade, so what is left is the result alone.
    const zed = matchStakes(ratings, ["zed"], ["ann"])!.players[0];
    expect(zed.change.win).toBeGreaterThan(ELO.k / 2);
    expect(-zed.change.loss).toBeLessThan(ELO.k / 2);
  });

  it("waits for somebody on both sides", () => {
    expect(matchStakes(computeRatings(history), ["ann"], [])).toBeNull();
  });
});
