
import { Player } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
  return (
    <>
      <div>
        <Label htmlFor="teamA">Team A</Label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {players.filter(player => teamA.includes(player.id)).map(player => (
            <Button
              key={player.id}
              variant="secondary"
              className="w-full"
              onClick={() => togglePlayer('A', player.id)}
            >
              {player.name}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="teamB">Team B</Label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {players.filter(player => teamB.includes(player.id)).map(player => (
            <Button
              key={player.id}
              variant="secondary"
              className="w-full"
              onClick={() => togglePlayer('B', player.id)}
            >
              {player.name}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label>Available Players</Label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availablePlayers.map(player => (
            <Button
              key={player.id}
              variant="outline"
              className="w-full"
              onClick={() => togglePlayer(teamA.length <= teamB.length ? 'A' : 'B', player.id)}
            >
              {player.name}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
};

export default TeamSelection;
