
import { Link } from "react-router-dom";
import { Users, Trophy, Plus, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPlayers, getMatches } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const { data: players = [] } = useQuery({
    queryKey: ['players'],
    queryFn: getPlayers
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches
  });

  const completedMatches = matches.filter(match => match.status === "completed");
  const scheduledMatches = matches.filter(match => match.status === "scheduled");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-slide-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              5-A-Side Football Tracker
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Keep track of your players, matches, and statistics with this beautifully designed tracker.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="hover-scale">
                <Link to="/players">
                  <Users className="h-5 w-5 mr-2" />
                  Manage Players
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="hover-scale">
                <Link to="/matches/create">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Match
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card shadow-md hover-scale">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold">{players.length}</h3>
              <p className="text-muted-foreground">Players Registered</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card shadow-md hover-scale">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold">{matches.length}</h3>
              <p className="text-muted-foreground">Total Matches</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card shadow-md hover-scale">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-600 mb-4">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold">{completedMatches.length}</h3>
              <p className="text-muted-foreground">Completed Matches</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card shadow-md hover-scale">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-purple-600 mb-4">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold">{scheduledMatches.length}</h3>
              <p className="text-muted-foreground">Upcoming Matches</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Quick Access</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="overflow-hidden shadow-lg border-0">
              <div className="h-2 bg-blue-500"></div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-500" />
                  Players
                </h3>
                
                <p className="mb-4 text-muted-foreground">
                  Manage your players, view their stats, and track their performance.
                </p>
                
                <div className="space-y-2 mb-6">
                  <Link 
                    to="/players/add" 
                    className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50 text-blue-600"
                  >
                    <span className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Player
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  
                  <Link 
                    to="/players" 
                    className="flex items-center justify-between p-2 rounded-md hover:bg-blue-50 text-blue-600"
                  >
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      View All Players
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                
                <Button asChild variant="outline" className="w-full">
                  <Link to="/players">
                    Go to Players
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden shadow-lg border-0">
              <div className="h-2 bg-green-500"></div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-green-500" />
                  Matches
                </h3>
                
                <p className="mb-4 text-muted-foreground">
                  Create matches, record results, and view match history.
                </p>
                
                <div className="space-y-2 mb-6">
                  <Link 
                    to="/matches/create" 
                    className="flex items-center justify-between p-2 rounded-md hover:bg-green-50 text-green-600"
                  >
                    <span className="flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Match
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  
                  <Link 
                    to="/matches" 
                    className="flex items-center justify-between p-2 rounded-md hover:bg-green-50 text-green-600"
                  >
                    <span className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2" />
                      View Match History
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                
                <Button asChild variant="outline" className="w-full">
                  <Link to="/matches">
                    Go to Matches
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
