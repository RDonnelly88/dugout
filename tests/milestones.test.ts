import { describe, expect, it } from "vitest";
import { milestones } from "@/lib/milestones";

const none = new Set<string>();

describe("milestones", () => {
  it("names a round number a player is close to", () => {
    expect(milestones([{ playerId: "a", played: 49, wins: 20 }], none)).toEqual([
      { playerId: "a", kind: "games", mark: 50, toGo: 1 },
    ]);
  });

  it("says nothing of a mark still far off", () => {
    expect(milestones([{ playerId: "a", played: 40, wins: 12 }], none)).toEqual([]);
  });

  it("celebrates a mark brought up in the latest match, and only then", () => {
    const record = { playerId: "a", played: 50, wins: 7 };
    expect(milestones([record], new Set(["a"]))).toEqual([
      { playerId: "a", kind: "games", mark: 50, toGo: 0 },
    ]);
    // Sitting on fifty since March is not news; the next mark is far away.
    expect(milestones([record], none)).toEqual([]);
  });

  it("counts wins as well as games", () => {
    expect(milestones([{ playerId: "a", played: 61, wins: 24 }], none)).toEqual([
      { playerId: "a", kind: "wins", mark: 25, toGo: 1 },
    ]);
  });

  it("puts the nearest first and the bigger mark first among equals", () => {
    const found = milestones(
      [
        { playerId: "far", played: 23, wins: 3 },
        { playerId: "big", played: 99, wins: 30 },
        { playerId: "small", played: 9, wins: 3 },
      ],
      none
    );
    expect(found.map((m) => m.playerId)).toEqual(["big", "small", "far"]);
  });
});
