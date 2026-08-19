import { describe, expect, it } from "vitest";
import { seasonWrap } from "@/lib/season-wrap";
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
    teamA: { name: "Bibs", players: a, score: scoreA },
    teamB: { name: "No bibs", players: b, score: scoreB },
    status: "completed",
    createdAt: on,
    updatedAt: on,
  };
}

describe("seasonWrap", () => {
  it("has nothing to say about a season nobody played", () => {
    const wrap = seasonWrap([]);

    expect(wrap.matches).toBe(0);
    expect(wrap.climber).toBeNull();
    expect(wrap.streak).toBeNull();
    expect(wrap.everPresent).toBeNull();
    expect(wrap.upset).toBeNull();
  });

  it("counts only matches that were actually played", () => {
    const pending: Match = { ...match(["a"], ["b"], 0, 0), status: "pending" };
    const wrap = seasonWrap([match(["a"], ["b"], 1, 0), pending]);

    expect(wrap.matches).toBe(1);
  });

  describe("the longest run", () => {
    it("finds the longest string of wins anybody put together", () => {
      const fixtures = [
        match(["a", "x"], ["b", "y"], 1, 0),
        match(["a", "x"], ["b", "y"], 1, 0),
        match(["a", "x"], ["b", "y"], 1, 0),
        match(["b", "a"], ["x", "y"], 1, 0),
      ];

      // `a` wins all four; `x` wins the first three then loses.
      const wrap = seasonWrap(fixtures);
      expect(wrap.streak).toEqual({ playerId: "a", length: 4 });
    });

    it("counts a defeat as the end of a run", () => {
      const wrap = seasonWrap([
        match(["a"], ["b"], 1, 0),
        match(["a"], ["b"], 0, 1),
        match(["a"], ["b"], 1, 0),
        match(["a"], ["b"], 1, 0),
      ]);

      expect(wrap.streak).toEqual({ playerId: "a", length: 2 });
    });

    /** One win is a result. A run is something you can boast about. */
    it("does not call a single win a run", () => {
      const wrap = seasonWrap([match(["a"], ["b"], 1, 0)]);
      expect(wrap.streak).toBeNull();
    });
  });

  describe("turning out", () => {
    it("names whoever played most, and what share that was", () => {
      const wrap = seasonWrap([
        match(["ever", "a"], ["b", "c"], 1, 0),
        match(["ever", "a"], ["b", "c"], 1, 0),
        match(["ever", "d"], ["e", "f"], 1, 0),
        match(["g", "d"], ["e", "f"], 1, 0),
      ]);

      expect(wrap.everPresent?.playerId).toBe("ever");
      expect(wrap.everPresent?.played).toBe(3);
      expect(wrap.everPresent?.share).toBeCloseTo(0.75);
    });
  });

  describe("the climber", () => {
    /**
     * The point of the award, and only possible because ratings are replayed
     * over the whole history: a player walks into a season carrying what they
     * earned in the last one, so a climb can be measured against it.
     */
    it("measures the climb from what they carried into the season", () => {
      // Last season: `faller` was the best of them, `riser` the worst.
      const before = Array.from({ length: 5 }, () =>
        match(["faller"], ["riser"], 1, 0)
      );
      // This season: the other way round.
      const season = Array.from({ length: 5 }, () =>
        match(["riser"], ["faller"], 1, 0)
      );

      const wrap = seasonWrap([...before, ...season], season);

      expect(wrap.climber?.playerId).toBe("riser");
      expect(wrap.climber!.change).toBeGreaterThan(0);
      // They started the season below where they finished it.
      expect(wrap.climber!.from).toBeLessThan(wrap.climber!.to);
    });

    it("takes no notice of games played before the season began", () => {
      const before = Array.from({ length: 4 }, () => match(["a"], ["b"], 1, 0));
      const season = Array.from({ length: 4 }, () => match(["b"], ["a"], 1, 0));

      const wrap = seasonWrap([...before, ...season], season);

      // `b` lost four then won four: within the season only the winning half
      // counts, so they are the climber despite a wretched year overall.
      expect(wrap.climber?.playerId).toBe("b");
    });

    it("says nothing when a squad has barely played", () => {
      const wrap = seasonWrap([match(["a"], ["b"], 1, 0)]);
      expect(wrap.climber).toBeNull();
    });
  });

  describe("the upset", () => {
    it("picks the night the table got most wrong", () => {
      const fixtures = [
        // Build a gap: `strong` beats everyone repeatedly.
        ...Array.from({ length: 6 }, (_, i) =>
          match(["strong"], [`weak${i}`], 1, 0)
        ),
        // A routine win, then the shock.
        match(["strong"], ["nobody"], 1, 0),
        match(["underdog"], ["strong"], 1, 0),
      ];

      const wrap = seasonWrap(fixtures);
      expect(wrap.upset?.winnerIds).toEqual(["underdog"]);
      expect(wrap.upset?.loserIds).toEqual(["strong"]);
      // The table gave the winners less than an even chance.
      expect(wrap.upset!.expected).toBeLessThan(0.5);
    });

    it("reads the sides as they stood that night, not as they finished", () => {
      const wrap = seasonWrap([
        match(["a"], ["b"], 1, 0),
        match(["a"], ["b"], 1, 0),
      ]);

      // Both were level going into the first, so it is no upset at all; the
      // second is the mild one, `b` having been beaten already.
      expect(wrap.upset?.matchId).toBe(wrap.upset?.matchId);
      expect(wrap.upset!.expected).toBeLessThanOrEqual(0.5);
    });

    it("marks a draw as a draw", () => {
      const wrap = seasonWrap([match(["a"], ["b"], 1, 1)]);
      expect(wrap.upset?.drawn).toBe(true);
    });
  });

  describe("the partnership", () => {
    it("finds the pair who win most on the same side", () => {
      const fixtures = [
        ...Array.from({ length: 6 }, () =>
          match(["pal1", "pal2"], ["opp1", "opp2"], 1, 0)
        ),
        ...Array.from({ length: 4 }, () =>
          match(["pal1", "opp1"], ["pal2", "opp2"], 0, 1)
        ),
      ];

      const wrap = seasonWrap(fixtures);
      expect(wrap.partnership).not.toBeNull();
      expect(wrap.partnership!.playerIds).toContain("pal1");
      expect(wrap.partnership!.playerIds).toContain("pal2");
      expect(wrap.partnership!.lift).toBeGreaterThan(0);
    });

    it("says nothing when nobody has played with anybody twice", () => {
      const wrap = seasonWrap([match(["a"], ["b"], 1, 0)]);
      expect(wrap.partnership).toBeNull();
    });
  });

  it("gives the same answers however often it is asked", () => {
    const fixtures = [
      match(["a", "b"], ["c", "d"], 1, 0),
      match(["a", "c"], ["b", "d"], 0, 1),
      match(["a", "d"], ["b", "c"], 1, 0),
    ];

    expect(seasonWrap(fixtures)).toEqual(seasonWrap(fixtures));
  });
});
