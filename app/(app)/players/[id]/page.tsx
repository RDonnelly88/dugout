"use client";

import Link from "next/link";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Edit, LayoutGrid, Network, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTabs, { type PageTab } from "@/components/PageTabs";
import { usePlayerDetail } from "@/hooks/usePlayerDetail";
import { usePlayerRecords } from "@/hooks/usePlayerRecords";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import { usePointValues } from "@/hooks/usePointValues";
import { usePermission } from "@/lib/permission-utils";
import { useTeam } from "@/contexts/TeamContext";
import { getPlayers } from "@/lib/db";
import PlayerHero from "@/components/players/PlayerHero";
import PlayerHighlights from "@/components/players/PlayerHighlights";
import PlayerSeasonsList from "@/components/players/PlayerSeasonsList";
import PlayerRatingCard from "@/components/players/PlayerRatingCard";
import PlayerWeb from "@/components/wrapped/PlayerWeb";
import MatchListItem from "@/components/matches/MatchListItem";
import SectionHeading from "@/components/SectionHeading";
import { matchExpectations } from "@/lib/expected-wins";
import { highlightsFor } from "@/lib/player-highlights";
import { playerSeasons } from "@/lib/player-seasons";
import { recentResults } from "@/lib/recent-results";
import { ratingSwings } from "@/lib/match-impact";
import { pointsPerGame, ppg } from "@/lib/measure";
import { cn } from "@/lib/utils";
import type { RecentResult } from "@/types";

/** How many of a player's matches to list before asking. */
const MATCHES_SHOWN = 10;

type View = "overview" | "web" | "matches" | "seasons";

const VIEWS: PageTab[] = [
  { value: "overview", label: "Overview", icon: LayoutGrid },
  { value: "web", label: "Web", icon: Network },
  { value: "matches", label: "Matches", icon: CalendarDays },
  { value: "seasons", label: "Seasons", icon: Trophy },
];

/**
 * One player, from the top: who they are and where they stand, then four
 * ways into the rest — the headline numbers, the web of who they play with
 * and against, every match, and every season.
 *
 * A stretch picked at the top ("all time", or one season) applies to all of
 * it but the seasons, which are the stretches themselves. Everything is read
 * off the matches through the same pieces a season wrapped uses, so the two
 * name the same best partner for the same games.
 */
const PlayerDetail = () => {
  const [view, setView] = React.useState<View>("overview");
  const [stretch, setStretch] = React.useState<string>("all");
  const [showAllMatches, setShowAllMatches] = React.useState(false);
  const { player, allMatches, seasons, viewpointOf, isLoading, router } = usePlayerDetail();
  const { currentTeam } = useTeam();
  const { canManage } = usePermission();
  const { recordFor } = usePlayerRecords();
  const { ratingFor, all: rated } = usePlayerRatings();
  const values = usePointValues();

  const { data: players = [] } = useQuery({
    queryKey: ["players", currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam,
  });
  const byId = React.useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const playerFor = React.useCallback((id: string) => byId.get(id), [byId]);

  const id = player?.id ?? "";
  const swings = React.useMemo(() => ratingSwings(allMatches), [allMatches]);
  const odds = React.useMemo(() => matchExpectations(allMatches), [allMatches]);
  const lastFive: RecentResult[] = React.useMemo(
    () => recentResults(allMatches).get(id)?.results ?? [],
    [allMatches, id]
  );
  const career = React.useMemo(
    () => playerSeasons(allMatches, seasons, id, values),
    [allMatches, seasons, id, values]
  );

  const inStretch = React.useMemo(
    () => (stretch === "all" ? allMatches : allMatches.filter((m) => m.seasonId === stretch)),
    [allMatches, stretch]
  );
  const highlights = React.useMemo(
    () => (id ? highlightsFor(inStretch, odds, id, values) : null),
    [inStretch, odds, id, values]
  );
  const theirMatches = React.useMemo(
    () =>
      inStretch
        .filter((m) => viewpointOf(m))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [inStretch, viewpointOf]
  );

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="sheen mb-6 h-[260px] rounded-2xl" />
        <div className="sheen h-[400px] rounded-xl" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="page-container">
        <div className="p-6 text-center">
          <h2 className="text-xl font-medium">Player not found</h2>
          <p className="mt-2 text-muted-foreground">This player may have been deleted.</p>
          <Button className="mt-4" asChild>
            <Link href="/players">The squad</Link>
          </Button>
        </div>
      </div>
    );
  }

  const rating = ratingFor(player.id);
  const squadRank = rating ? rated.findIndex((r) => r.playerId === player.id) + 1 : null;
  const current = career.find((row) => row.season.isCurrent) ?? null;
  const shownMatches = showAllMatches ? theirMatches : theirMatches.slice(0, MATCHES_SHOWN);
  const stretchName =
    stretch === "all" ? "all time" : (seasons.find((s) => s.id === stretch)?.name ?? "this season");
  const first = player.name.split(/\s+/)[0];

  return (
    <div className="page-container animate-slide-up">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        {canManage() && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/players/edit/${player.id}`}>
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Link>
          </Button>
        )}
      </div>

      <PlayerHero
        player={player}
        rating={rating}
        squadRank={squadRank}
        squadSize={rated.length}
        record={recordFor(player.id, player.name)}
        current={current}
        lastFive={lastFive}
      />

      <PageTabs
        tabs={VIEWS}
        value={view}
        onChange={(next) => setView(next as View)}
        label={`${player.name}'s page`}
      />

      {view !== "seasons" && career.length > 0 && (
        <div className="-mx-4 mb-5 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          <fieldset aria-label="Over which stretch" className="flex w-max gap-1.5">
            {[{ id: "all", name: "All time" }, ...career.map((row) => row.season)].map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={stretch === s.id}
                onClick={() => {
                  setStretch(s.id);
                  setShowAllMatches(false);
                }}
                className={cn(
                  "focus-ring whitespace-nowrap rounded-full border px-3 py-1 text-sm transition-colors",
                  stretch === s.id
                    ? "border-accent bg-accent/15 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {s.name}
              </button>
            ))}
          </fieldset>
        </div>
      )}

      {view === "overview" && (
        <div className="space-y-8">
          {highlights ? (
            <section>
              <SectionHeading
                kicker={stretchName}
                title={
                  <span className="tabular">
                    <span className="text-win">{highlights.record.wins}W</span>{" "}
                    <span className="text-draw">{highlights.record.draws}D</span>{" "}
                    <span className="text-loss">{highlights.record.losses}L</span>
                  </span>
                }
                actions={
                  values && (
                    <span className="text-sm text-muted-foreground tabular">
                      {ppg(pointsPerGame(highlights.record, values))} pts a game
                    </span>
                  )
                }
              />
              <RecordBar
                wins={highlights.record.wins}
                draws={highlights.record.draws}
                losses={highlights.record.losses}
              />
              <div className="mt-4">
                <PlayerHighlights
                  playerId={player.id}
                  highlights={highlights}
                  values={values}
                  playerFor={playerFor}
                />
              </div>
            </section>
          ) : (
            <Empty>{first} has not played {stretch === "all" ? "yet" : `in ${stretchName}`}.</Empty>
          )}
          <PlayerRatingCard playerId={player.id} playerName={player.name} />
        </div>
      )}

      {view === "web" &&
        (highlights && values ? (
          <section>
            <SectionHeading
              kicker={stretchName}
              title={`${first}'s web`}
              actions={
                <Link
                  href={`/lineups?p=${player.id}`}
                  className="flex items-center gap-1 text-sm text-accent hover:underline"
                >
                  <Network className="h-4 w-4" />
                  Line-up lab
                </Link>
              }
            />
            <p className="mb-4 text-sm text-muted-foreground">
              Everybody {first} has played with or against, round them. Green
              where they took more points a game than their own average, red
              where fewer; thicker is more games. Tap a face for the numbers.
            </p>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <PlayerWeb
                player={player}
                own={highlights.record}
                mates={highlights.mates}
                opponents={highlights.opponents}
                playerFor={playerFor}
                values={values}
                across={stretch === "all" ? "all their games" : stretchName}
              />
            </div>
          </section>
        ) : (
          <Empty>Nothing to draw {stretch === "all" ? "yet" : `for ${stretchName}`}.</Empty>
        ))}

      {view === "matches" &&
        (theirMatches.length === 0 ? (
          <Empty>{first} has not played {stretch === "all" ? "yet" : `in ${stretchName}`}.</Empty>
        ) : (
          <section>
            <SectionHeading kicker={stretchName} title={`Every match · ${theirMatches.length}`} />
            <ul className="space-y-2">
              {shownMatches.map((match) => (
                <MatchListItem
                  key={match.id}
                  match={match}
                  viewpoint={viewpointOf(match)}
                  swing={swings.get(match.id)}
                />
              ))}
            </ul>
            {theirMatches.length > MATCHES_SHOWN && (
              <Button
                variant="outline"
                className="mt-3 w-full"
                onClick={() => setShowAllMatches((shown) => !shown)}
              >
                {showAllMatches ? "Show fewer" : `Show all ${theirMatches.length}`}
              </Button>
            )}
          </section>
        ))}

      {view === "seasons" && (
        <section>
          <SectionHeading kicker="Season by season" title={`${career.length} ${career.length === 1 ? "season" : "seasons"}`} />
          <PlayerSeasonsList playerId={player.id} seasons={career} />
        </section>
      )}
    </div>
  );
};

/** Wins, draws and defeats as one bar, in the app's three colours. */
function RecordBar({ wins, draws, losses }: { wins: number; draws: number; losses: number }) {
  const total = Math.max(1, wins + draws + losses);
  return (
    <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
      <div className="bg-win" style={{ width: `${(wins / total) * 100}%` }} />
      <div className="bg-draw" style={{ width: `${(draws / total) * 100}%` }} />
      <div className="bg-loss" style={{ width: `${(losses / total) * 100}%` }} />
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export default PlayerDetail;
