"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMatches, getPlayers, getSeason, getSeasonPlayerStats } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import { pointValues } from "@/lib/season-positions";
import { seasonWrapped } from "@/lib/season-wrapped";
import WrappedStory from "@/components/wrapped/WrappedStory";
import { wrappedSlides } from "@/components/wrapped/wrappedSlides";

/**
 * One player's season, as a story to tap through and a picture to send.
 *
 * Off the same queries the season page holds, so opening it from there costs
 * nothing new, and everything on it is worked out from the matches.
 */
export default function WrappedPage() {
  const { id, playerId } = useParams<{ id: string; playerId: string }>();
  const { currentTeam } = useTeam();

  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });
  const { data: players = [], isLoading: loadingPlayers } = useQuery({
    queryKey: ["players", currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam,
  });
  const { data: season, isLoading: loadingSeason } = useQuery({
    queryKey: ["seasons", id],
    queryFn: () => getSeason(id),
  });
  const { data: table = [], isLoading: loadingTable } = useQuery({
    queryKey: ["seasonPlayerStats", id],
    queryFn: () => getSeasonPlayerStats(id),
  });

  const story = useMemo(
    () => seasonWrapped(matches, id, playerId, pointValues(table)),
    [matches, id, playerId, table]
  );

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const player = byId.get(playerId);

  if (loadingMatches || loadingPlayers || loadingSeason || loadingTable) {
    return (
      <div className="page-container">
        <div className="sheen mx-auto h-[70vh] max-w-md rounded-3xl" />
      </div>
    );
  }

  if (!season || !player || !story) {
    return (
      <div className="page-container text-center">
        <h1 className="page-title">Nothing to wrap</h1>
        <p className="page-subtitle mx-auto mt-2 max-w-sm">
          {player && season
            ? `${player.name} has not played in ${season.name}.`
            : "That season or player could not be found."}
        </p>
        <Link href={season ? `/seasons/${season.id}` : "/seasons"} className="mt-4 inline-block text-accent underline-offset-4 hover:underline">
          Back to the season
        </Link>
      </div>
    );
  }

  return (
    <WrappedStory
      closeHref={`/seasons/${season.id}#wrapped`}
      slides={wrappedSlides({
        story,
        player,
        season,
        row: table.find((r) => r.playerId === playerId),
        playerFor: (pid) => byId.get(pid),
      })}
    />
  );
}
