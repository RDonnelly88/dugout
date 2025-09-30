
import React from "react";
import { Link } from "react-router-dom";
import { Match } from "@/types";
import { Calendar, MapPin, Clock, Edit, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MatchHeaderProps {
  match: Match;
  isCompleted: boolean;
  onEditClick: () => void;
}

const MatchHeader = ({ match, isCompleted, onEditClick }: MatchHeaderProps) => {
  return (
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
        
        <div className="flex gap-2">
          <Link to={`/matches/edit/${match.id}`}>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          
          {!isCompleted && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onEditClick}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              Record Result
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchHeader;
