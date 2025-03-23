import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePermission } from "@/lib/permission-utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PlayerForm from "@/components/players/PlayerForm";
import { getPlayer } from "@/lib/db";
import { usePlayerMutation } from "@/hooks/usePlayerMutation";

const AddEditPlayer = () => {
  const { canManage } = usePermission();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!canManage()) {
      toast({
        title: "Team required",
        description: "You need to create or select a team before adding players",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [canManage, navigate, toast]);

  const { id } = useParams<{ id: string }>();
  const isAddMode = !id;
  const { addPlayerMutation, updatePlayerMutation } = usePlayerMutation();

  const { data: player, isLoading } = useQuery({
    queryKey: ['player', id],
    queryFn: () => getPlayer(id!),
    enabled: !isAddMode && !!id
  });

  const [initialValues, setInitialValues] = useState(null);

  useEffect(() => {
    if (player) {
      setInitialValues({
        name: player.name,
        position: player.position,
        number: player.number,
        dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth) : null,
        nationality: player.nationality,
        height: player.height,
        weight: player.weight,
        preferredFoot: player.preferredFoot,
        description: player.description,
        imageUrl: player.imageUrl
      });
    }
  }, [player]);

  const onSubmit = async (values: any) => {
    const payload = {
      ...values,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null
    };

    if (isAddMode) {
      addPlayerMutation.mutate(payload);
    } else {
      updatePlayerMutation.mutate({ id, updates: payload });
    }
  };

  if (!isAddMode && isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page-container animate-slide-up">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/players">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Players
          </Link>
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{isAddMode ? "Add Player" : "Edit Player"}</CardTitle>
          <CardDescription>
            {isAddMode ? "Create a new player" : "Edit an existing player"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initialValues && (
            <PlayerForm
              initialValues={initialValues}
              onSubmit={onSubmit}
              isSubmitting={addPlayerMutation.isLoading || updatePlayerMutation.isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddEditPlayer;
