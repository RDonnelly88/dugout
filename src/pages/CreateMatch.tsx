
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlayers, addMatch } from "@/lib/db";
import { Player } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const CreateMatch = () => {
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers
  });

  const availablePlayers = players.filter(player =>
    !teamA.includes(player.id) && !teamB.includes(player.id)
  );

  const togglePlayer = (team: 'A' | 'B', playerId: string) => {
    if (team === 'A') {
      if (teamA.includes(playerId)) {
        setTeamA(teamA.filter(id => id !== playerId));
      } else {
        setTeamA([...teamA, playerId]);
      }
      setTeamB(teamB.filter(id => id !== playerId));
    } else {
      if (teamB.includes(playerId)) {
        setTeamB(teamB.filter(id => id !== playerId));
      } else {
        setTeamB([...teamB, playerId]);
      }
      setTeamA(teamA.filter(id => id !== playerId));
    }
  };

  const createMatchMutation = useMutation({
    mutationFn: (matchData: any) => addMatch(matchData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      const typedData = data as any; // Type cast to 'any' to resolve the TS error
      navigate(`/matches/${typedData.id}`);
      toast({
        title: "Match created",
        description: "The match has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create the match. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date for the match.",
        variant: "destructive",
      });
      return;
    }

    if (teamA.length !== 5 || teamB.length !== 5) {
      toast({
        title: "Error",
        description: "Each team must have exactly 5 players.",
        variant: "destructive",
      });
      return;
    }

    const matchData = {
      teamA,
      teamB,
      date: date.toISOString(),
      status: "scheduled"
    };

    createMatchMutation.mutate(matchData);
  };

  return (
    <div className="page-container animate-slide-up">
      <div className="page-header">
        <h1 className="page-title">Create Match</h1>
        <p className="mt-2 text-muted-foreground">
          Set up your next 5-a-side match
        </p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="teamA">Team A</Label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {players.filter(player => teamA.includes(player.id)).map(player => (
                  <Button
                    key={player.id}
                    variant="secondary"
                    className="w-full"
                    onClick={() => togglePlayer('A', player.id)}
                  >
                    {player.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="teamB">Team B</Label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {players.filter(player => teamB.includes(player.id)).map(player => (
                  <Button
                    key={player.id}
                    variant="secondary"
                    className="w-full"
                    onClick={() => togglePlayer('B', player.id)}
                  >
                    {player.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Available Players</Label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availablePlayers.map(player => (
                  <Button
                    key={player.id}
                    variant="outline"
                    className="w-full"
                    onClick={() => togglePlayer(teamA.length <= teamB.length ? 'A' : 'B', player.id)}
                  >
                    {player.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button type="submit" className="w-full" disabled={createMatchMutation.isPending}>
              {createMatchMutation.isPending ? "Creating..." : "Create Match"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMatch;
