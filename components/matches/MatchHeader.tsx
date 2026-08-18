"use client";

import Link from "next/link";

import { Calendar, Edit, MapPin, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import ShareMatchButton from "@/components/matches/ShareMatchButton";
import { useSideNames } from "@/hooks/useSideNames";
import { Match } from "@/types";

interface MatchHeaderProps {
  match: Match;
  isCompleted: boolean;
  onEditClick: () => void;
}

/**
 * The top of a match.
 *
 * Uses the same header as every other page rather than a heading of its own
 * inside a card, which is what made this the one page whose title sat in a box.
 */
const MatchHeader = ({ match, isCompleted, onEditClick }: MatchHeaderProps) => {
  const sides = useSideNames();

  return (
    <PageHeader
      // The team's own words for its two sides, not whatever name the match
      // was saved under. Everything played before the names were configurable
      // carries "Team A", so falling back to the stored one put "Team A v Team
      // B" at the top of a page whose score line read "Bibs 1 – 0 No bibs".
      title={
        <>
          {sides.A} <span className="text-muted-foreground">v</span> {sides.B}
        </>
      }
      subtitle={
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 shrink-0" />
            {new Date(match.date).toLocaleDateString()}
          </span>
          {match.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" />
              {match.location}
            </span>
          )}
        </span>
      }
      badges={
        isCompleted ? (
          <Badge className="bg-win text-win-foreground">Played</Badge>
        ) : (
          <Badge variant="outline">Not played</Badge>
        )
      }
      actions={
        <>
          {isCompleted && <ShareMatchButton match={match} />}

          <Button variant="outline" size="sm" asChild className="gap-1">
            <Link href={`/matches/edit/${match.id}`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>

          {!isCompleted && (
            <Button size="sm" onClick={onEditClick} className="gap-1">
              <Edit className="h-4 w-4" />
              Record the result
            </Button>
          )}
        </>
      }
    />
  );
};

export default MatchHeader;
