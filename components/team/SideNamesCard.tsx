"use client";

import { useEffect, useState } from "react";
import { Shirt } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTeam } from "@/contexts/TeamContext";
import { usePermission } from "@/lib/permission-utils";
import { SIDE_NAMES } from "@/lib/config";

const MAX = 30;

/**
 * What this team calls its two sides.
 *
 * Every five-a-side has its own word for it, and getting it wrong is the sort
 * of thing that grates every week. Bibs and No bibs are only the defaults.
 */
export default function SideNamesCard() {
  const { currentTeam, updateTeam } = useTeam();
  // `ready` matters: nothing is known until the team loads, and "unknown"
  // is not "not allowed".
  const { canManage, ready } = usePermission();

  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [saving, setSaving] = useState(false);

  // Seeded from the team, and reseeded when it changes underneath — switching
  // team would otherwise leave the previous team's names in the boxes.
  useEffect(() => {
    setA(currentTeam?.side_a_name ?? SIDE_NAMES.A);
    setB(currentTeam?.side_b_name ?? SIDE_NAMES.B);
  }, [currentTeam]);

  if (!currentTeam) return null;

  const editable = ready && canManage();

  const trimmedA = a.trim();
  const trimmedB = b.trim();
  const unchanged =
    trimmedA === (currentTeam.side_a_name ?? SIDE_NAMES.A) &&
    trimmedB === (currentTeam.side_b_name ?? SIDE_NAMES.B);
  // The database rejects a blank name; catching it here explains why.
  const valid = trimmedA.length > 0 && trimmedB.length > 0;

  const save = async () => {
    setSaving(true);
    await updateTeam(currentTeam.id, {
      side_a_name: trimmedA,
      side_b_name: trimmedB,
    });
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shirt className="h-5 w-5 text-accent" />
          Side names
        </CardTitle>
        <CardDescription>
          Used when picking the teams, on every match, and in the league table.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="side-a">First side</Label>
            <Input
              id="side-a"
              value={a}
              maxLength={MAX}
              disabled={!editable}
              onChange={(e) => setA(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="side-b">Second side</Label>
            <Input
              id="side-b"
              value={b}
              maxLength={MAX}
              disabled={!editable}
              onChange={(e) => setB(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Tonight it would read{" "}
          <span className="font-medium text-foreground">
            {trimmedA || "…"} v {trimmedB || "…"}
          </span>
          .
        </p>

        {editable ? (
          <Button onClick={save} disabled={saving || unchanged || !valid}>
            {saving ? "Saving…" : "Save names"}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Only an admin can change these.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
