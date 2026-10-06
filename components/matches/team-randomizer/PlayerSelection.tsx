import React, { useState, useMemo } from 'react';
import { Player } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";
import { useRecentResults } from "@/hooks/useRecentResults";
import ResultStrip from '@/components/players/ResultStrip';
import { calculatePlayerRanks } from "@/lib/ranking-utils";
import PlayerSelectionFilters from './PlayerSelectionFilters';
import { selectionOrder } from "@/lib/player-selection";
import { usePlayerRecords } from "@/hooks/usePlayerRecords";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import { displayRating } from "@/lib/elo";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { useTeam } from "@/contexts/TeamContext";

interface PlayerSelectionProps {
  players: Player[];
  selectedPlayers: string[];
  togglePlayerSelection: (playerId: string) => void;
  disabled: boolean;
}

const PlayerSelection = ({ 
  players, 
  selectedPlayers, 
  togglePlayerSelection,
  disabled
}: PlayerSelectionProps) => {
  const { currentTeam } = useTeam();
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const { recordFor } = usePlayerRecords();
  const { ratingFor } = usePlayerRatings();

  const { data: currentSeason } = useQuery({
    queryKey: ['currentSeason', currentTeam?.id],
    queryFn: getCurrentSeason
  });
  
  // The squad's recent nights, worked out once for the whole list. Picking a
  // side is not a season view, and asking per player opened one request each.
  const { resultsFor } = useRecentResults();

  const { data: seasonPlayerStats = [] } = useQuery({
    queryKey: ['seasonPlayerStats', currentSeason?.id],
    queryFn: () => currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([]),
    enabled: !!currentSeason
  });
  
  const playerRanks = React.useMemo(() => {
    if (!seasonPlayerStats.length) return {};
    return calculatePlayerRanks(seasonPlayerStats);
  }, [seasonPlayerStats]);

  // Most games first — this season's where there is one, all time otherwise.
  const filteredAndSortedPlayers = useMemo(
    () =>
      selectionOrder(players, {
        activeOnly: showActiveOnly,
        search: searchTerm,
        playedOf: (p) =>
          seasonPlayerStats.find((stat) => stat.playerId === p.id)?.played ??
          recordFor(p.id, p.name).played,
      }),
    [players, searchTerm, showActiveOnly, seasonPlayerStats, recordFor]
  );

  const filteredSelectedPlayers = filteredAndSortedPlayers.filter(player =>
    selectedPlayers.includes(player.id)
  );

  // Selected but filtered out of view. Without this the header could read
  // "12 selected" while twenty-three players were actually going to be split,
  // the difference being inactive players picked before the filter hid them.
  const hiddenSelectedCount = selectedPlayers.length - filteredSelectedPlayers.length;
  
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-4">
        {/* No heading of its own: "Who's playing" above it already says it. */}
        <div className="mb-3 flex items-center justify-end">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => filteredAndSortedPlayers.forEach(p => {
                if (!selectedPlayers.includes(p.id)) {
                  togglePlayerSelection(p.id);
                }
              })}
              disabled={disabled}
            >
              Select shown
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => selectedPlayers.forEach(id => togglePlayerSelection(id))}
              disabled={disabled}
            >
              Clear
            </Button>
          </div>
        </div>
        
        <PlayerSelectionFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showActiveOnly={showActiveOnly}
          setShowActiveOnly={setShowActiveOnly}
          totalCount={players.length}
          filteredCount={filteredAndSortedPlayers.length}
          selectedCount={selectedPlayers.length}
          hiddenSelectedCount={hiddenSelectedCount}
        />
      </div>
      
      {/* The whole tile is the tick box, so a thumb can pick ten people in
          ten taps without aiming for a small square. Who is active is
          changed on the squad page, not here, where a switch beside every
          tick box was a second thing to mistake for the first. */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {filteredAndSortedPlayers.map((player) => {
          const rating = ratingFor(player.id);
          const recentRun = resultsFor(player.id);
          const picked = selectedPlayers.includes(player.id);
          const rank = playerRanks[player.id];

          return (
            <label
              key={player.id}
              htmlFor={`player-${player.id}`}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 transition-colors ${
                picked ? "border-accent/60 bg-accent/15" : "border-border hover:bg-surface-2/60"
              } ${disabled ? "pointer-events-none opacity-60" : ""}`}
            >
              <Checkbox
                id={`player-${player.id}`}
                checked={picked}
                onCheckedChange={() => togglePlayerSelection(player.id)}
                disabled={disabled}
              />
              <PlayerAvatar name={player.name} image={player.image} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium leading-tight">{player.name}</span>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground tabular">
                  {rating && <span>{displayRating(rating.rating)}</span>}
                  {rank && seasonPlayerStats.some((s) => s.playerId === player.id && s.played > 0) && (
                    <span>#{rank} this season</span>
                  )}
                  <ResultStrip results={recentRun} size="xs" />
                </span>
              </span>
            </label>
          );
        })}
      </div>
      
      {filteredAndSortedPlayers.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p>No players found matching your criteria</p>
          {(searchTerm || showActiveOnly) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchTerm('');
                setShowActiveOnly(false);
              }}
              className="mt-2"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerSelection;
