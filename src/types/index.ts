
// Re-export all types from separate files
export * from "./team";

// Player types
export interface PlayerStats {
  played: number;
  won: number;
  lost: number;
  drawn: number;
}

export interface Player {
  id: string;
  name: string;
  position?: string;
  number?: number;
  dateOfBirth?: string;
  nationality?: string;
  height?: number;
  weight?: number;
  preferredFoot?: string;
  description?: string;
  imageUrl?: string;
  image: string | null;
  stats: PlayerStats;
  createdAt: string;
  updatedAt: string;
  team_id?: string;
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
  createdAt: string;
  updatedAt: string;
  seasonId?: string;
  team_id?: string;
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
  team_id?: string;
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

export interface PlayerForm {
  playerId: string;
  playerName: string;
  form: PlayerFormResult[];
}
