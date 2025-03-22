
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMatchDetail } from "@/hooks/useMatchDetail";
import MatchHeader from "@/components/matches/MatchHeader";
import MatchScore from "@/components/matches/MatchScore";
import TeamsList from "@/components/matches/TeamsList";
import MatchNotFound from "@/components/matches/MatchNotFound";
import Confetti from "@/components/Confetti";

const MatchDetail = () => {
  const {
    match,
    players,
    isLoadingMatch,
    isEditing,
    setIsEditing,
    teamAScore,
    setTeamAScore,
    teamBScore,
    setTeamBScore,
    showConfetti,
    updateMatchMutation,
    handleSaveResult,
    getPlayerName,
    navigate
  } = useMatchDetail();

  if (isLoadingMatch) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
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
    return <MatchNotFound onBack={() => navigate(-1)} />;
  }

  // Make sure necessary team data exists
  if (!match.teamA || !match.teamB) {
    return (
      <div className="page-container">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <div className="p-6 text-center">
          <h2 className="text-xl font-medium">Invalid match data</h2>
          <p className="text-muted-foreground mt-2">This match has incomplete team information.</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
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
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Match Header Card */}
      <Card className="shadow-lg mb-8 overflow-hidden">
        <CardContent className="p-0">
          <MatchHeader 
            match={match} 
            isCompleted={isCompleted} 
            onEditClick={() => setIsEditing(true)} 
          />

          <MatchScore 
            match={match}
            isCompleted={isCompleted}
            isEditing={isEditing}
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
    </div>
  );
};

export default MatchDetail;
