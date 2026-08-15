import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMatches } from "@/lib/db";
import { computeRatings, type PlayerRating } from "@/lib/elo";
import { useTeam } from "@/contexts/TeamContext";
import { ELO } from "@/lib/config";

/**
 * Elo ratings for the squad, replayed from the match history.
 *
 * Computed rather than fetched. The matches are already loaded for half the
 * app, the arithmetic is trivial for a few hundred results, and nothing has to
 * be kept in step — editing a scoreline from last month re-rates everything
 * after it on the next render.
 */
export const usePlayerRatings = () => {
  const { currentTeam } = useTeam();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });

  const ratings = useMemo(() => computeRatings(matches), [matches]);

  const ranked = useMemo(
    () =>
      [...ratings.values()]
        // A provisional rating is still finding its level, so it doesn't
        // belong in a table beside settled ones.
        .filter((r) => !r.provisional)
        .sort((a, b) => b.rating - a.rating),
    [ratings]
  );

  return {
    ratings,
    /** Established players, strongest first. */
    ranked,
    /** Everyone who has played, including those still settling. */
    all: useMemo(
      () => [...ratings.values()].sort((a, b) => b.rating - a.rating),
      [ratings]
    ),
    ratingFor: (playerId: string): PlayerRating | undefined =>
      ratings.get(playerId),
    startingRating: ELO.start,
    isLoading,
  };
};
