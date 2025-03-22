
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMatches, getPlayers, deleteMatch } from "@/lib/db";
import { Match } from "@/types";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useMatchFiltering } from "@/hooks/useMatchFiltering";
import MatchList from "@/components/matches/MatchList";
import DeleteMatchDialog from "@/components/matches/DeleteMatchDialog";

const Matches = () => {
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

  const { searchTerm, setSearchTerm, filteredMatches } = useMatchFiltering(matches);

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

      <MatchList
        matches={filteredMatches}
        isLoading={isLoadingMatches}
        searchTerm={searchTerm}
        onDeleteClick={handleDeleteClick}
      />

      <DeleteMatchDialog
        match={matchToDelete}
        onOpenChange={(open) => !open && setMatchToDelete(null)}
        onConfirmDelete={confirmDelete}
      />
    </div>
  );
};

export default Matches;
