
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
import { useEffect } from "react";
import PlayerSelection from "./team-randomizer/PlayerSelection";
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
    flashingPlayers,
    revealStage,
    teamAPlayers,
    teamBPlayers,
    revealIndex,
    togglePlayerSelection,
    performRandomization,
    setInitialSelectedPlayers
  } = useRandomizer(onRandomize);
  
  // Set initial selected players when the component mounts
  useEffect(() => {
    setInitialSelectedPlayers(players);
  }, [players, setInitialSelectedPlayers]);
  
  const availablePlayers = players.filter(player => selectedPlayers.includes(player.id));
  const canRandomize = availablePlayers.length > 0;
  const playerCount = availablePlayers.length;
  
  const renderPlayerCards = () => {
    // If not randomizing or in flashing stage, show the available players
    if (!isRandomizing || revealStage === 'flashing') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
        <div className="flex justify-between gap-8 flex-wrap">
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
            onClick={() => performRandomization(availablePlayers)}
            variant="outline"
            disabled={disabled || !canRandomize || isRandomizing}
            className="gap-2 mr-2"
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
      </div>
      
      {/* Main randomization area */}
      <div className="team-randomization-area mt-4">
        {renderPlayerCards()}
      </div>
      
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
