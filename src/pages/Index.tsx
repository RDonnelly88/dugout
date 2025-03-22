
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Trophy, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-black/80 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-[10%] left-[15%] w-64 h-64 rounded-full bg-blue-500/30 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] right-[20%] w-60 h-60 rounded-full bg-blue-600/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 glass-card p-8 sm:p-12 rounded-2xl max-w-3xl mx-4 animate-slide-up">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-gradient bg-gradient-to-r from-blue-200 via-blue-100 to-white">5-A-Side Tracker</h1>
        <p className="text-xl text-blue-100/80 mb-8">
          Track your five-a-side football matches, manage players, and create balanced teams with this powerful app.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="p-4 rounded-lg bg-black/30 border border-white/10">
            <Users className="h-8 w-8 text-blue-400 mb-2" />
            <h3 className="text-lg font-semibold text-white mb-1">Player Management</h3>
            <p className="text-sm text-blue-100/70">Create and manage your player roster with detailed statistics.</p>
          </div>
          
          <div className="p-4 rounded-lg bg-black/30 border border-white/10">
            <Trophy className="h-8 w-8 text-blue-400 mb-2" />
            <h3 className="text-lg font-semibold text-white mb-1">Match Tracking</h3>
            <p className="text-sm text-blue-100/70">Record matches, scores, and automatically update player stats.</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-none">
            <Link to="/players">
              <Users className="h-5 w-5 mr-2" />
              Manage Players
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/20 backdrop-blur-sm hover:bg-white/10">
            <Link to="/matches">
              <Trophy className="h-5 w-5 mr-2" />
              View Matches
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
