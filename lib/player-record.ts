import type { PlayerRecord } from "@/types";

/**
 * The pure half of a player's record: what it means, rather than how it is
 * fetched.
 *
 * Split from `player-stats` because that module reaches for the database on
 * import, which drags a Supabase client — and its environment — into
 * anything that only wanted the arithmetic. `player-stats` re-exports both of
 * these, so there is still one definition and one place to import from.
 */

/** Wins as a share of games played. Zero games is 0, not a division by zero. */
export const winRate = (record: Pick<PlayerRecord, "wins" | "played">): number =>
  record.played > 0 ? record.wins / record.played : 0;

/** An empty record, so a player with no games renders zeroes rather than gaps. */
export const emptyRecord = (playerId: string, playerName: string): PlayerRecord => ({
  playerId,
  playerName,
  playerImage: null,
  isActive: true,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  points: 0,
});
