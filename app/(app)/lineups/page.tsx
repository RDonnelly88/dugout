"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FlaskConical, Handshake, Network, UserPlus, X } from "lucide-react";
import { getMatches, getPlayers, getSeasons } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import { RECENT_MATCHES } from "@/lib/config";
import { matchExpectations, signedWins, type Ledger } from "@/lib/expected-wins";
import type { PointValues } from "@/lib/season-positions";
import {
  averagePointsPerGame,
  enoughGames,
  pointsPerGame,
  ppg,
  rankBy,
  listTone,
  type Measure,
} from "@/lib/measure";
import MeasureToggle from "@/components/MeasureToggle";
import PointsBar from "@/components/PointsBar";
import { lineupReport, LINEUP_MAX } from "@/lib/lineup";
import { LAST_MONTHS, readTimeline, withinTimeline } from "@/lib/timeline";
import { squadWeb } from "@/lib/squad-web";
import { sideOf } from "@/lib/match-result";
import { usePointValues } from "@/hooks/usePointValues";
import PageHeader from "@/components/PageHeader";
import StatsNav from "@/components/StatsNav";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import ActiveFilter, { isActivePlayer, type ActiveScope } from "@/components/players/ActiveFilter";
import MatchCard from "@/components/matches/MatchCard";
import Verdict from "@/components/xw/Verdict";
import LuckBar from "@/components/xw/LuckBar";
import { Rail } from "@/components/ui/rail";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Match, Player } from "@/types";

/** Who-to-add suggestions shown before the list stops. */
const ADDITIONS_SHOWN = 5;

const timelineChoice = (token: string | null) =>
  token?.startsWith("r:") ? "range" : (token ?? "all");

/** "Ross", "Ross & Boyd", "Ross, Boyd & Ian". */
const names = (list: string[]) =>
  list.length <= 1 ? (list[0] ?? "") : `${list.slice(0, -1).join(", ")} & ${list.at(-1)}`;

/** Wins with a draw as a half, to one place, dropping a needless ".0". */
const wins = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

function Record({ ledger }: { ledger: Ledger }) {
  return (
    <span className="tabular">
      {ledger.wins}W {ledger.draws}D {ledger.losses}L
    </span>
  );
}

/** How the page is being read, and the baseline a figure is set against. */
interface Reading {
  measure: Measure;
  values: PointValues;
  /** Points a game a figure is compared with, on the record. */
  baseline: number;
}

const LEAN_TEXT = { ahead: "text-win", behind: "text-loss", level: "text-foreground" } as const;

/**
 * The figure a row is about, coloured by which way it went: points a game on
 * the record, wins above expected against the odds.
 */
function Lean({ ledger, reading, className }: { ledger: Ledger; reading: Reading; className?: string }) {
  return (
    <span
      className={cn(
        "tabular font-semibold",
        ledger.played === 0
          ? "text-muted-foreground"
          : LEAN_TEXT[listTone(ledger, reading.measure, reading.values, reading.baseline)],
        className
      )}
    >
      {ledger.played === 0
        ? "—"
        : reading.measure === "record"
          ? ppg(pointsPerGame(ledger, reading.values))
          : signedWins(ledger.above)}
    </span>
  );
}

/** The bar beside a figure: points a game out of a win, or the luck band. */
function Bar({ ledger, reading }: { ledger: Ledger; reading: Reading }) {
  return reading.measure === "record" ? (
    <PointsBar ledger={ledger} values={reading.values} baseline={reading.baseline} className="flex-1" />
  ) : (
    <LuckBar ledger={ledger} className="flex-1" />
  );
}

/** One line of the with-and-without breakdown. */
function LedgerRow({
  label,
  faces,
  ledger,
  reading,
  emphasis = false,
}: {
  label: string;
  faces: Player[];
  ledger: Ledger;
  reading: Reading;
  emphasis?: boolean;
}) {
  return (
    <li
      className={cn(
        "grid gap-2 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] sm:items-center",
        emphasis ? "border-accent/50 bg-accent/5" : "border-border bg-surface"
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex shrink-0 -space-x-2">
          {faces.map((player) => (
            <PlayerAvatar key={player.id} name={player.name} image={player.image} size="xs" />
          ))}
        </div>
        <div className="min-w-0">
          <p className={cn("truncate text-sm", emphasis && "font-semibold")}>{label}</p>
          <p className="text-xs text-muted-foreground">
            {ledger.played === 0 ? (
              "Never happened"
            ) : (
              <>
                {ledger.played} {ledger.played === 1 ? "game" : "games"} · <Record ledger={ledger} />
                {reading.measure === "odds" && (
                  <span className="tabular">
                    {" "}· {wins(ledger.actual)} won v {ledger.expected.toFixed(1)} xW
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Bar ledger={ledger} reading={reading} />
        <Lean ledger={ledger} reading={reading} className="w-10 text-right text-sm" />
        {reading.measure === "odds" && (
          <Verdict verdict={ledger.verdict} className="hidden w-[7.5rem] justify-center sm:inline-flex" />
        )}
      </div>
    </li>
  );
}

function Headline({
  faces,
  ledger,
  reading,
}: {
  faces: Player[];
  ledger: Ledger;
  reading: Reading;
}) {
  const who = names(faces.map((p) => p.name));
  const one = faces.length === 1;
  const record = reading.measure === "record";
  const box = "rounded-lg bg-surface-2/60 p-3";

  return (
    <Card className="grain overflow-hidden">
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex -space-x-3">
            {faces.map((player) => (
              <PlayerAvatar key={player.id} name={player.name} image={player.image} size="md" />
            ))}
          </div>
          <div className="min-w-0">
            <p className="eyebrow">{one ? "On their own" : "On the same side"}</p>
            <h2 className="text-xl font-bold">{who}</h2>
          </div>
          {!record && <Verdict verdict={ledger.verdict} className="ml-auto text-xs" />}
        </div>

        {ledger.played === 0 ? (
          <p className="text-muted-foreground">
            {one ? "No games in this stretch." : "Never on the same side in this stretch."}
          </p>
        ) : record ? (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={box}>
                <p className="scoreboard text-4xl">{ledger.played}</p>
                <p className="eyebrow mt-1">Played</p>
              </div>
              <div className={box}>
                {/* Smaller on a phone: three two-figure counts and their
                    dashes do not fit a third of the width at full size. */}
                <p className="scoreboard whitespace-nowrap text-2xl sm:text-4xl">
                  <span className="text-win">{ledger.wins}</span>
                  <span className="text-muted-foreground">–</span>
                  <span className="text-draw">{ledger.draws}</span>
                  <span className="text-muted-foreground">–</span>
                  <span className="text-loss">{ledger.losses}</span>
                </p>
                <p className="eyebrow mt-1">W–D–L</p>
              </div>
              <div className={box}>
                <Lean ledger={ledger} reading={reading} className="scoreboard text-4xl" />
                <p className="eyebrow mt-1">Pts a game</p>
              </div>
            </div>

            <PointsBar ledger={ledger} values={reading.values} baseline={reading.baseline} />

            <p className="text-sm text-muted-foreground">
              {one
                ? `${ppg(pointsPerGame(ledger, reading.values))} points a game over ${ledger.played} ${
                    ledger.played === 1 ? "game" : "games"
                  }, against the squad's ${ppg(reading.baseline)} — the tick on the bar.`
                : `Together they took ${ppg(pointsPerGame(ledger, reading.values))} points a game. Each of them, whoever else was playing, averaged ${ppg(
                    reading.baseline
                  )} between them — the tick on the bar.`}{" "}
              {!enoughGames(ledger) && "Too few games to read much into yet."}
            </p>
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={box}>
                <p className="scoreboard text-4xl">{wins(ledger.actual)}</p>
                <p className="eyebrow mt-1">Won</p>
              </div>
              <div className={box}>
                <p className="scoreboard text-4xl text-muted-foreground">{ledger.expected.toFixed(1)}</p>
                <p className="eyebrow mt-1">xW</p>
              </div>
              <div className={box}>
                <Lean ledger={ledger} reading={reading} className="scoreboard text-4xl" />
                <p className="eyebrow mt-1">Above xW</p>
              </div>
            </div>

            <div>
              <LuckBar ledger={ledger} />
              <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                <span>Worse than expected</span>
                <span>Better</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {ledger.played} {ledger.played === 1 ? "game" : "games"}, <Record ledger={ledger} />. The
              ratings expected {ledger.expected.toFixed(1)} wins from the sides they were in,
              counting a draw as half, and they took {wins(ledger.actual)}.{" "}
              {ledger.verdict === "early"
                ? "Too few games to read anything into yet."
                : `Luck alone would land anywhere within ±${ledger.luck.toFixed(1)} of what was expected, so ${
                    ledger.verdict === "luck"
                      ? "this could easily be luck."
                      : ledger.verdict === "above"
                        ? "this is better than luck usually manages."
                        : "this is worse than luck usually manages."
                  }`}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function LineupLab() {
  const { currentTeam } = useTeam();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });
  const { data: players = [], isLoading: loadingPlayers } = useQuery({
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

  // Everything the page is asking lives in the address, so a line-up can be
  // shared and the back button undoes a change.
  const picked = useMemo(
    () =>
      (params.get("p") ?? "")
        .split(",")
        .filter((id) => byId.has(id))
        .slice(0, LINEUP_MAX),
    [params, byId]
  );
  const scope: ActiveScope = params.get("a") === "all" ? "all" : "active";
  const timelineToken = params.get("t");
  const timeline = useMemo(() => readTimeline(timelineToken), [timelineToken]);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const toggle = (id: string) => {
    const next = picked.includes(id)
      ? picked.filter((p) => p !== id)
      : [...picked, id].slice(0, LINEUP_MAX);
    update({ p: next.join(",") || null });
  };

  // Odds from the whole history; the stretch only decides which nights count.
  const odds = useMemo(() => matchExpectations(matches), [matches]);
  const values = usePointValues();
  const scoped = useMemo(() => withinTimeline(matches, timeline), [matches, timeline]);

  const candidates = useMemo(
    () => players.filter((p) => scope === "all" || isActivePlayer(p)).map((p) => p.id),
    [players, scope]
  );

  const web = useMemo(
    () => squadWeb(scoped, odds, new Set(candidates)),
    [scoped, odds, candidates]
  );
  const report = useMemo(
    () => (picked.length > 0 ? lineupReport(scoped, odds, picked, candidates) : null),
    [scoped, odds, picked, candidates]
  );

  const listed = players
    .filter((p) => scope === "all" || isActivePlayer(p) || picked.includes(p.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  const pickedPlayers = picked.map((id) => byId.get(id)!);
  const nameOf = (id: string) => byId.get(id)?.name ?? "Unknown";

  // The record unless the address asks for the odds, and the odds alone
  // until the table that says what a win is worth has loaded.
  const measure: Measure = values && params.get("m") !== "odds" ? "record" : "odds";
  const points = values ?? { win: 1, draw: 0.5 };
  const squadAverage = averagePointsPerGame(web.players.map((p) => p.ledger), points);
  // What the group is set against: on their own, each of them averages this
  // between them, whoever else was playing. For one player, the squad.
  const ownAverage = (() => {
    const played = (report?.alone ?? []).filter((a) => a.ledger.played > 0);
    if (picked.length < 2 || played.length === 0) return squadAverage;
    return played.reduce((sum, a) => sum + pointsPerGame(a.ledger, points), 0) / played.length;
  })();
  const reading: Reading = { measure, values: points, baseline: ownAverage };
  // A suggestion is read against the group as it stands: green if adding
  // them took more points a game than the group takes already.
  const additionReading: Reading = {
    measure,
    values: points,
    baseline: report ? pointsPerGame(report.together, points) : 0,
  };
  const additions = report
    ? rankBy(report.additions, measure, points, additionReading.baseline)
    : [];

  const nightsTogether: Match[] = useMemo(() => {
    if (!report) return [];
    const ids = new Set(report.together.nights.map((n) => n.matchId));
    return scoped.filter((m) => ids.has(m.id)).reverse();
  }, [report, scoped]);

  const range = timeline.kind === "range" ? timeline : { from: undefined, to: undefined };

  return (
    <div className="page-container animate-slide-up">
      <StatsNav />
      <PageHeader
        title="Line-up lab"
        subtitle="Who plays well together. Pick up to five and see their record on the same side, or read the whole squad as a web."
      />

      {/* One column on a phone, held to the screen: an auto-sized column would
          stretch to the full width of the rail of match cards inside it. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Card className="h-fit lg:sticky lg:top-6">
          <CardHeader className="pb-3 sm:pb-3">
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-accent" />
              The line-up
            </CardTitle>
            <CardDescription>
              {picked.length === 0
                ? "Tap players to add them."
                : `${picked.length} of ${LINEUP_MAX} picked.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lineup-timeline">Over</Label>
              <Select
                value={timelineChoice(timelineToken)}
                onValueChange={(value) =>
                  update({ t: value === "range" ? "r:_" : value === "all" ? null : value })
                }
              >
                <SelectTrigger id="lineup-timeline">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="recent">Last {RECENT_MATCHES} matches</SelectItem>
                  <SelectItem value="year">Last {LAST_MONTHS} months</SelectItem>
                  {seasons.map((season) => (
                    <SelectItem key={season.id} value={`s:${season.id}`}>
                      {season.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="range">Between dates…</SelectItem>
                </SelectContent>
              </Select>
              {timeline.kind === "range" && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <Label htmlFor="lineup-from" className="text-xs text-muted-foreground">
                      From
                    </Label>
                    <Input
                      id="lineup-from"
                      type="date"
                      value={range.from ?? ""}
                      onChange={(e) => update({ t: `r:${e.target.value}_${range.to ?? ""}` })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lineup-to" className="text-xs text-muted-foreground">
                      To
                    </Label>
                    <Input
                      id="lineup-to"
                      type="date"
                      value={range.to ?? ""}
                      onChange={(e) => update({ t: `r:${range.from ?? ""}_${e.target.value}` })}
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {scoped.length} {scoped.length === 1 ? "match" : "matches"} in this stretch.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">Players</span>
              <ActiveFilter value={scope} onChange={(next) => update({ a: next === "all" ? "all" : null })} />
            </div>

            {loadingPlayers ? (
              <div className="sheen h-48 rounded-lg" />
            ) : (
              <ul className="flex flex-wrap gap-2" aria-label="Players to pick from">
                {listed.map((player) => {
                  const on = picked.includes(player.id);
                  const full = !on && picked.length >= LINEUP_MAX;
                  return (
                    <li key={player.id}>
                      <button
                        type="button"
                        aria-pressed={on}
                        disabled={full}
                        onClick={() => toggle(player.id)}
                        className={cn(
                          "focus-ring flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-sm transition-colors disabled:opacity-40",
                          on
                            ? "border-accent bg-accent/10 font-medium text-foreground"
                            : "border-border bg-surface text-muted-foreground hover:border-border-strong"
                        )}
                      >
                        <PlayerAvatar name={player.name} image={player.image} size="xs" />
                        {player.name}
                        {on && <X className="h-3 w-3" aria-hidden />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {loadingMatches ? (
            <div className="sheen h-64 rounded-xl" />
          ) : !report ? (
            <>
              <Card>
                <CardContent className="py-12 text-center sm:py-12">
                  <Handshake className="mx-auto mb-3 h-8 w-8 text-accent" />
                  <p className="font-medium">Who plays well together?</p>
                  <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                    Pick two or three of the squad for their record on the same side, or find a
                    pair on the squad web. Switch to against the odds to allow for who else was on
                    each side.
                  </p>
                  <Link
                    href="/web"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                  >
                    <Network className="h-4 w-4" />
                    The squad web
                  </Link>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {values && (
                <div className="flex items-center justify-end">
                  <MeasureToggle
                    value={measure}
                    onChange={(next) => update({ m: next === "odds" ? "odds" : null })}
                  />
                </div>
              )}
              <Headline faces={pickedPlayers} ledger={report.together} reading={reading} />

              {report.without.length > 0 && (
                <Card className="reveal">
                  <CardHeader className="pb-3 sm:pb-3">
                    <CardTitle>With and without</CardTitle>
                    <CardDescription>
                      The same group with one of them missing from the side, and each of them on
                      their own. Where the number drops, that is who makes the difference.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <LedgerRow
                        label={`All ${picked.length} together`}
                        faces={pickedPlayers}
                        ledger={report.together}
                        reading={reading}
                        emphasis
                      />
                      {report.without.map(({ playerId, ledger }) => {
                        const rest = picked.filter((id) => id !== playerId);
                        return (
                          <LedgerRow
                            key={`without-${playerId}`}
                            label={`${names(rest.map(nameOf))}, without ${nameOf(playerId)}`}
                            faces={rest.map((id) => byId.get(id)!)}
                            ledger={ledger}
                            reading={reading}
                          />
                        );
                      })}
                      {report.alone.map(({ playerId, ledger }) => (
                        <LedgerRow
                          key={`alone-${playerId}`}
                          label={`${nameOf(playerId)}, whoever else`}
                          faces={[byId.get(playerId)!]}
                          ledger={ledger}
                          reading={reading}
                        />
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {additions.length > 0 && (
                <Card className="reveal">
                  <CardHeader className="pb-3 sm:pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-accent" />
                      Who completes {picked.length === 1 ? "them" : "the set"}?
                    </CardTitle>
                    <CardDescription>
                      Everybody{scope === "active" ? " active" : ""} who has shared a side with{" "}
                      {picked.length === 1 ? nameOf(picked[0]) : "all of them"}, by how the group did
                      with them added. Tap one to add them.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {additions.slice(0, ADDITIONS_SHOWN).map(({ playerId, ledger }) => {
                        const player = byId.get(playerId);
                        if (!player) return null;
                        return (
                          <li key={playerId}>
                            <button
                              type="button"
                              onClick={() => toggle(playerId)}
                              className="focus-ring grid w-full gap-2 rounded-lg border border-border bg-surface p-3 text-left transition-colors hover:border-border-strong sm:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] sm:items-center"
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                <PlayerAvatar name={player.name} image={player.image} size="sm" />
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-medium">
                                    + {player.name}
                                  </span>
                                  <span className="block text-xs text-muted-foreground">
                                    {ledger.played} {ledger.played === 1 ? "game" : "games"} ·{" "}
                                    <Record ledger={ledger} />
                                  </span>
                                </span>
                              </span>
                              <span className="flex items-center gap-3">
                                <Bar ledger={ledger} reading={additionReading} />
                                <Lean
                                  ledger={ledger}
                                  reading={additionReading}
                                  className="w-10 text-right text-sm"
                                />
                                {measure === "odds" && (
                                  <Verdict
                                    verdict={ledger.verdict}
                                    className="hidden w-[7.5rem] justify-center sm:inline-flex"
                                  />
                                )}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {nightsTogether.length > 0 && (
                <Card className="reveal">
                  <CardHeader className="pb-3 sm:pb-3">
                    <CardTitle>
                      {picked.length === 1 ? "Their games" : "The nights together"}
                    </CardTitle>
                    <CardDescription>Newest first.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Rail label="Nights together">
                      {nightsTogether.map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          side={sideOf(match, picked[0]) ?? undefined}
                        />
                      ))}
                    </Rail>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The address carries the line-up, and reading it opts the page out of being
 * prerendered; the boundary keeps that to this page's own content.
 */
export default function LineupLabPage() {
  return (
    <Suspense>
      <LineupLab />
    </Suspense>
  );
}
