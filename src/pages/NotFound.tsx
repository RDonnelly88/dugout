
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/50 p-4">
      <div className="text-center glass-card p-8 rounded-xl max-w-md mx-auto animate-fade-in shadow-lg">
        <h1 className="text-6xl font-bold mb-2 text-gradient">404</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Oops! This page has gone missing.
        </p>
        
        <div className="space-y-2">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline" 
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          
          <Button 
            onClick={() => navigate("/")} 
            className="w-full"
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
