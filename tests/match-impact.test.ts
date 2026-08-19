import { describe, expect, it } from "vitest";
import { matchImpact } from "@/lib/match-impact";
import { SKILL } from "@/lib/config";
import type { Match, Player } from "@/types";

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
    teamA: { name: "Bibs", players: a, score: scoreA },
    teamB: { name: "No bibs", players: b, score: scoreB },
    status: "completed",
    createdAt: on,
    updatedAt: on,
  };
}

const player = (id: string, skillLevel?: number): Player => ({
  id,
  name: id,
  image: null,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  skillLevel,
});

const squad = [player("a", 5), player("b", 3), player("c", 1), player("d", 3)];

describe("matchImpact", () => {
  it("reports what the winners gained and the losers lost", () => {
    const fixture = match(["a", "b"], ["c", "d"], 3, 1, "2026-01-01");
    const impact = matchImpact([fixture], fixture, squad)!;

    expect(impact.A.ratingAfter).toBeGreaterThan(impact.A.ratingBefore);
    expect(impact.B.ratingAfter).toBeLessThan(impact.B.ratingBefore);

    // Nothing is created or destroyed: one side's gain is the other's loss.
    const gained = impact.A.ratingAfter - impact.A.ratingBefore;
    const lost = impact.B.ratingBefore - impact.B.ratingAfter;
    expect(gained).toBeCloseTo(lost);
  });

  it("gives every player who featured a before and an after", () => {
    const fixture = match(["a", "b"], ["c", "d"], 3, 1, "2026-01-02");
    const impact = matchImpact([fixture], fixture, squad)!;

    expect(impact.A.players.map((p) => p.playerId).sort()).toEqual(["a", "b"]);
    for (const entry of impact.A.players) {
      expect(entry.after - entry.before).toBeCloseTo(entry.change);
    }
  });

  it("averages the hand-set levels, which a result never moves", () => {
    const fixture = match(["a", "b"], ["c", "d"], 3, 1, "2026-01-03");
    const impact = matchImpact([fixture], fixture, squad)!;

    expect(impact.A.skill).toBe(4); // a is 5, b is 3
    expect(impact.B.skill).toBe(2); // c is 1, d is 3
  });

  it("falls back to the middle level for anyone who has none set", () => {
    const fixture = match(["x"], ["y"], 2, 0, "2026-01-04");
    const impact = matchImpact([fixture], fixture, [player("x"), player("y")])!;

    expect(impact.A.skill).toBe(SKILL.default);
  });

  /** Form is a window over recent results, so it only means anything in order. */
  it("moves form for the side that won and not for the side that did not play", () => {
    const earlier = match(["a"], ["c"], 1, 0, "2026-01-05");
    const target = match(["a"], ["c"], 5, 0, "2026-01-06");
    const impact = matchImpact([earlier, target], target, squad)!;

    expect(impact.A.formAfter).toBeGreaterThanOrEqual(impact.A.formBefore);
    expect(impact.B.formAfter).toBeLessThanOrEqual(impact.B.formBefore);
  });

  /**
   * The strip beside each name on a match page is the run that decided their
   * share, so it has to carry the nights they were not there. Closing the
   * gaps up drew an unbroken run of wins beside a player who had turned out
   * once in a month, and made the number next to it look arbitrary.
   */
  it("carries the nights a player missed into the strip beside them", () => {
    const fixtures = [
      match(["a", "c"], ["b"], 1, 0, "2026-05-01"),
      match(["b"], ["c"], 1, 0, "2026-05-02"),
      match(["b"], ["c"], 1, 0, "2026-05-03"),
      match(["a", "c"], ["b"], 1, 0, "2026-05-04"),
    ];
    const impact = matchImpact(fixtures, fixtures.at(-1)!, squad)!;

    const a = impact.A.players.find((p) => p.playerId === "a")!;
    // Newest first: two nights missed, then the win they opened with.
    expect(a.form).toEqual(["dnp", "dnp", "win"]);

    // Somebody who played every one of them has no gaps at all.
    const c = impact.A.players.find((p) => p.playerId === "c")!;
    expect(c.form).not.toContain("dnp");
  });

  it("is nothing for a fixture that was never played", () => {
    const scheduled: Match = { ...match(["a"], ["c"], 0, 0, "2026-02-01"), status: "pending" };
    expect(matchImpact([scheduled], scheduled, squad)).toBeNull();
  });

  it("is nothing for a match that is not in the list", () => {
    const stray = match(["a"], ["c"], 1, 0, "2026-03-01");
    expect(matchImpact([], stray, squad)).toBeNull();
  });
});
