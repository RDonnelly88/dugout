"use client";

import Link from "next/link";

import React from "react";

import { ArrowLeft, ChevronRight, Edit, Trash, Calendar, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import SeasonLeaderboard from "@/components/seasons/SeasonLeaderboard";
import SeasonPositionChart from "@/components/seasons/SeasonPositionChart";
import WrappedPicker from "@/components/wrapped/WrappedPicker";
import MatchCard from "@/components/matches/MatchCard";
import { Rail } from "@/components/ui/rail";
import { outcomeOf } from "@/lib/match-result";
import { useSeasonDetail } from "@/hooks/useSeasonDetail";
import { calculatePlayerRanks } from "@/lib/ranking-utils";
import PageHeader from "@/components/PageHeader";
import { StatTile, StatTiles } from "@/components/StatTile";

/** How many of the season's latest results the rail at the top shows. */
const LATEST_NIGHTS = 8;

const SeasonDetail = () => {
  const { currentTeam } = useTeam();
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

  const ranks = calculatePlayerRanks(playerStats);
  const leaders = playerStats.filter((p) => ranks[p.playerId] === 1);
  // The season's last few results, newest first, as a run of scoreboards.
  const latestNights = seasonMatches
    .filter((m) => outcomeOf(m) !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, LATEST_NIGHTS);

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
          <CardContent className="p-8 text-center">
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

  const startDate = new Date(season.startDate).toLocaleDateString();
  const endDate = season.endDate
    ? new Date(season.endDate).toLocaleDateString()
    // A finished season with no end date recorded is over, whatever the
    // absence of a date implies. It used to read "Finished" and "Ongoing" side
    // by side.
    : season.isFinished
      ? "no end date"
      : "ongoing";

  return (
    <div className="page-container animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/seasons">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Seasons
            </Link>
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <SeasonSelector seasons={seasons} currentSeasonId={season.id} />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setIsDeleting(true)}
            className="w-full sm:w-auto"
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
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
            <StatTiles>
              {/* Played ones: a fixture on the calendar is not yet a match
                  of the season, and the seasons list counts the same way. */}
              <StatTile
                label="Matches"
                value={seasonMatches.filter((m) => outcomeOf(m) !== null).length}
              />
              <StatTile label="Players" value={playerStats.length} />
              <StatTile
                label={
                  season.isFinished
                    ? leaders.length > 1
                      ? "Joint champions"
                      : "Champion"
                    : leaders.length > 1
                      ? "Joint leaders"
                      : "Leader"
                }
                tone="draw"
                value={
                  leaders.length > 0 ? (
                    <span className="text-base">
                      {leaders.map((p) => p.playerName).join(" & ")}
                    </span>
                  ) : (
                    <span className="text-base text-muted-foreground">—</span>
                  )
                }
              />
              <StatTile
                label="Top points"
                value={leaders[0]?.points ?? 0}
              />
            </StatTiles>
          </PageHeader>

          {latestNights.length > 0 && (
            <section className="mb-6">
              <h2 className="section-title mb-3">Latest nights</h2>
              <Rail label={`The latest nights of ${season.name}`}>
                {latestNights.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </Rail>
            </section>
          )}

          <div className="mb-6">
            <WrappedPicker
              seasonId={season.id}
              finished={season.isFinished}
              table={playerStats}
              players={allPlayers}
            />
          </div>

          <Tabs defaultValue="leaderboard" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="leaderboard">League Table</TabsTrigger>
              <TabsTrigger value="story">The Season</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
            </TabsList>
            
            <TabsContent value="leaderboard" className="space-y-4">
              <SeasonLeaderboard 
                stats={playerStats}
                seasonName={season.name}
                isFinished={season.isFinished}
                seasonId={season.id}
              />
            </TabsContent>

            <TabsContent value="story" className="space-y-4">
              <SeasonWrap
                season={seasonMatches}
                players={allPlayers}
                finished={season.isFinished}
              />
            </TabsContent>

            <TabsContent value="positions" className="space-y-4">
              <SeasonPositionChart
                seasonId={season.id}
                seasonName={season.name}
              />
            </TabsContent>
            
            <TabsContent value="matches" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Season Matches</CardTitle>
                  <CardDescription>
                    All matches in this season
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MatchList 
                    matches={seasonMatches}
                    isLoading={false}
                    searchTerm=""
                    onDeleteClick={() => {}}
                  />
                  
                  {seasonMatches.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">No matches in this season yet</p>
                      {!season.isFinished ? (
                        <Button asChild>
                          <Link href="/matches/create">Create a Match</Link>
                        </Button>
                      ) : (
                        <p className="text-draw">This season is finished. No more matches can be added.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
