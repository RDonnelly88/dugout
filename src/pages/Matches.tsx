import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMatches, getPlayers, deleteMatch } from "@/lib/db";
import { Match } from "@/types";
import { Plus, Search, Calendar, Trash2, AlertTriangle, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

const Matches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches
  });

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      toast({
        title: "Match deleted",
        description: "The match has been removed successfully.",
      });
      setMatchToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the match. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteClick = (match: Match) => {
    setMatchToDelete(match);
  };

  const confirmDelete = () => {
    if (matchToDelete) {
      deleteMutation.mutate(matchToDelete.id);
    }
  };

  const getPlayerName = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : "Unknown Player";
  };

  const filteredMatches = matches.filter(match => {
    const teamAName = match.teamA?.name || "";
    const teamBName = match.teamB?.name || "";
    
    return teamAName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           teamBName.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">Matches</h1>
        <p className="mt-2 text-muted-foreground">
          Create and manage your football matches
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search matches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full sm:w-[300px]"
          />
        </div>
        <Button asChild>
          <Link to="/matches/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Match
          </Link>
        </Button>
      </div>

      {isLoadingMatches ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shimmer h-[150px]" />
          ))}
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="space-y-4">
          {filteredMatches.map((match) => (
            <Card key={match.id} className="match-card hover-scale overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(match.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full ${
                      match.status === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {match.status === "completed" ? "Completed" : "Scheduled"}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
                    <div className="text-center md:text-right flex-1">
                      <h3 className="text-lg font-bold">{match.teamA.name}</h3>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {match.teamA.players.length} players
                      </div>
                    </div>

                    <div className="flex items-center justify-center px-6">
                      {match.status === "completed" && match.teamA.score !== undefined && match.teamB.score !== undefined ? (
                        <div className="text-3xl font-bold">
                          {match.teamA.score} - {match.teamB.score}
                        </div>
                      ) : (
                        <div className="text-lg font-medium text-muted-foreground">vs</div>
                      )}
                    </div>

                    <div className="text-center md:text-left flex-1">
                      <h3 className="text-lg font-bold">{match.teamB.name}</h3>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {match.teamB.players.length} players
                      </div>
                    </div>
                  </div>

                  {match.status === "completed" && (
                    <div className="flex justify-center mb-4">
                      <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                        <Trophy className="h-3.5 w-3.5 mr-1" />
                        {match.teamA.score !== undefined && match.teamB.score !== undefined ? (
                          match.teamA.score > match.teamB.score 
                            ? `${match.teamA.name} won` 
                            : match.teamB.score > match.teamA.score 
                              ? `${match.teamB.name} won` 
                              : "Match Drawn"
                        ) : "Result Recorded"}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex border-t">
                  <Link 
                    to={`/matches/${match.id}`} 
                    className="flex-1 py-3 text-center text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    View Details
                  </Link>
                  <div className="w-px bg-border"></div>
                  <button 
                    onClick={() => handleDeleteClick(match)} 
                    className="flex-1 py-3 text-center text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "No matches match your search" : "No matches created yet"}
          </p>
          {!searchTerm && (
            <Button asChild>
              <Link to="/matches/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Match
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!matchToDelete} onOpenChange={(open) => !open && setMatchToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Match
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this match? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Matches;
