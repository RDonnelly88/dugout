import { describe, expect, it } from "vitest";
import { initials, shareCard } from "@/lib/share-card";
import type { Match, PlayerFormResult } from "@/types";

const sides = { A: "Bibs", B: "No bibs" };
const nameOf = (id: string) => ({ p1: "Ross Donnelly", p2: "Sam" })[id] ?? id;

function match(over: Partial<Match> = {}): Match {
  return {
    id: "m1",
    date: "2026-08-11",
    teamA: { name: "Bibs", players: ["p1"], score: 5 },
    teamB: { name: "No bibs", players: ["p2"], score: 3 },
    status: "completed",
    outcome: "a",
    createdAt: "2026-08-11",
    updatedAt: "2026-08-11",
    ...over,
  };
}

describe("shareCard", () => {
  it("names the winners and the score", () => {
    const card = shareCard(match(), sides, nameOf)!;

    expect(card.headline).toBe("Bibs win 5–3");
    expect(card.a.won).toBe(true);
    expect(card.b.won).toBe(false);
  });

  it("puts the bigger number first however the sides line up", () => {
    const card = shareCard(
      match({
        outcome: "b",
        teamA: { name: "Bibs", players: ["p1"], score: 1 },
        teamB: { name: "No bibs", players: ["p2"], score: 4 },
      }),
      sides,
      nameOf
    )!;

    expect(card.headline).toBe("No bibs win 4–1");
  });

  it("says who won when nobody counted the goals", () => {
    const card = shareCard(
      match({
        teamA: { name: "Bibs", players: ["p1"] },
        teamB: { name: "No bibs", players: ["p2"] },
      }),
      sides,
      nameOf
    )!;

    expect(card.headline).toBe("Bibs win it");
    expect(card.a.score).toBeUndefined();
  });

  it("calls a draw a draw", () => {
    const card = shareCard(
      match({
        outcome: "draw",
        teamA: { name: "Bibs", players: ["p1"], score: 2 },
        teamB: { name: "No bibs", players: ["p2"], score: 2 },
      }),
      sides,
      nameOf
    )!;

    expect(card.headline).toBe("Honours even, 2–2");
    expect(card.a.won).toBe(false);
    expect(card.b.won).toBe(false);
  });

  /** A card reading "not played yet" is worse than no card. */
  it("has no picture for a fixture nobody has played", () => {
    expect(shareCard(match({ status: "scheduled" }), sides, nameOf)).toBeNull();
  });

  it("uses the squad's own words for its sides", () => {
    const card = shareCard(match(), { A: "Reds", B: "Blues" }, nameOf)!;

    expect(card.a.name).toBe("Reds");
    expect(card.headline).toBe("Reds win 5–3");
  });

  it("turns the ids into names", () => {
    const card = shareCard(match(), sides, nameOf)!;

    expect(card.a.players.map((p) => p.name)).toEqual(["Ross Donnelly"]);
    expect(card.b.players.map((p) => p.name)).toEqual(["Sam"]);
  });

  /**
   * The card goes to people who are not looking at the app, so it cannot take
   * its date format from whichever phone rendered it.
   */
  it("writes the date the same way wherever it is made", () => {
    const card = shareCard(match({ date: "2026-08-11" }), sides, nameOf)!;

    expect(card.date).toBe("Tue, 11 August 2026");
  });

  it("carries the pitch when there is one", () => {
    expect(shareCard(match({ location: "Powerleague" }), sides, nameOf)!.location).toBe(
      "Powerleague"
    );
    expect(shareCard(match({ location: "" }), sides, nameOf)!.location).toBeUndefined();
  });
});

describe("initials", () => {
  it("takes the first and last of a full name", () => {
    expect(initials("Ross Donnelly")).toBe("RD");
    expect(initials("Ross James Donnelly")).toBe("RD");
  });

  it("takes two letters from a single name", () => {
    expect(initials("Sam")).toBe("SA");
  });

  it("has something to draw for a name that is barely one", () => {
    expect(initials("  ")).toBe("?");
    expect(initials("x")).toBe("X");
  });
});

describe("the blurb", () => {
  const scored = (a: number, b: number) =>
    shareCard(
      match({
        outcome: a > b ? "a" : a < b ? "b" : "draw",
        teamA: { name: "Bibs", players: ["p1"], score: a },
        teamB: { name: "No bibs", players: ["p2"], score: b },
      }),
      sides,
      nameOf
    )!.blurb;

  it("says how it felt rather than repeating the score", () => {
    expect(scored(3, 2)).toBe("Nothing in it");
    expect(scored(5, 2)).toBe("Comfortable enough");
    expect(scored(9, 1)).toBe("A hammering");
    expect(scored(2, 2)).toBe("Honours even");
  });

  it("reads the margin the same way round whoever won", () => {
    expect(scored(1, 9)).toBe("A hammering");
  });

  /** With no goals recorded there is no margin to describe. */
  it("falls back to who won when nobody counted", () => {
    const card = shareCard(
      match({
        teamA: { name: "Bibs", players: ["p1"] },
        teamB: { name: "No bibs", players: ["p2"] },
      }),
      sides,
      nameOf
    )!;

    expect(card.blurb).toBe("Bibs win it");
  });
});

describe("what the night was worth", () => {
  it("puts each player's swing beside them", () => {
    const card = shareCard(match(), sides, nameOf, {
      changes: new Map([
        ["p1", 18.4],
        ["p2", -18.4],
      ]),
    })!;

    expect(card.a.players[0].change).toBeCloseTo(18.4);
    expect(card.b.players[0].change).toBeCloseTo(-18.4);
  });

  /** A player deleted since the match still has a shirt on the night. */
  it("leaves the swing off anybody the ladder has never heard of", () => {
    const card = shareCard(match(), sides, nameOf, { changes: new Map() })!;
    expect(card.a.players[0].change).toBeUndefined();
  });
});

describe("the tables under the result", () => {
  const ladder = [
    { playerId: "p3", name: "Chris", rating: 1301.6 },
    { playerId: "p1", name: "Ross Donnelly", rating: 1288.2 },
    { playerId: "p4", name: "Danny", rating: 1250 },
    { playerId: "p5", name: "Ally", rating: 1210 },
    { playerId: "p6", name: "Paul", rating: 1190 },
    { playerId: "p7", name: "Ewan", rating: 1150 },
  ];

  // Deliberately not the ladder's order: p1 is second by rating and third on
  // points, and p2 is outside the five rows the card has room to draw.
  const standings = [
    { playerId: "p3", name: "Chris", points: 31, played: 12, wins: 10 },
    { playerId: "p4", name: "Danny", points: 28, played: 12, wins: 9 },
    { playerId: "p1", name: "Ross Donnelly", points: 26, played: 11, wins: 8 },
    { playerId: "p5", name: "Ally", points: 22, played: 10, wins: 7 },
    { playerId: "p6", name: "Paul", points: 19, played: 9, wins: 6 },
    { playerId: "p2", name: "Sam", points: 14, played: 8, wins: 4 },
  ];

  it("takes the top five and no more", () => {
    const card = shareCard(match(), sides, nameOf, { ladder })!;

    expect(card.ladder).toHaveLength(5);
    expect(card.ladder.at(-1)!.name).toBe("Paul");
  });

  it("rounds a rating rather than drawing four decimal places", () => {
    const card = shareCard(match(), sides, nameOf, { ladder })!;
    expect(card.ladder[0].figure).toBe(1302);
  });

  /** The tables are there to answer "and where does that leave us?". */
  it("marks whoever was in this match", () => {
    const card = shareCard(match(), sides, nameOf, { ladder })!;

    expect(card.ladder[0].played).toBe(false);
    expect(card.ladder[1].played).toBe(true);
  });

  it("carries the season's own name over its table", () => {
    const card = shareCard(match(), sides, nameOf, {
      standings: [
        { playerId: "p1", name: "Ross Donnelly", points: 26, played: 11, wins: 8 },
      ],
      seasonName: "Winter 2026",
    })!;

    expect(card.standingsTitle).toBe("Season Winter 2026");
    expect(card.standings[0]).toEqual({
      name: "Ross Donnelly",
      figure: 26,
      played: true,
      place: 1,
    });
  });

  /** "August 2026" over a column of numbers reads as a date, not a season. */
  it("says what the name is the name of", () => {
    const titleFor = (seasonName?: string) =>
      shareCard(match(), sides, nameOf, { seasonName })!.standingsTitle;

    expect(titleFor("August 2026")).toBe("Season August 2026");
    expect(titleFor()).toBe("League table");
  });

  it("does not say it twice for a squad who have said it themselves", () => {
    const titleFor = (seasonName: string) =>
      shareCard(match(), sides, nameOf, { seasonName })!.standingsTitle;

    expect(titleFor("Season 4")).toBe("Season 4");
    expect(titleFor("season two")).toBe("season two");
    expect(titleFor("Seasonal five-a-side")).toBe("Season Seasonal five-a-side");
  });

  /** A squad with nothing to rank says nothing rather than drawing a stub. */
  it("has no tables when it is told of none", () => {
    const card = shareCard(match(), sides, nameOf)!;

    expect(card.ladder).toEqual([]);
    expect(card.standings).toEqual([]);
    expect(card.standingsTitle).toBe("League table");
  });

  /**
   * The table shows the top five and everybody else is somewhere below it, so
   * a place beside a name is the only way the card answers "and me?".
   */
  it("gives each player their place in the league", () => {
    const card = shareCard(match(), sides, nameOf, { standings })!;

    expect(card.a.players[0].rank).toBe(3);
  });

  /**
   * The two tables order the same squad differently, and the number beside a
   * name belongs to the one it is nearest in meaning: a season is played for
   * points, not for a rating.
   */
  it("takes the place from the league rather than the ladder", () => {
    const card = shareCard(match(), sides, nameOf, { ladder, standings })!;

    // Second on the ladder, third in the league.
    expect(card.a.players[0].rank).toBe(3);
  });

  it("places a player the table has not cut to, not only the top five", () => {
    const card = shareCard(match(), sides, nameOf, { standings })!;

    expect(card.standings).toHaveLength(5);
    expect(card.b.players[0].rank).toBe(6);
  });

  it("leaves the place off anybody the league has never heard of", () => {
    const card = shareCard(match(), sides, nameOf, { standings: [] })!;

    expect(card.a.players[0].rank).toBeUndefined();
  });

  /**
   * The season page settles a tie on points by games played and then wins, and
   * gives two players who match on all three the same number. A card saying
   * somebody is third while the table they are looking at says joint first is
   * the same squad being told two different things.
   */
  it("settles a tie the way the season page settles it", () => {
    const level = [
      { playerId: "p3", name: "Chris", points: 26, played: 12, wins: 8 },
      { playerId: "p1", name: "Ross Donnelly", points: 26, played: 12, wins: 8 },
      { playerId: "p2", name: "Sam", points: 26, played: 9, wins: 8 },
    ];

    const card = shareCard(match(), sides, nameOf, { standings: level })!;

    // Level on all three with Chris, so they share the place rather than one
    // of them being second by the order they happened to arrive in.
    expect(card.a.players[0].rank).toBe(1);
    // Same points, fewer games: behind both of them.
    expect(card.b.players[0].rank).toBe(3);
  });

  /**
   * Three players level on a league share a number beside their names, so the
   * table has to say the same thing. Counting the rows off gives the third of
   * them a 3 under a name the card has just called joint first.
   */
  it("numbers a tie in the table the way it numbers it beside a name", () => {
    const level = [
      { playerId: "p3", name: "Chris", points: 26, played: 12, wins: 8 },
      { playerId: "p1", name: "Ross Donnelly", points: 26, played: 12, wins: 8 },
      { playerId: "p4", name: "Danny", points: 26, played: 12, wins: 8 },
      { playerId: "p5", name: "Ally", points: 20, played: 12, wins: 6 },
    ];

    const card = shareCard(match(), sides, nameOf, { standings: level })!;

    expect(card.standings.map((row) => row.place)).toEqual([1, 1, 1, 4]);
    expect(card.a.players[0].rank).toBe(1);
  });

  /** A rating is a measurement, so its table is numbered straight down. */
  it("numbers the ladder by its rows", () => {
    const card = shareCard(match(), sides, nameOf, { ladder })!;

    expect(card.ladder.map((row) => row.place)).toEqual([1, 2, 3, 4, 5]);
  });

  /** Points first, then games played — not whatever order the view returned. */
  it("orders the table itself rather than trusting what it was handed", () => {
    const jumbled = [
      { playerId: "p2", name: "Sam", points: 14, played: 8, wins: 4 },
      { playerId: "p3", name: "Chris", points: 31, played: 12, wins: 10 },
      { playerId: "p1", name: "Ross Donnelly", points: 26, played: 11, wins: 8 },
    ];

    const card = shareCard(match(), sides, nameOf, { standings: jumbled })!;

    expect(card.standings.map((row) => row.name)).toEqual([
      "Chris",
      "Ross Donnelly",
      "Sam",
    ]);
    expect(card.a.players[0].rank).toBe(2);
  });
});

describe("the run each player is on", () => {
  const run: PlayerFormResult[] = ["win", "dnp", "loss", "win", "draw"];

  it("puts it beside them, newest first", () => {
    const card = shareCard(match(), sides, nameOf, {
      form: new Map([["p1", run]]),
    })!;

    expect(card.a.players[0].form).toEqual(run);
  });

  /** Nothing to draw for somebody the window has no record of. */
  it("leaves it off anybody with no recent nights", () => {
    const card = shareCard(match(), sides, nameOf, { form: new Map() })!;

    expect(card.a.players[0].form).toBeUndefined();
  });
});
