"use client";

import { useMemo } from "react";
import { Shield, Users } from "lucide-react";
import { Player } from "@/types";
import Formation from "./team-randomizer/Formation";
import PlayerAvatar from "@/components/players/PlayerAvatar";

interface TeamSelectionProps {
  teamA: string[];
  teamB: string[];
  players: Player[];
  selectedPlayers: string[];
  togglePlayer: (team: "A" | "B", playerId: string) => void;
}

/**
 * The sides once they have been picked, and whoever is left over.
 *
 * This used to carry a second full player picker — search, active filter,
 * stat cards, the lot — sitting directly under the randomiser's own picker,
 * asking the same question twice. Choosing the sides by hand is now one of the
 * randomiser's methods, so all this has to do is show the answer and let you
 * put a straggler on a side.
 */
const TeamSelection = ({
  teamA,
  teamB,
  players,
  selectedPlayers,
  togglePlayer,
}: TeamSelectionProps) => {
  const teamAPlayers = useMemo(
    () => players.filter((player) => teamA.includes(player.id)),
    [players, teamA]
  );
  const teamBPlayers = useMemo(
    () => players.filter((player) => teamB.includes(player.id)),
    [players, teamB]
  );

  // Picked to play, but on neither side — usually because they were taken off
  // one. Shown so that removing somebody is undoable.
  const bench = useMemo(
    () =>
      players
        .filter(
          (player) =>
            selectedPlayers.includes(player.id) &&
            !teamA.includes(player.id) &&
            !teamB.includes(player.id)
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [players, selectedPlayers, teamA, teamB]
  );

  return (
    <div className="space-y-6">
      <section>
        <h3 className="eyebrow mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-accent" />
          Team formations
        </h3>

        <Formation
          teamA={teamAPlayers}
          teamB={teamBPlayers}
          teamSize={Math.max(teamAPlayers.length, teamBPlayers.length).toString()}
          onRemovePlayer={togglePlayer}
        />
      </section>

      {bench.length > 0 && (
        <section>
          <h3 className="eyebrow mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" />
            Not on a side yet
          </h3>
          <ul className="flex flex-wrap gap-2">
            {bench.map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  onClick={() =>
                    togglePlayer(teamA.length <= teamB.length ? "A" : "B", player.id)
                  }
                  className="focus-ring tap flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 text-sm transition-colors hover:border-accent"
                >
                  <PlayerAvatar name={player.name} image={player.image} size="xs" />
                  <span className="truncate">{player.name}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Tap to add to whichever side is short.
          </p>
        </section>
      )}
    </div>
  );
};

export default TeamSelection;
