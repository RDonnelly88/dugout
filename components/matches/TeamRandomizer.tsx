"use client";

import { useEffect, useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Player } from "@/types";
import PlayerSelection from "./team-randomizer/PlayerSelection";
import MethodPicker from "./team-randomizer/MethodPicker";
import CardPackRandomizer from "./team-randomizer/CardPackRandomizer";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { splitTeams, type BalanceMethod, type Split } from "@/lib/team-balance";
import { usePlayerRatings } from "@/hooks/usePlayerRatings";
import { recentForm } from "@/lib/form";
import { getMatches } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";
import { useTeam } from "@/contexts/TeamContext";
import { ELO } from "@/lib/config";

interface TeamRandomizerProps {
  players: Player[];
  onRandomize: (players: Player[], teamSize: number) => void;
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
  const [method, setMethod] = useState<BalanceMethod>("random");
  const [dealing, setDealing] = useState(false);

  const { ratingFor } = usePlayerRatings();
  const { data: matches = [] } = useQuery({
    queryKey: ["matches", currentTeam?.id],
    queryFn: getMatches,
    enabled: !!currentTeam,
  });
  const form = useMemo(() => recentForm(matches), [matches]);

  useEffect(() => {
    setSelectedPlayers(players.map((p) => p.id));
  }, [players]);

  useEffect(() => {
    onSelectionChange?.(selectedPlayers);
  }, [selectedPlayers, onSelectionChange]);

  const availablePlayers = players.filter((p) => selectedPlayers.includes(p.id));
  const canRandomize = availablePlayers.length >= 2;

  // Scaled to sit in the same range as a rating, so the gap readout under each
  // option means something comparable whichever is chosen.
  const weightFor = useMemo(
    () => ({
      random: () => 0,
      rating: (p: Player) => ratingFor(p.id)?.rating ?? ELO.start,
      form: (p: Player) => (form.get(p.id)?.pointsPerGame ?? 1) * 100,
    }),
    [ratingFor, form]
  );

  const preview = useMemo(
    () =>
      ({
        random: null,
        rating: canRandomize
          ? splitTeams(availablePlayers, "rating", weightFor.rating)
          : null,
        form: canRandomize
          ? splitTeams(availablePlayers, "form", weightFor.form)
          : null,
      }) as Record<BalanceMethod, Split<Player> | null>,
    [availablePlayers, canRandomize, weightFor]
  );

  // Recomputed when the dialog opens rather than held in state: a shuffle
  // should be a different answer each time it is asked.
  const [dealt, setDealt] = useState<Split<Player> | null>(null);

  const startDealing = () => {
    if (!canRandomize) return;
    setDealt(splitTeams(availablePlayers, method, weightFor[method]));
    setDealing(true);
  };

  const finish = (teamA: Player[], teamB: Player[]) => {
    setDealing(false);
    onRandomize([...teamA, ...teamB], teamA.length);
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
          disabled={dealing || disabled || !canRandomize}
        />
      </section>

      <Button
        onClick={startDealing}
        disabled={disabled || !canRandomize || dealing}
        className="w-full gap-2 sm:w-auto"
      >
        <Shuffle className="h-4 w-4" />
        Pick the teams
        <span className="text-xs opacity-70">
          ({availablePlayers.length} playing)
        </span>
      </Button>

      <Dialog open={dealing} onOpenChange={(open) => !open && setDealing(false)}>
        <DialogPortal>
          <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
          <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-surface p-6 sm:max-w-[95%] md:max-w-3xl">
            {dealt && (
              <CardPackRandomizer
                split={dealt}
                onComplete={finish}
                onCancel={() => setDealing(false)}
              />
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
};

export default TeamRandomizer;
