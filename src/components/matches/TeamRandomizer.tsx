
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
import { useState, useEffect } from "react";
import PlayerSelection from "./team-randomizer/PlayerSelection";
import CardPackRandomizer from "./team-randomizer/CardPackRandomizer";
import { 
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";

interface TeamRandomizerProps {
  players: Player[];
  onRandomize: (players: Player[], teamSize: number) => void;
  disabled?: boolean;
}

const TeamRandomizer = ({ players, onRandomize, disabled = false }: TeamRandomizerProps) => {
  const [teamSize, setTeamSize] = useState<string>("5");
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [showRandomizerModal, setShowRandomizerModal] = useState(false);
  
  // Initialize the selected players when the component mounts
  useEffect(() => {
    setSelectedPlayers(players.map(p => p.id));
  }, [players]);
  
  const availablePlayers = players.filter(player => selectedPlayers.includes(player.id));
  const canRandomize = availablePlayers.length >= 2; // Need at least 2 players
  const playerCount = availablePlayers.length;
  
  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };
  
  const handleRandomizeClick = () => {
    if (!canRandomize) return;
    setIsRandomizing(true);
    setShowRandomizerModal(true);
  };
  
  const handleRandomizerComplete = (teamAPlayers: Player[], teamBPlayers: Player[]) => {
    setShowRandomizerModal(false);
    setIsRandomizing(false);
    
    // Call onRandomize with all players and team size
    const allPlayers = [...teamAPlayers, ...teamBPlayers];
    onRandomize(allPlayers, parseInt(teamSize));
  };
  
  const handleRandomizerCancel = () => {
    setShowRandomizerModal(false);
    setIsRandomizing(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-4 items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Select 
            value={teamSize} 
            onValueChange={setTeamSize}
            disabled={disabled || isRandomizing}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Players per team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5-a-side</SelectItem>
              <SelectItem value="6">6-a-side</SelectItem>
              <SelectItem value="7">7-a-side</SelectItem>
              <SelectItem value="8">8-a-side</SelectItem>
              <SelectItem value="9">9-a-side</SelectItem>
              <SelectItem value="10">10-a-side</SelectItem>
              <SelectItem value="11">11-a-side</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Button
            onClick={handleRandomizeClick}
            variant="outline"
            disabled={disabled || !canRandomize || isRandomizing}
            className="gap-2 mr-2"
          >
            <Shuffle className="h-4 w-4" />
            Randomize Teams
            {playerCount > 0 && !isRandomizing && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({playerCount} available)
              </span>
            )}
          </Button>
          
          <Button
            onClick={() => setShowPlayerSelection(!showPlayerSelection)}
            variant="ghost"
            size="sm"
            disabled={isRandomizing}
          >
            {showPlayerSelection ? "Hide Selection" : "Select Players"}
          </Button>
        </div>
      </div>
      
      <Dialog 
        open={showRandomizerModal}
        onOpenChange={(open) => {
          if (!open) handleRandomizerCancel();
        }}
      >
        <DialogPortal>
          <DialogOverlay className="bg-black/95 backdrop-blur-sm" />
          <DialogContent className="sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%] border-blue-500/30 neo-glassmorphism bg-black/90 p-6 overflow-hidden">
            <CardPackRandomizer 
              players={availablePlayers}
              onComplete={handleRandomizerComplete}
              onCancel={handleRandomizerCancel}
            />
          </DialogContent>
        </DialogPortal>
      </Dialog>
      
      {showPlayerSelection && (
        <PlayerSelection
          players={players}
          selectedPlayers={selectedPlayers}
          togglePlayerSelection={togglePlayerSelection}
          disabled={isRandomizing || disabled}
        />
      )}
    </div>
  );
};

export default TeamRandomizer;
