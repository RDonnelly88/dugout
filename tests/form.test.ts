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
  it("records wins, draws and defeats from each player's side", () => {
    const form = recentForm([
      match(["a"], ["b"], 3, 0, "2026-01-01"),
      match(["a"], ["b"], 1, 1, "2026-01-02"),
    ]);

    expect(form.get("a")!.results).toEqual(["draw", "win"]);
    expect(form.get("b")!.results).toEqual(["draw", "loss"]);
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
    expect(form.get("a")!.results).toEqual(["loss", "loss", "loss"]);
    expect(form.get("b")!.results).toEqual(["win", "win", "win"]);
  });

  it("takes the most recent games regardless of the order given", () => {
    const older = match(["a"], ["b"], 0, 1, "2026-01-01");
    const newer = match(["a"], ["b"], 1, 0, "2026-06-01");

    const form = recentForm([older, newer], 1);

    expect(form.get("a")!.results).toEqual(["win"]);
  });

  it("is only as long as the history when that is shorter than the window", () => {
    const form = recentForm([match(["a"], ["b"], 3, 0, "2026-01-01")], 5);

    expect(form.get("a")!.games).toBe(1);
    expect(form.get("a")!.results).toEqual(["win"]);
  });

  it("ignores fixtures that have not been played", () => {
    const pending: Match = {
      ...match(["a"], ["b"], 0, 0, "2026-01-01"),
      status: "scheduled",
    };

    expect(recentForm([pending]).size).toBe(0);
  });
});

describe("form over the squad's window, not the player's", () => {
  it("marks a night missed in the run of somebody who has played before", () => {
    const fixtures = [
      match(["ever", "sometimes"], ["x"], 1, 0, "2026-01-01"),
      match(["ever"], ["x"], 1, 0, "2026-01-02"),
    ];

    expect(recentForm(fixtures, 5).get("sometimes")!.results).toEqual(["dnp", "win"]);
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

  it("has nothing to say about somebody absent for the whole window", () => {
    const fixtures = [
      match(["old"], ["b"], 1, 0, "2026-01-01"),
      match(["c"], ["b"], 1, 0, "2026-01-02"),
      match(["c"], ["b"], 1, 0, "2026-01-03"),
    ];

    expect(recentForm(fixtures, 2).get("old")).toBeUndefined();
  });
});

describe("a first game is not a missed one", () => {
  it("gives a debutant only the nights since they arrived", () => {
    const fixtures = [
      match(["old"], ["x"], 1, 0, "2026-01-01"),
      match(["old"], ["x"], 1, 0, "2026-01-02"),
      match(["old"], ["x"], 1, 0, "2026-01-03"),
      match(["old", "new"], ["x"], 1, 0, "2026-01-04"),
      match(["old", "new"], ["x"], 0, 1, "2026-01-05"),
    ];

    const form = recentForm(fixtures, 5);

    // Newest first, and nothing before the fourth night.
    expect(form.get("new")!.results).toEqual(["loss", "win"]);
    // And the ever-present is measured over all five.
    expect(form.get("old")!.results).toHaveLength(5);
  });
});
