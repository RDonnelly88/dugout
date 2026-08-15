
export type TeamRole = "admin" | "viewer";

export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  /** What this team calls its two sides. Defaults to Bibs and No bibs. */
  side_a_name?: string;
  side_b_name?: string;
  /**
   * The one team every signed-in user can read and nobody can write. It has no
   * owner and no members, which is what makes it unmodifiable rather than
   * merely hidden behind a disabled button.
   */
  is_demo?: boolean;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  created_at: string;
  // Make username and avatar_url optional to match our handling in the code
  username?: string;
  avatar_url?: string | null;
  // Make profile optional to properly type our data structure
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}
