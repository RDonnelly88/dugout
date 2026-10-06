"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle } from "lucide-react";
import { getMatches } from "@/lib/db";
import { useTeam } from "@/contexts/TeamContext";
import { useSideNames } from "@/hooks/useSideNames";
import { ELO, XW } from "@/lib/config";
import { displayRating } from "@/lib/elo";
import { workedExample, fadeCurve } from "@/lib/ratings-guide";
import { Frac, Line, Sup, Var, Working } from "@/components/ratings/Formula";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { Button } from "@/components/ui/button";
import SidePanel from "@/components/ui/side-panel";
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
    () => workedExample(matches, sides),
    [matches, sides]
  );

  const fade = fadeCurve();

  return (
    <SidePanel
      open={open}
      onOpenChange={setOpen}
      title="How the table is worked out"
      description={
        <>
          Everyone starts on {ELO.start}. Beat a side rated above you and it
          says more about you than beating one below. Recent matches count most,
          and old ones stop counting altogether. A win is a win — a thrashing
          counts the same as a scrape.
        </>
      }
      trigger={
        <Button variant="outline" size="sm">
          <HelpCircle className="mr-2 h-4 w-4" />
          How it works
        </Button>
      }
    >
      <div className="space-y-6">
        <Section title="Every match, in three steps">
          <div className="space-y-4">
            <Step n={1} title="Each side is averaged">
              A team is worth the average of the players in it. Nothing else
              goes in — not the score, not who is in goal.
            </Step>
            <Step n={2} title="Games are weighed by age">
              Only the squad&apos;s last {ELO.window} matches count. The
              newest counts in full, one {ELO.halfLife} matches back counts
              half, and anything older does not count at all.
            </Step>
            <Step n={3} title="The result is settled, once">
              The two averages give each side a chance of winning, and
              everybody on a side moves by {ELO.k} times the gap between that
              chance and what they took: a win you were given 30% for is worth{" "}
              {Math.round(ELO.k * 0.7)} points, one you were given 70% for is
              worth {Math.round(ELO.k * 0.3)}. That amount is fixed on the
              night. Nothing that happens later changes what a game was worth;
              it only counts for less as it ages.
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
                {example.drawn ? "They drew" : "They won"}, and that result was
                settled there and then. For{" "}
                {example.winner.name}:
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
                      <span className="text-xs text-muted-foreground tabular">
                        {p.counted === 0
                          ? "debut"
                          : `${p.counted} ${p.counted === 1 ? "game" : "games"} behind it`}
                      </span>
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
                Everybody on {example.winner.name} took the same{" "}
                <span className="tabular">
                  {signed(ELO.k * ((example.drawn ? 0.5 : 1) - example.expected))}
                </span>{" "}
                for the result itself. The rest of each number is their older
                games each counting a match less, which is why it differs from
                one player to the next.
              </p>
            </div>
          </Section>
        )}

        <Section title="Old games fade">
          {/* The weights themselves, newest on the left, so the shape of the
              fade is seen rather than taken on trust. Hidden from a screen
              reader, which gets the same thing in the paragraph below. */}
          <div className="flex h-16 items-end gap-px" aria-hidden>
            {fade.map(({ age, weight }) => (
              <span
                key={age}
                className="flex-1 rounded-t-sm bg-accent/70"
                style={{ height: `${weight * 100}%` }}
              />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>The latest match</span>
            <span>{ELO.window} matches back</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            The newest match counts in full, one {ELO.halfLife} matches back
            counts half, and nothing older than {ELO.window} counts at all.
            It is counted in the squad&apos;s matches, whether you played in
            them or not, so a game ages at the same rate for everybody. Miss a
            few weeks and your last games are that much older when you come
            back; miss {ELO.window} and there is nothing left to rate you on,
            so you are back on {ELO.start} until you play again. A winter when
            nobody plays ages nothing.
          </p>
        </Section>

        <Section title="Straight answers">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium">
                Does a higher rating mean I will win?
              </dt>
              <dd className="mt-0.5 text-muted-foreground">
                Not really. Sides get picked to be even, so most nights are
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
                No. You start on {ELO.start} and your games count exactly as
                anybody else&apos;s do. The number is marked as a rough guess
                until {ELO.settledAfter} games are behind it, because a handful
                of results says little about anybody.
              </dd>
            </div>
            <div>
              <dt className="font-medium">
                Why did my number move when I didn&apos;t play?
              </dt>
              <dd className="mt-0.5 text-muted-foreground">
                Nothing is given or taken away for missing a game, and no game
                is ever re-judged. But every match the squad plays makes your
                games a match older, so each counts for a little less and your
                rating eases back towards {ELO.start} — up if you are below it,
                down if you are above. The rating card says &ldquo;while
                away&rdquo; beside a change like that.
              </dd>
            </div>
            <div>
              <dt className="font-medium">Is the rating the same as the league table?</dt>
              <dd className="mt-0.5 text-muted-foreground">
                No. The table is points from this season&apos;s results, and
                that decides the champion. The rating is how good the results
                say you are, over the squad&apos;s last {ELO.window} matches
                whichever season they fell in, and it is what evens up the
                sides.
              </dd>
            </div>
          </dl>
        </Section>

        <Section title="Records first, the odds a tap away">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Wherever players are measured together — your chemistry, the
              line-up lab, the squad web, a season wrapped — the first answer
              is the record: won, drawn and lost, and points a game, set against
              what you average anyway. That is the question most people are
              asking.
            </p>
            <p>
              Behind the{" "}
              <span className="font-medium text-foreground">Against the odds</span>{" "}
              switch is the same set of games measured another way. Before every
              kick-off the ratings give each side a chance of winning; added up,
              those chances are{" "}
              <span className="font-medium text-foreground">expected wins</span>,
              or xW. A side given 40% that wins has beaten the odds by 0.6 of a
              win, with a draw counting half. Because the odds already allow for
              everybody else on the pitch, beating your xW means you did better
              than the sides you were in should have — not just that you were
              picked into good ones.
            </p>
            <p>
              Luck moves the gap too, so every xW comes with a band showing how
              far luck alone could take it, and a verdict in words: too early to
              say under {XW.minGames} games, could be luck inside the band,
              better or worse than luck outside it. On a record, anything on
              fewer than {XW.minGames} games together is listed last and left
              uncoloured, so one good night cannot pass for a partnership.
            </p>
          </div>
        </Section>

        <Section title="The actual sums">
          <Working>
            <Line name="expected">
              <Frac
                over={<>1</>}
                under={
                  <>
                    1 <span className="mx-1 text-muted-foreground">+</span> 10
                    <Sup>
                      <Frac
                        over={
                          <>
                            <Var>them</Var>
                            <span className="mx-1 text-muted-foreground">−</span>
                            <Var>us</Var>
                          </>
                        }
                        under={<>400</>}
                      />
                    </Sup>
                  </>
                }
              />
            </Line>

            <Line name="weight">
              <span>½</span>
              <Sup>
                <Frac over={<Var>matches since</Var>} under={<>{ELO.halfLife}</>} />
              </Sup>
              <span className="ml-2 text-xs text-muted-foreground">
                for the last {ELO.window} matches, then 0
              </span>
            </Line>

            <Line name="change">
              <span>{ELO.k}</span>
              <span className="mx-1 text-muted-foreground">×</span>
              <span>(</span>
              <Var>result</Var>
              <span className="mx-1 text-muted-foreground">−</span>
              <Var>expected</Var>
              <span>)</span>
              <span className="ml-2 text-xs text-muted-foreground">fixed on the night</span>
            </Line>

            <Line name="rating">
              <span>{ELO.start}</span>
              <span className="mx-1 text-muted-foreground">+</span>
              <span className="text-sm">
                every <Var>change</Var> × its <Var>weight</Var> now
              </span>
            </Line>
          </Working>

          <p className="mt-2 text-xs text-muted-foreground">
            Result is 1 for a win, ½ for a draw, 0 for a defeat, and the same
            for everybody on the side. The most one game can move anybody is{" "}
            {ELO.k} points, and only for a result nobody saw coming.
          </p>
        </Section>
      </div>
    </SidePanel>
  );
}
