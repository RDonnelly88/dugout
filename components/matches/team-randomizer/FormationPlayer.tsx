
import React from 'react';
import { Player } from "@/types";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { usePlayerForm } from "@/hooks/usePlayerForm";
import { useQuery } from "@tanstack/react-query";
import { getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";
import PlayerFormDisplay from '@/components/players/PlayerFormDisplay';
import { TrendingUp, Trophy, Flag } from "lucide-react";
import { usePlayerRecords } from "@/hooks/usePlayerRecords";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { useTeam } from "@/contexts/TeamContext";

interface FormationPlayerProps {
  player: Player;
  index: number;
  teamColor: 'red' | 'green';
  onClick?: () => void;
}

const FormationPlayer = ({ player, index, teamColor, onClick }: FormationPlayerProps) => {
  const { currentTeam } = useTeam();
  const { recordFor } = usePlayerRecords();
  const record = recordFor(player.id, player.name);

  console.log(`Rendering FormationPlayer for ${player.name} at index ${index} and team ${teamColor}`);
  
  const bgColor = teamColor === 'red' ? 'bg-destructive' : 'bg-win';
  const textColor = 'text-foreground';
  
  // Get current season
  const { data: currentSeason } = useQuery({
    queryKey: ['currentSeason', currentTeam?.id],
    queryFn: getCurrentSeason
  });

  // Get player form data
  const { form, isLoading } = usePlayerForm(
    currentSeason?.id || null,
    player.id
  );
  
  // Get season stats
  const { data: seasonPlayerStats = [] } = useQuery({
    queryKey: ['seasonStats', currentSeason?.id],
    queryFn: () => currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([]),
    enabled: !!currentSeason
  });
  
  const playerSeasonStats = seasonPlayerStats.find(stat => stat.playerId === player.id);
  
  // Calculate player's rank in current season
  const playerRank = playerSeasonStats && playerSeasonStats.played > 0
    ? seasonPlayerStats
        .sort((a, b) => b.points - a.points)
        .findIndex(stat => stat.playerId === player.id) + 1
    : null;
  
  // Display last 5 matches in form
  const recentForm = form.slice(0, 5);
  console.log(`Player ${player.name} recent form:`, recentForm);
  
  return (
    <div className="player-formation-card">
      <HoverCard>
        <HoverCardTrigger asChild>
          <button
            type="button"
            className="flex flex-col items-center cursor-pointer"
            onClick={onClick}
          >
            <div className="relative">
              <Badge variant="outline" className={`absolute -top-3 -right-3 ${bgColor} ${textColor} w-6 h-6 flex items-center justify-center p-0 rounded-full text-xs font-bold shadow-md`}>
                {index + 1}
              </Badge>
              <PlayerAvatar name={player.name} image={player.image} size="md" className="border-2 border-white/50 shadow-lg hover:border-white transition-all duration-200" />
            </div>
            <span className="mt-1 text-xs font-medium text-foreground truncate max-w-[60px] text-center">
              {player.name}
            </span>
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-72 p-3 bg-popover border border-border text-foreground">
          <div className="flex space-x-3">
            <PlayerAvatar name={player.name} image={player.image} size="md" />
            <div>
              <h4 className="font-bold">{player.name}</h4>
              <div className="flex items-center text-xs">
                <Flag className="h-3 w-3 text-draw mr-1" />
                <span className="text-draw">
                  Season rank: {playerRank ? `#${playerRank}` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Season Stats */}
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
          
          {/* Overall Stats */}
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
          
          {/* Player form display */}
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
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default FormationPlayer;
