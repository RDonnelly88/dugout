import { describe, expect, it } from "vitest";
import { seasonPlayers, seasonWrapped } from "@/lib/season-wrapped";
import { ELO } from "@/lib/config";
import type { Match } from "@/types";

let n = 0;
function night(
  a: string[],
  b: string[],
  outcome: "a" | "b" | "draw",
  date: string,
  seasonId = "s1"
): Match {
  n++;
  return {
    id: `m${n}`,
    seasonId,
    date,
    teamA: { name: "A", players: a },
    teamB: { name: "B", players: b },
    status: "completed",
    outcome,
    createdAt: date,
    updatedAt: date,
  };
}

const VALUES = { win: 3, draw: 1 };
const day = (i: number) => new Date(Date.UTC(2026, 0, 6 + 7 * i)).toISOString().slice(0, 10);

describe("seasonWrapped", () => {
  it("has nothing to tell for somebody who did not play in the season", () => {
    const matches = [night(["x"], ["y"], "a", day(0))];

    expect(seasonWrapped(matches, "s1", "absent", VALUES)).toBeNull();
    expect(seasonWrapped(matches, "s2", "x", VALUES)).toBeNull();
  });

  it("tells the season's own record and nothing from another season", () => {
    const matches = [
      night(["x"], ["y"], "a", day(0), "s0"),
      night(["x"], ["y"], "a", day(1)),
      night(["x"], ["y"], "draw", day(2)),
      night(["x"], ["y"], "b", day(3)),
      night(["z"], ["y"], "b", day(4)),
    ];

    const story = seasonWrapped(matches, "s1", "x", VALUES)!;

    expect(story.nights).toBe(4);
    expect(story.record.played).toBe(3);
    expect([story.record.wins, story.record.draws, story.record.losses]).toEqual([1, 1, 1]);
  });

  it("finishes in the place the table gives, and remembers the best one first reached", () => {
    const matches = [
      night(["x"], ["y"], "a", day(0)),
      night(["z"], ["y"], "a", day(1)),
      night(["z"], ["x"], "a", day(2)),
    ];

    const story = seasonWrapped(matches, "s1", "x", VALUES)!;

    // z has 6 points from 2, x 3 from 2, y nothing.
    expect(story.place).toEqual({ position: 2, of: 3 });
    expect(story.bestPlace).toMatchObject({ position: 1, night: 1 });
    expect(story.journey).toEqual([1, 1, 2]);
  });

  it("counts runs over their own games and the squad's nights", () => {
    const matches = [
      night(["x"], ["y"], "a", day(0)),
      night(["x"], ["y"], "a", day(1)),
      night(["x"], ["y"], "draw", day(2)),
      night(["z"], ["y"], "a", day(3)),
      night(["x"], ["y"], "a", day(4)),
      night(["x"], ["y"], "b", day(5)),
    ];

    const story = seasonWrapped(matches, "s1", "x", VALUES)!;

    expect(story.winRun).toBe(2);
    expect(story.unbeatenRun).toBe(4);
    expect(story.attendanceRun).toBe(3);
  });

  it("names the team-mate they shared a side with most", () => {
    const matches = [
      night(["x", "often"], ["y"], "a", day(0)),
      night(["x", "often"], ["y"], "b", day(1)),
      night(["x", "once"], ["y"], "a", day(2)),
    ];

    expect(seasonWrapped(matches, "s1", "x", VALUES)!.regular).toEqual({
      playerId: "often",
      played: 2,
      wins: 1,
    });
  });

  it("carries a rating into the season rather than starting it level", () => {
    const before = Array.from({ length: 6 }, (_, i) => night(["x"], ["y"], "a", day(i), "s0"));
    const matches = [...before, night(["x"], ["y"], "a", day(10))];

    const story = seasonWrapped(matches, "s1", "x", VALUES)!;

    expect(story.rating!.from).toBeGreaterThan(ELO.start);
    expect(story.rating!.to).toBeGreaterThanOrEqual(story.rating!.from);
  });

  it("only calls a win an upset when they were not favourites", () => {
    // y beats x all through the season before, so x goes into this one the
    // underdog and wins it.
    const before = Array.from({ length: 6 }, (_, i) => night(["x"], ["y"], "b", day(i), "s0"));
    const shock = night(["x"], ["y"], "a", day(10));

    const story = seasonWrapped([...before, shock], "s1", "x", VALUES)!;
    expect(story.upset?.matchId).toBe(shock.id);
    expect(story.upset!.chance).toBeLessThan(0.5);

    // The favourite winning the same game is no upset.
    expect(seasonWrapped([...before, night(["x"], ["y"], "b", day(10))], "s1", "y", VALUES)!.upset).toBeNull();
  });

  it("names no best partner or nemesis on too few games to say", () => {
    const matches = [
      night(["x", "mate"], ["y"], "a", day(0)),
      night(["x", "mate"], ["y"], "a", day(1)),
    ];

    const story = seasonWrapped(matches, "s1", "x", VALUES)!;
    expect(story.partner).toBeNull();
    expect(story.nemesis).toBeNull();
  });

  it("has no place without a table to read the points from", () => {
    const story = seasonWrapped([night(["x"], ["y"], "a", day(0))], "s1", "x", null)!;
    expect(story.place).toBeNull();
  });
});

describe("the web of a season", () => {
  it("holds everybody they played with and against, from that season only", () => {
    const matches = [
      night(["x", "old"], ["y"], "a", day(0), "s0"),
      night(["x", "mate"], ["y", "foe"], "a", day(1)),
      night(["x", "mate"], ["foe"], "b", day(2)),
    ];

    const story = seasonWrapped(matches, "s1", "x", VALUES)!;

    expect(story.mates.map((m) => m.playerId)).toEqual(["mate"]);
    expect(story.mates[0].ledger).toMatchObject({ played: 2, wins: 1, losses: 1 });
    expect(story.opponents.map((o) => o.playerId).sort()).toEqual(["foe", "y"]);
  });
});

describe("seasonPlayers", () => {
  it("lists everybody who played a completed match in the season", () => {
    const fixture: Match = { ...night(["late"], ["y"], "a", day(9)), status: "scheduled", outcome: undefined };
    const matches = [night(["x"], ["y"], "a", day(0)), night(["z"], ["w"], "a", day(1), "s0"), fixture];

    expect(seasonPlayers(matches, "s1").sort()).toEqual(["x", "y"]);
  });
});
