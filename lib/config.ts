/**
 * Every tunable value lives here. Nothing in the app should inline a rating,
 * threshold or page size — import it, so there is one place to change it.
 */

/**
 * The rating model.
 *
 * Elo was built for one-on-one chess, so a five-a-side needs two decisions
 * made explicitly: what a team's rating is, and how a result is shared out.
 * A side is rated at the mean of its players, and everyone on it takes the
 * same adjustment — you win as a team.
 */
export const ELO = {
  /** Everyone starts level. The number is arbitrary; only differences matter. */
  start: 1200,

  /**
   * How far a single result can move a rating.
   *
   * Higher while a player is new, so a squad's order sorts itself out over a
   * few weeks rather than a season. After `provisionalGames` the rating is
   * treated as established and settles down.
   */
  kProvisional: 40,
  kEstablished: 24,
  provisionalGames: 10,

  /**
   * A thrashing counts for more than a scrape, but not proportionally — a
   * 9–0 is not nine times the evidence of a 1–0, it is one team having a
   * night. The multiplier steps up per goal and stops.
   */
  marginStep: 0.25,
  maxMarginMultiplier: 1.75,
} as const;

/** How many results the form strip shows. */
export const FORM_LENGTH = 5;

/**
 * Points for a win and for a draw are deliberately NOT here. They live in the
 * `season_player_stats` view, which is what the table is actually computed
 * from — a copy in TypeScript would be a second answer to the same question.
 */

/**
 * The hand-set ability scale.
 *
 * Five steps because people can tell "decent" from "good" and cannot reliably
 * tell 68 from 71. The labels are shown next to the number so two people
 * setting it mean roughly the same thing.
 */
export const SKILL = {
  min: 1,
  max: 5,
  default: 3,
  labels: {
    1: "Getting there",
    2: "Steady",
    3: "Decent",
    4: "Good",
    5: "Ringer",
  } as Record<number, string>,
} as const;

/** What the two sides are called on screen. Team A is the one in bibs. */
export const SIDE_NAMES = { A: "Bibs", B: "No bibs" } as const;
