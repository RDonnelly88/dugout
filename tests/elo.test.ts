import { describe, expect, it } from "vitest";
import {
  computeRatings,
  decayed,
  expectedScore,
  type PlayerRating,
} from "@/lib/elo";
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

describe("decayed", () => {
  it("leaves a rating alone inside the grace", () => {
    expect(decayed(1400, ELO.decay.graceMatches)).toBe(1400);
    expect(decayed(1400, 0)).toBe(1400);
  });

  it("pulls a strong rating down towards the start", () => {
    const after = decayed(1400, ELO.decay.graceMatches + 4);
    expect(after).toBeLessThan(1400);
    expect(after).toBeGreaterThan(ELO.start);
  });

  it("lifts a weak rating up towards the start", () => {
    const after = decayed(1000, ELO.decay.graceMatches + 4);
    expect(after).toBeGreaterThan(1000);
    expect(after).toBeLessThan(ELO.start);
  });

  /** Missing games should make you ordinary, never the opposite of what you were. */
  it("never crosses the starting mark, however many are missed", () => {
    expect(decayed(1400, 5000)).toBeGreaterThanOrEqual(ELO.start);
    expect(decayed(1000, 5000)).toBeLessThanOrEqual(ELO.start);
  });
});

describe("computeRatings and matches missed", () => {
  /** Games the squad played without you, not weeks on the calendar. */
  const withoutThem = (count: number) =>
    Array.from({ length: count }, (_, i) =>
      match(["x"], ["y"], 1, 0, `2026-02-${String(i + 1).padStart(2, "0")}`)
    );

  it("drifts a player the squad kept playing without", () => {
    const opener = match(["a"], ["b"], 5, 0, "2026-01-01");
    const ratings = computeRatings([
      opener,
      ...withoutThem(ELO.decay.graceMatches + 6),
    ]);

    const a = ratings.get("a")!;
    expect(a.drift).toBeGreaterThan(0);
    expect(a.missed).toBe(ELO.decay.graceMatches + 6);
    expect(a.rating).toBeLessThan(a.history.at(-1)!.rating);
  });

  /**
   * The whole reason this counts matches rather than weeks. A league that stops
   * for the summer used to age every rating in it, which is nothing anybody did.
   */
  it("costs nothing when the whole league stops", () => {
    const fixtures = [
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      match(["a"], ["b"], 5, 0, "2026-01-08"),
    ];
    const ratings = computeRatings(fixtures);

    expect(ratings.get("a")!.drift).toBe(0);
    expect(ratings.get("a")!.missed).toBe(0);
  });

  it("does not drift somebody who played the last game", () => {
    const ratings = computeRatings([match(["a"], ["b"], 3, 1, "2026-01-01")]);

    expect(ratings.get("a")!.drift).toBe(0);
    expect(ratings.get("a")!.missed).toBe(0);
  });

  it("rates a returning player on what they walk in with", () => {
    const opener = match(["a"], ["b"], 5, 0, "2026-01-01");
    const comeback = match(["a"], ["b"], 5, 0, "2026-03-01");

    const straight = computeRatings([opener, comeback]);
    const afterABreak = computeRatings([
      opener,
      ...withoutThem(ELO.decay.graceMatches + 8),
      comeback,
    ]);

    // Having drifted back towards level while away, the comeback win opens a
    // smaller gap than the same win in an uninterrupted run.
    expect(afterABreak.get("a")!.rating).toBeLessThan(
      straight.get("a")!.rating
    );
  });

  /**
   * The latest change is about the squad's last match, not the player's. A
   * regular who sat one out should read as flat or drifting, and it used to
   * show whatever their own last game did — a confident rise beside somebody
   * who had not turned out for months.
   */
  it("reports the last match for somebody who was in it", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 3, 1, "2026-01-01"),
      match(["a"], ["b"], 3, 1, "2026-01-08"),
    ]);

    const a = ratings.get("a")!;
    expect(a.missed).toBe(0);
    expect(a.lastChange).toBeCloseTo(a.history.at(-1)!.change);
    expect(a.lastChange).toBeGreaterThan(0);
  });

  it("reports nothing moving for somebody inside the grace", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      ...withoutThem(1),
    ]);

    const a = ratings.get("a")!;
    expect(a.missed).toBe(1);
    expect(a.lastChange).toBe(0);
  });

  it("reports a fall for a strong player who missed it, beyond the grace", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      ...withoutThem(ELO.decay.graceMatches + 3),
    ]);

    const a = ratings.get("a")!;
    // Above the starting mark and drifting back down towards it.
    expect(a.rating).toBeGreaterThan(ELO.start);
    expect(a.lastChange).toBeLessThan(0);
  });

  it("reports a rise for a weak player who missed it, drifting back up", () => {
    const ratings = computeRatings([
      match(["b"], ["a"], 5, 0, "2026-01-01"),
      ...withoutThem(ELO.decay.graceMatches + 3),
    ]);

    const a = ratings.get("a")!;
    expect(a.rating).toBeLessThan(ELO.start);
    expect(a.lastChange).toBeGreaterThan(0);
  });

  /**
   * A chart drawn from `history` alone stops at whenever somebody last played,
   * so a rating that has drifted thirty points looks like one holding steady.
   */
  it("carries the line on for every match missed", () => {
    const ratings = computeRatings([
      match(["a"], ["b"], 5, 0, "2026-01-01"),
      ...withoutThem(ELO.decay.graceMatches + 5),
    ]);

    const a = ratings.get("a")!;
    expect(a.drifted).toHaveLength(ELO.decay.graceMatches + 5);
    // Ends exactly where the rating now stands.
    expect(a.drifted.at(-1)!.rating).toBeCloseTo(a.rating);
    // Flat through the grace — the first missed match costs nothing — and
    // falling after it.
    const beforeAnyDrift = a.rating + a.drift;
    expect(a.drifted[0].rating).toBeCloseTo(beforeAnyDrift);
    expect(a.drifted[ELO.decay.graceMatches - 1].rating).toBeCloseTo(beforeAnyDrift);
    expect(a.drifted.at(-1)!.rating).toBeLessThan(beforeAnyDrift);
    // Each point carries the date of the match it sat out.
    expect(a.drifted[0].date).toBe("2026-02-01");
  });

  it("leaves no tail on somebody who played the last match", () => {
    const ratings = computeRatings([match(["a"], ["b"], 3, 1, "2026-01-01")]);
    expect(ratings.get("a")!.drifted).toEqual([]);
  });

  it("rates somebody from their very first game", () => {
    const ratings = computeRatings([match(["a"], ["b"], 3, 1, "2026-01-01")]);

    const a = ratings.get("a")!;
    expect(a.games).toBe(1);
    // Rated immediately, and flagged as still finding its level rather than
    // withheld — a squad two weeks old had an empty table before.
    expect(a.rating).not.toBe(ELO.start);
    expect(a.unsettled).toBe(true);
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

describe("a match's pot is conserved", () => {
  const sumChanges = (ratings: Map<string, PlayerRating>, ids: string[]) =>
    ids.reduce((total, id) => total + ratings.get(id)!.history.at(-1)!.change, 0);

  it("sums to zero across all ten deltas in an even match", () => {
    const teamA = ["a1", "a2", "a3", "a4", "a5"];
    const teamB = ["b1", "b2", "b3", "b4", "b5"];
    const ratings = computeRatings([match(teamA, teamB, 3, 1)]);

    expect(sumChanges(ratings, [...teamA, ...teamB])).toBeCloseTo(0, 9);
  });

  it("still sums to zero with a wide rating spread on one side", () => {
    // Spread team A out well before the decider: two pulled up, two pulled
    // down, one left level. This is the shape that breaks a scheme built on
    // ten separate per-player expectations, since those don't sum to five.
    const warmUps = [
      ...Array.from({ length: 8 }, (_, i) => match(["a1"], [`u${i}`], 1, 0)),
      ...Array.from({ length: 8 }, (_, i) => match(["a2"], [`v${i}`], 1, 0)),
      ...Array.from({ length: 8 }, (_, i) => match([`w${i}`], ["a4"], 1, 0)),
      ...Array.from({ length: 8 }, (_, i) => match([`z${i}`], ["a5"], 1, 0)),
    ];
    const teamA = ["a1", "a2", "a3", "a4", "a5"];
    const teamB = ["b1", "b2", "b3", "b4", "b5"];

    const ratings = computeRatings([...warmUps, match(teamA, teamB, 2, 1)]);

    expect(sumChanges(ratings, [...teamA, ...teamB])).toBeCloseTo(0, 9);
  });

  it("still sums to zero when the sides are uneven", () => {
    const teamA = ["a1", "a2", "a3", "a4"];
    const teamB = ["b1", "b2", "b3", "b4", "b5"];
    const ratings = computeRatings([match(teamA, teamB, 2, 1)]);

    expect(sumChanges(ratings, [...teamA, ...teamB])).toBeCloseTo(0, 9);
  });
});

describe("sharing a result out across a side", () => {
  /**
   * Form decides the split, and only form. Two other things could have —
   * how good a player is, and how long they have been about — and both are
   * deliberately kept out of it. Strength, because sides are picked level,
   * so the better man is nearly always the one above his side's mean, and
   * paying him less for a win than charging him for a defeat walks every
   * outlier back towards the start until the table is flat. Experience,
   * because a team result carries nothing that says who earned it.
   */

  /**
   * Five nights where one of them wins and the other loses, so both walk into
   * the sixth having played every match — the only difference between them
   * being how those matches went. Running the two through separate fixtures
   * would leave each of them absent for the other's, and an absence is part
   * of a run now.
   */
  const oneEach = Array.from({ length: 5 }, () => match(["hot"], ["cold"], 1, 0));

  it("gives the man in form more of a win than the man out of it", () => {
    const ratings = computeRatings([
      ...oneEach,
      match(["hot", "cold"], ["x", "y"], 1, 0),
    ]);

    const hot = ratings.get("hot")!.history.at(-1)!;
    const cold = ratings.get("cold")!.history.at(-1)!;

    expect(hot.change).toBeGreaterThan(0);
    expect(cold.change).toBeGreaterThan(0);
    expect(hot.change).toBeGreaterThan(cold.change);
  });

  /**
   * The other side of the same coin, and the price of it: whoever swings
   * hardest one way swings hardest the other. Deliberate — a share that
   * knew which way the result went would drift the table, and a share
   * settled before kick-off cannot.
   */
  it("and more of a defeat, being the same share either way", () => {
    const ratings = computeRatings([
      ...oneEach,
      match(["hot", "cold"], ["x", "y"], 0, 1),
    ]);

    const hot = ratings.get("hot")!.history.at(-1)!;
    const cold = ratings.get("cold")!.history.at(-1)!;

    expect(hot.change).toBeLessThan(0);
    expect(hot.change).toBeLessThan(cold.change);
  });

  it("takes no notice of how good the two of them are", () => {
    // Both walk in on the same run of results, so the only thing left to
    // tell them apart is the rating itself — which must not count.
    const apart = [
      ...Array.from({ length: 6 }, (_, i) => match(["rich"], [`gift${i}`], 1, 0)),
      ...Array.from({ length: 6 }, (_, i) => match([`hard${i}`], ["poor"], 1, 0)),
    ];
    const together = Array.from({ length: 5 }, (_, i) =>
      match(["rich", "poor"], [`opp${i}`, `opp2${i}`], 1, 0)
    );

    const ratings = computeRatings([
      ...apart,
      ...together,
      match(["rich", "poor"], ["x", "y"], 1, 0),
    ]);

    const rich = ratings.get("rich")!;
    const poor = ratings.get("poor")!;

    expect(rich.rating).toBeGreaterThan(poor.rating + 100);
    expect(rich.history.at(-1)!.change).toBeCloseTo(
      poor.history.at(-1)!.change,
      9
    );
  });

  it("takes no notice of how long they have been about", () => {
    // A veteran and a newer face carrying the same five results.
    const veteran = Array.from({ length: 14 }, (_, i) =>
      match(["vet"], [`v${i}`], i % 2, 1 - (i % 2))
    );
    const together = Array.from({ length: 5 }, (_, i) =>
      match(["vet", "newer"], [`w${i}`, `w2${i}`], 1, 0)
    );

    const ratings = computeRatings([
      ...veteran,
      ...together,
      match(["vet", "newer"], ["x", "y"], 1, 0),
    ]);

    const vet = ratings.get("vet")!;
    const newer = ratings.get("newer")!;

    expect(vet.games).toBeGreaterThan(newer.games + 10);
    expect(vet.history.at(-1)!.change).toBeCloseTo(
      newer.history.at(-1)!.change,
      9
    );
  });

  it("gives a debutant an even share, and flags them rather than favours them", () => {
    // A player with one win and one defeat behind them sits exactly at par,
    // which is where somebody with no games at all is assumed to be.
    const par = [
      match(["par"], ["p1"], 1, 0),
      match(["par"], ["p2"], 0, 1),
    ];

    const ratings = computeRatings([
      ...par,
      match(["debutant", "par"], ["x", "y"], 1, 0),
    ]);

    const debutant = ratings.get("debutant")!;
    const atPar = ratings.get("par")!;

    expect(debutant.games).toBe(1);
    expect(debutant.history.at(-1)!.change).toBeCloseTo(
      atPar.history.at(-1)!.change,
      9
    );
    expect(debutant.unsettled).toBe(true);
  });

  /**
   * The run the share is worked out from is the same one the table draws
   * beside a name: the squad's last five nights, with the ones somebody was
   * missing marked. A strip that skipped them would be telling a different
   * story from the number next to it.
   */
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

  it("takes less out of a win for somebody who has been missing", () => {
    const fixtures = [
      // Both win their first, so neither has an edge from the result itself.
      match(["kept", "missed"], ["x", "y"], 1, 0),
      // Three nights only one of them turns out for.
      ...Array.from({ length: 3 }, () => match(["kept"], ["x"], 1, 0)),
      match(["kept", "missed"], ["x", "y"], 1, 0),
    ];

    const ratings = computeRatings(fixtures);
    const kept = ratings.get("kept")!.history.at(-1)!.change;
    const missed = ratings.get("missed")!.history.at(-1)!.change;

    expect(kept).toBeGreaterThan(missed);
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

  it("keeps the match zero-sum however lopsided the form on it", () => {
    const teamA = ["a1", "a2", "a3", "a4", "a5"];
    const teamB = ["b1", "b2", "b3", "b4", "b5"];
    // Four of the ten walk in on runs as far apart as runs get: two who have
    // won every week, two who have not turned out at all.
    const ratings = computeRatings([
      ...Array.from({ length: 5 }, () => match(["a1", "b1"], ["x", "y"], 1, 0)),
      match(teamA, teamB, 1, 0),
    ]);

    const total = [...teamA, ...teamB].reduce(
      (sum, id) => sum + ratings.get(id)!.history.at(-1)!.change,
      0
    );
    expect(total).toBeCloseTo(0, 9);
  });
});

