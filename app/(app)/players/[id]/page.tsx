"use client";

import Link from "next/link";
import React from "react";

import { ArrowLeft, Edit, Trophy, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usePlayerDetail } from "@/hooks/usePlayerDetail";
import { usePlayerRank } from "@/hooks/usePlayerRank";
import { usePlayerRecords } from "@/hooks/usePlayerRecords";
import PlayerSeasonStats from "@/components/players/PlayerSeasonStats";
import PlayerFormDisplay from "@/components/players/PlayerFormDisplay";
import PlayerChemistry from "@/components/players/PlayerChemistry";
import PlayerSeasonStars from "@/components/players/PlayerSeasonStars";
import type { PlayerFormResult } from "@/types";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import PlayerRatingCard from "@/components/players/PlayerRatingCard";
import PageHeader from "@/components/PageHeader";
import { AVATAR_TRANSITION } from "@/components/TransitionLink";
import MatchListItem from "@/components/matches/MatchListItem";
import { recentForm } from "@/lib/form";
import { ratingSwings } from "@/lib/match-impact";
import { StatTile, StatTiles } from "@/components/StatTile";

/** How many of a player's matches to list before asking. */
const MATCHES_SHOWN = 10;

const PlayerDetail = () => {
  const [showAllMatches, setShowAllMatches] = React.useState(false);
  const {
    player,
    playerMatches,
    allMatches,
    seasons,
    seasonStats,
    setSelectedSeasonId,
    selectedSeason,
    getPlayerMatchResult,
    isLoading,
    router
  } = usePlayerDetail();

  // From every match, not just this player's: what a side carried into a game
  // depends on everything played before it.
  const swings = React.useMemo(() => ratingSwings(allMatches), [allMatches]);

  // The same all-time record every other surface reads. Resolved before the
  // early returns below, because hooks cannot run conditionally; an unknown id
  // yields a record of zeroes rather than undefined.
  const { recordFor } = usePlayerRecords();
  const record = recordFor(player?.id ?? "", player?.name ?? "");

  // Get current season
  const currentSeason = seasons.find(s => s.isCurrent);
  
  // Get player's current season stats
  const currentSeasonStats = currentSeason 
    ? seasonStats.find(stat => stat.seasonId === currentSeason.id)
    : null;

  // Use the shared hook for consistent rank calculation
  const { rank: playerRank, hasPlayedCurrentSeason } = usePlayerRank(
    currentSeason?.id || null,
    player?.id || null
  );

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="shimmer rounded-xl h-[200px] mb-8"></div>
        <div className="shimmer rounded-xl h-[400px]"></div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="p-6 text-center">
          <h2 className="text-xl font-medium">Player not found</h2>
          <p className="text-muted-foreground mt-2">This player may have been deleted.</p>
          <Button className="mt-4" asChild>
            <Link href="/players">View All Players</Link>
          </Button>
        </div>
      </div>
    );
  }

  // The run to show when there is no current season to read one from: the
  // squad's recent nights, with the ones this player was missing marked, which
  // is the same run every other strip in the app draws. Their own last five
  // results would close the gaps up and read as an unbroken run.
  const recentResults: PlayerFormResult[] = React.useMemo(
    () => recentForm(allMatches).get(player?.id ?? "")?.results ?? [],
    [allMatches, player?.id]
  );

  const orderedMatches = [...playerMatches].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const shownMatches = showAllMatches
    ? orderedMatches
    : orderedMatches.slice(0, MATCHES_SHOWN);

  return (
    <div className="page-container animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/players/edit/${player.id}`}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </Button>
      </div>

      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {/* The other half of the transition begun on the card that was
                tapped: same name, so the browser carries one face across. */}
            <PlayerAvatar
              name={player.name}
              image={player.image}
              size="lg"
              style={{ viewTransitionName: AVATAR_TRANSITION }}
            />
            {player.name}
          </span>
        }
        badges={<PlayerSeasonStars playerId={player.id} size="lg" />}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>{record.played} matches</span>
            <span>
              {seasons.length} {seasons.length === 1 ? "season" : "seasons"}
            </span>
            {currentSeason && hasPlayedCurrentSeason && playerRank && (
              <span>#{playerRank} this season</span>
            )}
          </span>
        }
      >
        <div className="flex items-center gap-3">
          <span className="eyebrow">Recent form</span>
          <PlayerFormDisplay
            results={recentResults}
          />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <PlayerRatingCard playerId={player.id} playerName={player.name} />
        {/* Current Season Stats */}
        {currentSeasonStats && currentSeason && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 shrink-0 text-draw" />
                {currentSeason.name}
                {hasPlayedCurrentSeason && playerRank && (
                  <Badge variant="outline">
                    <Flag className="mr-1 h-3 w-3" />#{playerRank}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* The same tiles as everywhere else. These were a fourth style
                  of the same four numbers. */}
              <StatTiles>
                <StatTile label="Played" value={currentSeasonStats.played} />
                <StatTile label="Won" value={currentSeasonStats.wins} tone="win" />
                <StatTile label="Drawn" value={currentSeasonStats.draws} tone="draw" />
                <StatTile label="Lost" value={currentSeasonStats.losses} tone="loss" />
              </StatTiles>
              <p className="mt-4 text-sm text-muted-foreground">
                {currentSeasonStats.points} points, winning{" "}
                {Math.round(
                  (currentSeasonStats.wins / Math.max(1, currentSeasonStats.played)) * 100
                )}
                % of them.
              </p>
            </CardContent>
          </Card>
        )}

      </div>

      <Tabs defaultValue="stats" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stats">All stats</TabsTrigger>
          <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <PlayerSeasonStats 
            playerName={player.name}
            overallStats={record}
            seasonStats={seasonStats}
            onSeasonSelect={setSelectedSeasonId}
          />
        </TabsContent>
        
        <TabsContent value="chemistry">
          <PlayerChemistry playerId={player.id} playerName={player.name} />
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="section-title mb-4">
          {selectedSeason ? `Matches in ${selectedSeason.name}` : "Matches"}
        </h2>

        {playerMatches.length === 0 ? (
          <div className="rounded-lg bg-surface-2/40 p-8 text-center">
            <p className="text-muted-foreground">
              {selectedSeason
                ? `${player.name} did not play in ${selectedSeason.name}.`
                : `${player.name} has not played yet.`}
            </p>
          </div>
        ) : (
          <>
            {/* The same row as the matches page, rather than a second design
                for the same list — with this player's own result on the end. */}
            <ul className="space-y-2">
              {shownMatches.map((match) => (
                <MatchListItem
                  key={match.id}
                  match={match}
                  result={getPlayerMatchResult(match).result}
                  swing={swings.get(match.id)}
                />
              ))}
            </ul>

            {/* Somebody with two years behind them has fifty of these, which
                is a great deal of scrolling past to reach nothing, and a page
                too tall for the browser to photograph in one piece. */}
            {playerMatches.length > MATCHES_SHOWN && (
              <Button
                variant="outline"
                className="mt-3 w-full"
                onClick={() => setShowAllMatches((shown) => !shown)}
              >
                {showAllMatches
                  ? "Show fewer"
                  : `Show all ${playerMatches.length}`}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerDetail;
