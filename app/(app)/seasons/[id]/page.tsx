"use client";

import { format } from "date-fns";
import Link from "next/link";

import React from "react";

import { ArrowLeft, BookOpen, CalendarDays, Edit, LineChart, ListOrdered, Trash, Calendar, Lock, Check, MoreHorizontal, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PageTabs, { type PageTab } from "@/components/PageTabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MatchList from "@/components/matches/MatchList";
import SeasonWrap from "@/components/seasons/SeasonWrap";
import { useQuery } from "@tanstack/react-query";
import { getPlayers } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import SeasonForm from "@/components/seasons/SeasonForm";
import SeasonSelector from "@/components/seasons/SeasonSelector";
import LeagueTable from "@/components/seasons/LeagueTable";
import SeasonPositionChart from "@/components/seasons/SeasonPositionChart";
import WrappedPicker from "@/components/wrapped/WrappedPicker";
import { outcomeOf } from "@/lib/match-result";
import { useSeasonDetail } from "@/hooks/useSeasonDetail";
import { calculatePlayerRanks } from "@/lib/ranking-utils";
import PageHeader from "@/components/PageHeader";
import { usePermission } from "@/lib/permission-utils";

type Part = "table" | "story" | "positions" | "results";

const PARTS: PageTab[] = [
  { value: "table", label: "Table", icon: ListOrdered },
  { value: "story", label: "Story", icon: BookOpen },
  { value: "positions", label: "Race", icon: LineChart },
  { value: "results", label: "Results", icon: CalendarDays },
];

/**
 * One season: the table first, because that is what anybody opening a season
 * has come for, then the story of it, the race for the top and every result.
 * Changing or deleting the season is tucked in a menu for whoever can.
 */
const SeasonDetail = () => {
  const { currentTeam } = useTeam();
  const { canManage, ready } = usePermission();
  const [part, setPart] = React.useState<Part>("table");
  // The squad, for the names and faces on the season's awards.
  const { data: allPlayers = [] } = useQuery({
    queryKey: ["players", currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam,
  });

  const {
    season,
    seasons,
    playerStats,
    seasonMatches,
    isLoadingSeason,
    isEditing,
    setIsEditing,
    isDeleting,
    setIsDeleting,
    updateSeasonMutation,
    deleteSeasonMutation,
    handleUpdateSeason,
    handleDeleteSeason,
    router
  } = useSeasonDetail();

  const ranks = calculatePlayerRanks(playerStats.filter((p) => p.played > 0));
  const leaders = playerStats.filter((p) => ranks[p.playerId] === 1);
  // Played ones: a fixture on the calendar is not yet a night of the season.
  const nights = seasonMatches.filter((m) => outcomeOf(m) !== null).length;

  if (isLoadingSeason) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="sheen rounded-xl h-[100px] mb-6"></div>
        <div className="sheen rounded-xl h-[400px]"></div>
      </div>
    );
  }

  if (!season) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center sm:p-8">
            <h2 className="text-xl font-medium mb-2">Season not found</h2>
            <p className="text-muted-foreground mb-4">The season you're looking for doesn't exist or has been deleted.</p>
            <Button asChild>
              <Link href="/seasons">View All Seasons</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startDate = format(new Date(season.startDate), "d MMM yyyy");
  const endDate = season.endDate
    ? format(new Date(season.endDate), "d MMM yyyy")
    // A finished season with no end date recorded is over, whatever the
    // absence of a date implies. It used to read "Finished" and "Ongoing" side
    // by side.
    : season.isFinished
      ? "no end date"
      : "ongoing";

  return (
    <div className="page-container animate-slide-up">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/seasons">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Seasons
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <SeasonSelector seasons={seasons} currentSeasonId={season.id} />
          {ready && canManage() && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Change this season">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit season
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleting(true)} className="text-loss focus:text-loss">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete season
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Season</CardTitle>
            <CardDescription>
              Update your season details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SeasonForm 
              initialData={season}
              onSubmit={handleUpdateSeason}
              isSubmitting={updateSeasonMutation.isPending}
            />
            <Button 
              variant="outline" 
              className="mt-4 w-full" 
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <PageHeader
            title={season.name}
            subtitle={
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0" />
                {startDate} – {endDate}
              </span>
            }
            badges={
              <>
                {season.isCurrent && !season.isFinished && (
                  <Badge className="bg-win text-win-foreground">
                    <Check className="mr-1 h-3 w-3" />
                    Ongoing
                  </Badge>
                )}
                {season.isFinished && (
                  <Badge variant="outline">
                    <Lock className="mr-1 h-3 w-3" />
                    Finished
                  </Badge>
                )}
              </>
            }
          >
            {leaders.length > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-draw/30 bg-draw/10 px-4 py-3">
                <Trophy className="h-6 w-6 shrink-0 text-draw" />
                <p className="min-w-0 text-sm">
                  <span className="font-semibold">{leaders.map((p) => p.playerName).join(" & ")}</span>{" "}
                  {season.isFinished
                    ? leaders.length > 1 ? "were joint champions" : "won it"
                    : leaders.length > 1 ? "lead jointly" : "leads"}{" "}
                  on {leaders[0].points} points
                  <span className="text-muted-foreground">
                    {" "}· {nights} {nights === 1 ? "night" : "nights"}, {playerStats.filter((p) => p.played > 0).length} players
                  </span>
                </p>
              </div>
            )}
          </PageHeader>

          <div className="mb-6">
            <WrappedPicker
              seasonId={season.id}
              finished={season.isFinished}
              table={playerStats}
              players={allPlayers}
            />
          </div>

          <PageTabs
            tabs={PARTS}
            value={part}
            onChange={(next) => setPart(next as Part)}
            label={`${season.name}, part by part`}
          />

          {part === "table" && (
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <LeagueTable stats={playerStats} seasonId={season.id} />
              </CardContent>
            </Card>
          )}

          {part === "story" && (
            <SeasonWrap season={seasonMatches} players={allPlayers} finished={season.isFinished} />
          )}

          {part === "positions" && (
            <SeasonPositionChart seasonId={season.id} seasonName={season.name} />
          )}

          {part === "results" &&
            (seasonMatches.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-10 text-center">
                <p className="mb-4 text-muted-foreground">No matches in this season yet</p>
                {!season.isFinished && ready && canManage() && (
                  <Button asChild>
                    <Link href="/matches/create">Pick the teams</Link>
                  </Button>
                )}
              </div>
            ) : (
              <MatchList matches={seasonMatches} isLoading={false} searchTerm="" />
            ))}
        </>
      )}

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the season "{season.name}". Matches in this season will remain but will no longer be associated with this season.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSeason}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSeasonMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SeasonDetail;
