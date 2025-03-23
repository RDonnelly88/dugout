
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Trophy, ArrowRight, Plus, Calendar, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';

const Index = () => {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Ensure animations are triggered after component mount
    setTimeout(() => setLoaded(true), 100);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f172a]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Base overlay */}
        <div className="absolute inset-0 bg-[url('/lovable-uploads/5272ffa1-ea39-4215-af61-28746198cab8.png')] bg-cover bg-center opacity-10"></div>
        
        {/* Large glowing orbs - much larger and more visible */}
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[30%] right-[10%] w-[600px] h-[600px] rounded-full bg-accent/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] right-[30%] w-[400px] h-[400px] rounded-full bg-[#06b6d4]/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Tech grid overlay */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(rgba(45, 212, 191, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 212, 191, 0.2) 1px, transparent 1px)', 
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Highly visible light streaks */}
        <div className={`absolute h-[5px] w-[500px] bg-gradient-to-r from-transparent via-primary to-transparent top-[20%] -left-[250px] ${loaded ? 'animate-[slide-in-right_15s_linear_infinite]' : ''}`}></div>
        <div className={`absolute h-[5px] w-[400px] bg-gradient-to-r from-transparent via-primary to-transparent top-[40%] -left-[200px] ${loaded ? 'animate-[slide-in-right_10s_linear_infinite]' : ''}`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute h-[5px] w-[600px] bg-gradient-to-r from-transparent via-accent to-transparent top-[60%] -left-[300px] ${loaded ? 'animate-[slide-in-right_12s_linear_infinite]' : ''}`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute h-[5px] w-[450px] bg-gradient-to-r from-transparent via-primary to-transparent top-[80%] -left-[225px] ${loaded ? 'animate-[slide-in-right_8s_linear_infinite]' : ''}`} style={{ animationDelay: '3s' }}></div>
        
        {/* Scanner animation */}
        <div className={`absolute inset-0 overflow-hidden ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
          <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-transparent via-primary to-transparent animate-scanner"></div>
        </div>
        
        {/* Floating particles - larger and more visible */}
        {loaded && Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              backgroundColor: i % 2 === 0 ? 'rgba(45, 212, 191, 0.8)' : 'rgba(20, 184, 166, 0.8)',
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 3}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-12 md:pt-32 md:pb-20">
        <div className={`text-center mb-12 md:mb-16 transition-all duration-1000 transform ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-accent animation-glow">
            5-A-Side Tracker
          </h1>
          <div className="h-1 w-40 mx-auto bg-gradient-to-r from-primary to-accent rounded-full mb-8"></div>
          <p className="text-xl md:text-2xl text-primary/80 max-w-2xl mx-auto mb-10">
            Track your five-a-side football matches, create balanced teams, and keep detailed player statistics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 justify-center max-w-md mx-auto">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 border-none text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all">
              <Link to="/players">
                <Users className="h-5 w-5 mr-2" />
                Manage Players
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/20 shadow-lg shadow-primary/10">
              <Link to="/matches/create">
                <Plus className="h-5 w-5 mr-2" />
                Create Match
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="relative z-10 container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Players Card */}
          <div className={`bg-black/40 backdrop-blur-xl border border-primary/30 rounded-2xl overflow-hidden shadow-lg transform transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '200ms' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            <div className="p-8 relative">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-bold text-white text-center mb-2">17</h3>
              <p className="text-primary/80 text-center">Players Registered</p>
            </div>
          </div>

          {/* Matches Card */}
          <div className={`bg-black/40 backdrop-blur-xl border border-accent/30 rounded-2xl overflow-hidden shadow-lg transform transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '400ms' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
            <div className="p-8 relative">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Trophy className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-4xl font-bold text-white text-center mb-2">2</h3>
              <p className="text-accent/80 text-center">Total Matches</p>
            </div>
          </div>

          {/* Upcoming Matches Card */}
          <div className={`bg-black/40 backdrop-blur-xl border border-primary/30 rounded-2xl overflow-hidden shadow-lg transform transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '600ms' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            <div className="p-8 relative">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-4xl font-bold text-white text-center mb-2">0</h3>
              <p className="text-primary/80 text-center">Upcoming Matches</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 container mx-auto px-4 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Player Management */}
            <div className={`p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-primary/30 shadow-lg transition-all duration-700 transform ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '800ms' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white">Player Management</h3>
              </div>
              <p className="text-gray-300 mb-4">Create and manage player profiles with detailed statistics and performance tracking for your five-a-side team.</p>
              <Button asChild variant="link" className="p-0 text-primary hover:text-primary/80">
                <Link to="/players" className="flex items-center">
                  Manage Players
                  <ArrowRight className="h-4 w-4 ml-2 animate-pulse" />
                </Link>
              </Button>
            </div>
            
            {/* Match Tracking */}
            <div className={`p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-accent/30 shadow-lg transition-all duration-700 transform ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: '1000ms' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mr-4">
                  <Trophy className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-white">Match Tracking</h3>
              </div>
              <p className="text-gray-300 mb-4">Record match results, track team performance, and maintain a complete history of all your five-a-side games.</p>
              <Button asChild variant="link" className="p-0 text-accent hover:text-accent/80">
                <Link to="/matches" className="flex items-center">
                  View Matches
                  <ArrowRight className="h-4 w-4 ml-2 animate-pulse" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
