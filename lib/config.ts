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
   * Ratings drift back towards `start` while a player is away.
   *
   * The trade-off is real and worth stating: missing a Tuesday is not evidence
   * that anyone got worse, so a player returning from a break is rated below
   * their ability and the side they are picked into is stronger than the split
   * thinks. What it buys is a ladder where every week is comparable and a good
   * run two years ago does not hold the top of the table for ever.
   *
   * `graceWeeks` covers the ordinary gaps — a holiday, an injury, a week off —
   * so nothing moves for the great majority of absences.
   */
  decay: {
    graceWeeks: 3,
    /** Of the distance back to `start`, per week away beyond the grace. */
    perWeek: 0.05,
  },

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
 * Five steps because people can tell one end from the other and cannot
 * reliably tell 68 from 71. Deliberately unlabelled: naming the steps invited
 * an argument about whether "ringer" meant the best player or the worst, which
 * is not a question a number needs to raise. It is drawn as five pips.
 */
export const SKILL = {
  min: 1,
  max: 5,
  default: 3,
} as const;

/** What the two sides are called on screen. Team A is the one in bibs. */
export const SIDE_NAMES = { A: "Bibs", B: "No bibs" } as const;
