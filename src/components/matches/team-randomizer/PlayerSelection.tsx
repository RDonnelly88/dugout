
import React from 'react';
import { Player } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";
import { usePlayerForm } from "@/hooks/usePlayerForm";
import PlayerFormDisplay from '@/components/players/PlayerFormDisplay';
import { TrendingUp, TrendingDown, Trophy, Flag, MinusCircle } from "lucide-react";
import { calculatePlayerRanks } from "@/lib/ranking-utils";

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
  // Get current season for player stats
  const { data: currentSeason } = useQuery({
    queryKey: ['currentSeason'],
    queryFn: getCurrentSeason
  });
  
  // Get season stats for all players
  const { data: seasonPlayerStats = [] } = useQuery({
    queryKey: ['seasonStats', currentSeason?.id],
    queryFn: () => currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([]),
    enabled: !!currentSeason
  });
  
  // Calculate player ranks using our shared utility
  const playerRanks = React.useMemo(() => {
    if (!seasonPlayerStats.length) return {};
    return calculatePlayerRanks(seasonPlayerStats);
  }, [seasonPlayerStats]);
  
  return (
    <div className="border rounded-md p-4 bg-card">
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-sm font-medium">Select Available Players</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => players.forEach(p => {
              if (!selectedPlayers.includes(p.id)) {
                togglePlayerSelection(p.id);
              }
            })}
            disabled={disabled}
          >
            Select All
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => selectedPlayers.forEach(id => togglePlayerSelection(id))}
            disabled={disabled}
          >
            Clear All
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {players.map(player => (
          <div key={player.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`player-${player.id}`} 
              checked={selectedPlayers.includes(player.id)}
              onCheckedChange={() => togglePlayerSelection(player.id)}
              disabled={disabled}
            />
            <Label htmlFor={`player-${player.id}`} className="cursor-pointer flex items-center">
              <HoverCard>
                <HoverCardTrigger>
                  <span className="hover:underline">{player.name}</span>
                </HoverCardTrigger>
                <HoverCardContent className="w-72 p-3 bg-blue-950 border border-blue-500/30 text-white">
                  <PlayerHoverContent 
                    player={player} 
                    currentSeasonId={currentSeason?.id || null}
                    seasonPlayerStats={seasonPlayerStats}
                    playerRanks={playerRanks}
                  />
                </HoverCardContent>
              </HoverCard>
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

// Extracted player hover content to a shared component
interface PlayerHoverContentProps {
  player: Player;
  currentSeasonId: string | null;
  seasonPlayerStats: Array<any>;
  playerRanks?: Record<string, number>;
}

export const PlayerHoverContent = ({ 
  player, 
  currentSeasonId, 
  seasonPlayerStats,
  playerRanks = {}
}: PlayerHoverContentProps) => {
  // Get player form data
  const { form, isLoading } = usePlayerForm(
    currentSeasonId,
    player.id
  );
  
  const playerSeasonStats = seasonPlayerStats.find(stat => stat.playerId === player.id);
  
  // Use the rank from the pre-calculated ranks
  const playerRank = playerSeasonStats && playerSeasonStats.played > 0
    ? playerRanks[player.id] || null
    : null;
  
  // Display last 5 matches in form
  const recentForm = form.slice(0, 5);
  
  return (
    <>
      <div className="flex space-x-3">
        <Avatar className="h-12 w-12">
          {player.image ? (
            <AvatarImage src={player.image} alt={player.name} />
          ) : (
            <AvatarFallback className="bg-blue-700">
              {player.name.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h4 className="font-bold">{player.name}</h4>
          <div className="flex items-center text-xs">
            <Flag className="h-3 w-3 text-yellow-500 mr-1" />
            <span className="text-yellow-300">
              Season rank: {playerRank ? `#${playerRank}` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Season Stats */}
      {playerSeasonStats && (
        <div className="mt-3 p-2 bg-blue-900/50 rounded-md">
          <div className="flex items-center mb-1">
            <Trophy className="h-3 w-3 text-blue-300 mr-1" />
            <h5 className="text-xs font-medium text-blue-300">Season Stats</h5>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center">
            <div>
              <span className="text-sm font-bold">{playerSeasonStats.played}</span>
              <span className="text-xs block text-blue-200">Played</span>
            </div>
            <div>
              <span className="text-sm font-bold">{playerSeasonStats.wins}</span>
              <span className="text-xs block text-green-300">Won</span>
            </div>
            <div>
              <span className="text-sm font-bold">{playerSeasonStats.losses}</span>
              <span className="text-xs block text-red-300">Lost</span>
            </div>
            <div>
              <span className="text-sm font-bold">{playerSeasonStats.draws}</span>
              <span className="text-xs block text-amber-300">Draw</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Overall Stats */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        <div className="bg-blue-900/50 p-2 rounded-md text-center">
          <div className="text-sm font-bold">{player.stats?.played || 0}</div>
          <div className="text-xs text-blue-300">Played</div>
        </div>
        <div className="bg-green-900/50 p-2 rounded-md text-center">
          <div className="text-sm font-bold">{player.stats?.won || 0}</div>
          <div className="text-xs text-green-300">Won</div>
        </div>
        <div className="bg-amber-900/50 p-2 rounded-md text-center">
          <div className="text-sm font-bold">{player.stats?.drawn || 0}</div>
          <div className="text-xs text-amber-300">Draw</div>
        </div>
        <div className="bg-red-900/50 p-2 rounded-md text-center">
          <div className="text-sm font-bold">{player.stats?.lost || 0}</div>
          <div className="text-xs text-red-300">Lost</div>
        </div>
      </div>
      
      {/* Player form display */}
      <div className="mt-2 p-2 rounded-md bg-blue-900/30 border border-blue-500/20">
        <div className="flex items-center mb-1">
          <TrendingUp className="h-3 w-3 text-blue-300 mr-1" />
          <h5 className="text-xs font-medium text-blue-300">Recent Form</h5>
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
