import { describe, expect, it } from "vitest";
import { computeRatings } from "@/lib/elo";
import { ratingSeries } from "@/lib/rating-series";
import { ELO } from "@/lib/config";
import type { Match } from "@/types";

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
    teamA: { name: "A", players: a, score: scoreA },
    teamB: { name: "B", players: b, score: scoreB },
    status: "completed",
    createdAt: date,
    updatedAt: date,
  };
}

/** Matches the squad played without them. */
const withoutThem = (count: number, from = 2) =>
  Array.from({ length: count }, (_, i) =>
    match(["x"], ["y"], 1, 0, `2026-0${from}-${String(i + 1).padStart(2, "0")}`)
  );

describe("ratingSeries", () => {
  it("carries a result, which way it went, and what it was worth", () => {
    const ratings = computeRatings([match(["a"], ["b"], 3, 1, "2026-01-01")]);
    const [point] = ratingSeries(ratings.get("a")!);

    expect(point.played).toBe(true);
    expect(point.result).toBe("win");
    expect(point.change).toBeGreaterThan(0);
    expect(point.opponentRating).toBeCloseTo(ELO.start);
  });

  it("marks a defeat as one", () => {
    const ratings = computeRatings([match(["a"], ["b"], 0, 3, "2026-01-01")]);
    const [point] = ratingSeries(ratings.get("a")!);

    expect(point.result).toBe("loss");
    expect(point.change).toBeLessThan(0);
  });

  it("puts the weeks they missed on the same line as the ones they played", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      ...withoutThem(ELO.decay.graceMatches + 4),
    ]);
    const series = ratingSeries(ratings.get("a")!);

    expect(series[0].played).toBe(true);
    expect(series.slice(1).every((p) => !p.played)).toBe(true);
    expect(series).toHaveLength(1 + ELO.decay.graceMatches + 4);
  });

  /** Inside the grace nothing has happened, and the line should say so. */
  it("costs nothing for a week away inside the grace", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      ...withoutThem(1),
    ]);
    const series = ratingSeries(ratings.get("a")!);
    const away = series.at(-1)!;

    expect(away.played).toBe(false);
    expect(away.change).toBe(0);
  });

  it("works out what a week away cost once the grace has gone", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      ...withoutThem(ELO.decay.graceMatches + 3),
    ]);
    const series = ratingSeries(ratings.get("a")!);
    const away = series.at(-1)!;

    // Above the start and drifting back down towards it.
    expect(away.played).toBe(false);
    expect(away.change).toBeLessThan(0);
    // The steps add up to the distance travelled, so the line and the numbers
    // beside it cannot disagree.
    const first = series[0];
    const drifted = series.slice(1).reduce((sum, p) => sum + p.change, 0);
    expect(first.rating + drifted).toBeCloseTo(away.rating, 6);
  });

  it("reads in date order whichever half a point came from", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      ...withoutThem(3),
    ]);
    const dates = ratingSeries(ratings.get("a")!).map((p) => p.date);

    expect([...dates].sort((x, y) => x.localeCompare(y))).toEqual(dates);
  });

  it("has nothing to draw for somebody who has never played", () => {
    const ratings = computeRatings([match(["a"], ["b"], 1, 0, "2026-01-01")]);
    expect(ratings.get("nobody")).toBeUndefined();
  });
});
