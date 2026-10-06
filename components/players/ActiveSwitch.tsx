"use client";

import { Switch } from "@/components/ui/switch";
import { usePermission } from "@/lib/permission-utils";
import { useSetActive } from "@/hooks/useSetActive";
import { cn } from "@/lib/utils";
import type { Player } from "@/types";

/**
 * Active or not, in one tap, wherever a player is listed.
 *
 * Only for somebody who can change players; everybody else sees the
 * "Inactive" badge and nothing to press. `onChange` tells the page holding it,
 * so the team picker can pick or drop the player to match.
 */
export default function ActiveSwitch({
  player,
  onChange,
  label = false,
  className,
}: {
  player: Player;
  onChange?: (active: boolean) => void;
  /** "Active" written beside the switch, where there is room for it. */
  label?: boolean;
  className?: string;
}) {
  const { canManage, ready } = usePermission();
  const setActive = useSetActive();
  if (!ready || !canManage()) return null;

  const active = player.isActive !== false;
  return (
    <label
      className={cn("flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground", className)}
      title={active ? `${player.name} is active` : `${player.name} is inactive`}
    >
      {label && <span>Active</span>}
      <Switch
        size="sm"
        checked={active}
        onCheckedChange={(next) => {
          setActive.mutate({ id: player.id, active: next });
          onChange?.(next);
        }}
        aria-label={`${player.name} is active`}
      />
    </label>
  );
}
