import Link from "next/link";

import React from "react";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Match } from "@/types";
import MatchListItem from "./MatchListItem";
import type { SideSwing } from "@/lib/match-impact";

interface MatchListProps {
  matches: Match[];
  isLoading: boolean;
  searchTerm: string;
  onDeleteClick: (match: Match) => void;
  /**
   * Rating movement per match, worked out once for the whole history.
   * Optional: the season page lists matches without ratings to hand.
   */
  swings?: Map<string, { A: SideSwing; B: SideSwing }>;
}

const MatchList = ({ matches, isLoading, searchTerm, onDeleteClick, swings }: MatchListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shimmer h-[150px] border-accent/20" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg border border-accent/10">
        <p className="text-muted-foreground mb-4">
          {searchTerm ? "No matches match your search" : "No matches created yet"}
        </p>
        {!searchTerm && (
          <Button asChild>
            <Link href="/matches/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Match
            </Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {matches.map((match) => (
        <MatchListItem
          key={match.id}
          match={match}
          onDeleteClick={onDeleteClick}
          swing={swings?.get(match.id)}
        />
      ))}
    </ul>
  );
};

export default MatchList;
