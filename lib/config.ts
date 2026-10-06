/**
 * Every tunable value lives here. Nothing in the app should inline a rating,
 * threshold or page size — import it, so there is one place to change it.
 */

/**
 * The rating model.
 *
 * Elo's scale — everyone starts on 1200, and 400 points between two sides
 * makes one about a ten-to-one favourite — but not Elo's arithmetic. Rather
 * than nudging a running total after every game, the table is fitted afresh
 * after every match from the squad's recent matches: the ratings that best
 * explain who beat whom, with a side worth the mean of its players.
 *
 * A running total never forgets. A great spell two years ago went on holding
 * a rating up long after the player had stopped being that player. A window
 * over the squad's matches forgets on purpose, and ages everybody's games at
 * the same rate whether they played the matches since or not.
 *
 * Tuned by replaying simulated seasons — five-a-side, picked roughly level,
 * irregular turnout, some players improving and some fading — and scoring
 * each setting on how well it called the next result and how closely it
 * ranked the true order. A shorter memory notices a change of form sooner
 * and ranks everybody else worse for it, because a five-a-side result says
 * very little about any one of the ten. Thirty matches is a choice
 * about what the table should describe — roughly the last season of games —
 * rather than the sixty that ranked best in those tests. Counting the window in each player's
 * own games instead of the squad's matches ranked noticeably better in the
 * same tests, at the cost of an absent player's rating standing still rather
 * than easing back.
 */
export const ELO = {
  /** Everyone starts level. The number is arbitrary; only differences matter. */
  start: 1200,

  /**
   * Matches the squad has played since a game, after which it counts half as
   * much towards a rating as the latest.
   */
  halfLife: 15,

  /**
   * Matches the squad has played since a game, after which it no longer
   * counts at all. Paired with `halfLife`: by the time a game drops out it is
   * already counting for a quarter, so nobody's rating lurches the week an
   * old result leaves.
   */
  window: 30,

  /**
   * How far apart the squad is assumed to be before any results come in, in
   * rating points.
   *
   * Every rating is pulled towards `start` with this much give, so it takes
   * results to move one and a single win cannot make anybody a world-beater.
   * Smaller, and the table is cautious and bunched; larger, and it believes
   * every hot streak. It is also what a player with few games behind them
   * leans on most, which is why a debutant's number moves further on one
   * result than a regular's does.
   */
  spread: 200,

  /**
   * Games before a rating stops being flagged as a rough guess.
   *
   * A label on the confidence of a number, never a lever on it.
   */
  settledAfter: 10,

  /**
   * Matches missed in a row before the table notes that somebody has been
   * away, and that their rating is easing back towards `start` as their games
   * age.
   */
  awayAfter: 4,
} as const;

/**
 * Expected wins: results measured against what the ratings expected.
 *
 * Before every match the ratings give each side a chance of winning; a side
 * that wins a game it was given 40% for has beaten the odds by 0.6 of a win,
 * and one that loses it was only expected to take 0.4. Summed over the games
 * a player, a pair or a whole line-up shared, that is how far they ran ahead
 * of, or behind, the side they were picked into.
 */
export const XW = {
  /**
   * Games together before a verdict is offered at all. Below this the figures
   * are shown but called too early: four games is a fortnight's luck.
   */
  minGames: 5,

  /**
   * How wide the band of ordinary luck is, in standard deviations of the
   * results those games could have produced. Two covers about nineteen
   * results in twenty, so anything outside it is unlikely to be chance.
   */
  luckWidth: 2,
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
