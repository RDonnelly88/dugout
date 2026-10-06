"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Plus, Search, Settings2 } from "lucide-react";
import { getPlayers, deletePlayer, getCurrentSeason, getSeasonPlayerStats } from "@/lib/db";
import { Player } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DeletePlayerDialog from "@/components/players/DeletePlayerDialog";
import SquadList from "@/components/players/SquadList";
import ActiveFilter, { isActivePlayer, type ActiveScope } from "@/components/players/ActiveFilter";
import PlayerSort from "@/components/players/PlayerSort";
import { useTeam } from "@/contexts/TeamContext";
import { usePermission } from "@/lib/permission-utils";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import type { PlayerSort as PlayerSortValue } from "@/lib/player-order";

const Players = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [scope, setScope] = useState<ActiveScope>("active");
  const [sort, setSort] = useState<PlayerSortValue>("rank");
  const [managing, setManaging] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTeam } = useTeam();
  const { canManage, ready } = usePermission();
  const editable = ready && canManage();

  const { data: players = [], isLoading: isLoadingPlayers } = useQuery({
    queryKey: ["players", currentTeam?.id],
    queryFn: getPlayers,
    enabled: !!currentTeam,
  });

  const { data: currentSeason } = useQuery({
    queryKey: ["currentSeason", currentTeam?.id],
    queryFn: getCurrentSeason,
  });

  const { data: seasonPlayerStats = [] } = useQuery({
    queryKey: ["seasonPlayerStats", currentSeason?.id],
    queryFn: () => (currentSeason ? getSeasonPlayerStats(currentSeason.id) : Promise.resolve([])),
    enabled: !!currentSeason,
    staleTime: 60000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast({
        title: "Player deleted",
        description: "The player has been removed successfully.",
      });
      setPlayerToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the player. Please try again.",
        variant: "destructive",
      });
    },
  });

  const active = players.filter(isActivePlayer).length;

  return (
    <div className="page-container animate-slide-up">
      <PageHeader
        title="Squad"
        subtitle={`${active} playing${players.length > active ? ` · ${players.length - active} not at the moment` : ""}`}
        actions={
          // Offering an action that the database will refuse is worse than
          // not offering it: a viewer, or anybody looking round the demo
          // team, sees neither.
          editable && (
            <>
              <Button
                variant={managing ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  // Everybody while managing: the people to switch back on
                  // are the ones the active view hides.
                  if (!managing) setScope("all");
                  setManaging(!managing);
                }}
                aria-pressed={managing}
              >
                {managing ? <Check className="mr-1.5 h-4 w-4" /> : <Settings2 className="mr-1.5 h-4 w-4" />}
                {managing ? "Done" : "Manage"}
              </Button>
              <Button size="sm" asChild>
                <Link href="/players/add">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add player
                </Link>
              </Button>
            </>
          )
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-full sm:basis-60">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Find a player"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-full bg-surface pl-9"
            aria-label="Find a player"
          />
        </div>
        <ActiveFilter
          value={scope}
          onChange={setScope}
          counts={{ active, all: players.length }}
        />
        <PlayerSort value={sort} onChange={setSort} />
      </div>

      {managing && (
        <p className="mb-3 rounded-lg bg-accent/10 px-3 py-2 text-sm text-muted-foreground">
          Switch somebody off when they stop turning up: they leave the team
          picker and the table&apos;s active view, and keep every result.
        </p>
      )}

      {isLoadingPlayers ? (
        <PageLoading rows={6} label="Loading the squad" />
      ) : (
        <SquadList
          players={players}
          seasonStats={seasonPlayerStats}
          searchTerm={searchTerm}
          scope={scope}
          sort={sort}
          managing={managing}
          onDeleteClick={setPlayerToDelete}
        />
      )}

      <DeletePlayerDialog
        isOpen={!!playerToDelete}
        onOpenChange={(open) => !open && setPlayerToDelete(null)}
        onConfirm={() => playerToDelete && deleteMutation.mutate(playerToDelete.id)}
      />
    </div>
  );
};

export default Players;
