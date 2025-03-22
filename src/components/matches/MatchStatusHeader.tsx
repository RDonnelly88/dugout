
import React from "react";
import { Calendar } from "lucide-react";
import { Match } from "@/types";

interface MatchStatusHeaderProps {
  match: Match;
}

const MatchStatusHeader = ({ match }: MatchStatusHeaderProps) => {
  return (
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
  );
};

export default MatchStatusHeader;
