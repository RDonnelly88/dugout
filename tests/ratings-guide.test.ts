import { describe, expect, it } from "vitest";
import { workedExample, fadeCurve } from "@/lib/ratings-guide";
import { ELO } from "@/lib/config";
import type { Match } from "@/types";

let counter = 0;
function match(
  a: string[],
  b: string[],
  scoreA: number,
  scoreB: number,
  date?: string
): Match {
  // Numbered here rather than in the default date, so two matches given dates
  // of their own still get ids of their own.
  const n = ++counter;
  date ??= `2026-01-${String(n).padStart(2, "0")}`;
  return {
    id: `m${n}`,
    date,
    teamA: { name: "Bibs", players: a, score: scoreA },
    teamB: { name: "No bibs", players: b, score: scoreB },
    status: "completed",
    createdAt: date,
    updatedAt: date,
  };
}

const sides = { A: "Bibs", B: "No bibs" };

describe("workedExample", () => {
  it("has nothing to show a squad that has not played", () => {
    expect(workedExample([], sides)).toBeNull();
  });

  it("walks through the most recent result, not the first", () => {
    const older = match(["a"], ["x"], 1, 0, "2026-02-01");
    const latest = match(["b"], ["y"], 1, 0, "2026-03-01");

    const example = workedExample([older, latest], sides)!;

    expect(example.matchId).toBe(latest.id);
    expect(example.date).toBe("2026-03-01");
  });

  it("moves the winners up and the losers down", () => {
    const fixture = match(["a", "b", "c"], ["x", "y", "z"], 2, 1, "2026-04-01");
    const example = workedExample([fixture], sides)!;

    for (const p of example.winner.players) expect(p.change).toBeGreaterThan(0);
    for (const p of example.loser.players) expect(p.change).toBeLessThan(0);
  });

  it("says how many games each rating rested on going in", () => {
    const earlier = match(["a"], ["x"], 1, 0, "2026-04-02");
    const fixture = match(["a", "b"], ["x", "y"], 2, 1, "2026-04-03");
    const example = workedExample([earlier, fixture], sides)!;

    const counted = new Map(
      example.winner.players.map((p) => [p.playerId, p.counted])
    );
    expect(counted.get("a")).toBe(1);
    expect(counted.get("b")).toBe(0);
  });

  it("puts the side that won on the winning side of the story", () => {
    const bibsLost = match(["a", "b"], ["x", "y"], 0, 3, "2026-06-01");
    const example = workedExample([bibsLost], sides)!;

    expect(example.winner.name).toBe("No bibs");
    expect(example.loser.name).toBe("Bibs");
    expect(example.drawn).toBe(false);
  });

  it("reads a draw between equals as a draw that moves nobody", () => {
    const drawn = match(["a", "b"], ["x", "y"], 1, 1, "2026-07-01");
    const example = workedExample([drawn], sides)!;

    expect(example.drawn).toBe(true);
    for (const p of [...example.winner.players, ...example.loser.players]) {
      expect(p.change).toBeCloseTo(0, 6);
    }
  });

  it("starts two sides that have never played at even", () => {
    const fixture = match(["a", "b"], ["x", "y"], 1, 0, "2026-08-01");
    const example = workedExample([fixture], sides)!;

    expect(example.expected).toBeCloseTo(0.5, 6);
  });
});

describe("fadeCurve", () => {
  const curve = fadeCurve();

  it("has a point for every game that still counts, newest first", () => {
    expect(curve).toHaveLength(ELO.window);
    expect(curve[0]).toEqual({ age: 0, weight: 1 });
  });

  it("only ever falls", () => {
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].weight).toBeLessThan(curve[i - 1].weight);
    }
  });

  it("still counts the oldest game for something", () => {
    expect(curve.at(-1)!.weight).toBeGreaterThan(0);
  });
});
