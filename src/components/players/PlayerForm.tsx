
import { Player } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PlayerImageUpload from "./PlayerImageUpload";

interface PlayerFormProps {
  name: string;
  setName: (name: string) => void;
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const PlayerForm = ({ 
  name, 
  setName, 
  imageUrl, 
  setImageUrl, 
  onSubmit, 
  isSubmitting 
}: PlayerFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          placeholder="Player Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <PlayerImageUpload 
        imageUrl={imageUrl} 
        onImageChange={setImageUrl} 
      />
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Player"}
      </Button>
    </form>
  );
};

export default PlayerForm;
