
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Player } from "@/types";

interface TeamRandomizerProps {
  players: Player[];
  onRandomize: (players: Player[]) => void;
  disabled?: boolean;
}

const TeamRandomizer = ({ players, onRandomize, disabled = false }: TeamRandomizerProps) => {
  const canRandomize = players.length > 0;

  return (
    <div className="flex justify-end mb-4">
      <Button
        onClick={() => onRandomize(players)}
        variant="outline"
        disabled={disabled || !canRandomize}
        className="gap-2"
      >
        <Shuffle className="h-4 w-4" />
        Randomize Teams
      </Button>
    </div>
  );
};

export default TeamRandomizer;
