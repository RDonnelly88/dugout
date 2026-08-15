import { describe, expect, it } from "vitest";
import {
  computeRatings,
  decayed,
  expectedScore,
  marginMultiplier,
} from "@/lib/elo";
import { ELO } from "@/lib/config";
import type { Match } from "@/types";

/**
 * Ratings drift towards the starting mark with time away, so every one of
 * these has to say when "now" is. Left to the real clock they would pass today
 * and fail next month, drifting a little further from the fixtures each week.
 */
const NOW = new Date("2026-02-01").getTime();

let counter = 0;
function match(
  a: string[],
  b: string[],
  scoreA: number,
  scoreB: number,
  date = `2026-01-${String(++counter).padStart(2, "0")}`
): Match {
  return {
    id: `m${counter}`,
    date,
    teamA: { name: "A", players: a, score: scoreA },
    teamB: { name: "B", players: b, score: scoreB },
    status: "completed",
    createdAt: date,
    updatedAt: date,
  };
}

describe("expectedScore", () => {
  it("is even between equal sides", () => {
    expect(expectedScore(1200, 1200)).toBe(0.5);
  });

  it("makes 400 points about a ten-to-one favourite", () => {
    expect(expectedScore(1600, 1200)).toBeCloseTo(10 / 11, 3);
  });

  it("is symmetrical", () => {
    expect(expectedScore(1400, 1100) + expectedScore(1100, 1400)).toBeCloseTo(1);
  });
});

describe("marginMultiplier", () => {
  it("does not inflate a one-goal win", () => {
    expect(marginMultiplier(1)).toBe(1);
    expect(marginMultiplier(-1)).toBe(1);
  });

  it("ignores which way round the margin is", () => {
    expect(marginMultiplier(4)).toBe(marginMultiplier(-4));
  });

  it("steps up with the margin", () => {
    expect(marginMultiplier(2)).toBeGreaterThan(marginMultiplier(1));
    expect(marginMultiplier(3)).toBeGreaterThan(marginMultiplier(2));
  });

  it("stops climbing, so one thrashing cannot rewrite a rating", () => {
    expect(marginMultiplier(20)).toBe(ELO.maxMarginMultiplier);
    expect(marginMultiplier(200)).toBe(ELO.maxMarginMultiplier);
  });
});

describe("computeRatings", () => {
  it("gives an unplayed squad nothing to rate", () => {
    expect(computeRatings([], NOW).size).toBe(0);
  });

  it("moves the winner up and the loser down by the same amount", () => {
    const ratings = computeRatings([match(["a"], ["b"], 3, 1)], NOW);

    const a = ratings.get("a")!;
    const b = ratings.get("b")!;

    expect(a.rating).toBeGreaterThan(ELO.start);
    expect(b.rating).toBeLessThan(ELO.start);
    // Between equal sides the exchange is symmetrical, so the total is
    // conserved — nobody is created or destroyed by playing a game.
    expect(a.rating + b.rating).toBeCloseTo(ELO.start * 2, 6);
  });

  it("leaves a draw between equals where it found them", () => {
    const ratings = computeRatings([match(["a"], ["b"], 2, 2)], NOW);

    expect(ratings.get("a")!.rating).toBeCloseTo(ELO.start);
    expect(ratings.get("b")!.rating).toBeCloseTo(ELO.start);
  });

  it("rewards beating a stronger side more than beating a weaker one", () => {
    // Give `strong` a head start, then have each of two equals beat them.
    const setup = [
      match(["strong"], ["filler1"], 9, 0),
      match(["strong"], ["filler2"], 9, 0),
    ];

    const upset = computeRatings([...setup, match(["challenger"], ["strong"], 1, 0)], NOW);
    const routine = computeRatings([...setup, match(["challenger"], ["filler3"], 1, 0)], NOW);

    expect(upset.get("challenger")!.rating).toBeGreaterThan(
      routine.get("challenger")!.rating
    );
  });

  it("counts a thrashing for more than a scrape", () => {
    const narrow = computeRatings([match(["a"], ["b"], 1, 0)], NOW);
    const rout = computeRatings([match(["c"], ["d"], 7, 0)], NOW);

    expect(rout.get("c")!.rating).toBeGreaterThan(narrow.get("a")!.rating);
  });

  it("settles down once a player is established", () => {
    // Eleven straight wins: the last is worth less than the first, because the
    // rating is no longer provisional.
    const fixtures = Array.from({ length: 11 }, (_, i) =>
      match(["a"], [`opp${i}`], 1, 0)
    );
    const { history } = computeRatings(fixtures, NOW).get("a")!;

    expect(history).toHaveLength(11);
    expect(Math.abs(history[10].change)).toBeLessThan(
      Math.abs(history[0].change)
    );
  });

  it("shares a team result across everyone who played", () => {
    const ratings = computeRatings([
      match(["a", "b", "c"], ["x", "y", "z"], 4, 2),
    ], NOW);

    for (const id of ["a", "b", "c"]) {
      expect(ratings.get(id)!.rating).toBeGreaterThan(ELO.start);
    }
    for (const id of ["x", "y", "z"]) {
      expect(ratings.get(id)!.rating).toBeLessThan(ELO.start);
    }
  });

  it("replays in date order however the matches arrive", () => {
    const first = match(["a"], ["b"], 5, 0, "2026-01-01");
    const second = match(["a"], ["b"], 0, 5, "2026-02-01");

    const forwards = computeRatings([first, second], NOW).get("a")!;
    const backwards = computeRatings([second, first], NOW).get("a")!;

    expect(forwards.rating).toBeCloseTo(backwards.rating, 6);
    expect(backwards.history.map((h) => h.date)).toEqual([
      "2026-01-01",
      "2026-02-01",
    ]);
  });

  it("rates both sides from what they carried into the match", () => {
    // A and B meet twice on the same day. The second result must not be
    // computed against a rating the first one had already moved for one side
    // but not the other.
    const ratings = computeRatings([
      match(["a"], ["b"], 1, 0, "2026-03-01"),
      match(["a"], ["b"], 0, 1, "2026-03-01"),
    ], NOW);

    expect(ratings.get("a")!.rating + ratings.get("b")!.rating).toBeCloseTo(
      ELO.start * 2,
      6
    );
  });

  it("ignores anything that is not a played result", () => {
    const pending: Match = {
      ...match(["a"], ["b"], 0, 0),
      status: "pending",
    };
    const noScore: Match = {
      id: "ns",
      date: "2026-04-01",
      teamA: { name: "A", players: ["a"] },
      teamB: { name: "B", players: ["b"] },
      status: "completed",
      createdAt: "2026-04-01",
      updatedAt: "2026-04-01",
    };

    expect(computeRatings([pending, noScore], NOW).size).toBe(0);
  });

  it("records a peak that a later slump does not erase", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 9, 0, "2026-05-01"),
      match(["a"], ["b"], 0, 9, "2026-05-02"),
      match(["a"], ["b"], 0, 9, "2026-05-03"),
    ], NOW);

    const a = ratings.get("a")!;
    expect(a.peak).toBeGreaterThan(a.rating);
  });
});

describe("decayed", () => {
  it("leaves a rating alone inside the grace period", () => {
    expect(decayed(1400, ELO.decay.graceWeeks)).toBe(1400);
    expect(decayed(1400, 0)).toBe(1400);
  });

  it("pulls a strong rating down towards the start", () => {
    const after = decayed(1400, ELO.decay.graceWeeks + 4);
    expect(after).toBeLessThan(1400);
    expect(after).toBeGreaterThan(ELO.start);
  });

  it("lifts a weak rating up towards the start", () => {
    const after = decayed(1000, ELO.decay.graceWeeks + 4);
    expect(after).toBeGreaterThan(1000);
    expect(after).toBeLessThan(ELO.start);
  });

  /** Time away should make you ordinary, never turn you into the opposite. */
  it("never crosses the starting mark, however long the absence", () => {
    expect(decayed(1400, 5000)).toBeGreaterThanOrEqual(ELO.start);
    expect(decayed(1000, 5000)).toBeLessThanOrEqual(ELO.start);
  });
});

describe("computeRatings with time away", () => {
  it("drifts a player who has stopped turning up", () => {
    const fixtures = [
      match(["a", "b"], ["c", "d"], 5, 0, "2026-01-01"),
      match(["a", "b"], ["c", "d"], 5, 0, "2026-01-08"),
    ];

    const fresh = computeRatings(fixtures, new Date("2026-01-09").getTime());
    const stale = computeRatings(fixtures, new Date("2026-06-01").getTime());

    expect(fresh.get("a")!.rating).toBeGreaterThan(stale.get("a")!.rating);
    expect(stale.get("a")!.drift).toBeGreaterThan(0);
    expect(stale.get("a")!.idleWeeks).toBeGreaterThan(ELO.decay.graceWeeks);
  });

  it("counts no drift for somebody who played this week", () => {
    const ratings = computeRatings(
      [match(["a"], ["b"], 3, 1, "2026-01-01")],
      new Date("2026-01-03").getTime()
    );

    expect(ratings.get("a")!.drift).toBe(0);
    expect(ratings.get("a")!.idleWeeks).toBe(0);
  });

  it("rates a returning player on what they walk in with", () => {
    // Same two results, but the second pair are months apart rather than days.
    const together = computeRatings(
      [
        match(["a"], ["b"], 5, 0, "2026-01-01"),
        match(["a"], ["b"], 5, 0, "2026-01-08"),
      ],
      new Date("2026-01-09").getTime()
    );
    const apart = computeRatings(
      [
        match(["a"], ["b"], 5, 0, "2026-01-01"),
        match(["a"], ["b"], 5, 0, "2026-06-01"),
      ],
      new Date("2026-06-02").getTime()
    );

    // Having drifted back towards level, the second win is worth more, so the
    // gap it opens is smaller than the uninterrupted run's.
    expect(apart.get("a")!.rating).toBeLessThan(together.get("a")!.rating);
  });
});
