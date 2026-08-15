import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PlayerAvatar from "@/components/players/PlayerAvatar";
import { AVATAR_ICON_NAMES, AVATAR_ICONS, toIconValue } from "@/lib/avatars";

interface PlayerImageUploadProps {
  imageUrl: string | null;
  onImageChange: (imageUrl: string | null) => void;
  /** Shown in the preview when nothing is chosen. */
  playerName?: string;
}

/**
 * Avatar picker.
 *
 * The preview is the same component every other page renders a player with, so
 * what you choose here is exactly what you will see on the card, in the table
 * and in the randomiser — rather than the picker being the one place a choice
 * looked right.
 */
const PlayerImageUpload = ({
  imageUrl,
  onImageChange,
  playerName = "",
}: PlayerImageUploadProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      <Label>Avatar</Label>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative">
          <PlayerAvatar name={playerName} image={imageUrl} size="lg" />
          {imageUrl && (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              aria-label="Remove avatar"
              className="absolute -right-1 -top-1 h-6 w-6 rounded-full"
              onClick={() => onImageChange(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="gap-2">
              <ImagePlus className="h-4 w-4" />
              {imageUrl ? "Change avatar" : "Choose avatar"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 p-2">
            <div className="grid grid-cols-5 gap-1">
              {AVATAR_ICON_NAMES.map((iconName) => {
                const Icon = AVATAR_ICONS[iconName];
                const value = toIconValue(iconName);
                const selected = imageUrl === value;
                return (
                  <Button
                    key={iconName}
                    type="button"
                    variant={selected ? "secondary" : "ghost"}
                    aria-label={iconName}
                    aria-pressed={selected}
                    className="flex h-11 w-11 items-center justify-center rounded-full p-0"
                    onClick={() => {
                      onImageChange(value);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default PlayerImageUpload;
