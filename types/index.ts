
// Re-export all types from separate files
export * from "./team";

/**
 * A player. Identity only — no record.
 *
 * What a player has done is derived from completed matches and lives in
 * `PlayerRecord`, read through `usePlayerRecords`. Keeping a tally on the
 * player row is what let a card claim "No matches played" beside a season
 * showing twelve.
 */
export interface Player {
  id: string;
  name: string;
  image: string | null;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  teamId?: string;
  isActive?: boolean;
  /**
   * Hand-set ability, 1 to 5, defaulting to 3.
   *
   * The one figure on a player that a person sets rather than the results
   * deciding. Elo and form both need games behind them; this needs none, which
   * is what makes it useful for somebody's first Tuesday.
   */
  skillLevel?: number;
}

/** A player's all-time record, from the `player_stats` view. */
export interface PlayerRecord {
  playerId: string;
  playerName: string;
  playerImage: string | null;
  isActive: boolean;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
}

// Match types
export interface TeamInfo {
  name: string;
  players: string[];
  score?: number;
}

export type MatchStatus = "pending" | "in_progress" | "completed";

export interface Match {
  id: string;
  date: string;
  location?: string;
  teamA: TeamInfo;
  teamB: TeamInfo;
  status: MatchStatus;
  /**
   * Who won: the first side, the second, or neither. The truth about the
   * result — the score is optional detail that must agree with it.
   */
  outcome?: "a" | "b" | "draw" | null;
  createdAt: string;
  updatedAt: string;
  seasonId?: string;
  teamId?: string;
  notes?: string;
}

// Season types
export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  isFinished: boolean;
  createdAt: string;
  updatedAt: string;
  teamId?: string;
}

export interface SeasonPlayerStats {
  seasonId: string;
  seasonName: string;
  playerId: string;
  playerName: string;
  playerImage: string | null;
  wins: number;
  losses: number;
  draws: number;
  played: number;
  points: number;
}

export interface SeasonChampion extends SeasonPlayerStats {
  rank: number;
}

// Updated to include "dnp" as a valid result
export type PlayerFormResult = "win" | "loss" | "draw" | "dnp";
