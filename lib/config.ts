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
 *
 * The result is one pot per side, sized off `kEstablished` and however many
 * played, and shared across the side rather than handed to each player
 * whole. That is what keeps a match exactly zero-sum: what a side is due
 * never depends on who is standing in it. `lib/elo.ts` can share a pot out
 * unevenly through a `Weigher`, but nothing does by default.
 */
export const ELO = {
  /** Everyone starts level. The number is arbitrary; only differences matter. */
  start: 1200,

  /**
   * The size of a match's pot, per player on the fuller side.
   *
   * Sets how far one night can move anybody, and with it how much of the
   * table's spread is real rather than rounding. It is paired with the decay
   * below: pulling absent ratings back towards `start` faster shrinks the
   * whole table with them, and this is what holds the spread open against
   * that. Moving one without the other flattens the ladder or stiffens it.
   */
  kEstablished: 44,
  /**
   * A provisional player's weight under `uncertaintyWeigher`, which is not
   * the default. Nothing reads this unless a caller asks for that weigher.
   * Only its ratio to `kEstablished` matters, weights being normalised.
   */
  kProvisional: 72,
  provisionalGames: 10,

  /**
   * Ratings drift back towards `start` for matches a player missed.
   *
   * Counted in matches the rest of the squad played without them, not weeks on
   * the calendar. Wall-clock decay meant a summer with no football aged every
   * rating at once — thirty-nine-game regulars sagging fifty points for a break
   * they had no part in — when nothing had happened to compare anyone on.
   * Absence only means something when there was something to be absent from.
   *
   * The trade-off stands either way: missing a Tuesday is not evidence that
   * anyone got worse, so a player returning is rated below their ability and
   * the side they are picked into is stronger than the split thinks. What it
   * buys is a ladder that keeps up with who is actually turning out.
   *
   * `graceMatches` covers the ordinary gaps — a holiday, an injury, a couple of
   * weeks off — so nothing moves for the great majority of absences.
   *
   * The drift does more than mark absence: pulling a stale rating back
   * towards `start` also walks off whatever it had got wrong, so a player
   * whose game has moved on is met halfway rather than having to win the
   * whole distance back. That is most of why the table now keeps up with a
   * player who improves. It costs spread, which `kEstablished` pays back.
   */
  decay: {
    graceMatches: 2,
    /** Of the distance back to `start`, per missed match beyond the grace. */
    perMatch: 0.08,
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
