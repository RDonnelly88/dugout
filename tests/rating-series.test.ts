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
  date?: string
): Match {
  // The number is taken here rather than in the default date, so a caller
  // passing a date of their own still gets an id of their own. Sharing one
  // made four matches indistinguishable to anything that looks a result up
  // by id.
  const n = ++counter;
  const on = date ?? `2026-01-${String(n).padStart(2, "0")}`;
  return {
    id: `m${n}`,
    date: on,
    teamA: { name: "A", players: a, score: scoreA },
    teamB: { name: "B", players: b, score: scoreB },
    status: "completed",
    createdAt: on,
    updatedAt: on,
  };
}

/** Matches the squad played without them, between people they never met. */
const withoutThem = (count: number, from = 2) =>
  Array.from({ length: count }, (_, i) =>
    match([`x${from}${i}`], [`y${from}${i}`], 1, 0, `2026-0${from}-${String(i + 1).padStart(2, "0")}`)
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
      ...withoutThem(6),
    ]);
    const series = ratingSeries(ratings.get("a")!);

    expect(series[0].played).toBe(true);
    expect(series.slice(1).every((p) => !p.played)).toBe(true);
    expect(series).toHaveLength(1 + 6);
  });

  it("eases down through weeks away as their games age", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      ...withoutThem(8),
    ]);
    const series = ratingSeries(ratings.get("a")!);

    for (const away of series.slice(1)) {
      expect(away.played).toBe(false);
      expect(away.change).toBeLessThan(0);
    }
  });

  it("works out a week away's step from the point before it", () => {
    // Their old opponent plays on and loses, so the win over him is worth a
    // little less in hindsight.
    const ratings = computeRatings([
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      match(["z"], ["b"], 1, 0, "2026-01-02"),
    ]);
    const series = ratingSeries(ratings.get("a")!);
    const away = series.at(-1)!;

    expect(away.played).toBe(false);
    expect(away.change).toBeLessThan(0);
    // The steps add up to the distance travelled, so the line and the numbers
    // beside it cannot disagree.
    expect(series[0].rating + away.change).toBeCloseTo(away.rating, 6);
  });

  it("reads in date order whichever half a point came from", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      ...withoutThem(3),
    ]);
    const dates = ratingSeries(ratings.get("a")!).map((p) => p.date);

    expect([...dates].sort((x, y) => x.localeCompare(y))).toEqual(dates);
  });

  it("shows the weeks missed in the middle, not only the ones since", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      ...withoutThem(6, 2),
      match(["a"], ["b"], 1, 0, "2026-03-01"),
    ]);
    const series = ratingSeries(ratings.get("a")!);

    const away = series.filter((p) => !p.played);
    expect(away).toHaveLength(6);
    // Every one of them sits between the two games, not after the last.
    for (const point of away) {
      expect(point.date > "2026-01-01" && point.date < "2026-03-01").toBe(true);
    }
  });

  it("keeps the middle weeks and the trailing ones both", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      ...withoutThem(4, 2),
      match(["a"], ["b"], 1, 0, "2026-03-01"),
      ...withoutThem(3, 4),
    ]);
    const away = ratingSeries(ratings.get("a")!).filter((p) => !p.played);

    expect(away).toHaveLength(7);
  });

  it("has nothing to draw for somebody who has never played", () => {
    const ratings = computeRatings([match(["a"], ["b"], 1, 0, "2026-01-01")]);
    expect(ratings.get("nobody")).toBeUndefined();
  });
});
