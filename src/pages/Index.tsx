
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Trophy, ArrowRight, Plus, Shield, BarChart, Clock } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f172a]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900/80 via-gray-900 to-gray-900/90"></div>
        <div className="absolute inset-0 bg-[url('/lovable-uploads/c3cc0d40-1885-4c96-8a3b-8bdbe268a70a.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-[10%] right-[20%] w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[10%] w-96 h-96 rounded-full bg-accent/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-12 md:pt-32 md:pb-20">
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-white to-gray-300">
            5-A-Side Tracker
          </h1>
          <div className="h-1 w-40 mx-auto bg-gradient-to-r from-accent/80 to-accent rounded-full mb-6"></div>
          <p className="text-xl md:text-2xl text-gray-300/90 max-w-2xl mx-auto mb-8">
            Track your five-a-side football matches, create balanced teams, and keep detailed player statistics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center max-w-md mx-auto">
            <Button asChild size="lg" className="bg-gradient-to-r from-accent to-accent/90 border-none shadow-lg shadow-accent/20 hover:shadow-accent/30 hover:from-accent/90 hover:to-accent transition-all">
              <Link to="/players">
                <Users className="h-5 w-5 mr-2" />
                Manage Players
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gray-600 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-800/60 text-gray-200 shadow-lg shadow-black/20">
              <Link to="/matches/create">
                <Plus className="h-5 w-5 mr-2" />
                Create Match
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="relative z-10 container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {/* Players Card */}
          <div className="glass-effect rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-accent/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/80 to-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">10</h3>
              <p className="text-gray-300/80">Players Registered</p>
            </div>
          </div>

          {/* Total Matches Card */}
          <div className="glass-effect rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-accent/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/80 to-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">1</h3>
              <p className="text-gray-300/80">Total Matches</p>
            </div>
          </div>

          {/* Completed Matches Card */}
          <div className="glass-effect rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-accent/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/80 to-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">1</h3>
              <p className="text-gray-300/80">Completed Matches</p>
            </div>
          </div>

          {/* Upcoming Matches Card */}
          <div className="glass-effect rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-accent/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/80 to-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">0</h3>
              <p className="text-gray-300/80">Upcoming Matches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="relative z-10 pb-24">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-3xl p-8 max-w-5xl mx-auto backdrop-blur-xl border border-gray-700/30 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/20 shadow-inner">
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Player Management</h3>
                <p className="text-gray-300/80 mb-4">Create and manage player profiles with detailed statistics and performance tracking.</p>
                <Button asChild variant="link" className="p-0 text-accent hover:text-accent/80">
                  <Link to="/players" className="flex items-center">
                    Manage Players
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              
              <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/20 shadow-inner">
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Match Tracking</h3>
                <p className="text-gray-300/80 mb-4">Organize matches, record scores, and automatically update player statistics.</p>
                <Button asChild variant="link" className="p-0 text-accent hover:text-accent/80">
                  <Link to="/matches" className="flex items-center">
                    View Matches
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
