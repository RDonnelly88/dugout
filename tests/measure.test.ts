import { describe, expect, it } from "vitest";
import {
  averagePointsPerGame,
  enoughGames,
  firmness,
  listTone,
  lean,
  pointsPerGame,
  rankBy,
  tone,
} from "@/lib/measure";
import type { Ledger } from "@/lib/expected-wins";

const VALUES = { win: 3, draw: 1 };

const sheet = (wins: number, draws: number, losses: number, above = 0): Ledger => ({
  played: wins + draws + losses,
  wins,
  draws,
  losses,
  actual: wins + draws / 2,
  expected: wins + draws / 2 - above,
  above,
  luck: 1,
  verdict: wins + draws + losses < 5 ? "early" : Math.abs(above) > 1 ? (above > 0 ? "above" : "below") : "luck",
  nights: [],
});

describe("points a game", () => {
  it("counts a win and a draw at what the table says they are worth", () => {
    expect(pointsPerGame(sheet(2, 1, 1), VALUES)).toBe(7 / 4);
    expect(pointsPerGame(sheet(2, 1, 1), { win: 2, draw: 1 })).toBe(5 / 4);
  });

  it("is nought for no games rather than not a number", () => {
    expect(pointsPerGame(sheet(0, 0, 0), VALUES)).toBe(0);
  });

  it("averages over every game, not over every player", () => {
    // One player with ten games at 3 a game and one with a single loss.
    expect(averagePointsPerGame([sheet(10, 0, 0), sheet(0, 0, 1)], VALUES)).toBe(30 / 11);
  });
});

describe("reading a link", () => {
  it("leans by points a game against the baseline for the record", () => {
    expect(lean(sheet(3, 0, 1), "record", VALUES, 1.5)).toBeCloseTo(0.75);
  });

  it("leans by wins above expected for the odds", () => {
    expect(lean(sheet(3, 0, 1, -0.4), "odds", VALUES, 1.5)).toBe(-0.4);
  });

  it("can read ahead on the record and behind on the odds", () => {
    // Won most games, but in sides that should have won more of them.
    const link = sheet(4, 0, 1, -0.6);

    expect(tone(link, "record", VALUES, 1.4)).toBe("ahead");
    expect(tone(link, "odds", VALUES, 1.4)).toBe("behind");
  });

  it("leaves a small lean uncoloured", () => {
    expect(tone(sheet(1, 1, 1), "record", VALUES, 4 / 3 + 0.1)).toBe("level");
  });

  it("draws a link with too few games faintly whatever the result", () => {
    expect(enoughGames(sheet(2, 0, 0))).toBe(false);
    expect(firmness(sheet(2, 0, 0), "record", 10)).toBeLessThan(0.2);
    expect(firmness(sheet(8, 0, 2), "record", 10)).toBeGreaterThan(0.8);
  });
});

describe("ranking by a measure", () => {
  const entry = (id: string, ledger: Ledger) => ({ id, ledger });

  it("ranks by points a game on the record, enough games first", () => {
    const ranked = rankBy(
      [
        entry("lucky", sheet(2, 0, 0)),
        entry("steady", sheet(4, 1, 1)),
        entry("poor", sheet(1, 1, 4)),
      ],
      "record",
      VALUES,
      1.4
    );

    expect(ranked.map((e) => e.id)).toEqual(["steady", "poor", "lucky"]);
  });

  it("ranks the same games differently against the odds", () => {
    const ranked = rankBy(
      [entry("won-a-lot", sheet(5, 0, 1, -0.8)), entry("beat-the-odds", sheet(3, 0, 3, 1.2))],
      "odds",
      VALUES,
      0
    );

    expect(ranked.map((e) => e.id)).toEqual(["beat-the-odds", "won-a-lot"]);
  });
});

describe("the colour of a figure in a list", () => {
  it("stays level on too few games, however good they were", () => {
    expect(listTone(sheet(2, 0, 0), "record", VALUES, 1.4)).toBe("level");
    expect(listTone(sheet(5, 0, 0), "record", VALUES, 1.4)).toBe("ahead");
  });
});
