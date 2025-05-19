
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Match } from "@/types";
import MatchStatusHeader from "./MatchStatusHeader";
import MatchTeams from "./MatchTeams";
import MatchResult from "./MatchResult";
import MatchActions from "./MatchActions";

interface MatchListItemProps {
  match: Match;
  onDeleteClick: (match: Match) => void;
}

const MatchListItem = ({ match, onDeleteClick }: MatchListItemProps) => {
  return (
    <Card key={match.id} className="match-card hover-scale overflow-hidden neo-glassmorphism border-accent/30 shadow-accent/10">
      <CardContent className="p-0">
        <div className="p-5">
          <MatchStatusHeader match={match} />
          <MatchTeams match={match} />
          <MatchResult match={match} />
        </div>
        <MatchActions match={match} onDeleteClick={onDeleteClick} />
      </CardContent>
    </Card>
  );
};

export default MatchListItem;
