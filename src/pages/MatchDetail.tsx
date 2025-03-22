
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMatch, getPlayers, updateMatch } from "@/lib/db";
import { ArrowLeft, Trophy, Calendar, MapPin, Users, Edit, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import Confetti from "@/components/Confetti";

const MatchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [teamAScore, setTeamAScore] = useState<number | undefined>(undefined);
  const [teamBScore, setTeamBScore] = useState<number | undefined>(undefined);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: match, isLoading: isLoadingMatch } = useQuery({
    queryKey: ['match', id],
    queryFn: () => getMatch(id!),
    enabled: !!id
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers
  });

  // Update match mutation
  const updateMatchMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) => 
      updateMatch(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      
      toast({
        title: "Match updated",
        description: "The match result has been recorded successfully.",
      });
      
      setIsEditing(false);
      setShowConfetti(true);
      
      // Hide confetti after a few seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the match. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSaveResult = () => {
    if (teamAScore === undefined || teamBScore === undefined) {
      toast({
        title: "Validation Error",
        description: "Please enter scores for both teams.",
        variant: "destructive",
      });
      return;
    }

    if (teamAScore < 0 || teamBScore < 0) {
      toast({
        title: "Validation Error",
        description: "Scores cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    if (!match) return;

    const updates = {
      teamA: {
        ...match.teamA,
        score: teamAScore
      },
      teamB: {
        ...match.teamB,
        score: teamBScore
      },
      status: "completed" as const
    };

    updateMatchMutation.mutate({ id: match.id, updates });
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : "Unknown Player";
  };

  // Initialize form values when match data is loaded
  if (match && teamAScore === undefined && match.teamA.score !== undefined) {
    setTeamAScore(match.teamA.score);
  }
  if (match && teamBScore === undefined && match.teamB.score !== undefined) {
    setTeamBScore(match.teamB.score);
  }

  if (isLoadingMatch) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="shimmer rounded-xl h-[300px] mb-8"></div>
        <div className="shimmer rounded-xl h-[400px]"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Match Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The match you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/matches">View All Matches</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isCompleted = match.status === "completed";
  const winner = isCompleted && match.teamA.score !== undefined && match.teamB.score !== undefined
    ? match.teamA.score > match.teamB.score 
      ? match.teamA.name 
      : match.teamB.score > match.teamA.score 
        ? match.teamB.name 
        : null
    : null;

  return (
    <div className="page-container max-w-4xl mx-auto animate-slide-up">
      {showConfetti && <Confetti />}
      
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Match Header Card */}
      <Card className="shadow-lg mb-8 overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {match.teamA.name} vs {match.teamB.name}
                </h1>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(match.date).toLocaleDateString()}</span>
                  </div>
                  {match.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{match.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      isCompleted 
                        ? "bg-green-100 text-green-800" 
                        : "bg-blue-100 text-blue-800"
                    )}>
                      {isCompleted ? "Completed" : "Scheduled"}
                    </span>
                  </div>
                </div>
              </div>
              
              {!isCompleted && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Record Result
                </Button>
              )}
            </div>

            {/* Score Display or Edit Form */}
            {isCompleted ? (
              <div className="bg-muted/20 rounded-xl p-6 text-center mb-4">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                  <div className="text-center md:text-right flex-1">
                    <h3 className="text-xl font-bold">{match.teamA.name}</h3>
                  </div>

                  <div className="flex items-center justify-center px-6">
                    <div className="text-4xl font-bold">
                      {match.teamA.score} - {match.teamB.score}
                    </div>
                  </div>

                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-xl font-bold">{match.teamB.name}</h3>
                  </div>
                </div>
                
                {winner && (
                  <div className="mt-4 inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span className="font-medium">{winner} won the match</span>
                  </div>
                )}
                {!winner && isCompleted && (
                  <div className="mt-4 inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
                    <span className="font-medium">Match ended in a draw</span>
                  </div>
                )}
              </div>
            ) : isEditing ? (
              <div className="bg-muted/20 rounded-xl p-6 text-center mb-4">
                <h3 className="text-lg font-medium mb-4">Record Match Result</h3>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <div className="text-center md:text-right flex-1">
                    <h3 className="text-lg font-bold mb-2">{match.teamA.name}</h3>
                    <Input
                      type="number"
                      min="0"
                      value={teamAScore !== undefined ? teamAScore : ""}
                      onChange={(e) => setTeamAScore(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="text-center text-lg font-bold w-20 mx-auto"
                    />
                  </div>

                  <div className="flex items-center justify-center px-4">
                    <span className="text-xl font-bold text-muted-foreground">vs</span>
                  </div>

                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-lg font-bold mb-2">{match.teamB.name}</h3>
                    <Input
                      type="number"
                      min="0"
                      value={teamBScore !== undefined ? teamBScore : ""}
                      onChange={(e) => setTeamBScore(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="text-center text-lg font-bold w-20 mx-auto"
                    />
                  </div>
                </div>
                
                <div className="mt-6 space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setTeamAScore(match.teamA.score);
                      setTeamBScore(match.teamB.score);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveResult}
                    disabled={teamAScore === undefined || teamBScore === undefined || updateMatchMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save Result
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-muted/20 rounded-xl p-6 text-center mb-4">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  <div className="text-center md:text-right flex-1">
                    <h3 className="text-xl font-bold">{match.teamA.name}</h3>
                  </div>

                  <div className="flex items-center justify-center px-6">
                    <div className="text-xl font-medium text-muted-foreground">vs</div>
                  </div>

                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-xl font-bold">{match.teamB.name}</h3>
                  </div>
                </div>
                
                <div className="mt-4 text-muted-foreground">
                  <span>Waiting for match result</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teams Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Team A */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {match.teamA.name}
            </CardTitle>
            <CardDescription>
              {match.teamA.players.length} players
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {match.teamA.players.map(playerId => {
                const playerName = getPlayerName(playerId);
                const playerObj = players.find(p => p.id === playerId);
                
                return (
                  <Link 
                    key={playerId}
                    to={`/players/${playerId}`}
                    className="flex items-center p-3 rounded-lg hover:bg-blue-50 border border-blue-100 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mr-3">
                      {playerObj?.image ? (
                        <img
                          src={playerObj.image}
                          alt={playerName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-blue-600">
                          {playerName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{playerName}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Team B */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {match.teamB.name}
            </CardTitle>
            <CardDescription>
              {match.teamB.players.length} players
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {match.teamB.players.map(playerId => {
                const playerName = getPlayerName(playerId);
                const playerObj = players.find(p => p.id === playerId);
                
                return (
                  <Link 
                    key={playerId}
                    to={`/players/${playerId}`}
                    className="flex items-center p-3 rounded-lg hover:bg-red-50 border border-red-100 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center overflow-hidden mr-3">
                      {playerObj?.image ? (
                        <img
                          src={playerObj.image}
                          alt={playerName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-red-600">
                          {playerName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{playerName}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatchDetail;
