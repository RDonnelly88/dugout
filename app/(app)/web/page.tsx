"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMatches, getPlayers, getSeasons } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import { ELO } from "@/lib/config";
import { matchExpectations } from "@/lib/expected-wins";
import { ringOrder, squadWeb } from "@/lib/squad-web";
import { readTimeline, withinTimeline } from "@/lib/timeline";
import { usePointValues } from "@/hooks/usePointValues";
import SquadWeb from "@/components/lineups/SquadWeb";
import PageHeader from "@/components/PageHeader";
import StatsNav from "@/components/StatsNav";
import ActiveFilter, { isActivePlayer, type ActiveScope } from "@/components/players/ActiveFilter";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * The whole squad as one picture: everybody round a ring, a line wherever
 * two of them have shared a side, coloured by how they did together. Its own
 * page under Stats, where it was the foot of the line-up lab and easy to miss.
 * A line or a face opens the lab on that pair or player.
 *
 * The stretch and who is shown live in the address, in the same tokens the
 * lab uses, so opening a pair carries the stretch across with it.
 */
function SquadWebPage() {
  const { currentTeam } = useTeam();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
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

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const scope: ActiveScope = params.get("a") === "all" ? "all" : "active";
  const token = params.get("t");
  const timeline = useMemo(() => readTimeline(token), [token]);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const odds = useMemo(() => matchExpectations(matches), [matches]);
  const values = usePointValues();
  const scoped = useMemo(() => withinTimeline(matches, timeline), [matches, timeline]);
  const candidates = useMemo(
    () => players.filter((p) => scope === "all" || isActivePlayer(p)).map((p) => p.id),
    [players, scope]
  );
  const web = useMemo(() => squadWeb(scoped, odds, new Set(candidates)), [scoped, odds, candidates]);
  const seating = useMemo(() => ringOrder(web), [web]);

  /** Into the lab with the same stretch, on whoever was tapped. */
  const openLab = (ids: string[]) => {
    const query = new URLSearchParams({ p: ids.join(",") });
    if (token) query.set("t", token);
    if (scope === "all") query.set("a", "all");
    router.push(`/lineups?${query.toString()}`);
  };

  const stretches = [
    { token: null, name: "All time" },
    { token: "recent", name: `Last ${ELO.window}` },
    ...[...seasons]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .map((s) => ({ token: `s:${s.id}`, name: s.name })),
  ];

  return (
    <div className="page-container animate-slide-up">
      <StatsNav />
      <PageHeader
        title="Squad web"
        subtitle="Everybody round a ring, with a line wherever two of them have shared a side. Tap a face to light up their links, or a line to open that pair in the line-up lab."
      />

      <div className="mb-4 space-y-3">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          <fieldset aria-label="Over which stretch" className="flex w-max gap-1.5">
            {stretches.map((s) => {
              const on = (token ?? null) === s.token;
              return (
                <button
                  key={s.token ?? "all"}
                  type="button"
                  aria-pressed={on}
                  onClick={() => update({ t: s.token })}
                  className={cn(
                    "focus-ring whitespace-nowrap rounded-full border px-3 py-1 text-sm transition-colors",
                    on
                      ? "border-accent bg-accent/15 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.name}
                </button>
              );
            })}
          </fieldset>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground tabular">
            {scoped.length} {scoped.length === 1 ? "match" : "matches"}
          </span>
          <ActiveFilter value={scope} onChange={(next) => update({ a: next === "all" ? "all" : null })} />
        </div>
      </div>

      {isLoading ? (
        <div className="sheen h-96 rounded-xl" />
      ) : (
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <SquadWeb
              web={web}
              order={seating}
              byId={byId}
              picked={[]}
              onOpenPair={(a, b) => openLab([a, b])}
              onAddPlayer={(id) => openLab([id])}
              values={values}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SquadWebRoute() {
  // Reading the address needs a boundary, or the page cannot be prerendered.
  return (
    <Suspense>
      <SquadWebPage />
    </Suspense>
  );
}
