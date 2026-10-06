import { describe, expect, it } from "vitest";
import { computeRatings, expectedScore, gameWeight } from "@/lib/elo";
import { ELO } from "@/lib/config";
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
    teamA: { name: "A", players: a, score: scoreA },
    teamB: { name: "B", players: b, score: scoreB },
    status: "completed",
    createdAt: on,
    updatedAt: on,
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

describe("the size of a win", () => {
  /**
   * A win is a win. The margin used to scale the adjustment by up to
   * three-quarters again, which weighted the least reliable thing on the
   * record — and the score is optional now, so most results have none.
   */
  it("moves a rating the same however heavy the win", () => {
    const narrow = computeRatings([match(["a"], ["b"], 1, 0, "2026-01-01")]);
    const heavy = computeRatings([match(["c"], ["d"], 9, 0, "2026-01-01")]);

    expect(narrow.get("a")!.rating).toBeCloseTo(heavy.get("c")!.rating);
  });

  it("counts a win with no score recorded at all", () => {
    const scoreless: Match = {
      ...match(["a"], ["b"], 0, 0, "2026-01-02"),
      teamA: { name: "Bibs", players: ["a"] },
      teamB: { name: "No bibs", players: ["b"] },
      outcome: "a",
    };
    const ratings = computeRatings([scoreless]);

    expect(ratings.get("a")!.rating).toBeGreaterThan(ELO.start);
    expect(ratings.get("b")!.rating).toBeLessThan(ELO.start);
  });
});

describe("computeRatings", () => {
  it("gives an unplayed squad nothing to rate", () => {
    expect(computeRatings([]).size).toBe(0);
  });

  it("moves the winner up and the loser down by the same amount", () => {
    const ratings = computeRatings([match(["a"], ["b"], 3, 1)]);

    const a = ratings.get("a")!;
    const b = ratings.get("b")!;

    expect(a.rating).toBeGreaterThan(ELO.start);
    expect(b.rating).toBeLessThan(ELO.start);
    // Between equal sides the exchange is symmetrical, so the total is
    // conserved — nobody is created or destroyed by playing a game.
    expect(a.rating + b.rating).toBeCloseTo(ELO.start * 2, 6);
  });

  it("leaves a draw between equals where it found them", () => {
    const ratings = computeRatings([match(["a"], ["b"], 2, 2)]);

    expect(ratings.get("a")!.rating).toBeCloseTo(ELO.start);
    expect(ratings.get("b")!.rating).toBeCloseTo(ELO.start);
  });

  it("rewards beating a stronger side more than beating a weaker one", () => {
    // Give `strong` a head start, then have each of two equals beat them.
    const setup = [
      match(["strong"], ["filler1"], 9, 0),
      match(["strong"], ["filler2"], 9, 0),
    ];

    const upset = computeRatings([...setup, match(["challenger"], ["strong"], 1, 0)]);
    const routine = computeRatings([...setup, match(["challenger"], ["filler3"], 1, 0)]);

    expect(upset.get("challenger")!.rating).toBeGreaterThan(
      routine.get("challenger")!.rating
    );
  });

  it("pays less for a win the more of them you have already had", () => {
    // Eleven straight wins: the last is worth less than the first, because
    // each one raises the rating the next is expected from. Nothing about the
    // player is treated differently — the curve does all of it.
    const fixtures = Array.from({ length: 11 }, (_, i) =>
      match(["a"], [`opp${i}`], 1, 0)
    );
    const { history } = computeRatings(fixtures).get("a")!;

    expect(history).toHaveLength(11);
    expect(Math.abs(history[10].change)).toBeLessThan(
      Math.abs(history[0].change)
    );
  });

  it("shares a team result across everyone who played", () => {
    const ratings = computeRatings([
      match(["a", "b", "c"], ["x", "y", "z"], 4, 2),
    ]);

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

    const forwards = computeRatings([first, second]).get("a")!;
    const backwards = computeRatings([second, first]).get("a")!;

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
    ]);

    expect(ratings.get("a")!.rating + ratings.get("b")!.rating).toBeCloseTo(
      ELO.start * 2,
      6
    );
  });

  it("ignores anything that is not a played result", () => {
    const pending: Match = {
      ...match(["a"], ["b"], 0, 0),
      status: "scheduled",
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

    expect(computeRatings([pending, noScore]).size).toBe(0);
  });

  it("records a peak that a later slump does not erase", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 9, 0, "2026-05-01"),
      match(["a"], ["b"], 0, 9, "2026-05-02"),
      match(["a"], ["b"], 0, 9, "2026-05-03"),
    ]);

    const a = ratings.get("a")!;
    expect(a.peak).toBeGreaterThan(a.rating);
  });
});

/** Games the squad played without them, not weeks on the calendar. */
const withoutThem = (count: number, month = 2) =>
  Array.from({ length: count }, (_, i) =>
    match(
      [`x${i}`],
      [`y${i}`],
      1,
      0,
      `2026-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
    )
  );

describe("gameWeight", () => {
  it("counts the newest game in full", () => {
    expect(gameWeight(0)).toBe(1);
  });

  it("halves every half-life", () => {
    expect(gameWeight(ELO.halfLife)).toBeCloseTo(0.5);
    expect(gameWeight(ELO.halfLife + 5) / gameWeight(5)).toBeCloseTo(0.5);
  });

  it("stops counting a game at the edge of the window", () => {
    expect(gameWeight(ELO.window - 1)).toBeGreaterThan(0);
    expect(gameWeight(ELO.window)).toBe(0);
    expect(gameWeight(ELO.window + 50)).toBe(0);
  });
});

describe("old games fade", () => {
  /** A game against somebody new each time, so no opponent carries anything over. */
  const versus = (player: string, won: boolean, tag: string) =>
    won ? match([player], [`${tag}`], 1, 0) : match([`${tag}`], [player], 1, 0);

  it("forgets a result once it is a window's worth of games old", () => {
    const recent = Array.from({ length: ELO.window }, (_, i) =>
      versus("a", i % 2 === 0, `recent${i}`)
    );
    const flyingStart = Array.from({ length: 12 }, (_, i) =>
      versus("a", true, `early${i}`)
    );

    const withThem = computeRatings([...flyingStart, ...recent]).get("a")!;
    const without = computeRatings(recent).get("a")!;

    expect(withThem.rating).toBeCloseTo(without.rating, 6);
  });

  it("weighs a recent run above an older one", () => {
    const rising = [
      ...Array.from({ length: 10 }, (_, i) => versus("riser", false, `r1${i}`)),
      ...Array.from({ length: 10 }, (_, i) => versus("riser", true, `r2${i}`)),
    ];
    const fading = [
      ...Array.from({ length: 10 }, (_, i) => versus("fader", true, `f1${i}`)),
      ...Array.from({ length: 10 }, (_, i) => versus("fader", false, `f2${i}`)),
    ];

    const ratings = computeRatings([...rising, ...fading]);

    // The same ten wins and ten defeats each, in the opposite order.
    expect(ratings.get("riser")!.rating).toBeGreaterThan(ELO.start);
    expect(ratings.get("fader")!.rating).toBeLessThan(ELO.start);
  });

  it("catches up with a player who has got better", () => {
    const poorThenGood = [
      ...Array.from({ length: 30 }, (_, i) => versus("a", false, `p${i}`)),
      ...Array.from({ length: ELO.window }, (_, i) => versus("a", true, `g${i}`)),
    ];

    expect(computeRatings(poorThenGood).get("a")!.rating).toBeGreaterThan(
      ELO.start + 100
    );
  });
});

describe("computeRatings and matches missed", () => {
  /**
   * A game ages by the squad's matches, not the player's own. Somebody who
   * played, sat out five and played again has a first game six matches old,
   * not two, so it counts for less than it does for somebody who played the
   * same two games in consecutive weeks.
   */
  it("ages a game by the matches the squad has played since, not your own", () => {
    const away = computeRatings([
      match(["a"], ["opp1"], 1, 0, "2026-01-01"),
      ...withoutThem(5),
      match(["a"], ["opp2"], 1, 1, "2026-03-01"),
    ]).get("a")!;
    const regular = computeRatings([
      match(["b"], ["opp3"], 1, 0, "2026-01-01"),
      match(["b"], ["opp4"], 1, 1, "2026-01-02"),
    ]).get("b")!;

    expect(away.rating).toBeGreaterThan(ELO.start);
    expect(away.rating).toBeLessThan(regular.rating);
  });

  it("eases an absent player back towards the start as their games age", () => {
    const strong = Array.from({ length: 8 }, (_, i) =>
      match(["a"], [`opp${i}`], 1, 0, `2026-01-${String(i + 1).padStart(2, "0")}`)
    );

    const before = computeRatings(strong).get("a")!.rating;
    const after = computeRatings([...strong, ...withoutThem(10)]).get("a")!;

    expect(before).toBeGreaterThan(ELO.start);
    expect(after.rating).toBeLessThan(before);
    // Easing, never crossing: time away makes nobody worse than average.
    expect(after.rating).toBeGreaterThan(ELO.start);
    expect(after.missed).toBe(10);
    expect(after.lastChange).toBeLessThan(0);
  });

  it("has nothing left to rate somebody on once a window has passed without them", () => {
    const opener = match(["a"], ["b"], 5, 0, "2026-01-01");
    const away = Array.from({ length: ELO.window }, (_, i) =>
      match(
        [`x${i}`],
        [`y${i}`],
        1,
        0,
        new Date(Date.UTC(2026, 1, 1 + i)).toISOString().slice(0, 10)
      )
    );
    const a = computeRatings([opener, ...away]).get("a")!;

    expect(a.counted).toBe(0);
    expect(a.rating).toBeCloseTo(ELO.start, 6);
  });

  it("counts nothing missed for somebody who played the last match", () => {
    const fixtures = [
      match(["a"], ["b"], 1, 0, "2026-01-01"),
      match(["x"], ["y"], 1, 0, "2026-01-02"),
      match(["a"], ["b"], 1, 0, "2026-01-03"),
    ];
    expect(computeRatings(fixtures).get("a")!.missed).toBe(0);
  });

  it("gives the change from the last match to somebody who played it", () => {
    const ratings = computeRatings([
      match(["x"], ["y"], 1, 0, "2026-01-01"),
      match(["a"], ["b"], 1, 0, "2026-01-02"),
    ]);
    const a = ratings.get("a")!;

    expect(a.lastChange).toBeCloseTo(a.history.at(-1)!.change);
    expect(a.lastChange).toBeGreaterThan(0);
  });

  /**
   * Your rating rests on who you played with and against. When one of them
   * plays on and is re-rated, what your old results meant moves with them.
   */
  it("re-rates somebody away when a team-mate from their games plays on", () => {
    const ratings = computeRatings([
      match(["a", "mate"], ["x", "y"], 1, 0, "2026-01-01"),
      match(["mate"], ["z"], 1, 0, "2026-01-02"),
    ]);
    const a = ratings.get("a")!;

    // Their team-mate has just won again, so the old win together looks a
    // little more like the team-mate's doing.
    expect(a.lastChange).toBeLessThan(0);
    expect(Math.abs(a.lastChange)).toBeLessThan(Math.abs(a.history[0].change));
  });

  it("notes every match missed, with where the rating stood", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      ...withoutThem(5),
    ]);
    const a = ratings.get("a")!;

    expect(a.absent).toHaveLength(5);
    expect(a.absent[0].date).toBe("2026-02-01");
    expect(a.absent.at(-1)!.rating).toBeCloseTo(a.rating);
  });

  it("notes nothing for somebody who has never missed a match", () => {
    const ratings = computeRatings([match(["a"], ["b"], 3, 1, "2026-01-01")]);
    expect(ratings.get("a")!.absent).toEqual([]);
  });

  it("gives the same answer whenever it is asked", () => {
    const fixtures = [
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      ...withoutThem(9),
    ];

    expect(computeRatings(fixtures).get("a")!.rating).toBe(
      computeRatings(fixtures).get("a")!.rating
    );
  });
});

describe("a result across a side", () => {
  it("moves a debutant further than a regular on the same result", () => {
    const regular = Array.from({ length: 20 }, (_, i) =>
      match(["vet"], [`v${i}`], i % 2, 1 - (i % 2))
    );

    const ratings = computeRatings([
      ...regular,
      match(["vet", "debutant"], ["x", "y"], 1, 0),
    ]);

    const vet = ratings.get("vet")!.history.at(-1)!;
    const debutant = ratings.get("debutant")!.history.at(-1)!;

    expect(debutant.countedBefore).toBe(0);
    expect(vet.countedBefore).toBe(20);
    expect(debutant.change).toBeGreaterThan(vet.change);
    expect(vet.change).toBeGreaterThan(0);
  });

  it("flags a debutant's rating as a rough guess", () => {
    const ratings = computeRatings([match(["a"], ["b"], 3, 1, "2026-01-01")]);
    const a = ratings.get("a")!;

    expect(a.rating).not.toBe(ELO.start);
    expect(a.unsettled).toBe(true);
  });

  /**
   * Winning alongside somebody known to be good is less to your credit than
   * winning alongside somebody known to be poor.
   */
  it("credits a win beside a weak team-mate more than one beside a strong one", () => {
    const established = [
      ...Array.from({ length: 10 }, (_, i) => match(["star"], [`s${i}`], 1, 0)),
      ...Array.from({ length: 10 }, (_, i) => match([`w${i}`], ["weak"], 1, 0)),
    ];

    const ratings = computeRatings([
      ...established,
      match(["withStar", "star"], ["p", "q"], 1, 0),
      match(["withWeak", "weak"], ["r", "t"], 1, 0),
    ]);

    expect(ratings.get("withWeak")!.rating).toBeGreaterThan(
      ratings.get("withStar")!.rating
    );
  });

  it("keeps a level match level: a draw between equals moves nobody", () => {
    const teamA = ["a1", "a2", "a3", "a4", "a5"];
    const teamB = ["b1", "b2", "b3", "b4", "b5"];
    const ratings = computeRatings([match(teamA, teamB, 2, 2)]);

    for (const id of [...teamA, ...teamB]) {
      expect(ratings.get(id)!.rating).toBeCloseTo(ELO.start, 6);
    }
  });

  it("moves an uneven side's players by more each, being fewer to share it", () => {
    const teamA = ["a1", "a2", "a3", "a4"];
    const teamB = ["b1", "b2", "b3", "b4", "b5"];
    const ratings = computeRatings([match(teamA, teamB, 2, 1)]);

    const up = ratings.get("a1")!.rating - ELO.start;
    const down = ELO.start - ratings.get("b1")!.rating;
    expect(up).toBeGreaterThan(down);
    expect(down).toBeGreaterThan(0);
  });

  it("marks the nights a player was not there in the run they walk in on", () => {
    const ratings = computeRatings([
      match(["away", "regular"], ["x", "y"], 1, 0),
      match(["regular"], ["x"], 1, 0),
      match(["regular"], ["x"], 1, 0),
      match(["away", "regular"], ["x", "y"], 1, 0),
    ]);

    // Newest first: the two they missed sit between their two wins.
    expect(ratings.get("away")!.history.at(-1)!.formBefore).toEqual([
      "dnp",
      "dnp",
      "win",
    ]);
  });

  /** You cannot miss a match played before you had ever turned up. */
  it("charges a debutant nothing for the weeks before their first game", () => {
    const before = Array.from({ length: 4 }, () => match(["a"], ["b"], 1, 0));
    const ratings = computeRatings([
      ...before,
      match(["new", "alsoNew"], ["a", "b"], 1, 0),
    ]);

    expect(ratings.get("new")!.history.at(-1)!.formBefore).toEqual([]);
  });
});
