
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

interface TeamRandomizerProps {
  players: Player[];
  onRandomize: (players: Player[], teamSize: number) => void;
  disabled?: boolean;
}

const TeamRandomizer = ({ players, onRandomize, disabled = false }: TeamRandomizerProps) => {
  const [teamSize, setTeamSize] = useState<string>("5");
  const canRandomize = players.length > 0;
  const playerCount = players.length;
  
  const handleRandomize = () => {
    onRandomize(players, parseInt(teamSize));
  };
  
  return (
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
    </div>
  );
};

export default TeamRandomizer;
