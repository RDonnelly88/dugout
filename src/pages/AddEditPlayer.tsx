
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlayer, addPlayer, updatePlayer } from "@/lib/db";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const AddEditPlayer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch player data if in edit mode
  const { data: player, isLoading } = useQuery({
    queryKey: ['player', id],
    queryFn: () => getPlayer(id!),
    enabled: isEditMode
  });

  // Initialize form with player data when loaded
  useEffect(() => {
    if (player) {
      setName(player.name);
      setImagePreview(player.image);
    }
  }, [player]);

  // Add player mutation
  const addMutation = useMutation({
    mutationFn: (playerData: { name: string; image?: string }) => addPlayer(playerData),
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

  // Update player mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: { name: string; image?: string } }) => 
      updatePlayer(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['player', id] });
      toast({
        title: "Player updated",
        description: "The player has been updated successfully.",
      });
      navigate(`/players/${id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the player. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Player name is required.",
        variant: "destructive",
      });
      return;
    }

    const playerData = {
      name: name.trim(),
      image: imagePreview
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, updates: playerData });
    } else {
      addMutation.mutate(playerData);
    }
  };

  const clearImage = () => {
    setImagePreview(undefined);
    setImageFile(null);
  };

  return (
    <div className="page-container max-w-2xl mx-auto animate-slide-up">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Player" : "Add New Player"}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? "Update player information" 
              : "Add a new player to your roster"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Player Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter player name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Player Image */}
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-3xl text-muted-foreground">
                    {name ? name.charAt(0).toUpperCase() : "?"}
                  </div>
                )}

                <div>
                  <Label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Recommended: Square image, 500x500px or larger
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || addMutation.isPending || updateMutation.isPending}>
              {isEditMode ? "Update Player" : "Add Player"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AddEditPlayer;
