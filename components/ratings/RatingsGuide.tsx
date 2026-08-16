"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle } from "lucide-react";
import { getMatches } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import { useSideNames } from "@/hooks/useSideNames";
import { ELO, FORM_LENGTH } from "@/lib/config";
import { displayRating } from "@/lib/elo";
import { workedExample, driftCurve } from "@/lib/ratings-guide";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import PlayerFormDisplay from "@/components/players/PlayerFormDisplay";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Player } from "@/types";

const pct = (x: number) => `${Math.round(x * 100)}%`;
const signed = (x: number) => `${x >= 0 ? "+" : "−"}${Math.abs(Math.round(x))}`;

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold tabular text-muted-foreground">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold">{title}</h4>
        <div className="mt-1 text-sm text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * How the table is worked out, in the squad's own numbers.
 *
 * Every figure here is read from `ELO` or from a real result. Nothing is
 * typed in: a guide that restates the settings in prose is wrong the day
 * somebody changes one, and this app has already had four screens promising
 * behaviour it had stopped having.
 */
export default function RatingsGuide({ players }: { players: Player[] }) {
  const [open, setOpen] = useState(false);
  const { currentTeam } = useTeam();
  const sides = useSideNames();

  // Same key the ratings page already uses, so opening this fetches nothing.
  const { data: matches = [] } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam && open,
  });

  const byId = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players]
  );
  const example = useMemo(
    () => workedExample(matches, players, sides),
    [matches, players, sides]
  );

  const strong = ELO.start + 200;
  const drift = driftCurve(strong, ELO.decay.graceMatches + 8);
  const afterAWhile = drift.at(-1)!;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="mr-2 h-4 w-4" />
          How it works
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>How the table is worked out</SheetTitle>
          <SheetDescription>
            Everyone starts on {ELO.start}. Beat a side rated above you and you
            take more than you would for beating one below. A win is a win — a
            thrashing counts the same as a scrape.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6 pb-10">
          <Section title="A night, in three steps">
            <div className="space-y-4">
              <Step n={1} title="Each side is averaged">
                A team is worth the average of the players in it. Nothing else
                goes in — not the score, not who is in goal.
              </Step>
              <Step n={2} title="The result sets a pot">
                The further apart the two averages, the more an upset is worth
                and the less a win anybody saw coming. The pot is what the
                winning side gains and exactly what the losing side drops —
                nobody is created or destroyed by playing a game.
              </Step>
              <Step n={3} title="Form decides the shares">
                The pot is split across the side by how everyone has been going
                lately, over their last {FORM_LENGTH} games. Whoever is
                flying takes more of a win — and more of a defeat.
              </Step>
            </div>
          </Section>

          {example && (
            <Section title="Your last game, worked through">
              <div className="rounded-xl border border-border bg-surface-2/40 p-4 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {example.winner.name}
                  </span>{" "}
                  averaged{" "}
                  <span className="tabular">
                    {displayRating(example.winner.ratingBefore)}
                  </span>
                  ,{" "}
                  <span className="font-medium text-foreground">
                    {example.loser.name}
                  </span>{" "}
                  <span className="tabular">
                    {displayRating(example.loser.ratingBefore)}
                  </span>
                  . That made {example.winner.name} about{" "}
                  <span className="tabular">{pct(example.expected)}</span> to win.
                </p>
                <p className="mt-2 text-muted-foreground">
                  {example.drawn ? "They drew" : "They won"}, so{" "}
                  <span className="tabular font-medium text-foreground">
                    {Math.abs(Math.round(example.pot))}
                  </span>{" "}
                  points moved from one side to the other. Split by form:
                </p>

                <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                  {example.winner.players
                    .slice()
                    .sort((a, b) => b.change - a.change)
                    .map((p) => (
                      <li key={p.playerId} className="flex items-center gap-2">
                        <PlayerAvatar
                          name={byId.get(p.playerId)?.name ?? "Unknown"}
                          image={byId.get(p.playerId)?.image}
                          size="xs"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {byId.get(p.playerId)?.name ?? "Unknown"}
                        </span>
                        <PlayerFormDisplay results={p.form} size="xs" />
                        <span
                          className={`w-10 text-right tabular ${
                            p.change >= 0 ? "text-win" : "text-loss"
                          }`}
                        >
                          {signed(p.change)}
                        </span>
                      </li>
                    ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Same result, same side, different numbers — that is the form
                  strip beside each name doing the work. The six of them still
                  add up to the pot.
                </p>
              </div>
            </Section>
          )}

          <Section title="Weeks off">
            <p className="text-sm text-muted-foreground">
              Miss more than {ELO.decay.graceMatches} matches the rest of the
              squad played and a rating starts drifting back towards{" "}
              {ELO.start}. A holiday costs nothing. A long absence takes the
              edge off: someone on{" "}
              <span className="tabular">{strong}</span> who sat out{" "}
              {afterAWhile.missed} would come back on{" "}
              <span className="tabular">{Math.round(afterAWhile.rating)}</span>.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              It is counted in games the squad played without you, not weeks on
              the calendar — a winter where nobody plays costs nobody anything.
              It never carries you past {ELO.start}, so time off can make a
              strong player ordinary but never bad.
            </p>
          </Section>

          <Section title="Straight answers">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium">
                  Does a higher rating mean I will win?
                </dt>
                <dd className="mt-0.5 text-muted-foreground">
                  Not really. Sides get picked to be even, so most Mondays are
                  close to a coin toss whatever the table says. The rating is
                  for picking fair teams, not for predicting the result.
                </dd>
              </div>
              <div>
                <dt className="font-medium">Why did everyone&apos;s number change?</dt>
                <dd className="mt-0.5 text-muted-foreground">
                  Nothing is stored. The whole table is worked out from every
                  match, every time it is opened, so correcting a scoreline from
                  March re-rates everything after it — which is what should
                  happen.
                </dd>
              </div>
              <div>
                <dt className="font-medium">I am new. Am I treated differently?</dt>
                <dd className="mt-0.5 text-muted-foreground">
                  No. Your rating moves exactly as far as anyone else&apos;s from
                  your first game. It is only marked as a rough guess until{" "}
                  {ELO.settledAfter} games are behind it, because a number
                  resting on three results is a shakier guess than one resting
                  on forty.
                </dd>
              </div>
            </dl>
          </Section>

          <Section title="The actual sums">
            <div className="space-y-2 rounded-lg border border-border bg-surface-2/40 p-3 font-mono text-xs text-muted-foreground">
              <p>expected = 1 / (1 + 10^((them − us) / 400))</p>
              <p>
                pot = {example?.headcount ?? 5} × {ELO.k} × (result − expected)
              </p>
              <p>your share = pot × (your weight / the side&apos;s weights)</p>
              <p>weight = 1 + {ELO.formShare} × (form − par)</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Result is 1 for a win, ½ for a draw, 0 for a defeat. Form is read
              before kick-off, never from the result — a share that knew how the
              night went would quietly drag everyone towards the middle.
            </p>
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
