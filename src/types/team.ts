
export type TeamRole = "admin" | "viewer";

export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
