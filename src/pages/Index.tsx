
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Trophy, ArrowRight, Plus, Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f172a]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-purple-900/40"></div>
        <div className="absolute inset-0 bg-[url('/lovable-uploads/c3cc0d40-1885-4c96-8a3b-8bdbe268a70a.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-[10%] right-[20%] w-64 h-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[10%] w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-12 md:pt-32 md:pb-20">
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            5-A-Side Tracker
          </h1>
          <div className="h-1 w-40 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
          <p className="text-xl md:text-2xl text-blue-100/80 max-w-2xl mx-auto mb-8">
            Track your five-a-side football matches, create balanced teams, and keep detailed player statistics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center max-w-md mx-auto">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 border-none shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:from-blue-500 hover:to-indigo-500 transition-all">
              <Link to="/players">
                <Users className="h-5 w-5 mr-2" />
                Manage Players
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-blue-400/30 bg-blue-900/20 backdrop-blur-sm hover:bg-blue-800/30 text-blue-100 shadow-lg shadow-blue-900/20">
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
          <div className="glass-effect rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/20">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">10</h3>
              <p className="text-blue-200/80">Players Registered</p>
            </div>
          </div>

          {/* Total Matches Card */}
          <div className="glass-effect rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg shadow-green-900/10 hover:shadow-green-900/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/20">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">1</h3>
              <p className="text-emerald-200/80">Total Matches</p>
            </div>
          </div>

          {/* Completed Matches Card */}
          <div className="glass-effect rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg shadow-amber-900/10 hover:shadow-amber-900/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-amber-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-900/20">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">1</h3>
              <p className="text-amber-200/80">Completed Matches</p>
            </div>
          </div>

          {/* Upcoming Matches Card */}
          <div className="glass-effect rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-900/10 hover:shadow-purple-900/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-900/20">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">0</h3>
              <p className="text-purple-200/80">Upcoming Matches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="relative z-10 pb-24">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-3xl p-8 max-w-5xl mx-auto backdrop-blur-xl bg-blue-950/30 border border-blue-500/20 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/40 to-blue-950/40 border border-blue-500/10 shadow-inner">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Player Management</h3>
                <p className="text-blue-200/70 mb-4">Create and manage player profiles with detailed statistics and performance tracking.</p>
                <Button asChild variant="link" className="p-0 text-blue-400 hover:text-blue-300">
                  <Link to="/players" className="flex items-center">
                    Manage Players
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-indigo-950/40 border border-indigo-500/10 shadow-inner">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Match Tracking</h3>
                <p className="text-indigo-200/70 mb-4">Organize matches, record scores, and automatically update player statistics.</p>
                <Button asChild variant="link" className="p-0 text-indigo-400 hover:text-indigo-300">
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
