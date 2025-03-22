
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
import { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamRandomizerProps {
  players: Player[];
  onRandomize: (players: Player[], teamSize: number) => void;
  disabled?: boolean;
}

const TeamRandomizer = ({ players, onRandomize, disabled = false }: TeamRandomizerProps) => {
  const [teamSize, setTeamSize] = useState<string>("5");
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>(players.map(p => p.id));
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [randomizingPlayers, setRandomizingPlayers] = useState<Player[]>([]);
  const [randomizingIndex, setRandomizingIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const availablePlayers = players.filter(player => selectedPlayers.includes(player.id));
  const canRandomize = availablePlayers.length > 0;
  const playerCount = availablePlayers.length;
  
  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const shufflePlayers = (players: Player[]) => {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const performDramaticRandomization = async () => {
    setIsRandomizing(true);
    
    // Create and play audio
    if (!audioRef.current) {
      audioRef.current = new Audio("/randomizer-sound.mp3");
      audioRef.current.volume = 0.5;
    }
    
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    } catch (error) {
      console.error("Audio error:", error);
    }
    
    // Get filtered players and shuffle them
    const playersForRandomization = players.filter(player => selectedPlayers.includes(player.id));
    const shuffledPlayers = shufflePlayers(playersForRandomization);
    
    // Show sequential animation of player cards
    setRandomizingPlayers(shuffledPlayers);
    
    // Animate through each player
    for (let i = 0; i < Math.min(shuffledPlayers.length, 10); i++) {
      setRandomizingIndex(i);
      // Wait a short time between each player reveal
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // Pause for dramatic effect before finalizing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Complete randomization
    setIsRandomizing(false);
    setRandomizingPlayers([]);
    setRandomizingIndex(0);
    
    // Call the actual randomize function
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
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={performDramaticRandomization}
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
      
      {/* Dramatic randomization animation overlay */}
      {isRandomizing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="max-w-3xl w-full mx-auto px-4">
            <h2 className="text-center text-2xl font-bold text-white mb-8 animate-fade-in">
              Randomizing Teams
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {randomizingPlayers.map((player, idx) => (
                <div 
                  key={player.id}
                  className={`
                    ${idx <= randomizingIndex ? 'animate-scale-in' : 'opacity-0'}
                    duration-500 transition-all player-card-mini
                  `}
                >
                  <Card className="overflow-hidden h-full border-2 border-primary/50 hover:border-primary bg-card/80 backdrop-blur">
                    <CardContent className="p-4 flex flex-col items-center">
                      <Avatar className="h-16 w-16 mb-2">
                        {player.image ? (
                          <AvatarImage src={player.image} alt={player.name} />
                        ) : (
                          <AvatarFallback className="text-lg bg-gradient-blue text-white">
                            {player.name.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <h3 className="font-medium text-center line-clamp-1">{player.name}</h3>
                      
                      <div className="mt-2 grid grid-cols-2 gap-1 w-full text-xs">
                        <div className="bg-blue-50 dark:bg-blue-950/40 rounded p-1 text-center">
                          <div className="font-semibold">{player.stats?.played || 0}</div>
                          <div className="text-muted-foreground">Played</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950/40 rounded p-1 text-center">
                          <div className="font-semibold">{player.stats?.won || 0}</div>
                          <div className="text-muted-foreground">Won</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
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
                <Label htmlFor={`player-${player.id}`} className="cursor-pointer flex items-center">
                  <HoverCard>
                    <HoverCardTrigger>
                      <span className="hover:underline">{player.name}</span>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-60 p-0">
                      <div className="flex gap-2 p-2">
                        <Avatar className="h-10 w-10">
                          {player.image ? (
                            <AvatarImage src={player.image} alt={player.name} />
                          ) : (
                            <AvatarFallback className="bg-gradient-blue text-white">
                              {player.name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h4 className="text-sm font-semibold">{player.name}</h4>
                          <div className="text-xs text-muted-foreground">
                            {player.stats?.played || 0} Games Played
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1 p-2 pt-0 text-xs">
                        <div className="flex flex-col items-center bg-green-50 dark:bg-green-950/40 rounded p-1">
                          <span className="font-semibold">{player.stats?.won || 0}</span>
                          <span className="text-muted-foreground">Wins</span>
                        </div>
                        <div className="flex flex-col items-center bg-red-50 dark:bg-red-950/40 rounded p-1">
                          <span className="font-semibold">{player.stats?.lost || 0}</span>
                          <span className="text-muted-foreground">Losses</span>
                        </div>
                        <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-900/40 rounded p-1">
                          <span className="font-semibold">{player.stats?.drawn || 0}</span>
                          <span className="text-muted-foreground">Draws</span>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Hidden audio element for randomization sound effect */}
      <audio ref={audioRef} preload="auto" />
    </div>
  );
};

export default TeamRandomizer;
