
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Players from "./pages/Players";
import PlayerDetail from "./pages/PlayerDetail";
import AddEditPlayer from "./pages/AddEditPlayer";
import Matches from "./pages/Matches";
import CreateMatch from "./pages/CreateMatch";
import MatchDetail from "./pages/MatchDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="players" element={<Players />} />
            <Route path="players/:id" element={<PlayerDetail />} />
            <Route path="players/add" element={<AddEditPlayer />} />
            <Route path="players/edit/:id" element={<AddEditPlayer />} />
            <Route path="matches" element={<Matches />} />
            <Route path="matches/create" element={<CreateMatch />} />
            <Route path="matches/:id" element={<MatchDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
