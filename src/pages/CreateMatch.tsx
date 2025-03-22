
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlayers, addMatch } from "@/lib/db";
import { Player, TeamInfo } from "@/types";
import { ArrowLeft, Users, Shuffle, Plus, Check, X, UserPlus, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import Confetti from "@/components/Confetti";

const CreateMatch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState("");
  
  const [teamA, setTeamA] = useState<TeamInfo>({ name: "Team A", players: [] });
  const [teamB, setTeamB] = useState<TeamInfo>({ name: "Team B", players: [] });
  
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [showRandomizer, setShowRandomizer] = useState(false);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers
  });

  // Check if we have 10 players selected
  const hasEnoughPlayers = selectedPlayers.length === 10;
  const teamsFilled = teamA.players.length === 5 && teamB.players.length === 5;

  // Add match mutation
  const addMatchMutation = useMutation({
    mutationFn: (matchData: any) => addMatch(matchData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast({
        title: "Match created",
        description: "The match has been created successfully.",
      });
      // Type cast data to Match to access the id property
      const match = data as Match;
      navigate(`/matches/${match.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create the match. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Toggle player selection
  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        if (prev.length < 10) {
          return [...prev, playerId];
        }
        return prev;
      }
    });
  };

  // Reset teams
  const resetTeams = () => {
    setTeamA({ ...teamA, players: [] });
    setTeamB({ ...teamB, players: [] });
  };

  // Randomize teams with animation
  const randomizeTeams = () => {
    if (!hasEnoughPlayers) return;
    
    resetTeams();
    setIsRandomizing(true);
    setShowConfetti(true);
    
    // Create a shuffled copy of selected players
    const shuffled = [...selectedPlayers].sort(() => 0.5 - Math.random());
    
    // Animate the randomization process
    let count = 0;
    const totalIterations = 15; // Number of shuffle animations
    const interval = setInterval(() => {
      count++;
      
      // On each interval, reshuffle players
      const tempShuffle = [...selectedPlayers].sort(() => 0.5 - Math.random());
      
      // Distribute to teams
      const tempTeamA = tempShuffle.slice(0, 5);
      const tempTeamB = tempShuffle.slice(5, 10);
      
      setTeamA(prev => ({ ...prev, players: tempTeamA }));
      setTeamB(prev => ({ ...prev, players: tempTeamB }));
      
      // Stop after set number of iterations
      if (count >= totalIterations) {
        clearInterval(interval);
        
        // Set final teams
        const finalTeamA = shuffled.slice(0, 5);
        const finalTeamB = shuffled.slice(5, 10);
        
        setTeamA(prev => ({ ...prev, players: finalTeamA }));
        setTeamB(prev => ({ ...prev, players: finalTeamB }));
        
        setIsRandomizing(false);
        
        // Hide confetti after 3 seconds
        setTimeout(() => {
          setShowConfetti(false);
        }, 3000);
      }
    }, 100); // Speed of shuffle animation
  };

  // Add player to team
  const addPlayerToTeam = (playerId: string, team: "A" | "B") => {
    if (team === "A") {
      if (teamA.players.length < 5) {
        setTeamA(prev => ({
          ...prev,
          players: [...prev.players, playerId]
        }));
      }
    } else {
      if (teamB.players.length < 5) {
        setTeamB(prev => ({
          ...prev,
          players: [...prev.players, playerId]
        }));
      }
    }
  };

  // Remove player from team
  const removePlayerFromTeam = (playerId: string, team: "A" | "B") => {
    if (team === "A") {
      setTeamA(prev => ({
        ...prev,
        players: prev.players.filter(id => id !== playerId)
      }));
    } else {
      setTeamB(prev => ({
        ...prev,
        players: prev.players.filter(id => id !== playerId)
      }));
    }
  };

  // Create match
  const handleCreateMatch = () => {
    if (!date) {
      toast({
        title: "Validation Error",
        description: "Please select a date for the match.",
        variant: "destructive",
      });
      return;
    }

    if (!teamsFilled) {
      toast({
        title: "Validation Error",
        description: "Both teams must have exactly 5 players.",
        variant: "destructive",
      });
      return;
    }

    const matchData = {
      date,
      location: location || undefined,
      teamA,
      teamB,
      status: "scheduled" as const
    };

    addMatchMutation.mutate(matchData);
  };

  // Check if all selected players are assigned to teams
  const allPlayersAssigned = () => {
    const assignedPlayers = [...teamA.players, ...teamB.players];
    return selectedPlayers.every(id => assignedPlayers.includes(id)) && 
           assignedPlayers.length === selectedPlayers.length;
  };

  return (
    <div className="page-container max-w-4xl mx-auto animate-slide-up">
      {showConfetti && <Confetti />}
      
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Create New Match</CardTitle>
          <CardDescription>
            Set up a new 5-a-side football match
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Match Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Location (Optional)
              </Label>
              <Input
                id="location"
                placeholder="Enter match location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Team Names */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="teamA">Team A Name</Label>
              <Input
                id="teamA"
                placeholder="Team A"
                value={teamA.name}
                onChange={(e) => setTeamA({ ...teamA, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamB">Team B Name</Label>
              <Input
                id="teamB"
                placeholder="Team B"
                value={teamB.name}
                onChange={(e) => setTeamB({ ...teamB, name: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Selection */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Players
          </CardTitle>
          <CardDescription>
            Choose 10 players for your 5-a-side match
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="shimmer h-12 rounded-md"></div>
              ))}
            </div>
          ) : players.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {players.map((player) => {
                const isSelected = selectedPlayers.includes(player.id);
                const isInTeamA = teamA.players.includes(player.id);
                const isInTeamB = teamB.players.includes(player.id);
                const isAssigned = isInTeamA || isInTeamB;

                return (
                  <div
                    key={player.id}
                    className={cn(
                      "flex items-center p-3 rounded-lg border transition-all",
                      isSelected && !isAssigned && "border-primary bg-primary/5",
                      isInTeamA && "border-blue-500 bg-blue-50",
                      isInTeamB && "border-red-500 bg-red-50",
                      !isSelected && "hover:bg-muted/50 border-border",
                      (selectedPlayers.length >= 10 && !isSelected) && "opacity-50"
                    )}
                  >
                    <div className="flex-1 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden mr-3">
                        {player.image ? (
                          <img
                            src={player.image}
                            alt={player.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-primary">
                            {player.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="font-medium truncate">{player.name}</span>
                    </div>
                    
                    <div className="flex items-center">
                      {isInTeamA && (
                        <span className="mr-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                          Team A
                        </span>
                      )}
                      {isInTeamB && (
                        <span className="mr-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                          Team B
                        </span>
                      )}
                      
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => togglePlayerSelection(player.id)}
                        disabled={selectedPlayers.length >= 10 && !isSelected}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No players available. Add some players first.
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedPlayers.length} of 10 players selected
            </div>
            <Button
              onClick={() => {
                if (hasEnoughPlayers) {
                  setShowRandomizer(true);
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                } else {
                  toast({
                    title: "Not enough players",
                    description: "Please select exactly 10 players for the match.",
                    variant: "destructive",
                  });
                }
              }}
              disabled={!hasEnoughPlayers}
            >
              Continue to Team Setup
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Setup */}
      {showRandomizer && (
        <div className="animate-slide-up">
          <Card className="shadow-lg mb-8 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Setup
              </CardTitle>
              <CardDescription>
                Assign players to teams or use the randomizer
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="mb-6 flex justify-center">
                <Button
                  size="lg"
                  className={cn(
                    "animate-pulse transition-all",
                    isRandomizing && "animate-bounce bg-primary"
                  )}
                  onClick={randomizeTeams}
                  disabled={isRandomizing || !hasEnoughPlayers}
                >
                  <Shuffle className="h-5 w-5 mr-2" />
                  {isRandomizing ? "Randomizing..." : "Randomize Teams"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team A */}
                <div className={cn(
                  "bg-blue-50 border border-blue-200 rounded-xl p-4 transition-all",
                  isRandomizing && "animate-pulse"
                )}>
                  <h3 className="text-lg font-semibold text-blue-800 mb-3 text-center">{teamA.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    {teamA.players.map(playerId => {
                      const player = players.find(p => p.id === playerId);
                      if (!player) return null;
                      
                      return (
                        <div 
                          key={player.id}
                          className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm"
                        >
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-2">
                              {player.image ? (
                                <img
                                  src={player.image}
                                  alt={player.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-blue-600">
                                  {player.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <span className="font-medium">{player.name}</span>
                          </div>
                          
                          {!isRandomizing && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removePlayerFromTeam(player.id, "A")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                    
                    {Array.from({ length: 5 - teamA.players.length }).map((_, i) => (
                      <div 
                        key={`empty-a-${i}`}
                        className="flex items-center justify-center bg-white bg-opacity-50 rounded-lg p-2 h-12 border border-dashed border-blue-200"
                      >
                        <span className="text-sm text-blue-400">Empty slot</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Team B */}
                <div className={cn(
                  "bg-red-50 border border-red-200 rounded-xl p-4 transition-all",
                  isRandomizing && "animate-pulse"
                )}>
                  <h3 className="text-lg font-semibold text-red-800 mb-3 text-center">{teamB.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    {teamB.players.map(playerId => {
                      const player = players.find(p => p.id === playerId);
                      if (!player) return null;
                      
                      return (
                        <div 
                          key={player.id}
                          className="flex items-center justify-between bg-white rounded-lg p-2 shadow-sm"
                        >
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center overflow-hidden mr-2">
                              {player.image ? (
                                <img
                                  src={player.image}
                                  alt={player.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-red-600">
                                  {player.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <span className="font-medium">{player.name}</span>
                          </div>
                          
                          {!isRandomizing && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => removePlayerFromTeam(player.id, "B")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                    
                    {Array.from({ length: 5 - teamB.players.length }).map((_, i) => (
                      <div 
                        key={`empty-b-${i}`}
                        className="flex items-center justify-center bg-white bg-opacity-50 rounded-lg p-2 h-12 border border-dashed border-red-200"
                      >
                        <span className="text-sm text-red-400">Empty slot</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Unassigned Players */}
              {(!teamsFilled && !isRandomizing) && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Unassigned Players:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedPlayers.filter(id => 
                      !teamA.players.includes(id) && !teamB.players.includes(id)
                    ).map(playerId => {
                      const player = players.find(p => p.id === playerId);
                      if (!player) return null;
                      
                      return (
                        <div 
                          key={player.id}
                          className="flex items-center justify-between bg-muted/30 rounded-lg p-2"
                        >
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden mr-2">
                              {player.image ? (
                                <img
                                  src={player.image}
                                  alt={player.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-primary">
                                  {player.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <span className="font-medium">{player.name}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => addPlayerToTeam(player.id, "A")}
                              disabled={teamA.players.length >= 5}
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Team A
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => addPlayerToTeam(player.id, "B")}
                              disabled={teamB.players.length >= 5}
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Team B
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-muted/30 px-6 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetTeams();
                    setShowRandomizer(false);
                  }}
                >
                  Back to Player Selection
                </Button>
                
                <Button 
                  onClick={handleCreateMatch}
                  disabled={!teamsFilled || isRandomizing || addMatchMutation.isPending}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create Match
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CreateMatch;
