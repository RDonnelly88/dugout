"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import type { Player } from "@/types";

/**
 * Five is the most the chart will draw at once, because beyond that it is a
 * plate of spaghetti and the colours run out. Choosing which five is the
 * point of this — the top of the table is a reasonable guess and rarely the
 * comparison anybody actually wants.
 */
export const MAX_LINES = 5;

export default function ChartPlayerPicker({
  players,
  charted,
  onChange,
}: {
  /** Everyone who could be drawn, in the order the table has them. */
  players: Player[];
  /** Who is drawn now, by id. */
  charted: string[];
  onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const byId = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players]
  );

  const matching = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return needle
      ? players.filter((player) => player.name.toLowerCase().includes(needle))
      : players;
  }, [players, search]);

  const full = charted.length >= MAX_LINES;

  const toggle = (id: string) => {
    if (charted.includes(id)) {
      onChange(charted.filter((other) => other !== id));
      return;
    }
    if (full) return;
    onChange([...charted, id]);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {charted.map((id) => {
        const player = byId.get(id);
        if (!player) return null;
        return (
          <span
            key={id}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 py-0.5 pl-1 pr-1.5 text-xs"
          >
            <PlayerAvatar name={player.name} image={player.image} size="xs" />
            <span className="max-w-[8rem] truncate">{player.name}</span>
            <button
              type="button"
              onClick={() => toggle(id)}
              aria-label={`Take ${player.name} off the chart`}
              className="focus-ring rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search the squad"
            className="mb-2 h-8"
          />
          {full && (
            <p className="mb-2 px-1 text-xs text-muted-foreground">
              Five at a time. Take somebody off to add another.
            </p>
          )}
          <ul className="max-h-56 space-y-0.5 overflow-y-auto">
            {matching.map((player) => {
              const on = charted.includes(player.id);
              return (
                <li key={player.id}>
                  <label
                    className={`flex items-center gap-2 rounded-md p-1.5 text-sm ${
                      !on && full
                        ? "opacity-40"
                        : "cursor-pointer hover:bg-surface-2"
                    }`}
                  >
                    <Checkbox
                      checked={on}
                      disabled={!on && full}
                      onCheckedChange={() => toggle(player.id)}
                    />
                    <PlayerAvatar
                      name={player.name}
                      image={player.image}
                      size="xs"
                    />
                    <span className="min-w-0 flex-1 truncate">{player.name}</span>
                  </label>
                </li>
              );
            })}
            {matching.length === 0 && (
              <li className="p-2 text-center text-xs text-muted-foreground">
                Nobody by that name
              </li>
            )}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
}
