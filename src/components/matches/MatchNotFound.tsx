
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface MatchNotFoundProps {
  onBack: () => void;
}

const MatchNotFound = ({ onBack }: MatchNotFoundProps) => {
  return (
    <div className="page-container">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Match Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The match you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/matches">View All Matches</Link>
        </Button>
      </div>
    </div>
  );
};

export default MatchNotFound;
