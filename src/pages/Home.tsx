
import { Link } from "react-router-dom";
import { Users, Trophy, Plus, ArrowRight, BarChart3, Shield } from "lucide-react";
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
    <div className="min-h-screen bg-[#0f172a] bg-mesh-gradient">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[20%] left-[15%] w-64 h-64 rounded-full bg-blue-500/20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[30%] right-[10%] w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 lg:py-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto animate-slide-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-gradient">
              5-A-Side Football Tracker
            </h1>
            <div className="h-1 w-40 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
            <p className="text-xl text-blue-100/80 mb-8 max-w-2xl mx-auto">
              Keep track of your players, matches, and statistics with this beautifully designed tracker.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-800/20 hover:shadow-blue-800/30">
                <Link to="/players">
                  <Users className="h-5 w-5 mr-2" />
                  Manage Players
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-blue-900/20 backdrop-blur-sm border-blue-400/30 hover:bg-blue-800/30 text-blue-100">
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
          <Card className="neo-glassmorphism hover:border-blue-500/30 hover-scale">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-600/20 mb-4">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-3xl font-bold text-gradient">{players.length}</h3>
              <p className="text-blue-200/70">Players Registered</p>
            </CardContent>
          </Card>
          
          <Card className="neo-glassmorphism hover:border-emerald-500/30 hover-scale">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-600/20 mb-4">
                <Trophy className="h-7 w-7" />
              </div>
              <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">{matches.length}</h3>
              <p className="text-emerald-200/70">Total Matches</p>
            </CardContent>
          </Card>
          
          <Card className="neo-glassmorphism hover:border-amber-500/30 hover-scale">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-600/20 mb-4">
                <BarChart3 className="h-7 w-7" />
              </div>
              <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-400">{completedMatches.length}</h3>
              <p className="text-amber-200/70">Completed Matches</p>
            </CardContent>
          </Card>
          
          <Card className="neo-glassmorphism hover:border-purple-500/30 hover-scale">
            <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-600/20 mb-4">
                <Shield className="h-7 w-7" />
              </div>
              <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">{scheduledMatches.length}</h3>
              <p className="text-purple-200/70">Upcoming Matches</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Access */}
      <div className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold mb-8 text-center text-gradient">Quick Access</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="overflow-hidden neo-glassmorphism border-0 shadow-xl">
              <div className="h-1.5 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center text-blue-100">
                  <Users className="h-5 w-5 mr-2 text-blue-400" />
                  Players
                </h3>
                
                <p className="mb-6 text-blue-200/70">
                  Manage your players, view their stats, and track their performance over time.
                </p>
                
                <div className="space-y-2 mb-6">
                  <Link 
                    to="/players/add" 
                    className="flex items-center justify-between p-3 rounded-md bg-blue-900/30 hover:bg-blue-800/40 text-blue-100 border border-blue-500/20 group transition-all"
                  >
                    <span className="flex items-center">
                      <Plus className="h-4 w-4 mr-2 text-blue-400" />
                      Add New Player
                    </span>
                    <ArrowRight className="h-4 w-4 text-blue-400 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link 
                    to="/players" 
                    className="flex items-center justify-between p-3 rounded-md bg-blue-900/30 hover:bg-blue-800/40 text-blue-100 border border-blue-500/20 group transition-all"
                  >
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-400" />
                      View All Players
                    </span>
                    <ArrowRight className="h-4 w-4 text-blue-400 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                <Button asChild variant="outline" className="w-full border-blue-500/30 hover:bg-blue-800/30 text-blue-100">
                  <Link to="/players">
                    Manage Players
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden neo-glassmorphism border-0 shadow-xl">
              <div className="h-1.5 bg-gradient-to-r from-indigo-400 to-indigo-600"></div>
              <CardContent className="p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center text-indigo-100">
                  <Trophy className="h-5 w-5 mr-2 text-indigo-400" />
                  Matches
                </h3>
                
                <p className="mb-6 text-indigo-200/70">
                  Create matches, record results, and view detailed match history and statistics.
                </p>
                
                <div className="space-y-2 mb-6">
                  <Link 
                    to="/matches/create" 
                    className="flex items-center justify-between p-3 rounded-md bg-indigo-900/30 hover:bg-indigo-800/40 text-indigo-100 border border-indigo-500/20 group transition-all"
                  >
                    <span className="flex items-center">
                      <Plus className="h-4 w-4 mr-2 text-indigo-400" />
                      Create New Match
                    </span>
                    <ArrowRight className="h-4 w-4 text-indigo-400 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link 
                    to="/matches" 
                    className="flex items-center justify-between p-3 rounded-md bg-indigo-900/30 hover:bg-indigo-800/40 text-indigo-100 border border-indigo-500/20 group transition-all"
                  >
                    <span className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2 text-indigo-400" />
                      View Match History
                    </span>
                    <ArrowRight className="h-4 w-4 text-indigo-400 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                <Button asChild variant="outline" className="w-full border-indigo-500/30 hover:bg-indigo-800/30 text-indigo-100">
                  <Link to="/matches">
                    View Matches
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
