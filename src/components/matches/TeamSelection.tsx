
import React, { useMemo } from 'react';
import { Player } from "@/types";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Shield, Users } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useQuery } from "@tanstack/react-query";
import { getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";
import Formation from './team-randomizer/Formation';

interface TeamSelectionProps {
  teamA: string[];
  teamB: string[];
  players: Player[];
  selectedPlayers: string[];
  togglePlayer: (team: 'A' | 'B', playerId: string) => void;
}

const TeamSelection = ({ 
  teamA, 
  teamB, 
  players, 
  selectedPlayers,
  togglePlayer 
}: TeamSelectionProps) => {
  console.log("TeamSelection render - Team A:", teamA.length, "players");
  console.log("TeamSelection render - Team B:", teamB.length, "players");
  
  const { data: currentSeason } = useQuery({
    queryKey: ['currentSeason'],
    queryFn: getCurrentSeason
  });
  
  const { data: seasonStats = [] } = useQuery({
    queryKey: ['seasonStats', currentSeason?.id],
    queryFn: () => currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([]),
    enabled: !!currentSeason
  });
  
  const availablePlayers = useMemo(() => {
    return players.filter(player => 
      selectedPlayers.includes(player.id) && 
      !teamA.includes(player.id) && 
      !teamB.includes(player.id)
    );
  }, [players, selectedPlayers, teamA, teamB]);
  
  // Convert player IDs to actual Player objects
  const teamAPlayers = useMemo(() => {
    return players.filter(player => teamA.includes(player.id));
  }, [players, teamA]);
  
  const teamBPlayers = useMemo(() => {
    return players.filter(player => teamB.includes(player.id));
  }, [players, teamB]);
  
  console.log("Team A Players:", teamAPlayers.map(p => p.name));
  console.log("Team B Players:", teamBPlayers.map(p => p.name));

  return (
    <div className="space-y-8">
      <div className="teams-container">
        <Label className="team-label mb-4 block">
          <Shield className="h-5 w-5 mr-2 text-blue-400 inline" />
          <span className="text-xl font-bold">Team Formations</span>
        </Label>
        
        <Formation 
          teamA={teamAPlayers} 
          teamB={teamBPlayers} 
          teamSize={Math.max(teamAPlayers.length, teamBPlayers.length).toString()}
        />
      </div>

      <div className="available-players-container">
        <Label className="team-label mb-4 block">
          <Users className="h-5 w-5 mr-2 text-gray-400 inline" />
          <span className="text-xl font-bold">Available Players</span>
        </Label>
        <div className="available-players-card bg-blue-950/20 rounded-xl p-4 border border-blue-500/20">
          {availablePlayers.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-lg font-medium">No available players</p>
              <p className="text-sm mt-1">Select players above or add all players to teams</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availablePlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  seasonStats={seasonStats.find(s => s.playerId === player.id)}
                  onClick={() => togglePlayer(teamA.length <= teamB.length ? 'A' : 'B', player.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PlayerCardProps {
  player: Player;
  seasonStats?: { playerId: string; wins: number; losses: number; draws: number; played: number; points: number; };
  onClick: () => void;
}

const PlayerCard = ({ player, seasonStats, onClick }: PlayerCardProps) => {
  const winPercentage = player.stats.played > 0 
    ? Math.round((player.stats.won / player.stats.played) * 100) 
    : 0;
  
  const seasonWinPercentage = seasonStats?.played ? 
    Math.round((seasonStats.wins / seasonStats.played) * 100) : 0;
  
  return (
    <div 
      onClick={onClick}
      className="relative cursor-pointer transition-all duration-300 hover:scale-105 animate-pop-in"
    >
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="player-card-mini bg-blue-900/60 rounded-lg p-3 flex items-center space-x-2 shadow-md border border-blue-500/20 hover:border-blue-400/50 hover:shadow-blue-500/20 hover:shadow-lg transition-all duration-200">
            <Avatar className="h-10 w-10 border-2 border-blue-500/30">
              {player.image ? (
                <AvatarImage src={player.image} alt={player.name} />
              ) : (
                <AvatarFallback className="bg-blue-700 text-white">
                  {player.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm font-medium truncate text-blue-50">{player.name}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-64 p-3 bg-blue-950 border border-blue-500/30 text-white">
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
              <p className="text-xs text-blue-200">Win rate: {winPercentage}%</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="bg-blue-900/50 p-2 rounded-md text-center">
              <div className="text-sm font-bold">{player.stats?.played || 0}</div>
              <div className="text-xs text-blue-300">Played</div>
            </div>
            <div className="bg-green-900/50 p-2 rounded-md text-center">
              <div className="text-sm font-bold">{player.stats?.won || 0}</div>
              <div className="text-xs text-green-300">Won</div>
            </div>
            <div className="bg-red-900/50 p-2 rounded-md text-center">
              <div className="text-sm font-bold">{player.stats?.lost || 0}</div>
              <div className="text-xs text-red-300">Lost</div>
            </div>
          </div>
          
          {seasonStats && seasonStats.played > 0 && (
            <div className="mt-2 p-2 bg-blue-900/50 rounded-md">
              <h5 className="text-xs font-medium text-blue-300 mb-1">Season Stats</h5>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div>
                  <span className="text-sm font-bold">{seasonStats.played}</span>
                  <span className="text-xs block">Played</span>
                </div>
                <div>
                  <span className="text-sm font-bold">{seasonStats.wins}</span>
                  <span className="text-xs block">Won</span>
                </div>
                <div>
                  <span className="text-sm font-bold">{seasonWinPercentage}%</span>
                  <span className="text-xs block">Win Rate</span>
                </div>
              </div>
            </div>
          )}
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default TeamSelection;
