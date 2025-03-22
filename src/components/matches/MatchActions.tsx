
import React from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Match } from "@/types";

interface MatchActionsProps {
  match: Match;
  onDeleteClick: (match: Match) => void;
}

const MatchActions = ({ match, onDeleteClick }: MatchActionsProps) => {
  return (
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
  );
};

export default MatchActions;
