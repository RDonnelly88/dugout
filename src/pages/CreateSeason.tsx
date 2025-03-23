
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SeasonForm from "@/components/seasons/SeasonForm";
import { useCreateSeason } from "@/hooks/useCreateSeason";
import { usePermission } from "@/lib/permission-utils";
import { useToast } from "@/hooks/use-toast";

const CreateSeason = () => {
  const { canManage } = usePermission();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createSeasonMutation, handleSubmit } = useCreateSeason();

  useEffect(() => {
    if (!canManage()) {
      toast({
        title: "Team required",
        description: "You need to create or select a team before creating seasons",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [canManage, navigate, toast]);

  return (
    <div className="page-container animate-slide-up">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/seasons">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Seasons
          </Link>
        </Button>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create Season</CardTitle>
          <CardDescription>
            Create a new season to organize your matches and track player statistics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeasonForm 
            onSubmit={handleSubmit} 
            isSubmitting={createSeasonMutation.isPending} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSeason;
