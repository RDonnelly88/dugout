
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPlayer } from "@/lib/db";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PlayerForm from "@/components/players/PlayerForm";
import DeletePlayerDialog from "@/components/players/DeletePlayerDialog";
import { usePlayerMutation } from "@/hooks/usePlayerMutation";

const AddEditPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addPlayerMutation, updatePlayerMutation, deletePlayerMutation } = usePlayerMutation();

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const { data: player, isLoading: isLoadingPlayer } = useQuery({
    queryKey: ['player', id],
    queryFn: () => getPlayer(id!),
    enabled: !!id
  });

  useEffect(() => {
    if (player) {
      setName(player.name);
      setImageUrl(player.image || null);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [player]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && player) {
        // If editing, update existing player
        updatePlayerMutation.mutate({ 
          id: player.id, 
          updates: { 
            name, 
            image: imageUrl || undefined,
            stats: player.stats // Preserve existing stats
          }
        });
      } else {
        // If adding new player, create with default stats
        addPlayerMutation.mutate({ 
          name, 
          image: imageUrl || undefined,
          stats: { played: 0, won: 0, lost: 0, drawn: 0 } // Add default stats for new player
        });
      }
    } catch (error) {
      console.error("Error saving player:", error);
    }
  };

  const handleDelete = () => {
    if (player) {
      deletePlayerMutation.mutate(player.id);
      setIsDeleteAlertOpen(false);
    }
  };

  if (isLoadingPlayer) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="shimmer rounded-xl h-[300px] mb-8"></div>
        <div className="shimmer rounded-xl h-[200px]"></div>
      </div>
    );
  }

  return (
    <div className="page-container animate-slide-up">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <div className="page-header">
        <h1 className="page-title">{isEditing ? "Edit Player" : "Add Player"}</h1>
        <p className="mt-2 text-muted-foreground">
          {isEditing ? "Update player details" : "Create a new player"}
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Player" : "Add Player"}</CardTitle>
          <CardDescription>
            {isEditing ? "Make changes to the player details." : "Enter the details for the new player."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PlayerForm
            name={name}
            setName={setName}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            onSubmit={handleSubmit}
            isSubmitting={addPlayerMutation.isPending || updatePlayerMutation.isPending}
          />
        </CardContent>
        {isEditing && (
          <CardFooter className="justify-between">
            <Link to={`/players/${player?.id}`} className="text-sm text-muted-foreground hover:underline">
              View Player
            </Link>
            <Button variant="destructive" size="sm" onClick={() => setIsDeleteAlertOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </CardFooter>
        )}
      </Card>

      <DeletePlayerDialog 
        isOpen={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AddEditPlayer;
