
import { Player } from "@/types";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formationConfigs } from "./team-randomizer/constants";
import { Shield, Trophy, Users, Percent } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";

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
  
  const getFormationName = (teamSize: number): string => {
    if (teamSize <= 0) return "";
    if (teamSize === 1) return "1";
    if (teamSize === 2) return "1-1";
    if (teamSize === 3) return "1-2";
    if (teamSize === 4) return "1-2-1";
    if (teamSize === 5) return "2-2-1";
    if (teamSize === 6) return "2-3-1";
    if (teamSize === 7) return "3-3-1";
    if (teamSize === 8) return "3-3-2";
    if (teamSize === 9) return "3-4-2";
    if (teamSize === 10) return "4-4-2";
    return "4-4-3";
  };

  const getFormationSize = (teamSize: number): string => {
    if (teamSize <= 5) return "5";
    if (teamSize >= 11) return "11";
    return teamSize.toString();
  };

  const renderTeamFormation = (team: string[], teamName: string, teamLetter: 'A' | 'B') => {
    if (team.length === 0) return (
      <div className="team-empty-pitch flex flex-col items-center justify-center text-muted-foreground">
        <Shield className="h-12 w-12 mb-2 opacity-30" />
        <p className="text-lg font-medium">No players selected</p>
        <p className="text-sm mt-1">Add players to build your {teamName}</p>
      </div>
    );

    const teamPlayers = players.filter(player => team.includes(player.id));
    const formationConfig = formationConfigs[getFormationSize(teamPlayers.length)];
    const formationName = getFormationName(teamPlayers.length);
    const { rows } = formationConfig;
    
    let playerIndex = 0;
    
    return (
      <div className={`football-pitch ${teamLetter === 'A' ? 'team-a-pitch' : 'team-b-pitch'}`}>
        <div className="field-markings">
          <div className="center-circle"></div>
          <div className="halfway-line"></div>
          <div className="penalty-area-top"></div>
          <div className="penalty-area-bottom"></div>
          <div className="goal-area-top"></div>
          <div className="goal-area-bottom"></div>
        </div>
        
        <div className="text-center pitch-formation-label">
          <Badge variant="outline" className="px-4 py-1 text-sm font-medium bg-blue-500/10 text-primary border-blue-400/30">
            {formationName} Formation
          </Badge>
        </div>
        
        <div className="formation-rows">
          {rows.map((playersInRow, rowIndex) => (
            <div 
              key={`${teamName}-row-${rowIndex}`} 
              className={`formation-row row-${rowIndex} ${rows.length === 3 ? 'three-row-formation' : rows.length === 4 ? 'four-row-formation' : 'five-row-formation'}`}
            >
              {Array(playersInRow).fill(0).map((_, posIndex) => {
                if (playerIndex >= teamPlayers.length) return null;
                const player = teamPlayers[playerIndex++];
                const playerStats = seasonStats.find(s => s.playerId === player.id);
                return (
                  <PlayerFormationCard 
                    key={player.id} 
                    player={player}
                    seasonStats={playerStats}
                    onClick={() => togglePlayer(teamLetter, player.id)}
                    teamColor={teamLetter === 'A' ? 'red' : 'green'}
                  />
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="team-name-overlay">
          {teamLetter === 'A' ? 'Team A' : 'Team B'}
        </div>
      </div>
    );
  };

  const renderAvailablePlayers = () => {
    if (availablePlayers.length === 0) {
      return (
        <div className="text-center p-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
          <p className="text-lg font-medium">No available players</p>
          <p className="text-sm mt-1">Select players above or add all players to teams</p>
        </div>
      );
    }
    
    return (
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {availablePlayers.map(player => {
          const playerStats = seasonStats.find(s => s.playerId === player.id);
          return (
            <PlayerCard
              key={player.id}
              player={player}
              seasonStats={playerStats}
              onClick={() => togglePlayer(teamA.length <= teamB.length ? 'A' : 'B', player.id)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="teams-container grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="team-column">
          <Label htmlFor="teamA" className="team-label">
            <Shield className="h-5 w-5 mr-2 text-red-400" />
            <span className="text-xl font-bold text-red-100">Team A</span>
          </Label>
          <div className="mt-3 team-card">
            {renderTeamFormation(teamA, "Team A", 'A')}
          </div>
        </div>

        <div className="team-column">
          <Label htmlFor="teamB" className="team-label">
            <Shield className="h-5 w-5 mr-2 text-green-400" />
            <span className="text-xl font-bold text-green-100">Team B</span>
          </Label>
          <div className="mt-3 team-card">
            {renderTeamFormation(teamB, "Team B", 'B')}
          </div>
        </div>
      </div>

      <div className="available-players-container">
        <Label className="team-label">
          <Users className="h-5 w-5 mr-2 text-gray-400" />
          <span className="text-xl font-bold">Available Players</span>
        </Label>
        <div className="mt-3 available-players-card">
          {renderAvailablePlayers()}
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
          <div className="player-card-mini bg-gradient-to-br from-blue-900/60 to-blue-950/80 rounded-lg p-3 flex items-center space-x-2 shadow-md border border-blue-500/20 hover:border-blue-400/50 hover:shadow-blue-500/20 hover:shadow-lg transition-all duration-200">
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
        <HoverCardContent className="w-64 player-compact-card">
          <div className="flex justify-between space-x-3">
            <Avatar className="h-12 w-12 border border-blue-500/50">
              {player.image ? (
                <AvatarImage src={player.image} alt={player.name} />
              ) : (
                <AvatarFallback className="bg-blue-700 text-white">
                  {player.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h4 className="text-md font-semibold">{player.name}</h4>
              <div className="flex items-center mt-0.5 text-xs text-muted-foreground">
                <Percent className="h-3 w-3 mr-1" /> 
                Win rate: {winPercentage}%
              </div>
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="stat-section">
              <h5 className="text-xs font-medium text-muted-foreground mb-1.5">Overall Stats</h5>
              <div className="grid grid-cols-3 gap-1">
                <div className="stat-box">
                  <span className="stat-value">{player.stats.played}</span>
                  <span className="stat-label">Played</span>
                </div>
                <div className="stat-box win-stat">
                  <span className="stat-value">{player.stats.won}</span>
                  <span className="stat-label">Wins</span>
                </div>
                <div className="stat-box loss-stat">
                  <span className="stat-value">{player.stats.lost}</span>
                  <span className="stat-label">Losses</span>
                </div>
              </div>
            </div>
            
            {seasonStats && seasonStats.played > 0 && (
              <div className="stat-section">
                <h5 className="text-xs font-medium text-muted-foreground mb-1.5">Season Stats</h5>
                <div className="grid grid-cols-3 gap-1">
                  <div className="stat-box">
                    <span className="stat-value">{seasonStats.played}</span>
                    <span className="stat-label">Played</span>
                  </div>
                  <div className="stat-box win-stat">
                    <span className="stat-value">{seasonStats.wins}</span>
                    <span className="stat-label">Wins</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-value">{seasonWinPercentage}%</span>
                    <span className="stat-label">Win Rate</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

interface PlayerFormationCardProps {
  player: Player;
  seasonStats?: { playerId: string; wins: number; losses: number; draws: number; played: number; points: number; };
  onClick: () => void;
  teamColor: 'red' | 'green';
}

const PlayerFormationCard = ({ player, seasonStats, onClick, teamColor }: PlayerFormationCardProps) => {
  const jerseyColor = teamColor === 'red' ? 'bg-red-600' : 'bg-green-600';
  
  const winPercentage = player.stats.played > 0 
    ? Math.round((player.stats.won / player.stats.played) * 100) 
    : 0;
  
  const seasonWinPercentage = seasonStats?.played ? 
    Math.round((seasonStats.wins / seasonStats.played) * 100) : 0;
  
  return (
    <div className="player-position-card" onClick={onClick}>
      <div className="player-jersey">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`jersey ${jerseyColor}`}>
                <Avatar className="player-avatar">
                  {player.image ? (
                    <AvatarImage src={player.image} alt={player.name} />
                  ) : (
                    <AvatarFallback className={jerseyColor}>
                      {player.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {player.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="player-name-label cursor-pointer">{player.name}</div>
          </HoverCardTrigger>
          <HoverCardContent 
            className="w-64 player-compact-card" 
            align="center"
          >
            <div className="flex justify-between space-x-3">
              <Avatar className="h-12 w-12 border border-blue-500/50">
                {player.image ? (
                  <AvatarImage src={player.image} alt={player.name} />
                ) : (
                  <AvatarFallback className={jerseyColor}>
                    {player.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <h4 className="text-md font-semibold">{player.name}</h4>
                <div className="flex items-center mt-0.5 text-xs text-muted-foreground">
                  <Percent className="h-3 w-3 mr-1" /> 
                  Win rate: {winPercentage}%
                </div>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="stat-section">
                <h5 className="text-xs font-medium text-muted-foreground mb-1.5">Overall Stats</h5>
                <div className="grid grid-cols-3 gap-1">
                  <div className="stat-box">
                    <span className="stat-value">{player.stats.played}</span>
                    <span className="stat-label">Played</span>
                  </div>
                  <div className="stat-box win-stat">
                    <span className="stat-value">{player.stats.won}</span>
                    <span className="stat-label">Wins</span>
                  </div>
                  <div className="stat-box loss-stat">
                    <span className="stat-value">{player.stats.lost}</span>
                    <span className="stat-label">Losses</span>
                  </div>
                </div>
              </div>
              
              {seasonStats && seasonStats.played > 0 && (
                <div className="stat-section">
                  <h5 className="text-xs font-medium text-muted-foreground mb-1.5">Season Stats</h5>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="stat-box">
                      <span className="stat-value">{seasonStats.played}</span>
                      <span className="stat-label">Played</span>
                    </div>
                    <div className="stat-box win-stat">
                      <span className="stat-value">{seasonStats.wins}</span>
                      <span className="stat-label">Wins</span>
                    </div>
                    <div className="stat-box">
                      <span className="stat-value">{seasonWinPercentage}%</span>
                      <span className="stat-label">Win Rate</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  );
};

export default TeamSelection;
