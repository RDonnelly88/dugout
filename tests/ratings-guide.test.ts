import { describe, expect, it } from "vitest";
import { workedExample, fadeCurve, ratingBreakdown, threeWays } from "@/lib/ratings-guide";
import { computeRatings } from "@/lib/elo";
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

  /**
   * Team-mates finish a night on different numbers, and the guide has to
   * show why: the result is the same for all of them, the fading is not.
   */
  it("splits each player's night into the side's result and their own fading", () => {
    const earlier = match(["a"], ["x"], 1, 0, "2026-09-01");
    const fixture = match(["a", "b"], ["x", "y"], 2, 1, "2026-09-02");
    const example = workedExample([earlier, fixture], sides)!;

    expect(example.winner.settled).toBeCloseTo(ELO.k * (1 - example.expected), 9);
    expect(example.loser.settled).toBeCloseTo(-example.winner.settled, 9);
    for (const p of [...example.winner.players, ...example.loser.players]) {
      const side = example.winner.players.includes(p) ? example.winner : example.loser;
      expect(side.settled + p.faded).toBeCloseTo(p.change, 9);
    }
    const faded = new Map(example.winner.players.map((p) => [p.playerId, p.faded]));
    expect(faded.get("b")).toBeCloseTo(0, 9);
    expect(faded.get("a")).toBeLessThan(0);
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

describe("threeWays", () => {
  const night = threeWays();

  it("makes the higher-rated side the favourite", () => {
    expect(night.chance).toBeGreaterThan(0.5);
  });

  it("pays the underdog's win most and the favourite's least", () => {
    const [win, draw, loss] = night.outcomes.map((o) => o.change);
    expect(win).toBeGreaterThan(0);
    expect(draw).toBeLessThan(0);
    expect(loss).toBeLessThan(draw);
    // Between them the two results that can happen span the whole of K.
    expect(win - loss).toBeCloseTo(ELO.k, 9);
  });
});

describe("ratingBreakdown", () => {
  const fixtures = [
    match(["a", "b"], ["c", "d"], 1, 0, "2026-10-01"),
    match(["a", "c"], ["b", "d"], 1, 1, "2026-10-02"),
    match(["b", "c"], ["d", "e"], 2, 0, "2026-10-03"),
    match(["a", "e"], ["b", "c"], 0, 1, "2026-10-04"),
    match(["b", "d"], ["c", "e"], 3, 1, "2026-10-05"),
  ];

  it("adds up to the rating", () => {
    for (const rating of computeRatings(fixtures).values()) {
      const total = ratingBreakdown(rating).reduce<number>((sum, piece) => sum + piece.now, ELO.start);
      expect(total).toBeCloseTo(rating.rating, 9);
    }
  });

  it("lists their games newest first, aged by the squad's matches since", () => {
    const pieces = ratingBreakdown(computeRatings(fixtures).get("a")!);

    // a missed the last match, so their newest game is already one old.
    expect(pieces.map((p) => p.age)).toEqual([1, 3, 4]);
    expect(pieces[0].weight).toBeCloseTo(0.5 ** (1 / ELO.halfLife), 9);
  });

  it("leaves out a game too old to count", () => {
    const opener = match(["a"], ["b"], 1, 0, "2025-01-01");
    const later = Array.from({ length: ELO.window }, (_, i) =>
      match(["a"], [`o${i}`], 1, 0, new Date(Date.UTC(2025, 1, 1 + i)).toISOString().slice(0, 10))
    );
    const pieces = ratingBreakdown(computeRatings([opener, ...later]).get("a")!);

    expect(pieces).toHaveLength(ELO.window);
    expect(pieces.some((p) => p.matchId === opener.id)).toBe(false);
  });
});
