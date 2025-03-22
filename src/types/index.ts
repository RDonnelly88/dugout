export interface Player {
  id: string;
  name: string;
  image?: string;
  stats: PlayerStats;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerStats {
  played: number;
  won: number;
  lost: number;
  drawn: number;
}

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
}

export interface TeamInfo {
  name: string;
  score?: number;
  players: string[];
}

export type MatchStatus = "scheduled" | "completed";

export interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  isFinished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeasonPlayerStats {
  seasonId: string;
  seasonName: string;
  playerId: string;
  playerName: string;
  playerImage?: string;
  wins: number;
  losses: number;
  draws: number;
  played: number;
  points: number;
}

export interface SeasonChampion {
  seasonId: string;
  seasonName: string;
  playerId: string;
  playerName: string;
  playerImage?: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  played: number;
  rank: number;
}

export type PlayerFormResult = 'win' | 'loss' | 'draw';

export interface PlayerForm {
  seasonId: string;
  playerId: string;
  recentForm: PlayerFormResult[];
}
