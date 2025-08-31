import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed onboarding
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      // User exists, redirect to home
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const handleStartJourney = () => {
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Hero Section */}
        <div className="mb-8 animate-fade-in">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-hero flex items-center justify-center text-6xl animate-bounce-in">
            🧹
          </div>
          <h1 className="text-4xl font-bold mb-4 gradient-hero bg-clip-text text-transparent">
            CleanQuest
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Transforme ton ménage en aventure !
          </p>
          <p className="text-muted-foreground">
            Gagne des points, débloque des badges et deviens un maître du nettoyage
          </p>
        </div>

        {/* Features */}
        <Card className="p-6 mb-8 gradient-card animate-slide-up">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎯</div>
              <div className="text-left">
                <h3 className="font-semibold">Missions quotidiennes</h3>
                <p className="text-sm text-muted-foreground">
                  Des tâches adaptées à ton mode de vie
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-2xl">⭐</div>
              <div className="text-left">
                <h3 className="font-semibold">Système de points</h3>
                <p className="text-sm text-muted-foreground">
                  Gagne des XP et monte de niveau
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🏆</div>
              <div className="text-left">
                <h3 className="font-semibold">Badges et récompenses</h3>
                <p className="text-sm text-muted-foreground">
                  Débloque des achievements uniques
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <Button 
          onClick={handleStartJourney}
          className="w-full py-6 text-lg gradient-primary hover:opacity-90 transition-smooth shadow-primary"
        >
          🚀 Commencer l'aventure
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          Gratuit • Personnalisé • Motivant
        </p>
      </div>
    </div>
  );
};

export default Index;