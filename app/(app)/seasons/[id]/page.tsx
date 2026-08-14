"use client";

import Link from "next/link";

import React from "react";

import { ArrowLeft, ChevronRight, Edit, Trash, Calendar, Trophy, Lock, Check } from "lucide-react";
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
import SeasonForm from "@/components/seasons/SeasonForm";
import SeasonSelector from "@/components/seasons/SeasonSelector";
import SeasonLeaderboard from "@/components/seasons/SeasonLeaderboard";
import SeasonPositionChart from "@/components/seasons/SeasonPositionChart";
import { useSeasonDetail } from "@/hooks/useSeasonDetail";

const SeasonDetail = () => {
  const {
    season,
    seasons,
    playerStats,
    playerForms,
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

  if (isLoadingSeason) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="shimmer rounded-xl h-[100px] mb-6"></div>
        <div className="shimmer rounded-xl h-[400px]"></div>
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
  const endDate = season.endDate ? new Date(season.endDate).toLocaleDateString() : "Ongoing";

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
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-2xl font-bold flex items-center">
                    {season.name}
                    <div className="flex gap-2 ml-2">
                      {season.isCurrent && (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Current Season
                        </Badge>
                      )}
                      {season.isFinished && (
                        <Badge variant="outline" className="bg-slate-100 text-slate-700">
                          <Lock className="h-3 w-3 mr-1" />
                          Finished
                        </Badge>
                      )}
                    </div>
                  </h1>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{startDate} - {endDate}</span>
                  </div>
                </div>

                <div className="flex items-center mt-4 md:mt-0 gap-4">
                  <div className="bg-blue-50 text-blue-800 p-2 rounded-md flex items-center">
                    <span className="font-medium">{seasonMatches.length}</span>
                    <span className="ml-1 text-sm">Matches</span>
                  </div>
                  
                  <div className="bg-amber-50 text-amber-800 p-2 rounded-md flex items-center">
                    <Trophy className="h-4 w-4 mr-1 text-amber-500" />
                    <span className="font-medium">{playerStats[0]?.playerName || "No champion yet"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="leaderboard" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="leaderboard">League Table</TabsTrigger>
              <TabsTrigger value="positions">Position Tracking</TabsTrigger>
              <TabsTrigger value="matches">Matches</TabsTrigger>
            </TabsList>
            
            <TabsContent value="leaderboard" className="space-y-4">
              <SeasonLeaderboard 
                stats={playerStats}
                playerForms={playerForms}
                seasonName={season.name}
                isFinished={season.isFinished}
                seasonId={season.id}
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
                        <p className="text-amber-600">This season is finished. No more matches can be added.</p>
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
