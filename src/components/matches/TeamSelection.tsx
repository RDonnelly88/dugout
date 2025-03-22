
import { Player } from "@/types";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FormationConfig } from "./team-randomizer/types";
import { formationConfigs } from "./team-randomizer/constants";

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
    // Convert team size to closest available formation
    if (teamSize <= 5) return "5";
    if (teamSize >= 11) return "11";
    return teamSize.toString();
  };

  const renderTeamFormation = (team: string[], teamName: string) => {
    if (team.length === 0) return (
      <div className="text-center p-6 text-muted-foreground">
        No players selected for {teamName}
      </div>
    );

    const teamPlayers = players.filter(player => team.includes(player.id));
    const formationConfig = formationConfigs[getFormationSize(teamPlayers.length)];
    const { rows } = formationConfig;
    
    let playerIndex = 0;
    
    return (
      <div className="team-formation mb-4 p-4 bg-black/20 rounded-xl">
        <div className="text-center mb-4">
          <Badge variant="outline" className="bg-primary/10 text-primary-foreground">
            {formationConfig.name} Formation
          </Badge>
        </div>
        
        <div className="formation-rows space-y-4">
          {rows.map((playersInRow, rowIndex) => (
            <div key={`${teamName}-row-${rowIndex}`} className="formation-row flex justify-center gap-4">
              {Array(playersInRow).fill(0).map((_, posIndex) => {
                if (playerIndex >= teamPlayers.length) return null;
                const player = teamPlayers[playerIndex++];
                return (
                  <PlayerFormationCard 
                    key={player.id} 
                    player={player}
                    onClick={() => togglePlayer(teamName === "Team A" ? 'A' : 'B', player.id)}
                    index={playerIndex - 1}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAvailablePlayers = () => {
    return (
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
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
    <div className="space-y-6">
      <div>
        <Label htmlFor="teamA" className="text-lg font-semibold mb-2 block">Team A</Label>
        {renderTeamFormation(teamA, "Team A")}
      </div>

      <div>
        <Label htmlFor="teamB" className="text-lg font-semibold mb-2 block">Team B</Label>
        {renderTeamFormation(teamB, "Team B")}
      </div>

      <div>
        <Label className="text-lg font-semibold mb-2 block">Available Players</Label>
        {availablePlayers.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            All players have been assigned to teams
          </div>
        ) : renderAvailablePlayers()}
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
      className="relative cursor-pointer transition-all duration-200 hover:scale-105"
    >
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="player-card-mini bg-blue-900/40 rounded-lg p-3 flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              {player.image ? (
                <AvatarImage src={player.image} alt={player.name} />
              ) : (
                <AvatarFallback className="bg-primary/80 text-white">
                  {player.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="text-sm font-medium truncate">{player.name}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-64 bg-card/95 backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <Avatar className="h-12 w-12">
              {player.image ? (
                <AvatarImage src={player.image} alt={player.name} />
              ) : (
                <AvatarFallback className="bg-primary/80 text-white text-lg">
                  {player.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{player.name}</h4>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="bg-blue-900/20 rounded p-2 text-center">
              <div className="font-semibold">{player.stats?.played || 0}</div>
              <div className="text-muted-foreground">Played</div>
            </div>
            <div className="bg-green-900/20 rounded p-2 text-center">
              <div className="font-semibold">{player.stats?.won || 0}</div>
              <div className="text-muted-foreground">Won</div>
            </div>
            <div className="bg-red-900/20 rounded p-2 text-center">
              <div className="font-semibold">{player.stats?.lost || 0}</div>
              <div className="text-muted-foreground">Lost</div>
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
  index: number;
}

const PlayerFormationCard = ({ player, onClick, index }: PlayerFormationCardProps) => {
  return (
    <div className="player-position formation-player" onClick={onClick}>
      <div className="player-card-formation hover-scale cursor-pointer">
        <div className="player-number">{index + 1}</div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Avatar className="h-12 w-12 border-2 border-primary/30 hover:border-primary">
              {player.image ? (
                <AvatarImage src={player.image} alt={player.name} />
              ) : (
                <AvatarFallback className="bg-primary/80 text-white">
                  {player.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
          </HoverCardTrigger>
          <HoverCardContent className="w-64 bg-card/95 backdrop-blur-sm">
            <div className="flex justify-between items-start">
              <Avatar className="h-12 w-12">
                {player.image ? (
                  <AvatarImage src={player.image} alt={player.name} />
                ) : (
                  <AvatarFallback className="bg-primary/80 text-white text-lg">
                    {player.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">{player.name}</h4>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="bg-blue-900/20 rounded p-2 text-center">
                <div className="font-semibold">{player.stats?.played || 0}</div>
                <div className="text-muted-foreground">Played</div>
              </div>
              <div className="bg-green-900/20 rounded p-2 text-center">
                <div className="font-semibold">{player.stats?.won || 0}</div>
                <div className="text-muted-foreground">Won</div>
              </div>
              <div className="bg-red-900/20 rounded p-2 text-center">
                <div className="font-semibold">{player.stats?.lost || 0}</div>
                <div className="text-muted-foreground">Lost</div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        <div className="player-name">{player.name}</div>
      </div>
    </div>
  );
};

export default TeamSelection;
