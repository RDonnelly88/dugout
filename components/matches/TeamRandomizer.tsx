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
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { splitTeams, type Split } from "@/lib/team-balance";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import { recentForm } from "@/lib/form";
import { getMatches } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { useTeam } from "@/contexts/TeamContext";
import { ELO, SKILL } from "@/lib/config";

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
  const { currentTeam } = useTeam();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [method, setMethod] = useState<PickMethod>("random");
  const [dealing, setDealing] = useState(false);

  const { ratingFor } = usePlayerRatings();
  const { data: matches = [] } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });
  const form = useMemo(() => recentForm(matches), [matches]);

  // Active players only, matching what the list shows by default. Selecting
  // everyone meant retired players were picked, hidden, and quietly dealt into
  // the teams — the button read "23 playing" above a list showing twelve.
  useEffect(() => {
    setSelectedPlayers(
      players.filter((p) => p.isActive !== false).map((p) => p.id)
    );
  }, [players]);

  useEffect(() => {
    onSelectionChange?.(selectedPlayers);
  }, [selectedPlayers, onSelectionChange]);

  const availablePlayers = players.filter((p) => selectedPlayers.includes(p.id));
  const canRandomize = availablePlayers.length >= 2;

  // Each in its own unit. They used to be scaled onto a common range to make
  // the gap readouts comparable, which they are not — the readout names its
  // unit instead, and the search only ever compares within one method.
  const weightFor = useMemo(
    () => ({
      random: () => 0,
      rating: (p: Player) => ratingFor(p.id)?.rating ?? ELO.start,
      form: (p: Player) => form.get(p.id)?.pointsPerGame ?? 1,
      skill: (p: Player) => p.skillLevel ?? SKILL.default,
    }),
    [ratingFor, form]
  );

  // Everyone starts on the middle level, so until somebody sets them the skill
  // split is dead even and looks broken rather than untouched.
  const skillNote = useMemo(() => {
    if (availablePlayers.length < 2) return undefined;
    const levels = new Set(availablePlayers.map((p) => p.skillLevel ?? SKILL.default));
    return levels.size === 1
      ? `Everyone here is on ${[...levels][0]} — set levels on the player pages.`
      : undefined;
  }, [availablePlayers]);

  const preview = useMemo(
    () =>
      ({
        random: null,
        manual: null,
        rating: canRandomize
          ? splitTeams(availablePlayers, "rating", weightFor.rating)
          : null,
        form: canRandomize
          ? splitTeams(availablePlayers, "form", weightFor.form)
          : null,
        skill: canRandomize
          ? splitTeams(availablePlayers, "skill", weightFor.skill)
          : null,
      }) as Record<PickMethod, Split<Player> | null>,
    [availablePlayers, canRandomize, weightFor]
  );

  // Recomputed when the dialog opens rather than held in state: a shuffle
  // should be a different answer each time it is asked.
  const [dealt, setDealt] = useState<Split<Player> | null>(null);

  const startDealing = () => {
    if (!canRandomize) return;
    // Manual opens on a shuffle, so there is something to adjust rather than an
    // empty board.
    setDealt(
      isBalanceMethod(method)
        ? splitTeams(availablePlayers, method, weightFor[method])
        : splitTeams(availablePlayers, "random", weightFor.random)
    );
    setDealing(true);
  };

  const finish = (teamA: Player[], teamB: Player[]) => {
    setDealing(false);
    onRandomize(teamA, teamB);
  };

  const togglePlayerSelection = (playerId: string) =>
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );

  return (
    <div className="space-y-5">
      <section>
        <h3 className="eyebrow mb-2">1 · Who&apos;s playing</h3>
        <PlayerSelection
          players={players}
          selectedPlayers={selectedPlayers}
          togglePlayerSelection={togglePlayerSelection}
          disabled={dealing || disabled}
        />
      </section>

      <section>
        <h3 className="eyebrow mb-2">2 · How to split them</h3>
        <MethodPicker
          value={method}
          onChange={setMethod}
          preview={preview}
          notes={{ skill: skillNote }}
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
                  start={dealt}
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
