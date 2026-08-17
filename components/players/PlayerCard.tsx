import Link from "next/link";
import React from "react";

import { Player, PlayerFormResult, PlayerRecord, SeasonPlayerStats } from "@/types";
import { Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PlayerFormDisplay from "@/components/players/PlayerFormDisplay";
import { usePlayerRank } from "@/hooks/usePlayerRank";
import { usePermission } from "@/lib/permission-utils";
import { winRate } from "@/lib/player-stats";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import TransitionLink from "@/components/TransitionLink";
import { isActivePlayer } from "@/components/players/ActiveFilter";
import { displayRating, type PlayerRating } from "@/lib/elo";
import { SKILL } from "@/lib/config";
import SkillScale from "@/components/players/SkillScale";
import PlayerSeasonStars from "@/components/players/PlayerSeasonStars";

/**
 * Where a rating sits in the squad, nought to one, coloured warm at the top and
 * cool at the bottom.
 *
 * Against the squad rather than against a fixed number, because Elo has no
 * absolute meaning — 1250 is strong in one group and ordinary in another. Five
 * steps rather than a gradient so the colour is a category you can name, and
 * `undefined` where there is nothing to compare against.
 */
function ratingTone(standing: number | undefined): string {
  if (standing === undefined) return "";
  if (standing >= 0.8) return "text-win";
  if (standing >= 0.6) return "text-accent";
  if (standing >= 0.4) return "text-foreground";
  if (standing >= 0.2) return "text-draw";
  return "text-loss";
}

interface PlayerCardProps {
  player: Player;
  seasonId: string | null;
  /** This season's figures, when a season is selected. */
  seasonStats: SeasonPlayerStats | undefined;
  /** All-time, from the same view every other surface reads. */
  record: PlayerRecord;
  /** Worked out once for the whole grid, not per card. */
  rating: PlayerRating | undefined;
  /** Where that rating sits in the squad, nought to one. */
  standing: number | undefined;
  formResults: PlayerFormResult[];
  isLoadingForms: boolean;
  onDeleteClick: (player: Player) => void;
}

function Tally({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "win" | "draw" | "loss";
}) {
  const colour =
    tone === "win"
      ? "text-win"
      : tone === "draw"
        ? "text-draw"
        : tone === "loss"
          ? "text-loss"
          : "text-foreground";
  return (
    <div className="flex flex-col items-center">
      <span className={`text-base font-semibold tabular-nums ${colour}`}>{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  seasonId,
  seasonStats,
  record,
  rating,
  standing,
  formResults,
  isLoadingForms,
  onDeleteClick,
}) => {
  const { rank, hasPlayedCurrentSeason } = usePlayerRank(seasonId, player.id);
  const { canManage, ready } = usePermission();
  const editable = ready && canManage();

  // The season is the headline when one is selected, because that is what the
  // table on every other page is showing. All-time sits underneath it as
  // context rather than as a competing set of figures.
  const headline = seasonId && seasonStats ? seasonStats : record;
  const headlineLabel = seasonId && seasonStats ? "This season" : "All time";

  return (
    <Card className="player-card relative overflow-hidden bg-surface border-border">
      {/* Outside the link: a button nested in an anchor is invalid, and the
          whole card being the link is what makes a player reachable from
          anywhere they are named. Hidden for anyone who cannot act on them —
          a viewer, or anybody looking round the demo team. */}
      <div className={`absolute right-2 top-2 z-10 flex gap-1 ${editable ? "" : "hidden"}`}>
        <Link
          href={`/players/edit/${player.id}`}
          aria-label={`Edit ${player.name}`}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <Edit className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={() => onDeleteClick(player)}
          aria-label={`Delete ${player.name}`}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-loss/15 hover:text-loss"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <TransitionLink
        href={`/players/${player.id}`}
        className="block focus:outline-none"
        shareAvatar
      >
        <CardContent className="flex h-full flex-col p-0">
          <div className="flex items-center gap-4 p-5 pr-20">
            <PlayerAvatar name={player.name} image={player.image} size="lg" />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-lg font-medium">{player.name}</h3>
                {/* Seasons won, which the detail page and both season screens
                    already show and this one did not — a title is the first
                    thing anybody would want on a card, and the component
                    draws nothing for the many who have none. */}
                <PlayerSeasonStars playerId={player.id} size="sm" />
                {seasonId && hasPlayedCurrentSeason && rank && (
                  <Badge className="bg-surface-2 text-foreground">#{rank}</Badge>
                )}
                {/* Only the exception is marked. Active is the norm, and
                    stamping thirty cards with it says nothing. */}
                {!isActivePlayer(player) && (
                  <Badge variant="outline" className="shrink-0 text-muted-foreground">
                    Inactive
                  </Badge>
                )}
              </div>

              <p className="mt-0.5 text-sm text-muted-foreground">
                {record.played > 0
                  ? `${record.wins} of ${record.played} all time · ${Math.round(winRate(record) * 100)}%`
                  : "Yet to play"}
              </p>

              {/* Form is the point of a squad list — who is going well right
                  now. Hidden entirely when there is none rather than printing
                  "no match data" across every card. */}
              {(formResults.length > 0 || isLoadingForms) && (
                <div className="mt-2">
                  <PlayerFormDisplay
                    results={formResults}
                    size="sm"
                    isLoading={isLoadingForms && formResults.length === 0}
                  />
                </div>
              )}
            </div>
          </div>

          {/* The two ways a player is measured that the tally below does not
              show: what the results imply, and what a person decided. */}
          <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-2.5 text-sm">
            <span className="flex items-baseline gap-1.5">
              <span className="eyebrow">Elo</span>
              {rating ? (
                <>
                  <span className={`tabular font-semibold ${ratingTone(standing)}`}>
                    {displayRating(rating.rating)}
                  </span>
                  {rating.unsettled && (
                    <span className="text-xs text-muted-foreground">rough</span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </span>

            <span className="flex items-center gap-1.5">
              <span className="eyebrow">Skill</span>
              <SkillScale level={player.skillLevel ?? SKILL.default} />
            </span>
          </div>

          <div className="mt-auto border-t border-border bg-surface-2/40 px-5 py-3">
            <p className="eyebrow mb-2">{headlineLabel}</p>
            <div className="grid grid-cols-5">
              <Tally label="P" value={headline.played} />
              <Tally label="W" value={headline.wins} tone="win" />
              <Tally label="D" value={headline.draws} tone="draw" />
              <Tally label="L" value={headline.losses} tone="loss" />
              <Tally label="Pts" value={headline.points} />
            </div>
          </div>
        </CardContent>
      </TransitionLink>
    </Card>
  );
};

export default PlayerCard;
