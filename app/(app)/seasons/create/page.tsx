"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import React, { useEffect } from "react";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SeasonForm from "@/components/seasons/SeasonForm";
import { useCreateSeason } from "@/hooks/useCreateSeason";
import { usePermission } from "@/lib/permission-utils";
import { useToast } from "@/hooks/use-toast";

const CreateSeason = () => {
  const { canManage, ready } = usePermission();
  const router = useRouter();
  const { toast } = useToast();
  const { createSeasonMutation, handleSubmit } = useCreateSeason();

  useEffect(() => {
    // Nothing is known until the team has loaded, and "unknown" is not
    // "not allowed".
    if (!ready) return;
    if (!canManage()) {
      toast({
        title: "Team required",
        description: "You need to create or select a team before creating seasons",
        variant: "destructive",
      });
      router.push("/");
    }
  }, [ready, canManage, router, toast]);

  return (
    <div className="page-container animate-slide-up">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/seasons">
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
