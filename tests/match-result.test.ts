import { describe, expect, it } from "vitest";
import { outcomeOf, sideOf } from "@/lib/match-result";
import type { Match } from "@/types";

const base: Match = {
  id: "m1",
  date: "2026-01-01",
  teamA: { name: "Bibs", players: ["a"] },
  teamB: { name: "No bibs", players: ["b"] },
  status: "completed",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

describe("outcomeOf", () => {
  it("takes the stored outcome when there is one", () => {
    expect(outcomeOf({ ...base, outcome: "b" })).toBe("b");
  });

  /** Most of the history predates the column and carries only a score. */
  it("falls back to comparing the scores", () => {
    expect(
      outcomeOf({
        ...base,
        teamA: { ...base.teamA, score: 5 },
        teamB: { ...base.teamB, score: 2 },
      })
    ).toBe("a");
    expect(
      outcomeOf({
        ...base,
        teamA: { ...base.teamA, score: 2 },
        teamB: { ...base.teamB, score: 2 },
      })
    ).toBe("draw");
  });

  it("is a result with no score at all", () => {
    expect(outcomeOf({ ...base, outcome: "draw" })).toBe("draw");
  });

  it("is nothing for a match with neither an outcome nor a score", () => {
    expect(outcomeOf(base)).toBeNull();
  });

  it("is nothing for a fixture, whatever it carries", () => {
    expect(outcomeOf({ ...base, status: "pending", outcome: "a" })).toBeNull();
  });
});

describe("sideOf", () => {
  it("finds which side somebody was on", () => {
    expect(sideOf(base, "a")).toBe("a");
    expect(sideOf(base, "b")).toBe("b");
  });

  it("is nothing for somebody who did not feature", () => {
    expect(sideOf(base, "nobody")).toBeNull();
  });
});
