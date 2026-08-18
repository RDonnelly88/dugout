import { describe, expect, it } from "vitest";
import { recentForm } from "@/lib/form";
import type { Match } from "@/types";

let n = 0;
function match(
  a: string[],
  b: string[],
  scoreA: number,
  scoreB: number,
  date: string
): Match {
  n++;
  return {
    id: `m${n}`,
    date,
    teamA: { name: "A", players: a, score: scoreA },
    teamB: { name: "B", players: b, score: scoreB },
    status: "completed",
    createdAt: date,
    updatedAt: date,
  };
}

describe("recentForm", () => {
  it("scores three for a win and one for a draw", () => {
    const form = recentForm([
      match(["a"], ["b"], 3, 0, "2026-01-01"),
      match(["a"], ["b"], 1, 1, "2026-01-02"),
    ]);

    expect(form.get("a")!.points).toBe(4);
    expect(form.get("b")!.points).toBe(1);
  });

  it("looks only at the window, however long the history is", () => {
    // Ten wins then three losses. With a window of three, only the losses
    // count — being good in March is not being on form now.
    const fixtures = [
      ...Array.from({ length: 10 }, (_, i) =>
        match(["a"], ["b"], 5, 0, `2026-01-${String(i + 1).padStart(2, "0")}`)
      ),
      match(["a"], ["b"], 0, 5, "2026-02-01"),
      match(["a"], ["b"], 0, 5, "2026-02-02"),
      match(["a"], ["b"], 0, 5, "2026-02-03"),
    ];

    const form = recentForm(fixtures, 3);

    expect(form.get("a")!.games).toBe(3);
    expect(form.get("a")!.points).toBe(0);
    expect(form.get("b")!.points).toBe(9);
  });

  it("takes the most recent games regardless of the order given", () => {
    const older = match(["a"], ["b"], 0, 1, "2026-01-01");
    const newer = match(["a"], ["b"], 1, 0, "2026-06-01");

    const form = recentForm([older, newer], 1);

    expect(form.get("a")!.results).toEqual(["win"]);
  });

  it("averages over games actually played, not over the window", () => {
    const form = recentForm([match(["a"], ["b"], 3, 0, "2026-01-01")], 5);

    expect(form.get("a")!.games).toBe(1);
    expect(form.get("a")!.pointsPerGame).toBe(3);
  });

  it("ignores fixtures that have not been played", () => {
    const pending: Match = {
      ...match(["a"], ["b"], 0, 0, "2026-01-01"),
      status: "pending",
    };

    expect(recentForm([pending]).size).toBe(0);
  });
});

describe("form over the squad's window, not the player's", () => {
  /**
   * The bug this fixes: three wins out of three read as a perfect run and
   * outranked a player who turned out five times and won four, while the card
   * above them promised "points a game over the last five".
   */
  it("counts a night missed as nought", () => {
    const fixtures = [
      match(["ever", "sometimes"], ["x"], 1, 0, "2026-01-01"),
      match(["ever", "sometimes"], ["x"], 1, 0, "2026-01-02"),
      match(["ever", "sometimes"], ["x"], 1, 0, "2026-01-03"),
      match(["ever"], ["x"], 1, 0, "2026-01-04"),
      match(["ever"], ["x"], 1, 0, "2026-01-05"),
    ];

    const form = recentForm(fixtures, 5);

    expect(form.get("ever")!.pointsPerGame).toBe(3);
    // Nine points over five nights, not over the three they fancied.
    expect(form.get("sometimes")!.points).toBe(9);
    expect(form.get("sometimes")!.pointsPerGame).toBeCloseTo(1.8);
  });

  it("still says how many they actually played", () => {
    const fixtures = [
      match(["a"], ["b"], 1, 0, "2026-01-01"),
      match(["c"], ["b"], 1, 0, "2026-01-02"),
      match(["c"], ["b"], 1, 0, "2026-01-03"),
    ];

    expect(recentForm(fixtures, 3).get("a")!.games).toBe(1);
  });

  it("marks the nights they were not there", () => {
    const fixtures = [
      match(["a"], ["b"], 1, 0, "2026-01-01"),
      match(["c"], ["b"], 1, 0, "2026-01-02"),
      match(["a"], ["b"], 0, 1, "2026-01-03"),
    ];

    // Newest first.
    expect(recentForm(fixtures, 3).get("a")!.results).toEqual([
      "loss",
      "dnp",
      "win",
    ]);
  });

  /** A short history is a short window, not four imaginary noughts. */
  it("divides by what the squad has played when that is less than the window", () => {
    const form = recentForm([match(["a"], ["b"], 3, 0, "2026-01-01")], 5);

    expect(form.get("a")!.pointsPerGame).toBe(3);
  });

  it("has nothing to say about somebody absent for the whole window", () => {
    const fixtures = [
      match(["old"], ["b"], 1, 0, "2026-01-01"),
      match(["c"], ["b"], 1, 0, "2026-01-02"),
      match(["c"], ["b"], 1, 0, "2026-01-03"),
    ];

    expect(recentForm(fixtures, 2).get("old")).toBeUndefined();
  });
});
