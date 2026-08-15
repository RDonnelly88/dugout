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
