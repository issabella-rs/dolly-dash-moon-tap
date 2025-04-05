
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-space-gradient">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-dolly-purple dolly-shadow">404</h1>
        <p className="text-xl text-white mb-4">Oops! Dolly got lost in space</p>
        <div className="text-5xl my-6 animate-float">🐑💸</div>
        <Button asChild className="bg-dolly-purple hover:bg-dolly-purple/80 text-white">
          <a href="/">Return to Dolly Dash</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
