import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlayer, addPlayer, updatePlayer, deletePlayer } from "@/lib/db";
import { Player } from "@/types";
import { ArrowLeft, Trash2, ImagePlus, User, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AddEditPlayerProps {}

const AddEditPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const addPlayerMutation = useMutation(addPlayer, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Player added",
        description: "The player has been added successfully.",
      });
      navigate("/players");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add the player. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updatePlayerMutation = useMutation(
    (data: { id: string; updates: Partial<Player> }) =>
      updatePlayer(data.id, data.updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['players'] });
        toast({
          title: "Player updated",
          description: "The player has been updated successfully.",
        });
        navigate("/players");
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update the player. Please try again.",
          variant: "destructive",
        });
      },
    }
  );

  const deletePlayerMutation = useMutation(deletePlayer, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast({
        title: "Player deleted",
        description: "The player has been deleted successfully.",
      });
      navigate("/players");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the player. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && player) {
        // If editing, update existing player
        const updated = await updatePlayer(player.id, { 
          name, 
          image: imageUrl || undefined,
          stats: player.stats // Preserve existing stats
        });
        
        if (updated) {
          toast({
            title: "Player updated",
            description: "The player has been updated successfully.",
          });
          navigate(`/players/${player.id}`);
        }
      } else {
        // If adding new player, create with default stats
        const newPlayer = await addPlayer({ 
          name, 
          image: imageUrl || undefined,
          stats: { played: 0, won: 0, lost: 0, drawn: 0 } // Add default stats for new player
        });
        
        toast({
          title: "Player added",
          description: "The player has been added successfully.",
        });
        navigate(`/players/${newPlayer.id}`);
      }
    } catch (error) {
      console.error("Error saving player:", error);
      toast({
        title: "Error saving player",
        description: "There was an error saving the player.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div>
              <Label htmlFor="image">Image</Label>
              <Input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="relative">
                <Button variant="outline" asChild>
                  <label htmlFor="image" className="cursor-pointer flex items-center gap-2">
                    <ImagePlus className="h-4 w-4" />
                    {imageUrl ? "Change Image" : "Upload Image"}
                  </label>
                </Button>
                {imageUrl && (
                  <div className="absolute top-0 left-0 w-full h-full rounded-md overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Player"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={addPlayerMutation.isLoading || updatePlayerMutation.isLoading}>
              {addPlayerMutation.isLoading || updatePlayerMutation.isLoading
                ? "Saving..."
                : "Save Player"}
            </Button>
          </form>
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Player
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this player? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AddEditPlayer;
