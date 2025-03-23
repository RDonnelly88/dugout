
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { TeamProvider } from "@/contexts/TeamContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import Players from "@/pages/Players";
import PlayerDetail from "@/pages/PlayerDetail";
import AddEditPlayer from "@/pages/AddEditPlayer";
import Matches from "@/pages/Matches";
import MatchDetail from "@/pages/MatchDetail";
import CreateMatch from "@/pages/CreateMatch";
import Seasons from "@/pages/Seasons";
import SeasonDetail from "@/pages/SeasonDetail";
import CreateSeason from "@/pages/CreateSeason";
import TeamManagement from "@/pages/TeamManagement";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <TeamProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Home />} />
                
                {/* Player routes */}
                <Route path="/players" element={<Players />} />
                <Route path="/players/:id" element={<PlayerDetail />} />
                <Route path="/players/add" element={<AddEditPlayer />} />
                <Route path="/players/edit/:id" element={<AddEditPlayer />} />
                
                {/* Match routes */}
                <Route path="/matches" element={<Matches />} />
                <Route path="/matches/:id" element={<MatchDetail />} />
                <Route path="/matches/create" element={<CreateMatch />} />
                
                {/* Season routes */}
                <Route path="/seasons" element={<Seasons />} />
                <Route path="/seasons/:id" element={<SeasonDetail />} />
                <Route path="/seasons/create" element={<CreateSeason />} />
                
                {/* Team management */}
                <Route path="/team" element={<TeamManagement />} />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <Toaster />
          </TeamProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
