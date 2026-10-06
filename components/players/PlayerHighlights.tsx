"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Flame, Handshake, ShieldCheck, Skull, Users, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { XW } from "@/lib/config";
import { pointsPerGame, ppg } from "@/lib/measure";
import type { Highlights } from "@/lib/player-highlights";
import type { PointValues } from "@/lib/season-positions";
import { cn } from "@/lib/utils";
import type { Player } from "@/types";

function Tile({
  icon: Icon,
  label,
  href,
  tone = "accent",
  children,
}: {
  icon: LucideIcon;
  label: string;
  href?: string;
  tone?: "accent" | "win" | "loss" | "draw";
  children: React.ReactNode;
}) {
  const body = (
    <>
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon
          className={cn("h-3.5 w-3.5", {
            accent: "text-accent",
            win: "text-win",
            loss: "text-loss",
            draw: "text-draw",
          }[tone])}
        />
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </>
  );
  const box = "block rounded-xl border border-border bg-surface p-3 transition-colors";
  return href ? (
    <Link href={href} className={cn(box, "focus-ring hover:border-border-strong")}>
      {body}
    </Link>
  ) : (
    <div className={box}>{body}</div>
  );
}

function Person({ player, line }: { player: Player | undefined; line: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <PlayerAvatar name={player?.name ?? "?"} image={player?.image} size="xs" />
        <p className="min-w-0 break-words font-semibold leading-tight">{player?.name ?? "Unknown"}</p>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground tabular">{line}</p>
    </div>
  );
}

/**
 * The handful of things anybody wants to know about a player's run, as tiles
 * to glance across: who they are best beside, who has their number, their
 * longest runs and the win nobody saw coming. Each opens the page that tells
 * the rest of it.
 */
export default function PlayerHighlights({
  playerId,
  highlights,
  values,
  playerFor,
}: {
  playerId: string;
  highlights: Highlights;
  values: PointValues | null;
  playerFor: (id: string) => Player | undefined;
}) {
  const { partner, nemesis, regular, upset, winRun, unbeatenRun } = highlights;
  const perGame = (ledger: Highlights["record"]) =>
    values ? `${ppg(pointsPerGame(ledger, values))} pts a game` : `${ledger.wins}W ${ledger.draws}D ${ledger.losses}L`;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <Tile icon={Handshake} label="Best beside" tone="win" href={partner ? `/lineups?p=${playerId},${partner.playerId}` : undefined}>
        {partner ? (
          <Person
            player={playerFor(partner.playerId)}
            line={`${perGame(partner.ledger)} · ${partner.ledger.played} games`}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Nobody yet over {XW.minGames} games together.</p>
        )}
      </Tile>
      <Tile icon={Skull} label="Has their number" tone="loss" href={nemesis ? `/compare?a=${playerId}&b=${nemesis.playerId}` : undefined}>
        {nemesis ? (
          <Person
            player={playerFor(nemesis.playerId)}
            line={`${perGame(nemesis.ledger)} · ${nemesis.ledger.played} meetings`}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Nobody stands out.</p>
        )}
      </Tile>
      <Tile icon={Users} label="Most often beside" href={regular ? `/lineups?p=${playerId},${regular.playerId}` : undefined}>
        {regular ? (
          <Person
            player={playerFor(regular.playerId)}
            line={`${regular.played} games · ${regular.wins} won`}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Nobody yet.</p>
        )}
      </Tile>
      <Tile icon={Flame} label="Longest winning run" tone="win">
        <p className="scoreboard text-3xl leading-none">{winRun}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {winRun === 1 ? "win" : "wins in a row"}
        </p>
      </Tile>
      <Tile icon={ShieldCheck} label="Longest unbeaten" tone="draw">
        <p className="scoreboard text-3xl leading-none">{unbeatenRun}</p>
        <p className="mt-1 text-xs text-muted-foreground">games without losing</p>
      </Tile>
      <Tile icon={Zap} label="Biggest upset" tone="accent" href={upset ? `/matches/${upset.matchId}` : undefined}>
        {upset ? (
          <>
            <p className="scoreboard text-3xl leading-none">{Math.round(upset.chance * 100)}%</p>
            <p className="mt-1 text-xs text-muted-foreground">
              chance, and won · {format(parseISO(upset.date), "d MMM yy")}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Never won as the underdog.</p>
        )}
      </Tile>
    </div>
  );
}
