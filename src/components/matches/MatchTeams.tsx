
import React from "react";
import { Match } from "@/types";

interface MatchTeamsProps {
  match: Match;
}

const MatchTeams = ({ match }: MatchTeamsProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
      <div className="text-center md:text-right flex-1">
        <h3 className="text-lg font-bold">{match.teamA?.name || "Team A"}</h3>
        <div className="mt-1 text-sm text-muted-foreground">
          {match.teamA?.players?.length || 0} players
        </div>
      </div>

      <div className="flex items-center justify-center px-6">
        {match.status === "completed" && match.teamA?.score !== undefined && match.teamB?.score !== undefined ? (
          <div className="text-3xl font-bold">
            {match.teamA.score} - {match.teamB.score}
          </div>
        ) : (
          <div className="text-lg font-medium text-muted-foreground">vs</div>
        )}
      </div>

      <div className="text-center md:text-left flex-1">
        <h3 className="text-lg font-bold">{match.teamB?.name || "Team B"}</h3>
        <div className="mt-1 text-sm text-muted-foreground">
          {match.teamB?.players?.length || 0} players
        </div>
      </div>
    </div>
  );
};

export default MatchTeams;
