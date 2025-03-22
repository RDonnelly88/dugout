
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
}

export interface TeamInfo {
  name: string;
  score?: number;
  players: string[];
}

export type MatchStatus = "scheduled" | "completed";
