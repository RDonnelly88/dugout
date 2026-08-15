"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, TrendingUp } from "lucide-react";
import { useTeam } from "@/contexts/TeamContext";
import { getCurrentSeason, getMatches, getPlayers, getSeasonPlayerStats } from "@/lib/db";
import { useBatchFormLoader } from "@/hooks/useBatchFormLoader";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import { isActivePlayer } from "@/components/players/ActiveFilter";
import { outcomeOf } from "@/lib/match-result";
import { calculatePlayerRanks } from "@/lib/ranking-utils";
import PageHeader from "@/components/PageHeader";
import { StatTile, StatTiles } from "@/components/StatTile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SeasonLeaderboard from "@/components/seasons/SeasonLeaderboard";
import RatingLeaderboard from "@/components/ratings/RatingLeaderboard";
import MatchListItem from "@/components/matches/MatchListItem";
import QuickActions from "./QuickActions";
import FormLeaders from "./FormLeaders";

/** A card heading that is also the way through to the whole thing. */
function More({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="focus-ring flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent"
    >
      {children}
      <ChevronRight className="h-4 w-4" />
    </Link>
  );
}

/**
 * The front page.
 *
 * It used to be a league table and a list of recent matches, which is two of
 * the things the nav already goes to and none of the things you open the app
 * to do. It now leads with picking the teams, and shows the three answers
 * worth having at a glance — the table, who is in form, and who is rated where
 * — each linking through to the page that holds the rest.
 */
const Dashboard = () => {
  const { currentTeam } = useTeam();

  const { data: currentSeason } = useQuery({
    queryKey: ["currentSeason", currentTeam?.id],
    queryFn: getCurrentSeason,
    enabled: !!currentTeam,
  });

  const { data: seasonPlayerStats = [] } = useQuery({
    queryKey: ["seasonPlayerStats", currentSeason?.id, currentTeam?.id],
    queryFn: () =>
      currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([]),
    enabled: !!currentSeason && !!currentTeam,
  });

  const { data: matches = [] } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });

  const { data: players = [] } = useQuery({
    queryKey: ["players", currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam,
  });

  const { ranked } = usePlayerRatings();

  const topPlayerIds = useMemo(
    () =>
      [...seasonPlayerStats]
        .sort((a, b) => b.points - a.points)
        .slice(0, 5)
        .map((player) => player.playerId),
    [seasonPlayerStats]
  );

  const { formData: topPlayerForms } = useBatchFormLoader(
    currentSeason?.id || null,
    topPlayerIds
  );

  const played = useMemo(() => matches.filter((m) => outcomeOf(m) !== null), [matches]);

  const recent = useMemo(
    () =>
      [...matches]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [matches]
  );

  // Whoever tops the season table, sharing the place if it is shared.
  const leaders = useMemo(() => {
    if (seasonPlayerStats.length === 0) return [];
    const ranks = calculatePlayerRanks(seasonPlayerStats);
    return seasonPlayerStats.filter((stat) => ranks[stat.playerId] === 1);
  }, [seasonPlayerStats]);

  return (
    <div className="page-container animate-slide-up">
      <PageHeader
        title={currentTeam?.name ?? "Dugout"}
        subtitle={
          currentSeason
            ? `${currentSeason.name} · ${played.length} played`
            : "No season running. Start one to keep a table."
        }
      >
        <StatTiles>
          <StatTile label="Matches" value={played.length} />
          <StatTile
            label="Squad"
            value={players.filter(isActivePlayer).length}
            hint={
              players.length !== players.filter(isActivePlayer).length
                ? `${players.length} in total`
                : undefined
            }
          />
          <StatTile
            label={leaders.length > 1 ? "Joint leaders" : "Leader"}
            tone="draw"
            value={
              leaders.length > 0 ? (
                <span className="text-base">
                  {leaders.map((leader) => leader.playerName).join(" & ")}
                </span>
              ) : (
                <span className="text-base text-muted-foreground">—</span>
              )
            }
          />
          <StatTile
            label="Top rated"
            tone="accent"
            value={
              ranked.length > 0 ? (
                <span className="text-base">
                  {playerName(players, ranked[0].playerId)}
                </span>
              ) : (
                <span className="text-base text-muted-foreground">—</span>
              )
            }
          />
        </StatTiles>
      </PageHeader>

      <section className="mb-8">
        <h2 className="eyebrow mb-3">Get on with it</h2>
        <QuickActions />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {currentSeason && seasonPlayerStats.length > 0 && (
          <div className="lg:col-span-2">
            <SeasonLeaderboard
              stats={seasonPlayerStats}
              seasonId={currentSeason.id}
              playerForms={topPlayerForms}
              limit={5}
              seasonName={currentSeason.name}
            />
          </div>
        )}

        <FormLeaders matches={matches} players={players} />

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Top rated
                </CardTitle>
                <CardDescription>Elo, once a rating has settled</CardDescription>
              </div>
              <More href="/ratings">The table</More>
            </div>
          </CardHeader>
          <CardContent>
            <RatingLeaderboard ratings={ranked.slice(0, 5)} players={players} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Recent matches</CardTitle>
                <CardDescription>The last five, newest first</CardDescription>
              </div>
              <More href="/matches">All matches</More>
            </div>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nothing played yet.
              </p>
            ) : (
              /* No delete here. This is a glance, and a bin beside a row you
                 came to read is an accident waiting to happen. */
              <ul className="space-y-2">
                {recent.map((match) => (
                  <MatchListItem key={match.id} match={match} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/** The rating knows an id; the name lives on the player. */
function playerName(players: { id: string; name: string }[], id: string) {
  return players.find((player) => player.id === id)?.name ?? "—";
}

export default Dashboard;
