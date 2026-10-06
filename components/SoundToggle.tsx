"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { playKickOff, primeSound, setSoundEnabled, soundEnabled } from "@/lib/sound";

/**
 * Whether the app whistles. Kept on this device only — see `lib/sound.ts`.
 *
 * Turning it on plays the whistle once, so the setting proves itself and the
 * volume can be checked there and then.
 */
export default function SoundToggle() {
  const [on, setOn] = useState(true);
  // The stored choice can only be read in the browser, so the switch renders
  // off-and-unset on the server and settles once mounted.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOn(soundEnabled());
    setMounted(true);
  }, []);

  function change(next: boolean) {
    setOn(next);
    setSoundEnabled(next);
    if (next) {
      primeSound();
      playKickOff();
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor="sound" className="flex items-center gap-2 font-normal">
        {on ? (
          <Volume2 className="h-4 w-4 text-muted-foreground" />
        ) : (
          <VolumeX className="h-4 w-4 text-muted-foreground" />
        )}
        A whistle when a result is saved or the teams are dealt
      </Label>
      <Switch
        id="sound"
        checked={mounted && on}
        disabled={!mounted}
        onCheckedChange={change}
      />
    </div>
  );
}
