"use client";

import { Eye } from "lucide-react";
import { useTeam } from "@/contexts/TeamContext";

/**
 * Says you are looking round rather than at your own squad.
 *
 * Without it the demo team is indistinguishable from a real one until you try
 * to change something, which is a poor way to find out. Nothing here enforces
 * anything — the database refuses every write to this team regardless — it
 * just explains why the buttons are missing.
 */
export default function DemoBanner() {
  const { currentTeam, userTeams } = useTeam();

  if (!currentTeam?.is_demo) return null;

  const hasOwnTeam = userTeams.some((team) => !team.is_demo);

  return (
    <div className="border-b border-accent/30 bg-accent/10">
      <p className="page-container flex flex-wrap items-center gap-x-2 gap-y-1 py-2.5 text-sm">
        <Eye className="h-4 w-4 shrink-0 text-accent" aria-hidden />
        <span className="font-medium">You&apos;re looking at the demo team.</span>
        <span className="text-muted-foreground">
          Real results from a made-up Tuesday league, so you can see how it all
          works. Nothing here can be changed.
          {!hasOwnTeam && " Create your own team when you're ready."}
        </span>
      </p>
    </div>
  );
}
