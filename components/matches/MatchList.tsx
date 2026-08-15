import Link from "next/link";

import React from "react";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Match } from "@/types";
import MatchListItem from "./MatchListItem";

interface MatchListProps {
  matches: Match[];
  isLoading: boolean;
  searchTerm: string;
  onDeleteClick: (match: Match) => void;
}

const MatchList = ({ matches, isLoading, searchTerm, onDeleteClick }: MatchListProps) => {
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
          <Button asChild className="bg-gradient-to-r from-accent/80 to-accent hover:from-accent hover:to-accent/90">
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
    <div className="space-y-4">
      {matches.map((match) => (
        <MatchListItem 
          key={match.id} 
          match={match} 
          onDeleteClick={onDeleteClick} 
        />
      ))}
    </div>
  );
};

export default MatchList;
