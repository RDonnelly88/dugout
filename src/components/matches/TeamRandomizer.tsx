
import { Shuffle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Player } from "@/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TeamRandomizerProps {
  players: Player[];
  onRandomize: (players: Player[], teamSize: number) => void;
  disabled?: boolean;
}

const TeamRandomizer = ({ players, onRandomize, disabled = false }: TeamRandomizerProps) => {
  const [teamSize, setTeamSize] = useState<string>("5");
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(players.map(p => p.id));
  
  const availablePlayers = players.filter(player => selectedPlayers.includes(player.id));
  const canRandomize = availablePlayers.length > 0;
  const playerCount = availablePlayers.length;
  
  const handleRandomize = () => {
    const playersForRandomization = players.filter(player => selectedPlayers.includes(player.id));
    onRandomize(playersForRandomization, parseInt(teamSize));
  };

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4 items-center gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={teamSize} 
            onValueChange={setTeamSize}
            disabled={disabled}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Players per team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5-a-side</SelectItem>
              <SelectItem value="6">6-a-side</SelectItem>
              <SelectItem value="7">7-a-side</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={handleRandomize}
          variant="outline"
          disabled={disabled || !canRandomize}
          className="gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Randomize Teams
          {playerCount > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({playerCount} available)
            </span>
          )}
        </Button>
        
        <Button
          onClick={() => setShowPlayerSelection(!showPlayerSelection)}
          variant="ghost"
          size="sm"
        >
          {showPlayerSelection ? "Hide Selection" : "Select Players"}
        </Button>
      </div>
      
      {showPlayerSelection && (
        <div className="border rounded-md p-4 bg-card">
          <div className="mb-2 flex justify-between items-center">
            <h3 className="text-sm font-medium">Select Available Players</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedPlayers(players.map(p => p.id))}
              >
                Select All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedPlayers([])}
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
                />
                <Label htmlFor={`player-${player.id}`} className="cursor-pointer">
                  {player.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamRandomizer;
