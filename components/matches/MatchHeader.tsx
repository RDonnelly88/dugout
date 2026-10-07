"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Edit, MapPin, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteMatchDialog from "@/components/matches/DeleteMatchDialog";
import { deleteMatch } from "@/lib/db";
import { usePermission } from "@/lib/permission-utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import ShareImageButton from "@/components/ShareImageButton";
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
  const { canManage, ready } = usePermission();
  const admin = ready && canManage();
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Here rather than as a bin on every row of the results, where a slip of
  // the thumb while scrolling could take a result away.
  const remove = useMutation({
    mutationFn: () => deleteMatch(match.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast({ title: "Match deleted" });
      router.push("/matches");
    },
    onError: () => {
      toast({
        title: "Could not delete the match",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

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
            {format(match.date.includes("T") ? new Date(match.date) : new Date(`${match.date}T12:00:00`), "EEEE d MMMM yyyy")}
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
          {isCompleted && (
            <ShareImageButton
              src={`/api/share/match/${match.id}`}
              fileName={`${match.date}-match.png`}
              title="The result, as a picture"
              alt="The match result"
              label="Share the result"
            />
          )}
          {isCompleted && (
            <ShareImageButton
              src={`/api/share/table/${match.id}`}
              fileName={`${match.date}-table.png`}
              title="The tables after the night"
              alt="The ratings and league tables after the match"
              label="Share the table"
            />
          )}

          {admin && !isCompleted && (
            <Button size="sm" onClick={onEditClick} className="gap-1">
              <Edit className="h-4 w-4" />
              Record the result
            </Button>
          )}

          {admin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9" aria-label="Change this match">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/matches/edit/${match.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit match
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleting(true)} className="text-loss focus:text-loss">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete match
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DeleteMatchDialog
            match={deleting ? match : null}
            onOpenChange={(open) => !open && setDeleting(false)}
            onConfirmDelete={() => remove.mutate()}
          />
        </>
      }
    />
  );
};

export default MatchHeader;
