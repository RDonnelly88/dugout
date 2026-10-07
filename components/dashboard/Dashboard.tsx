"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, ChevronRight, Flag, Flame, PartyPopper, Sparkles, TrendingUp, Trophy, UserPlus } from "lucide-react";
import { useTeam } from "@/contexts/TeamContext";
import { getCurrentSeason, getMatches, getPlayers, getSeasonPlayerStats, getSeasons } from "@/lib/db";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import { usePlayerRecords } from "@/hooks/usePlayerRecords";
import { usePointValues } from "@/hooks/usePointValues";
import { usePermission } from "@/lib/permission-utils";
import { isActivePlayer } from "@/components/players/ActiveFilter";
import { outcomeOf } from "@/lib/match-result";
import { currentRuns, matchStory, nightContext } from "@/lib/match-story";
import { milestones } from "@/lib/milestones";
import { shortNames } from "@/lib/short-names";
import PageHeader from "@/components/PageHeader";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import LeagueTable from "@/components/seasons/LeagueTable";
import RatingLeaderboard from "@/components/ratings/RatingLeaderboard";
import { NextUp, LastResult } from "./Matchday";

const time = (date: string) => new Date(date).getTime();

/** How far back a player's latest game can be for their run to still be news. */
const RECENT_NIGHTS = 3;

/** A panel's lines, each with the accent's dot. */
function Lines({ lines }: { lines: string[] }) {
  return (
    <ul className="space-y-2">
      {lines.map((line) => (
        <li key={line} className="flex items-baseline gap-3 text-sm">
          <span className="h-2 w-2 shrink-0 translate-y-[-1px] rounded-full bg-accent" aria-hidden />
          {line}
        </li>
      ))}
    </ul>
  );
}

/** A card's heading, and the way through to the page that holds the rest. */
function Panel({
  title,
  icon: Icon,
  href,
  more,
  children,
}: {
  title: string;
  icon: typeof Trophy;
  href?: string;
  more?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Icon className="h-5 w-5 text-accent" />
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="focus-ring flex shrink-0 items-center gap-0.5 rounded text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            {more}
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/**
 * The front page, in the order a Monday goes: the next night (or the button
 * to set one up), how the last one finished and what was worth saying about
 * it, then where everybody stands — the table and the ratings — and the
 * round numbers coming up.
 *
 * Everything else has a tab of its own; this is a glance, and each panel
 * goes through to the page that tells the rest.
 */
const Dashboard = () => {
  const { currentTeam } = useTeam();
  const { canManage, ready } = usePermission();
  const admin = ready && canManage();

  const { data: currentSeason } = useQuery({
    queryKey: ["currentSeason", currentTeam?.id],
    queryFn: getCurrentSeason,
    enabled: !!currentTeam,
  });
  const { data: seasons = [] } = useQuery({
    queryKey: ["seasons", currentTeam?.id],
    queryFn: getSeasons,
    enabled: !!currentTeam,
  });
  const { data: seasonPlayerStats = [] } = useQuery({
    queryKey: ["seasonPlayerStats", currentSeason?.id],
    queryFn: () => (currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([])),
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
  const { records } = usePlayerRecords();

  const names = useMemo(() => shortNames(players), [players]);
  const name = (id: string) => names.get(id) ?? "?";
  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  const played = useMemo(
    () => matches.filter((m) => outcomeOf(m) !== null).sort((a, b) => time(b.date) - time(a.date)),
    [matches]
  );
  const last = played[0];
  // The soonest fixture not yet played, from the last result on: an old one
  // nobody ever finished is not "next".
  const fixture = useMemo(
    () =>
      matches
        .filter((m) => outcomeOf(m) === null && (!last || time(m.date) >= time(last.date)))
        .sort((a, b) => time(a.date) - time(b.date))[0],
    [matches, last]
  );

  const active = useMemo(() => new Set(players.filter(isActivePlayer).map((p) => p.id)), [players]);

  // The last night told the way the share card tells it, from the same
  // story, so the front page and the picture in the group chat never differ;
  // its runs are left to the panel below, which has everybody's.
  const values = usePointValues();
  const story = useMemo(() => {
    if (!last) return [];
    const night = nightContext(last, matches, values);
    return matchStory({
      match: last,
      played: night.played,
      season: night.season,
      chanceA: night.chanceA,
      league: night.league,
      nameOf: (id) => byId.get(id)?.name,
      among: (id) => active.has(id),
      runs: false,
    });
  }, [last, matches, values, byId, active]);

  // The runs the squad is on, each to their own latest game, so somebody
  // who sat out last week is still on the run they left on. Only those who
  // have played in the last few nights, so a run from months ago is not news.
  const runs = useMemo(
    () =>
      currentRuns({
        played,
        players: [...active],
        recent: new Set(played.slice(0, RECENT_NIGHTS).map((m) => m.id)),
        nameOf: (id) => byId.get(id)?.name,
        // The front page has room for everybody.
        shown: Infinity,
      }),
    [played, active, byId]
  );

  // Round numbers still to come. One brought up last time out is in the
  // story above, told only if it was really brought up then.
  const coming = useMemo(
    () => milestones(records.filter((r) => active.has(r.playerId)), new Set()).slice(0, 4),
    [records, active]
  );

  // A season that finished lately has a wrapped worth opening. Measured from
  // the latest result rather than today, so the page reads the same however
  // late it is opened.
  const wrapped = useMemo(() => {
    if (!last) return undefined;
    return seasons
      .filter((s) => s.isFinished && s.endDate && time(last.date) - time(s.endDate) < 60 * 86_400_000)
      .sort((a, b) => time(b.endDate!) - time(a.endDate!))[0];
  }, [seasons, last]);

  const nightsThisSeason = currentSeason ? played.filter((m) => m.seasonId === currentSeason.id).length : 0;

  return (
    <div className="page-container animate-slide-up">
      <PageHeader
        eyebrow={currentSeason?.name ?? "The Dugout"}
        title={currentTeam?.name ?? "Dugout"}
        subtitle={
          currentSeason
            ? `${nightsThisSeason} ${nightsThisSeason === 1 ? "night" : "nights"} into ${currentSeason.name}.`
            : "No season running. Start one to keep a table."
        }
      />

      <div className="space-y-4">
        <NextUp fixture={fixture} canManage={admin} name={name} />
        <LastResult match={last} name={name} />

        {last && story.length > 0 && (
          <Panel title="Last time out" icon={PartyPopper} href={`/matches/${last.id}`} more="The match">
            <Lines lines={story} />
          </Panel>
        )}

        {runs.length > 0 && (
          <Panel title="Runs going" icon={Flame}>
            <Lines lines={runs} />
          </Panel>
        )}

        {wrapped && (
          <Link
            href={`/seasons/${wrapped.id}#wrapped`}
            className="focus-ring flex items-center gap-3 rounded-2xl border border-accent/40 bg-gradient-to-r from-accent/15 to-transparent p-4 transition-colors hover:border-accent"
          >
            <Sparkles className="h-6 w-6 shrink-0 text-accent" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{wrapped.name}, wrapped</span>
              <span className="block text-sm text-muted-foreground">Everybody&apos;s season as a story to tap through.</span>
            </span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {currentSeason && seasonPlayerStats.some((s) => s.played > 0) && (
            <Panel title="The table" icon={Trophy} href={`/seasons/${currentSeason.id}`} more="In full">
              <LeagueTable stats={seasonPlayerStats} seasonId={currentSeason.id} limit={5} />
            </Panel>
          )}
          {ranked.length > 0 && (
            <Panel title="Top rated" icon={TrendingUp} href="/ratings" more="All ratings">
              {/* The squad as it is: somebody who has stopped coming keeps a
                  rating, but not a place in the top five. */}
              <RatingLeaderboard ratings={ranked.filter((r) => active.has(r.playerId)).slice(0, 5)} players={players} />
            </Panel>
          )}
        </div>

        {coming.length > 0 && (
          <Panel title="Coming up" icon={Flag}>
            <ul className="space-y-2">
              {coming.map((m) => {
                const player = byId.get(m.playerId);
                const what = m.kind === "games" ? "game" : "win";
                return (
                  <li key={`${m.playerId}-${m.kind}`} className="flex items-center gap-3">
                    <PlayerAvatar name={player?.name ?? "?"} image={player?.image} size="sm" />
                    <span className="min-w-0 flex-1 text-sm">
                      <Link href={`/players/${m.playerId}`} className="font-semibold hover:underline">
                        {player?.name ?? "Unknown"}
                      </Link>{" "}
                      is {m.toGo} {m.toGo === 1 ? what : `${what}s`} from {m.mark}.
                    </span>
                    <span className="scoreboard text-xl text-muted-foreground">{m.mark}</span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}

        {admin && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href="/players/add"
              className="focus-ring flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            >
              <UserPlus className="h-4 w-4" />
              Add a player
            </Link>
            <Link
              href="/seasons/create"
              className="focus-ring flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            >
              <CalendarPlus className="h-4 w-4" />
              Start a season
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
