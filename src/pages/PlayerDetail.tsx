
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPlayer, getMatches } from "@/lib/db";
import { ArrowLeft, Edit, Trophy, Calendar, User, Target, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Match } from "@/types";

const PlayerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: player, isLoading: isLoadingPlayer } = useQuery({
    queryKey: ['player', id],
    queryFn: () => getPlayer(id!),
    enabled: !!id
  });

  const { data: allMatches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches
  });

  // Filter matches this player participated in
  const playerMatches = allMatches.filter(match => {
    return (
      match.teamA.players.includes(id!) || 
      match.teamB.players.includes(id!)
    );
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate win percentage
  const winPercentage = player?.stats.played 
    ? Math.round((player.stats.won / player.stats.played) * 100) 
    : 0;

  // Helper to determine if this player won a specific match
  const didPlayerWin = (match: Match): boolean | null => {
    if (match.status !== "completed" || match.teamA.score === undefined || match.teamB.score === undefined) {
      return null;
    }

    const isInTeamA = match.teamA.players.includes(id!);
    const isInTeamB = match.teamB.players.includes(id!);
    
    if (isInTeamA) {
      return match.teamA.score > match.teamB.score;
    } else if (isInTeamB) {
      return match.teamB.score > match.teamA.score;
    }
    
    return null;
  };

  if (isLoadingPlayer) {
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

  if (!player) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Player Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The player you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/players">View All Players</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-slide-up">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Player Profile Card */}
      <Card className="glass-card shadow-lg overflow-hidden mb-8">
        <CardContent className="p-0">
          <div className="p-8 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {player.image ? (
                <img
                  src={player.image}
                  alt={player.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-5xl font-medium text-primary">
                  {player.name.charAt(0)}
                </span>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{player.name}</h1>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Joined {new Date(player.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-2">
                <Button asChild className="mr-2">
                  <Link to={`/players/edit/${player.id}`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-t">
            <div className="stat-card p-6 text-center border-r border-b md:border-b-0">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mb-3">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold">{player.stats.won}</div>
              <div className="text-sm text-muted-foreground">Wins</div>
            </div>
            
            <div className="stat-card p-6 text-center border-b md:border-b-0 md:border-r">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-700 mb-3">
                <User className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold">{player.stats.played}</div>
              <div className="text-sm text-muted-foreground">Matches Played</div>
            </div>
            
            <div className="stat-card p-6 text-center border-r">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-700 mb-3">
                <Target className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold">{player.stats.lost}</div>
              <div className="text-sm text-muted-foreground">Losses</div>
            </div>
            
            <div className="stat-card p-6 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-purple-700 mb-3">
                <Percent className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold">{winPercentage}%</div>
              <div className="text-sm text-muted-foreground">Win Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Match History */}
      <Card className="shadow-md mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Match History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {playerMatches.length > 0 ? (
            <div className="space-y-4">
              {playerMatches.map((match) => {
                const playerWon = didPlayerWin(match);
                const isInTeamA = match.teamA.players.includes(id!);
                const playerTeam = isInTeamA ? match.teamA : match.teamB;
                const opposingTeam = isInTeamA ? match.teamB : match.teamA;
                
                return (
                  <Link 
                    key={match.id} 
                    to={`/matches/${match.id}`}
                    className="block"
                  >
                    <div className={`p-4 rounded-lg transition-colors hover:bg-muted ${
                      playerWon === true 
                        ? "bg-green-50 border-l-4 border-green-500" 
                        : playerWon === false
                          ? "bg-red-50 border-l-4 border-red-500"
                          : playerWon === null && match.status === "completed"
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : "bg-gray-50 border-l-4 border-gray-300"
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">
                          {new Date(match.date).toLocaleDateString()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          match.status === "completed" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {match.status === "completed" ? "Completed" : "Scheduled"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="font-medium text-sm">
                          {playerTeam.name}
                          <span className="ml-1 text-xs text-muted-foreground">(Your Team)</span>
                        </div>
                        
                        {match.status === "completed" && match.teamA.score !== undefined && match.teamB.score !== undefined && (
                          <div className="font-bold">
                            {isInTeamA ? match.teamA.score : match.teamB.score} - {isInTeamA ? match.teamB.score : match.teamA.score}
                          </div>
                        )}
                        
                        <div className="font-medium text-sm">
                          {opposingTeam.name}
                        </div>
                      </div>
                      
                      {playerWon === true && (
                        <div className="mt-2 text-xs text-green-600 font-medium">Win</div>
                      )}
                      {playerWon === false && (
                        <div className="mt-2 text-xs text-red-600 font-medium">Loss</div>
                      )}
                      {playerWon === null && match.status === "completed" && (
                        <div className="mt-2 text-xs text-blue-600 font-medium">Draw</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No matches played yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerDetail;
