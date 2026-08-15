"use client";

import React from "react";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMatchDetail } from "@/hooks/useMatchDetail";
import MatchHeader from "@/components/matches/MatchHeader";
import MatchScore from "@/components/matches/MatchScore";
import TeamsList from "@/components/matches/TeamsList";
import MatchImpact from "@/components/matches/MatchImpact";
import MatchNotFound from "@/components/matches/MatchNotFound";
import Confetti from "@/components/Confetti";

const MatchDetail = () => {
  const {
    match,
    players,
    isLoadingMatch,
    isEditing,
    setIsEditing,
    setOutcome,
    effectiveOutcome,
    teamAScore,
    setTeamAScore,
    teamBScore,
    setTeamBScore,
    showConfetti,
    updateMatchMutation,
    handleSaveResult,
    getPlayerName,
    router
  } = useMatchDetail();

  if (isLoadingMatch) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="shimmer rounded-xl h-[300px] mb-8"></div>
        <div className="shimmer rounded-xl h-[400px]"></div>
      </div>
    );
  }

  if (!match) {
    return <MatchNotFound onBack={() => router.back()} />;
  }

  // Make sure necessary team data exists
  if (!match.teamA || !match.teamB) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="p-6 text-center">
          <h2 className="text-xl font-medium">Invalid match data</h2>
          <p className="text-muted-foreground mt-2">This match has incomplete team information.</p>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isCompleted = match.status === "completed";

  return (
    <div className="page-container max-w-4xl mx-auto animate-slide-up">
      {showConfetti && <Confetti />}
      
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <MatchHeader
        match={match}
        isCompleted={isCompleted}
        onEditClick={() => setIsEditing(true)}
      />

      <Card className="mb-8 overflow-hidden">
        <CardContent className="p-0">
          <MatchScore
            match={match}
            isCompleted={isCompleted}
            isEditing={isEditing}
            setOutcome={setOutcome}
            effectiveOutcome={effectiveOutcome}
            teamAScore={teamAScore}
            teamBScore={teamBScore}
            onScoreChange={{
              teamA: setTeamAScore,
              teamB: setTeamBScore
            }}
            onCancel={() => {
              setIsEditing(false);
              setTeamAScore(match.teamA.score);
              setTeamBScore(match.teamB.score);
            }}
            onSave={handleSaveResult}
            updateMatchMutation={updateMatchMutation}
          />
        </CardContent>
      </Card>

      {/* Teams Display */}
      <TeamsList 
        match={match} 
        players={players} 
        getPlayerName={getPlayerName} 
      />

      {isCompleted && <MatchImpact match={match} players={players} />}

      {/* Match Notes */}
      {match.notes && (
        <Card className="shadow-lg mt-8">
          <CardContent>
            <h3 className="text-lg font-semibold mb-3">Match Notes</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{match.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchDetail;
