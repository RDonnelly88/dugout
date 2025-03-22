
import React from "react";
import { Trophy } from "lucide-react";
import { Match } from "@/types";

interface MatchResultProps {
  match: Match;
}

const MatchResult = ({ match }: MatchResultProps) => {
  if (match.status !== "completed") {
    return null;
  }

  return (
    <div className="flex justify-center mb-4">
      <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
        <Trophy className="h-3.5 w-3.5 mr-1" />
        {match.teamA?.score !== undefined && match.teamB?.score !== undefined ? (
          match.teamA.score > match.teamB.score 
            ? `${match.teamA.name || "Team A"} won` 
            : match.teamB.score > match.teamA.score 
              ? `${match.teamB.name || "Team B"} won` 
              : "Match Drawn"
        ) : "Result Recorded"}
      </div>
    </div>
  );
};

export default MatchResult;
