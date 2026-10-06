"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Search, Shuffle } from "lucide-react";
import { getMatches, getPlayers, getSeasons } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MatchListItem from "@/components/matches/MatchListItem";
import { useTeam } from "@/contexts/TeamContext";
import { usePermission } from "@/lib/permission-utils";
import { outcomeOf } from "@/lib/match-result";
import { ratingSwings } from "@/lib/match-impact";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import { cn } from "@/lib/utils";
import type { Match } from "@/types";

/** How many results to list before asking: two months or so of Mondays. */
const PAGE = 12;

const time = (date: string) => new Date(date).getTime();
const day = (value: string) => (value.includes("T") ? parseISO(value) : new Date(`${value}T12:00:00`));

/**
 * Every result, newest first, under the month it was played in, with
 * anything not yet played pinned above. Narrowed by season, or by a player's
 * name to see only the nights they were in.
 *
 * Deleting a match is on the match itself rather than a bin on every row,
 * where a slip of the thumb while scrolling could take a result away.
 */
const Results = () => {
  const { currentTeam } = useTeam();
  const { canManage, ready } = usePermission();
  const [search, setSearch] = useState("");
  const [season, setSeason] = useState<string>("all");
  const [shown, setShown] = useState(PAGE);

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
  });
  const { data: players = [] } = useQuery({
    queryKey: ["players", currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam,
  });
  const { data: seasons = [] } = useQuery({
    queryKey: ["seasons", currentTeam?.id],
    queryFn: getSeasons,
    enabled: !!currentTeam,
  });

  // From the whole history, not the filtered list: a side's rating going
  // into a match depends on everything played before it.
  const swings = useMemo(() => ratingSwings(matches), [matches]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const named = term
      ? new Set(players.filter((p) => p.name.toLowerCase().includes(term)).map((p) => p.id))
      : null;
    return matches.filter(
      (m) =>
        (season === "all" || m.seasonId === season) &&
        (!named || [...m.teamA.players, ...m.teamB.players].some((id) => named.has(id)))
    );
  }, [matches, players, search, season]);

  const fixtures = filtered
    .filter((m) => outcomeOf(m) === null)
    .sort((a, b) => time(a.date) - time(b.date));
  const results = filtered
    .filter((m) => outcomeOf(m) !== null)
    .sort((a, b) => time(b.date) - time(a.date));

  // Grouped by month, in order, from the slice being shown.
  const months = useMemo(() => {
    const groups: { key: string; label: string; matches: Match[] }[] = [];
    for (const match of results.slice(0, shown)) {
      const date = day(match.date);
      const key = format(date, "yyyy-MM");
      const last = groups.at(-1);
      if (last?.key === key) last.matches.push(match);
      else groups.push({ key, label: format(date, "MMMM yyyy"), matches: [match] });
    }
    return groups;
  }, [results, shown]);

  const allPlayed = matches.filter((m) => outcomeOf(m) !== null).length;
  const sortedSeasons = [...seasons].sort((a, b) => time(b.startDate) - time(a.startDate));

  return (
    <div className="page-container animate-slide-up">
      <PageHeader
        title="Results"
        subtitle={`${allPlayed} played${seasons.length ? ` over ${seasons.length} ${seasons.length === 1 ? "season" : "seasons"}` : ""}.`}
        actions={
          ready &&
          canManage() && (
            <Button asChild size="sm">
              <Link href="/matches/create">
                <Shuffle className="mr-1.5 h-4 w-4" />
                Pick the teams
              </Link>
            </Button>
          )
        }
      />

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Nights a player was in"
            aria-label="Only the nights a player was in"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShown(PAGE);
            }}
            className="w-full rounded-full bg-surface pl-9 sm:max-w-sm"
          />
        </div>
        {seasons.length > 1 && (
          <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
            <fieldset aria-label="Which season" className="flex w-max gap-1.5">
              {[{ id: "all", name: "Every season" }, ...sortedSeasons].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={season === s.id}
                  onClick={() => {
                    setSeason(s.id);
                    setShown(PAGE);
                  }}
                  className={cn(
                    "focus-ring whitespace-nowrap rounded-full border px-3 py-1 text-sm transition-colors",
                    season === s.id
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
      </div>

      {isLoading ? (
        <PageLoading rows={5} label="Loading the results" />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
          {search ? `No nights with anybody called “${search}”.` : "Nothing played yet."}
        </div>
      ) : (
        <div className="space-y-6">
          {fixtures.length > 0 && (
            <section>
              <h2 className="eyebrow mb-2 text-accent">Coming up</h2>
              <ul className="space-y-2">
                {fixtures.map((match) => (
                  <MatchListItem key={match.id} match={match} />
                ))}
              </ul>
            </section>
          )}
          {months.map((month) => (
            <section key={month.key}>
              <h2 className="eyebrow mb-2">{month.label}</h2>
              <ul className="space-y-2">
                {month.matches.map((match) => (
                  <MatchListItem key={match.id} match={match} swing={swings.get(match.id)} />
                ))}
              </ul>
            </section>
          ))}
          {results.length > shown && (
            <Button variant="outline" className="w-full" onClick={() => setShown((n) => n + PAGE * 2)}>
              Older results · {results.length - shown} more
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Results;
