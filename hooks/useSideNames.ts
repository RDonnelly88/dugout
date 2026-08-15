"use client";

import { useTeam } from "@/contexts/TeamContext";
import { SIDE_NAMES } from "@/lib/config";

export interface SideNames {
  A: string;
  B: string;
}

/**
 * What this team calls its two sides.
 *
 * One answer, read everywhere a side is labelled. The randomiser dealt into
 * Bibs and Skins, a saved match stored "Team A", and the match page fell back
 * to "Team A" again — so the sides you picked were not the sides you were
 * shown afterwards.
 *
 * Falls back to the defaults while the team is still loading, which keeps the
 * labels stable rather than flashing "Team A" and then correcting itself.
 */
export function useSideNames(): SideNames {
  const { currentTeam } = useTeam();

  return {
    A: currentTeam?.side_a_name?.trim() || SIDE_NAMES.A,
    B: currentTeam?.side_b_name?.trim() || SIDE_NAMES.B,
  };
}
