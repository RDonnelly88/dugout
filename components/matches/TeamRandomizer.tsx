"use client";

import { useEffect, useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Player } from "@/types";
import PlayerSelection from "./team-randomizer/PlayerSelection";
import MethodPicker from "./team-randomizer/MethodPicker";
import CardPackRandomizer from "./team-randomizer/CardPackRandomizer";
import ManualPicker from "./team-randomizer/ManualPicker";
import { isBalanceMethod, type PickMethod } from "./team-randomizer/pick-method";
import { keepSelection } from "@/lib/player-selection";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import {
  alternateSplit,
  leagueOrder,
  splitTeams,
  type Split,
} from "@/lib/team-balance";
import { getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import { useTeam } from "@/contexts/TeamContext";
import { ELO } from "@/lib/config";

interface TeamRandomizerProps {
  players: Player[];
  /** The two sides, already decided. Not a flat list to be split again. */
  onRandomize: (teamA: Player[], teamB: Player[]) => void;
  onSelectionChange?: (selectedPlayerIds: string[]) => void;
  disabled?: boolean;
}

/**
 * Picking the sides, in two steps: who is playing, then how to split them.
 *
 * The split is decided here and handed to the reveal already made. The reveal
 * used to deal cards alternately and so decided the teams itself, which meant
 * choosing "even by rating" changed nothing at all.
 */
const TeamRandomizer = ({
  players,
  onRandomize,
  onSelectionChange,
  disabled = false,
}: TeamRandomizerProps) => {
  // Null until the squad first arrives; see `keepSelection`.
  const [picked, setPicked] = useState<string[] | null>(null);
  const selectedPlayers = useMemo(() => picked ?? [], [picked]);
  const [method, setMethod] = useState<PickMethod>("random");
  const [dealing, setDealing] = useState(false);

  const { ratingFor } = usePlayerRatings();

  // The same two queries, under the same keys, as the player list beside this,
  // so the table is fetched once for both.
  const { currentTeam } = useTeam();
  const { data: currentSeason } = useQuery({
    queryKey: ["currentSeason", currentTeam?.id],
    queryFn: getCurrentSeason,
  });
  const { data: standings = [] } = useQuery({
    queryKey: ["seasonPlayerStats", currentSeason?.id],
    queryFn: () =>
      currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([]),
    enabled: !!currentSeason,
  });

  // Active players to start with, matching what the list shows by default, and
  // the person's own picks from then on, whatever redraws the list. Selecting
  // everyone meant retired players were picked, hidden, and quietly dealt into
  // the teams — the button read "23 playing" above a list showing twelve.
  useEffect(() => {
    setPicked((previous) => keepSelection(previous, players));
  }, [players]);

  useEffect(() => {
    onSelectionChange?.(selectedPlayers);
  }, [selectedPlayers, onSelectionChange]);

  const availablePlayers = players.filter((p) => selectedPlayers.includes(p.id));
  const canRandomize = availablePlayers.length >= 2;

  const weightFor = useMemo(
    () => ({
      random: () => 0,
      rating: (p: Player) => ratingFor(p.id)?.rating ?? ELO.start,
    }),
    [ratingFor]
  );

  // Measured by rating, like "even by rating", so the two gaps can be read
  // against each other: dealing down the table is fair by position, and this
  // says how fair that turns out to be on the pitch.
  const byStanding = useMemo(
    () =>
      alternateSplit(
        leagueOrder(availablePlayers, standings, weightFor.rating),
        weightFor.rating
      ),
    [availablePlayers, standings, weightFor]
  );

  const preview = useMemo(
    () =>
      ({
        random: null,
        manual: null,
        rating: canRandomize
          ? splitTeams(availablePlayers, "rating", weightFor.rating)
          : null,
        standing: canRandomize ? byStanding : null,
      }) as Record<PickMethod, Split<Player> | null>,
    [availablePlayers, canRandomize, weightFor, byStanding]
  );

  // Recomputed when the dialog opens rather than held in state: a shuffle
  // should be a different answer each time it is asked.
  const [dealt, setDealt] = useState<Split<Player> | null>(null);

  const startDealing = () => {
    if (!canRandomize) return;
    // Still dealt for the manual picker, which opens empty and ignores it.
    setDealt(
      isBalanceMethod(method)
        ? splitTeams(availablePlayers, method, weightFor[method])
        : method === "standing"
          ? byStanding
          : splitTeams(availablePlayers, "random", weightFor.random)
    );
    setDealing(true);
  };

  const finish = (teamA: Player[], teamB: Player[]) => {
    setDealing(false);
    onRandomize(teamA, teamB);
  };

  // Somebody marked active from the list is playing; somebody marked
  // inactive is not, and drops out of the picks rather than staying picked
  // behind the filter.
  const followActive = (playerId: string, active: boolean) =>
    setPicked((prev) => {
      const list = prev ?? [];
      if (!active) return list.filter((id) => id !== playerId);
      return list.includes(playerId) ? list : [...list, playerId];
    });

  const togglePlayerSelection = (playerId: string) =>
    setPicked((prev) =>
      (prev ?? []).includes(playerId)
        ? (prev ?? []).filter((id) => id !== playerId)
        : [...(prev ?? []), playerId]
    );

  return (
    <div className="space-y-5">
      <section>
        <h3 className="eyebrow mb-2">1 · Who&apos;s playing</h3>
        <PlayerSelection
          players={players}
          selectedPlayers={selectedPlayers}
          togglePlayerSelection={togglePlayerSelection}
          onActiveChange={followActive}
          disabled={dealing || disabled}
        />
      </section>

      <section>
        <h3 className="eyebrow mb-2">2 · How to split them</h3>
        <MethodPicker
          value={method}
          onChange={setMethod}
          preview={preview}
          disabled={dealing || disabled || !canRandomize}
        />
      </section>

      <Button
        onClick={startDealing}
        disabled={disabled || !canRandomize || dealing}
        className="w-full gap-2 sm:w-auto"
      >
        <Shuffle className="h-4 w-4" />
        {method === "manual" ? "Sort them out" : "Pick the teams"}
        <span className="text-xs opacity-70">
          ({availablePlayers.length} playing)
        </span>
      </Button>

      <Dialog open={dealing} onOpenChange={(open) => !open && setDealing(false)}>
        <DialogPortal>
          <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
          <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-surface p-6 sm:max-w-[95%] md:max-w-3xl">
            {dealt &&
              (method === "manual" ? (
                <ManualPicker
                  players={availablePlayers}
                  onComplete={finish}
                  onCancel={() => setDealing(false)}
                />
              ) : (
                <CardPackRandomizer
                  split={dealt}
                  onComplete={finish}
                  onCancel={() => setDealing(false)}
                />
              ))}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

export default TeamRandomizer;
