
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
import PlayerSpotlight from "./team-randomizer/PlayerSpotlight";
import PlayerCard from "./team-randomizer/PlayerCard";
import { useRandomizer } from "./team-randomizer/hooks/useRandomizer";

interface TeamRandomizerProps {
  players: Player[];
  onRandomize: (players: Player[], teamSize: number) => void;
  disabled?: boolean;
}

const TeamRandomizer = ({ players, onRandomize, disabled = false }: TeamRandomizerProps) => {
  const {
    teamSize,
    setTeamSize,
    showPlayerSelection,
    setShowPlayerSelection,
    selectedPlayers,
    isRandomizing,
    randomizingPlayers,
    teamAPlayers,
    teamBPlayers,
    spotlightPlayer,
    revealComplete,
    revealIndex,
    revealStage,
    togglePlayerSelection,
    performDramaticRandomization,
    setInitialSelectedPlayers
  } = useRandomizer(onRandomize);
  
  const [flashingPlayers, setFlashingPlayers] = useState<string[]>([]);
  
  // Set initial selected players when the component mounts
  useEffect(() => {
    setInitialSelectedPlayers(players);
  }, [players, setInitialSelectedPlayers]);
  
  // Flash random players during the initial randomization stage
  useEffect(() => {
    if (isRandomizing && revealStage === 'flashing') {
      const interval = setInterval(() => {
        const availablePlayerIds = selectedPlayers;
        const randomPlayerIds = availablePlayerIds
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.floor(availablePlayerIds.length / 2));
        
        setFlashingPlayers(randomPlayerIds);
      }, 300);
      
      return () => clearInterval(interval);
    } else {
      setFlashingPlayers([]);
    }
  }, [isRandomizing, revealStage, selectedPlayers]);
  
  const availablePlayers = players.filter(player => selectedPlayers.includes(player.id));
  const canRandomize = availablePlayers.length > 0;
  const playerCount = availablePlayers.length;
  
  const renderPlayerCards = () => {
    // If not randomizing, show the available players
    if (!isRandomizing) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
          {availablePlayers.map((player, index) => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              index={index} 
              revealed={true} 
            />
          ))}
        </div>
      );
    }
    
    // During the flashing stage, show all players with some flashing
    if (revealStage === 'flashing') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
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
    
    // During the spotlight stage, show the spotlight player
    if (revealStage === 'spotlight' && spotlightPlayer) {
      return <PlayerSpotlight player={spotlightPlayer} />;
    }
    
    // During the assignment stage, show team assignments
    if (revealStage === 'assigning') {
      const allPlayers = [...teamAPlayers, ...teamBPlayers].slice(0, revealIndex + 1);
      
      return (
        <div className="mt-8">
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="team-column w-full md:w-5/12">
              <h3 className="text-xl font-bold text-center mb-4 text-red-400">Team A</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teamAPlayers.slice(0, Math.ceil((revealIndex + 1) / 2)).map((player, idx) => (
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
            
            <div className="team-column w-full md:w-5/12">
              <h3 className="text-xl font-bold text-center mb-4 text-green-400">Team B</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teamBPlayers.slice(0, Math.floor((revealIndex + 1) / 2)).map((player, idx) => (
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
        </div>
      );
    }
    
    // If randomizing but no specific stage, show nothing
    return null;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4 items-center gap-2 flex-wrap">
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
        
        <Button
          onClick={() => performDramaticRandomization(availablePlayers)}
          variant="outline"
          disabled={disabled || !canRandomize || isRandomizing}
          className="gap-2"
        >
          <Shuffle className={`h-4 w-4 ${isRandomizing ? 'animate-spin' : ''}`} />
          {isRandomizing ? "Randomizing..." : "Randomize Teams"}
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
      
      {/* Main randomization area */}
      {renderPlayerCards()}
      
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
