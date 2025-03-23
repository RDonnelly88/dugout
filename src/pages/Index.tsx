
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Trophy, ArrowRight, Plus, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

const Index = () => {
  const [animationsLoaded, setAnimationsLoaded] = useState(false);
  
  useEffect(() => {
    // Ensure animations are triggered after component mount
    setAnimationsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0f172a]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        {/* Background gradient and overlay */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/40 via-indigo-900/30 to-purple-900/40"></div>
        <div className="absolute inset-0 bg-[url('/lovable-uploads/62e3bd01-9a72-4fd1-ae50-65f5608f446a.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        
        {/* Animated glowing elements with increased size and opacity */}
        <div className="absolute top-[10%] right-[20%] w-96 h-96 rounded-full bg-primary/30 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[20%] left-[10%] w-128 h-128 rounded-full bg-accent/30 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[30%] w-80 h-80 rounded-full bg-blue-500/30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Grid overlay with more prominent lines */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20"></div>
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(rgba(45, 212, 191, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 212, 191, 0.1) 1px, transparent 1px)', 
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* More prominent and numerous light streaks */}
        <div className="absolute h-[3px] w-[300px] bg-gradient-to-r from-transparent via-primary to-transparent top-[20%] -left-40 animate-[slide-in-right_8s_linear_infinite]" style={{ animationDelay: '0s' }}></div>
        <div className="absolute h-[3px] w-[400px] bg-gradient-to-r from-transparent via-primary to-transparent top-[60%] -left-40 animate-[slide-in-right_12s_linear_infinite]" style={{ animationDelay: '2s' }}></div>
        <div className="absolute h-[3px] w-[350px] bg-gradient-to-r from-transparent via-accent to-transparent top-[40%] -left-40 animate-[slide-in-right_15s_linear_infinite]" style={{ animationDelay: '5s' }}></div>
        <div className="absolute h-[3px] w-[250px] bg-gradient-to-r from-transparent via-primary/80 to-transparent top-[30%] -left-40 animate-[slide-in-right_10s_linear_infinite]" style={{ animationDelay: '7s' }}></div>
        <div className="absolute h-[3px] w-[350px] bg-gradient-to-r from-transparent via-accent/80 to-transparent top-[75%] -left-40 animate-[slide-in-right_9s_linear_infinite]" style={{ animationDelay: '3s' }}></div>
        
        {/* Dynamic scanner line effect */}
        <div className={`absolute inset-0 overflow-hidden ${animationsLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent animate-scanner"></div>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-12 md:pt-32 md:pb-20">
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-accent">
            5-A-Side Tracker
          </h1>
          <div className="h-1 w-40 mx-auto bg-gradient-to-r from-primary to-accent rounded-full mb-6"></div>
          <p className="text-xl md:text-2xl text-primary/80 max-w-2xl mx-auto mb-8">
            Track your five-a-side football matches, create balanced teams, and keep detailed player statistics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center max-w-md mx-auto">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent border-none shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:from-primary/90 hover:to-accent/90 transition-all animate-pulse">
              <Link to="/players">
                <Users className="h-5 w-5 mr-2" />
                Manage Players
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/30 bg-primary/10 backdrop-blur-sm hover:bg-primary/20 text-primary shadow-lg shadow-primary/20">
              <Link to="/matches/create">
                <Plus className="h-5 w-5 mr-2" />
                Create Match
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards with enhanced animations */}
      <div className="relative z-10 container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {/* Players Card */}
          <div className="glass-effect rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 relative overflow-hidden group animate-card-float" style={{ animationDelay: '0s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/60 to-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20 animate-pulse">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">10</h3>
              <p className="text-primary/80">Players Registered</p>
            </div>
          </div>

          {/* Total Matches Card */}
          <div className="glass-effect rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/40 relative overflow-hidden group animate-card-float" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/60 to-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20 animate-pulse">
                <Trophy className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">1</h3>
              <p className="text-accent/80">Total Matches</p>
            </div>
          </div>

          {/* Completed Matches Card */}
          <div className="glass-effect rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 relative overflow-hidden group animate-card-float" style={{ animationDelay: '0.6s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/60 to-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20 animate-pulse">
                <Trophy className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">1</h3>
              <p className="text-primary/80">Completed Matches</p>
            </div>
          </div>

          {/* Upcoming Matches Card */}
          <div className="glass-effect rounded-2xl p-8 text-center transform hover:scale-105 transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/40 relative overflow-hidden group animate-card-float" style={{ animationDelay: '0.9s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-accent/60 to-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20 animate-pulse">
                <Shield className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-1">0</h3>
              <p className="text-accent/80">Upcoming Matches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section with enhanced styling */}
      <div className="relative z-10 pb-24">
        <div className="container mx-auto px-4">
          <div className="tech-panel p-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/60 to-gray-900/60 border border-primary/20 shadow-inner shadow-primary/10 relative overflow-hidden group animate-card-float" style={{ animationDelay: '0.3s' }}>
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 animate-pulse">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Player Management</h3>
                  <p className="text-primary/70 mb-4">Create and manage player profiles with detailed statistics and performance tracking.</p>
                  <Button asChild variant="link" className="p-0 text-primary hover:text-primary/80">
                    <Link to="/players" className="flex items-center">
                      Manage Players
                      <ArrowRight className="h-4 w-4 ml-2 animate-float" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/60 to-gray-900/60 border border-accent/20 shadow-inner shadow-accent/10 relative overflow-hidden group animate-card-float" style={{ animationDelay: '0.6s' }}>
                <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4 animate-pulse">
                    <Trophy className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Match Tracking</h3>
                  <p className="text-accent/70 mb-4">Organize matches, record scores, and automatically update player statistics.</p>
                  <Button asChild variant="link" className="p-0 text-accent hover:text-accent/80">
                    <Link to="/matches" className="flex items-center">
                      View Matches
                      <ArrowRight className="h-4 w-4 ml-2 animate-float" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional dynamic elements - Floating particles with more prominence */}
      <div className="absolute bottom-10 left-10 w-5 h-5 rounded-full bg-primary/80 animate-float" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-20 left-20 w-4 h-4 rounded-full bg-accent/80 animate-float" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
      <div className="absolute bottom-15 left-40 w-3 h-3 rounded-full bg-primary/80 animate-float" style={{ animationDuration: '5s', animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-25 left-60 w-4 h-4 rounded-full bg-accent/80 animate-float" style={{ animationDuration: '7s', animationDelay: '1.5s' }}></div>
      <div className="absolute bottom-10 right-20 w-3 h-3 rounded-full bg-primary/80 animate-float" style={{ animationDuration: '5.5s', animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 right-40 w-3 h-3 rounded-full bg-accent/80 animate-float" style={{ animationDuration: '4.5s', animationDelay: '0.7s' }}></div>
      
      {/* Add more floating particles on top */}
      <div className="absolute top-20 left-30 w-4 h-4 rounded-full bg-primary/80 animate-float" style={{ animationDuration: '5s', animationDelay: '1.2s' }}></div>
      <div className="absolute top-40 right-30 w-5 h-5 rounded-full bg-accent/80 animate-float" style={{ animationDuration: '6.5s', animationDelay: '0.3s' }}></div>
      <div className="absolute top-10 right-60 w-3 h-3 rounded-full bg-primary/80 animate-float" style={{ animationDuration: '4.5s', animationDelay: '2.2s' }}></div>
    </div>
  );
};

export default Index;
