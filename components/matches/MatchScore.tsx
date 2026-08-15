
import React from "react";
import { Trophy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Match } from "@/types";
import { UseMutationResult } from "@tanstack/react-query";

interface MatchScoreProps {
  match: Match;
  isCompleted: boolean;
  isEditing: boolean;
  teamAScore: number | undefined;
  teamBScore: number | undefined;
  onScoreChange: {
    teamA: (value: number | undefined) => void;
    teamB: (value: number | undefined) => void;
  };
  onCancel: () => void;
  onSave: () => void;
  updateMatchMutation: UseMutationResult<any, any, any, any>;
}

const MatchScore = ({
  match,
  isCompleted,
  isEditing,
  teamAScore,
  teamBScore,
  onScoreChange,
  onCancel,
  onSave,
  updateMatchMutation
}: MatchScoreProps) => {
  // Determine winner
  const winner = isCompleted && match.teamA.score !== undefined && match.teamB.score !== undefined
    ? match.teamA.score > match.teamB.score 
      ? match.teamA.name 
      : match.teamB.score > match.teamA.score 
        ? match.teamB.name 
        : null
    : null;

  if (isCompleted) {
    return (
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
          <div className="mt-4 inline-flex items-center bg-win/10 text-win px-4 py-2 rounded-full">
            <Trophy className="h-4 w-4 mr-2" />
            <span className="font-medium">{winner} won the match</span>
          </div>
        )}
        {!winner && isCompleted && (
          <div className="mt-4 inline-flex items-center bg-info/10 text-info px-4 py-2 rounded-full">
            <span className="font-medium">Match ended in a draw</span>
          </div>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-muted/20 rounded-xl p-6 text-center mb-4">
        <h3 className="text-lg font-medium mb-4">Record Match Result</h3>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="text-center md:text-right flex-1">
            <h3 className="text-lg font-bold mb-2">{match.teamA.name}</h3>
            <Input
              type="number"
              min="0"
              value={teamAScore !== undefined ? teamAScore : ""}
              onChange={(e) => onScoreChange.teamA(e.target.value ? parseInt(e.target.value) : undefined)}
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
              onChange={(e) => onScoreChange.teamB(e.target.value ? parseInt(e.target.value) : undefined)}
              className="text-center text-lg font-bold w-20 mx-auto"
            />
          </div>
        </div>
        
        <div className="mt-6 space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            disabled={teamAScore === undefined || teamBScore === undefined || updateMatchMutation.isPending}
          >
            <Check className="h-4 w-4 mr-1" />
            Save Result
          </Button>
        </div>
      </div>
    );
  }

  return (
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
  );
};

export default MatchScore;
