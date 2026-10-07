/**
 * Every tunable value lives here. Nothing in the app should inline a rating,
 * threshold or page size — import it, so there is one place to change it.
 */

/**
 * The rating model.
 *
 * Elo's scale and Elo's arithmetic — everyone starts on 1200, 400 points
 * between two sides makes one about a ten-to-one favourite, and each game
 * moves a side by `k` times how far the result beat or fell short of what it
 * was expected to take — with one change: a game's effect fades. Each
 * game's verdict is settled on the night from the ratings as they stood and
 * never revisited, and then counts for less with every match the squad plays,
 * halving every `halfLife` of them however old it gets, and never cut off.
 *
 * A running total never forgets, so a great spell two years ago went on
 * holding a rating up long after the player had stopped being that player.
 * Fading forgets on purpose, and ages everybody's games at the same rate
 * whether they played the matches since or not.
 *
 * Tuned by replaying simulated seasons — five-a-side, picked roughly level,
 * irregular turnout, some players improving and some fading. Settling each
 * game on the night ranked players and called results a little behind
 * refitting every rating from the recent matches each week in most of those
 * squads, and a little ahead in one. It is chosen for the thing people expect
 * of a rating: what a game was worth is decided when it is played, and later
 * results cannot reach back and change it.
 */
export const ELO = {
  /** Everyone starts level. The number is arbitrary; only differences matter. */
  start: 1200,

  /**
   * Matches the squad has played since a game, after which it counts half as
   * much towards a rating as the latest.
   */
  halfLife: 20,

  /**
   * How far one game can move a side: the most it can take from a win
   * nobody gave it a chance in, or give up in a defeat it was sure of. An
   * even game is worth half this either way. Classic Elo's figure; in the
   * simulations it called results a shade better than 24 and ranked about
   * the same.
   */
  k: 32,

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

/** How many results the W/D/L strip shows. */
export const RESULTS_SHOWN = 5;

/**
 * Points for a win and for a draw are deliberately NOT here. They live in the
 * `season_player_stats` view, which is what the table is actually computed
 * from — a copy in TypeScript would be a second answer to the same question.
 */

/**
 * What "recent" means wherever a stretch of matches can be picked or a
 * player can be said to have gone quiet: the squad's last forty, by which
 * point a game counts for a quarter of a rating.
 */
export const RECENT_MATCHES = 40;

/** What the two sides are called on screen. Team A is the one in bibs. */
export const SIDE_NAMES = { A: "Bibs", B: "No bibs" } as const;
