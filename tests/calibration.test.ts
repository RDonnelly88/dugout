import { describe, expect, it } from "vitest";
import { calibration } from "@/lib/calibration";
import type { Match } from "@/types";

let counter = 0;
function match(outcome: "a" | "b" | "draw"): Match {
  const n = ++counter;
  const on = new Date(Date.UTC(2026, 0, n)).toISOString().slice(0, 10);
  return {
    id: `c${n}`,
    date: on,
    teamA: { name: "A", players: ["a"] },
    teamB: { name: "B", players: ["b"] },
    status: "completed",
    outcome,
    createdAt: on,
    updatedAt: on,
  };
}

describe("calibration", () => {
  it("reads every match from the favourite's side, whichever side that was", () => {
    const home = match("a");
    const away = match("a");
    const odds = new Map([
      [home.id, 0.7],
      // The second side favoured at 70%, and beaten.
      [away.id, 0.3],
    ]);
    const { all, bands } = calibration([home, away], odds);
    expect(all.played).toBe(2);
    expect(all.expected).toBeCloseTo(1.4);
    expect(all.wins).toBe(1);
    expect(all.losses).toBe(1);
    expect(bands).toHaveLength(1);
    expect(bands[0]).toMatchObject({ from: 0.7, to: 0.7 });
  });

  it("splits the games into thirds by how clear the favourite was", () => {
    const chances = [0.5, 0.52, 0.51, 0.6, 0.55, 0.58, 0.53, 0.5, 0.54, 0.57, 0.56, 0.59, 0.51, 0.52, 0.61];
    const games = chances.map((_, i) => match(i % 3 === 0 ? "draw" : "a"));
    const odds = new Map(games.map((game, i) => [game.id, chances[i]]));
    const { all, bands } = calibration(games, odds);
    expect(bands).toHaveLength(3);
    expect(bands.map((band) => band.ledger.played)).toEqual([5, 5, 5]);
    expect(bands.map((band) => [band.from, band.to])).toEqual([
      [0.5, 0.52],
      [0.52, 0.56],
      [0.57, 0.61],
    ]);
    // Each band's games are its ledger's, oldest first, and between them
    // they are every game.
    expect(bands.reduce((n, band) => n + band.ledger.actual, 0)).toBeCloseTo(all.actual);
    for (const band of bands) {
      const dates = band.ledger.nights.map((night) => night.date);
      expect(dates).toEqual([...dates].sort());
    }
  });

  it("uses fewer bands when there are too few games for three", () => {
    const games = Array.from({ length: 7 }, () => match("a"));
    const { bands } = calibration(games, new Map(games.map((game) => [game.id, 0.55])));
    expect(bands).toHaveLength(1);
    expect(bands[0].ledger.played).toBe(7);
  });

  it("leaves out a match with no result or no odds", () => {
    const fixture = { ...match("a"), outcome: undefined, status: "scheduled" as const };
    const unknown = match("a");
    const { all } = calibration([fixture, unknown], new Map([[fixture.id, 0.6]]));
    expect(all.played).toBe(0);
  });
});
