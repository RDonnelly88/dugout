import { describe, expect, it } from "vitest";
import { workedExample, driftCurve } from "@/lib/ratings-guide";
import { ELO } from "@/lib/config";
import type { Match, Player } from "@/types";

let counter = 0;
function match(
  a: string[],
  b: string[],
  scoreA: number,
  scoreB: number,
  date = `2026-01-${String(++counter).padStart(2, "0")}`
): Match {
  return {
    id: `m${counter}`,
    date,
    teamA: { name: "Bibs", players: a, score: scoreA },
    teamB: { name: "No bibs", players: b, score: scoreB },
    status: "completed",
    createdAt: date,
    updatedAt: date,
  };
}

const player = (id: string): Player => ({
  id,
  name: id,
  image: null,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  skillLevel: undefined,
});

const squad = ["a", "b", "c", "x", "y", "z"].map(player);
const sides = { A: "Bibs", B: "No bibs" };

describe("workedExample", () => {
  it("has nothing to show a squad that has not played", () => {
    expect(workedExample([], squad, sides)).toBeNull();
  });

  it("walks through the most recent result, not the first", () => {
    const older = match(["a"], ["x"], 1, 0, "2026-02-01");
    const latest = match(["b"], ["y"], 1, 0, "2026-03-01");

    const example = workedExample([older, latest], squad, sides)!;

    expect(example.matchId).toBe(latest.id);
    expect(example.date).toBe("2026-03-01");
  });

  /**
   * The guide prints a pot above a list of shares. If the two disagree the
   * whole explanation is worthless, so the pot is read back out of the
   * changes rather than worked out a second time.
   */
  it("prints a pot the shares underneath actually add up to", () => {
    const fixture = match(["a", "b", "c"], ["x", "y", "z"], 2, 1, "2026-04-01");
    const example = workedExample([fixture], squad, sides)!;

    const shares = example.winner.players.reduce((s, p) => s + p.change, 0);
    expect(shares).toBeCloseTo(example.pot, 9);
  });

  it("says the losers dropped exactly what the winners took", () => {
    const fixture = match(["a", "b", "c"], ["x", "y", "z"], 2, 1, "2026-05-01");
    const example = workedExample([fixture], squad, sides)!;

    const lost = example.loser.players.reduce((s, p) => s + p.change, 0);
    expect(lost).toBeCloseTo(-example.pot, 9);
  });

  it("puts the side that won on the winning side of the story", () => {
    const bibsLost = match(["a", "b"], ["x", "y"], 0, 3, "2026-06-01");
    const example = workedExample([bibsLost], squad, sides)!;

    expect(example.winner.name).toBe("No bibs");
    expect(example.loser.name).toBe("Bibs");
    expect(example.pot).toBeGreaterThan(0);
    expect(example.drawn).toBe(false);
  });

  it("reads a draw between equals as a draw worth nothing", () => {
    const drawn = match(["a", "b"], ["x", "y"], 1, 1, "2026-07-01");
    const example = workedExample([drawn], squad, sides)!;

    expect(example.drawn).toBe(true);
    expect(example.pot).toBeCloseTo(0, 9);
  });

  it("gives the favourite less than an even chance of nothing", () => {
    const fixture = match(["a", "b"], ["x", "y"], 1, 0, "2026-08-01");
    const example = workedExample([fixture], squad, sides)!;

    // Two sides that have never played are level, so the tale starts at even.
    expect(example.expected).toBeCloseTo(0.5, 6);
    expect(example.headcount).toBe(2);
  });
});

describe("driftCurve", () => {
  const strong = ELO.start + 200;

  it("stays flat for as long as the grace lasts", () => {
    const curve = driftCurve(strong, ELO.decay.graceMatches);
    for (const point of curve) expect(point.rating).toBe(strong);
  });

  it("falls away once the grace is used up", () => {
    const curve = driftCurve(strong, ELO.decay.graceMatches + 5);
    const last = curve.at(-1)!;

    expect(last.rating).toBeLessThan(strong);
    expect(last.rating).toBeGreaterThan(ELO.start);
  });

  it("never drags anybody past the starting mark", () => {
    expect(driftCurve(strong, 500).at(-1)!.rating).toBeGreaterThanOrEqual(
      ELO.start
    );
    expect(driftCurve(ELO.start - 200, 500).at(-1)!.rating).toBeLessThanOrEqual(
      ELO.start
    );
  });

  it("carries one point per match missed, counting from none", () => {
    const curve = driftCurve(strong, 6);
    expect(curve).toHaveLength(7);
    expect(curve[0]).toEqual({ missed: 0, rating: strong });
  });
});
