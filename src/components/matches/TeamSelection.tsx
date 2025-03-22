import { Player } from "@/types";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FormationConfig } from "./team-randomizer/types";
import { formationConfigs } from "./team-randomizer/constants";
import { Shield, Trophy, Users } from "lucide-react";

interface TeamSelectionProps {
  teamA: string[];
  teamB: string[];
  players: Player[];
  togglePlayer: (team: 'A' | 'B', playerId: string) => void;
  availablePlayers: Player[];
}

const TeamSelection = ({ 
  teamA, 
  teamB, 
  players, 
  togglePlayer, 
  availablePlayers 
}: TeamSelectionProps) => {
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
            {formationConfig.name} Formation
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
                return (
                  <PlayerFormationCard 
                    key={player.id} 
                    player={player}
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
          <p className="text-lg font-medium">All players have been assigned</p>
          <p className="text-sm mt-1">You've added all available players to teams</p>
        </div>
      );
    }
    
    return (
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {availablePlayers.map(player => (
          <PlayerCard
            key={player.id}
            player={player}
            onClick={() => togglePlayer(teamA.length <= teamB.length ? 'A' : 'B', player.id)}
          />
        ))}
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
        <div className="mt-3 available-players-card glass-card rounded-xl overflow-hidden border border-white/10 p-4">
          {renderAvailablePlayers()}
        </div>
      </div>
    </div>
  );
};

interface PlayerCardProps {
  player: Player;
  onClick: () => void;
}

const PlayerCard = ({ player, onClick }: PlayerCardProps) => {
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
        <HoverCardContent className="w-72 player-hover-card">
          <div className="flex justify-between items-start">
            <Avatar className="h-16 w-16 border-2 border-blue-500/50 shadow-md">
              {player.image ? (
                <AvatarImage src={player.image} alt={player.name} />
              ) : (
                <AvatarFallback className="bg-blue-700 text-white text-xl">
                  {player.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-lg font-semibold">{player.name}</h4>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="bg-blue-900/30 rounded-lg p-3 text-center border border-blue-500/20">
              <div className="font-semibold text-lg">{player.stats?.played || 0}</div>
              <div className="text-xs text-blue-300 mt-1">Matches Played</div>
            </div>
            <div className="bg-green-900/30 rounded-lg p-3 text-center border border-green-500/20">
              <div className="font-semibold text-lg text-green-300">{player.stats?.won || 0}</div>
              <div className="text-xs text-green-300 mt-1">Wins</div>
            </div>
            <div className="bg-red-900/30 rounded-lg p-3 text-center border border-red-500/20">
              <div className="font-semibold text-lg text-red-300">{player.stats?.lost || 0}</div>
              <div className="text-xs text-red-300 mt-1">Losses</div>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

interface PlayerFormationCardProps {
  player: Player;
  onClick: () => void;
  teamColor: 'red' | 'green';
}

const PlayerFormationCard = ({ player, onClick, teamColor }: PlayerFormationCardProps) => {
  const jerseyColor = teamColor === 'red' ? 'bg-red-600' : 'bg-green-600';
  
  return (
    <div className="player-position-card" onClick={onClick}>
      <div className="player-jersey">
        <HoverCard>
          <HoverCardTrigger asChild>
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
          </HoverCardTrigger>
          <HoverCardContent className="w-60 player-hover-card player-stats-card">
            <div className="flex justify-between items-start">
              <Avatar className="h-12 w-12 border border-white/20">
                {player.image ? (
                  <AvatarImage src={player.image} alt={player.name} />
                ) : (
                  <AvatarFallback className={jerseyColor}>
                    {player.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h4 className="text-md font-semibold">{player.name}</h4>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1">
              <div className="stat-box">
                <div className="font-bold">{player.stats?.played || 0}</div>
                <div className="stat-label">Played</div>
              </div>
              <div className="stat-box win-stat">
                <div className="font-bold">{player.stats?.won || 0}</div>
                <div className="stat-label">Wins</div>
              </div>
              <div className="stat-box loss-stat">
                <div className="font-bold">{player.stats?.lost || 0}</div>
                <div className="stat-label">Losses</div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        <div className="player-name-label">{player.name}</div>
      </div>
    </div>
  );
};

export default TeamSelection;
