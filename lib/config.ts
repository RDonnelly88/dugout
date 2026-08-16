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
 * The result is one pot per side, sized off `k` and however many played, and
 * split level across the side rather than handed to each player whole. That
 * is what keeps a match exactly zero-sum: what a side is due never depends
 * on who is standing in it, and what each of them takes never depends on
 * anything but how many of them there were.
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
   *
   * One figure for everybody. A rating built on three games is a shakier
   * guess than one built on forty, but moving the newcomer further is not
   * the way to say so — it means two players on the same side, in the same
   * result, walk off with different numbers, and there is nothing in a team
   * result that justifies telling them apart. `settledAfter` says it instead,
   * and says it in words, without touching anybody's rating.
   */
  k: 44,

  /**
   * Games before a rating stops being flagged as a rough guess.
   *
   * A label on the confidence of a number, never a lever on it: how far a
   * rating moves is `formShare`'s business and nothing to do with this.
   */
  settledAfter: 10,

  /**
   * How far recent form tilts a player's share of their side's pot.
   *
   * Nought splits a result level, as it always was. One lets a man on a
   * perfect run take roughly double the share of a man on none. It changes
   * only who gets what out of the pot, never the size of it, so a match
   * stays exactly zero-sum whatever this is set to.
   *
   * Form is read from the window in `lib/form.ts` — the same figure the
   * match card shows — and it is measured before kick-off, which is what
   * keeps this safe. A share worked out from the result itself would pay a
   * player less for a win than it charged them for a defeat, and that walks
   * everyone towards the middle until the table says nothing.
   */
  formShare: 0.8,

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
   * player who improves. It costs spread, which `k` pays back.
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
