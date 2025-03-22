
import { Shuffle, Users, Sparkles } from "lucide-react";
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
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import PlayerSpotlight from "./team-randomizer/PlayerSpotlight";

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
    spotlightPlayer,
    animationCompleted,
    hasStartedRandomization,
    performRandomization,
    resetRandomizer,
    togglePlayerSelection,
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
  
  // Effect to log modal state for debugging
  useEffect(() => {
    console.log(`Modal state: ${showRandomizerModal ? 'open' : 'closed'}, Animation completed: ${animationCompleted}`);
  }, [showRandomizerModal, animationCompleted]);
  
  const availablePlayers = players.filter(player => selectedPlayers.includes(player.id));
  const canRandomize = availablePlayers.length > 0;
  const playerCount = availablePlayers.length;
  
  // This function opens the modal and starts the randomization process
  const handleRandomizeClick = () => {
    // First open the modal
    setShowRandomizerModal(true);
    
    // Start randomization after a slight delay to ensure modal is visible
    setTimeout(() => {
      console.log("Starting randomization process from click handler");
      performRandomization(availablePlayers);
    }, 1000);
  };
  
  // Handle modal closing
  const handleModalClose = (open: boolean) => {
    if (!open) {
      console.log("Modal closing requested, animation completed:", animationCompleted);
      
      if (isRandomizing && !animationCompleted) {
        console.log("Preventing close while animation is running");
        return;
      }
      
      resetRandomizer();
      setShowRandomizerModal(false);
    }
  };
  
  const renderPlayerCards = () => {
    console.log("Rendering player cards for stage:", revealStage);
    
    // If in flashing stage, show the available players with dramatic flashing
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
    
    // Spotlight stage - show the spotlighted player card
    if (revealStage === 'spotlight' && spotlightPlayer) {
      return <PlayerSpotlight player={spotlightPlayer} />;
    }
    
    // During the team reveal stage, show the teams with cards revealing one by one
    if (revealStage === 'revealing') {
      return (
        <div className="flex justify-between gap-8 flex-wrap px-4">
          <div className="w-full md:w-5/12">
            <h3 className="text-xl font-bold text-center mb-4 text-red-400 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              Team A
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            </h3>
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
            <h3 className="text-xl font-bold text-center mb-4 text-green-400 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              Team B
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            </h3>
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
    
    // Celebration stage - show both teams fully revealed with animation
    if (revealStage === 'celebration') {
      return (
        <div className="flex justify-between gap-8 flex-wrap px-4">
          <div className="w-full md:w-5/12 animate-tada">
            <h3 className="text-xl font-bold text-center mb-4 text-red-400 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              Team A
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamAPlayers.map((player, idx) => (
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
          
          <div className="w-full md:w-5/12 animate-tada">
            <h3 className="text-xl font-bold text-center mb-4 text-green-400 flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
              Team B
              <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teamBPlayers.map((player, idx) => (
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
    
    // Default case - show a loading message or initial state
    return (
      <div className="flex flex-col items-center justify-center h-[300px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-blue-500/20 mb-4 flex items-center justify-center">
            <Shuffle className="h-10 w-10 text-blue-400" />
          </div>
          <p className="text-blue-400 text-xl">Preparing teams...</p>
          <p className="text-blue-300/60 text-sm mt-2">Please wait while we set up the randomizer</p>
        </div>
      </div>
    );
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
      
      {/* Loot Box Style Randomizer Modal Dialog */}
      <Dialog 
        open={showRandomizerModal}
        onOpenChange={handleModalClose}
      >
        <DialogPortal>
          <DialogOverlay className="bg-black/95 backdrop-blur-sm" />
          <DialogContent className="sm:max-w-[95%] md:max-w-[90%] lg:max-w-[85%] border-blue-500/30 neo-glassmorphism bg-black/90 p-0 overflow-hidden">
            <DialogTitle className="sr-only">Team Randomization</DialogTitle>
            <DialogDescription className="sr-only">Randomizing teams with dramatic effects</DialogDescription>
            
            <div className="randomizer-modal-container">
              <div className="randomizer-modal-header p-4 border-b border-blue-500/20">
                <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
                  {revealStage === 'flashing' && "Preparing Team Selection..."}
                  {revealStage === 'spotlight' && "Star Players Detected!"}
                  {revealStage === 'revealing' && "Revealing Teams..."}
                  {revealStage === 'celebration' && "Teams Assembled!"}
                  {revealStage === 'idle' && hasStartedRandomization && "Getting Ready..."}
                  {revealStage === 'idle' && !hasStartedRandomization && "Team Randomizer"}
                  <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                </h2>
              </div>
              
              <div className={`randomizer-modal-content p-6 ${revealStage === 'spotlight' ? 'h-[70vh]' : 'max-h-[70vh] overflow-y-auto'}`}>
                {renderPlayerCards()}
              </div>
              
              <div className="randomizer-modal-footer border-t border-blue-500/20 p-4 text-center text-sm text-blue-300/70">
                {revealStage === 'flashing' && <p>Scanning player database...</p>}
                {revealStage === 'spotlight' && <p>Star players identified!</p>}
                {revealStage === 'revealing' && <p>Generating balanced teams...</p>}
                {revealStage === 'celebration' && <p>Team creation complete!</p>}
                {revealStage === 'idle' && hasStartedRandomization && <p>Initializing randomizer...</p>}
                {revealStage === 'idle' && !hasStartedRandomization && <p>Click outside or the X to close</p>}
                {animationCompleted && <p>Teams have been saved! Click the X or outside to close.</p>}
              </div>
            </div>
            
            {/* Only show the close button when animation is complete or if randomization hasn't started */}
            {(animationCompleted || !hasStartedRandomization) && (
              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <Sparkles className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </DialogClose>
            )}
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
