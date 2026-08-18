import { describe, expect, it } from "vitest";
import { outcomeOf, resolveOutcome, sideOf } from "@/lib/match-result";
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

describe("resolveOutcome", () => {
  it("takes the word of whoever is recording it when there is no score", () => {
    expect(resolveOutcome(undefined, undefined, "a")).toBe("a");
    expect(resolveOutcome(undefined, undefined, "draw")).toBe("draw");
    expect(resolveOutcome(undefined, undefined, null)).toBeNull();
  });

  it("lets a complete score decide, so the two cannot disagree", () => {
    expect(resolveOutcome(6, 4, "b")).toBe("a");
    expect(resolveOutcome(1, 3, "a")).toBe("b");
    expect(resolveOutcome(2, 2, "a")).toBe("draw");
  });

  /** Half a score is no score: "4 – " says nothing about who won. */
  it("ignores a score with one half missing", () => {
    expect(resolveOutcome(4, undefined, "a")).toBe("a");
    expect(resolveOutcome(undefined, 4, "b")).toBe("b");
  });

  /**
   * Nil-nil is a real draw when somebody wrote it down, which is precisely why
   * a fixture must not be created carrying one: an invented nil-nil outranked
   * the result being clicked, and the buttons appeared not to work at all.
   */
  it("reads nought as a score, because it is one", () => {
    expect(resolveOutcome(0, 0, "a")).toBe("draw");
    expect(resolveOutcome(1, 0, "b")).toBe("a");
  });
});
