
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Trash2, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Match } from "@/types";

interface MatchListItemProps {
  match: Match;
  onDeleteClick: (match: Match) => void;
}

const MatchListItem = ({ match, onDeleteClick }: MatchListItemProps) => {
  return (
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

          {match.status === "completed" && (
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
            onClick={() => onDeleteClick(match)} 
            className="flex-1 py-3 text-center text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4 inline mr-1" />
            Delete
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchListItem;
