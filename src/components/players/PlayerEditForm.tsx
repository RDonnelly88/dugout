
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PlayerImageUpload from "./PlayerImageUpload";

interface PlayerEditFormProps {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  imageUrl: string | null;
  setImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}

const PlayerEditForm = ({
  name,
  setName,
  imageUrl,
  setImageUrl,
  onSubmit,
  isSubmitting
}: PlayerEditFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Player name"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <PlayerImageUpload
          imageUrl={imageUrl}
          onImageChange={setImageUrl}
        />
      </div>

      <Button type="submit" disabled={isSubmitting || !name.trim()}>
        {isSubmitting ? "Saving..." : "Save Player"}
      </Button>
    </form>
  );
};

export default PlayerEditForm;
