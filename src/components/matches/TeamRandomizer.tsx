
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
import { useEffect, useState } from "react";
import PlayerSelection from "./team-randomizer/PlayerSelection";
import PlayerCard from "./team-randomizer/PlayerCard";
import { useRandomizer } from "./team-randomizer/hooks/useRandomizer";
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
  const [showRandomizerModal, setShowRandomizerModal] = useState(false);
  
  const {
    teamSize,
    setTeamSize,
    showPlayerSelection,
    setShowPlayerSelection,
    selectedPlayers,
    isRandomizing,
    flashingPlayers,
    revealStage,
    teamAPlayers,
    teamBPlayers,
    revealIndex,
    togglePlayerSelection,
    performRandomization,
    resetRandomizer,
    setInitialSelectedPlayers
  } = useRandomizer(onRandomize);
  
  // Set initial selected players when the component mounts
  useEffect(() => {
    setInitialSelectedPlayers(players);
    
    // Make sure to reset the randomizer when unmounting
    return () => {
      resetRandomizer();
    };
  }, [players, setInitialSelectedPlayers, resetRandomizer]);
  
  const availablePlayers = players.filter(player => selectedPlayers.includes(player.id));
  const canRandomize = availablePlayers.length > 0;
  const playerCount = availablePlayers.length;
  
  const handleRandomizeClick = () => {
    setShowRandomizerModal(true);
    performRandomization(availablePlayers);
  };
  
  // Close the modal when randomization completes
  useEffect(() => {
    if (!isRandomizing && showRandomizerModal) {
      // Add a small delay before closing the modal to show the final teams
      const timer = setTimeout(() => {
        setShowRandomizerModal(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isRandomizing, showRandomizerModal]);
  
  const renderPlayerCards = () => {
    // If in flashing stage, show the available players
    if (revealStage === 'flashing') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4">
          {availablePlayers.map((player, index) => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              index={index} 
              revealed={true}
              flashing={flashingPlayers.includes(player.id)}
              selected={flashingPlayers.includes(player.id)}
            />
          ))}
        </div>
      );
    }
    
    // During the team reveal stage, show the teams
    if (revealStage === 'revealing') {
      return (
        <div className="flex justify-between gap-8 flex-wrap px-4">
          <div className="w-full md:w-5/12">
            <h3 className="text-xl font-bold text-center mb-4 text-red-400">Team A</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamAPlayers.slice(0, revealIndex + 1).map((player, idx) => (
                <PlayerCard 
                  key={player.id} 
                  player={player} 
                  index={idx} 
                  revealed={true}
                  teamColor="A"
                />
              ))}
            </div>
          </div>
          
          <div className="w-full md:w-5/12">
            <h3 className="text-xl font-bold text-center mb-4 text-green-400">Team B</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamBPlayers.slice(0, revealIndex + 1).map((player, idx) => (
                <PlayerCard 
                  key={player.id} 
                  player={player} 
                  index={idx} 
                  revealed={true}
                  teamColor="B"
                />
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // Default case
    return null;
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
      
      {/* Randomizer Modal Dialog */}
      <Dialog open={showRandomizerModal} onOpenChange={setShowRandomizerModal}>
        <DialogPortal>
          <DialogOverlay className="bg-black/90 backdrop-blur-sm" />
          <DialogContent className="sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%] border-blue-500/30 neo-glassmorphism bg-black/80 p-0 overflow-hidden">
            <div className="randomizer-modal-container">
              <div className="randomizer-modal-header p-4 border-b border-blue-500/20">
                <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {revealStage === 'flashing' ? "Randomizing Teams..." : "Team Reveal"}
                </h2>
              </div>
              
              <div className="randomizer-modal-content p-6 max-h-[70vh] overflow-y-auto">
                {renderPlayerCards()}
              </div>
              
              <div className="randomizer-modal-footer border-t border-blue-500/20 p-4 text-center text-sm text-blue-300/70">
                {isRandomizing ? (
                  <p>Creating balanced teams...</p>
                ) : (
                  <p>Teams have been created! The dialog will close automatically...</p>
                )}
              </div>
            </div>
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
      
      {/* Hidden audio element for randomization sound effect */}
      <audio preload="auto" />
    </div>
  );
};

export default TeamRandomizer;
