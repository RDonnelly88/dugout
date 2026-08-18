import React, { useState, useMemo } from 'react';
import { Player } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useQuery } from "@tanstack/react-query";
import { getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";
import { useSquadForm } from "@/hooks/useSquadForm";
import PlayerFormDisplay from '@/components/players/PlayerFormDisplay';
import { TrendingUp, Trophy, Flag } from "lucide-react";
import { calculatePlayerRanks } from "@/lib/ranking-utils";
import PlayerSelectionFilters from './PlayerSelectionFilters';
import { usePlayerRecords } from "@/hooks/usePlayerRecords";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import SkillScale from "@/components/players/SkillScale";
import { displayRating } from "@/lib/elo";
import { SKILL } from "@/lib/config";
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
  const { formFor } = useSquadForm();

  const { data: seasonPlayerStats = [] } = useQuery({
    queryKey: ['seasonStats', currentSeason?.id],
    queryFn: () => currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([]),
    enabled: !!currentSeason
  });
  
  const playerRanks = React.useMemo(() => {
    if (!seasonPlayerStats.length) return {};
    return calculatePlayerRanks(seasonPlayerStats);
  }, [seasonPlayerStats]);

  // Filter and sort players
  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = players;
    
    // Filter by active status
    if (showActiveOnly) {
      filtered = filtered.filter(player => player.isActive !== false);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by frequency (games played) descending, then by name
    return filtered.sort((a, b) => {
      const aSeasonStats = seasonPlayerStats.find(stat => stat.playerId === a.id);
      const bSeasonStats = seasonPlayerStats.find(stat => stat.playerId === b.id);
      
      // Prioritize current season stats, fallback to overall stats
      const aPlayed = aSeasonStats?.played ?? recordFor(a.id, a.name).played;
      const bPlayed = bSeasonStats?.played ?? recordFor(b.id, b.name).played;

      if (aPlayed !== bPlayed) {
        return bPlayed - aPlayed; // Most frequent first
      }
      return a.name.localeCompare(b.name); // Then alphabetically
    });
  }, [players, searchTerm, showActiveOnly, seasonPlayerStats, recordFor]);

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
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Select Available Players</h3>
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {filteredAndSortedPlayers.map(player => {
          const rating = ratingFor(player.id);
          const formResults = formFor(player.id);
          
          return (
            <div 
              key={player.id} 
              className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                selectedPlayers.includes(player.id) 
                  ? 'bg-accent/20 border border-accent/30' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <Checkbox 
                id={`player-${player.id}`} 
                checked={selectedPlayers.includes(player.id)}
                onCheckedChange={() => togglePlayerSelection(player.id)}
                disabled={disabled}
              />
              <div className="flex-1 min-w-0">
                <Label htmlFor={`player-${player.id}`} className="cursor-pointer flex items-center justify-between">
                  <HoverCard>
                    <HoverCardTrigger>
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="truncate hover:underline">{player.name}</span>
                        {/* The same three things the player card leads with, so
                            a name means the same wherever it is read. */}
                        <div className="flex items-center gap-2">
                          {rating && (
                            <span className="tabular text-xs text-muted-foreground">
                              {displayRating(rating.rating)}
                            </span>
                          )}
                          <PlayerFormDisplay results={formResults} size="xs" />
                          <SkillScale level={player.skillLevel ?? SKILL.default} />
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-72 p-3 bg-popover border border-border text-foreground">
                      <PlayerHoverContent 
                        player={player} 
                        seasonPlayerStats={seasonPlayerStats}
                        playerRanks={playerRanks}
                      />
                    </HoverCardContent>
                  </HoverCard>
                </Label>
              </div>
            </div>
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

interface PlayerHoverContentProps {
  player: Player;
  seasonPlayerStats: Array<any>;
  playerRanks?: Record<string, number>;
}

const PlayerHoverContent = ({ 
  player, 
  seasonPlayerStats,
  playerRanks = {}
}: PlayerHoverContentProps) => {
  const { formFor, isLoading } = useSquadForm();
  const { recordFor } = usePlayerRecords();
  const record = recordFor(player.id, player.name);

  const playerSeasonStats = seasonPlayerStats.find(stat => stat.playerId === player.id);
  
  const hasPlayedGames = playerSeasonStats && playerSeasonStats.played > 0;
  
  const playerRank = hasPlayedGames ? playerRanks[player.id] : null;
  
  const recentForm = formFor(player.id);
  
  return (
    <>
      <div className="flex space-x-3">
        <PlayerAvatar name={player.name} image={player.image} size="md" />
        <div>
          <h4 className="font-bold">{player.name}</h4>
          <div className="flex items-center text-xs">
            <Flag className="h-3 w-3 text-draw mr-1" />
            <span className="text-draw">
              {playerRank ? `Season rank: #${playerRank}` : hasPlayedGames ? 'Not ranked' : 'No games played'}
            </span>
          </div>
        </div>
      </div>
      
      {playerSeasonStats && (
        <div className="mt-3 p-2 bg-info/15 rounded-md">
          <div className="flex items-center mb-1">
            <Trophy className="h-3 w-3 text-info mr-1" />
            <h5 className="text-xs font-medium text-info">Season Stats</h5>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center">
            <div>
              <span className="text-sm font-bold">{playerSeasonStats.played}</span>
              <span className="text-xs block text-info">Played</span>
            </div>
            <div>
              <span className="text-sm font-bold">{playerSeasonStats.wins}</span>
              <span className="text-xs block text-win">Won</span>
            </div>
            <div>
              <span className="text-sm font-bold">{playerSeasonStats.losses}</span>
              <span className="text-xs block text-loss">Lost</span>
            </div>
            <div>
              <span className="text-sm font-bold">{playerSeasonStats.draws}</span>
              <span className="text-xs block text-draw">Draw</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-3 grid grid-cols-4 gap-2">
        <div className="bg-info/15 p-2 rounded-md text-center">
          <div className="text-sm font-bold">{record.played}</div>
          <div className="text-xs text-info">Played</div>
        </div>
        <div className="bg-win/15 p-2 rounded-md text-center">
          <div className="text-sm font-bold">{record.wins}</div>
          <div className="text-xs text-win">Won</div>
        </div>
        <div className="bg-draw/15 p-2 rounded-md text-center">
          <div className="text-sm font-bold">{record.draws}</div>
          <div className="text-xs text-draw">Draw</div>
        </div>
        <div className="bg-loss/15 p-2 rounded-md text-center">
          <div className="text-sm font-bold">{record.losses}</div>
          <div className="text-xs text-loss">Lost</div>
        </div>
      </div>
      
      <div className="mt-2 p-2 rounded-md bg-info/15 border border-border">
        <div className="flex items-center mb-1">
          <TrendingUp className="h-3 w-3 text-info mr-1" />
          <h5 className="text-xs font-medium text-info">Recent Form</h5>
        </div>
        <div className="flex space-x-1">
          {isLoading ? (
            <div className="w-full text-center text-xs opacity-70">Loading form data...</div>
          ) : recentForm.length > 0 ? (
            <PlayerFormDisplay results={recentForm} size="sm" />
          ) : (
            <div className="w-full text-center text-xs opacity-70">No recent matches</div>
          )}
        </div>
      </div>
    </>
  );
};

export default PlayerSelection;
