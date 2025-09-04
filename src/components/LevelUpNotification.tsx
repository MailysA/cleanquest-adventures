import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LevelSystem } from "@/lib/levelSystem";
import { Sparkles, Star, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface LevelUpNotificationProps {
  newLevel: string;
  oldLevel?: string;
  onClose: () => void;
  isVisible: boolean;
}

export const LevelUpNotification = ({ 
  newLevel, 
  oldLevel,
  onClose, 
  isVisible 
}: LevelUpNotificationProps) => {
  const [stage, setStage] = useState<'entering' | 'showing' | 'exiting'>('entering');
  
  const newLevelConfig = LevelSystem.getLevelConfig(newLevel);
  const newCharacter = LevelSystem.getCharacter(newLevel);
  
  useEffect(() => {
    if (isVisible) {
      setStage('entering');
      
      // Animation d'entrée
      const enterTimer = setTimeout(() => {
        setStage('showing');
      }, 100);
      
      // Auto-fermeture après 8 secondes
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 8000);
      
      return () => {
        clearTimeout(enterTimer);
        clearTimeout(autoCloseTimer);
      };
    }
  }, [isVisible]);
  
  const handleClose = () => {
    setStage('exiting');
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  if (!isVisible || !newLevelConfig || !newCharacter) {
    return null;
  }
  
  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center p-4",
      "bg-black/60 backdrop-blur-sm",
      stage === 'entering' && "animate-in fade-in duration-300",
      stage === 'exiting' && "animate-out fade-out duration-300"
    )}>
      <Card className={cn(
        "max-w-md w-full p-6 text-center relative",
        "bg-gradient-to-br from-amber-50 to-orange-100",
        "border-2 border-amber-200 shadow-2xl",
        stage === 'entering' && "animate-in zoom-in-50 slide-in-from-bottom-10 duration-500",
        stage === 'showing' && "animate-pulse",
        stage === 'exiting' && "animate-out zoom-out-50 slide-out-to-top-10 duration-300"
      )}>
        {/* Bouton de fermeture */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          onClick={handleClose}
        >
          <X className="w-4 h-4" />
        </Button>
        
        {/* Animation de confettis */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            >
              <Star className="w-3 h-3 text-amber-400 fill-current" />
            </div>
          ))}
        </div>
        
        {/* Titre kung fu */}
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Trophy className="w-6 h-6 text-amber-600 animate-bounce" />
            <h1 className="text-2xl font-bold text-amber-800">
              KUNG FU ÉVOLUÉ !
            </h1>
            <Trophy className="w-6 h-6 text-amber-600 animate-bounce" />
          </div>
          <div className="flex items-center justify-center space-x-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-amber-700 font-medium">
              Tu es maintenant {newLevelConfig.name} !
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
        </div>
        
        {/* Nouveau personnage */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center border-4 border-white shadow-lg animate-bounce-in">
            <span className="text-4xl">{newCharacter.emoji}</span>
          </div>
          
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {newCharacter.name}
          </h2>
          
          <p className="text-sm text-gray-600 mb-3">
            {newCharacter.description}
          </p>
          
          <div className="bg-white/50 rounded-lg p-3 border border-amber-200">
            <p className="text-sm italic text-amber-800">
              {newCharacter.catchPhrase}
            </p>
          </div>
        </div>
        
        {/* Message de déblocage */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-4 mb-4 border border-amber-200">
          <p className="text-sm text-amber-800 font-medium">
            {newCharacter.unlockMessage}
          </p>
        </div>
        
        {/* Bonus kung fu */}
        <div className="mb-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              Pouvoir martial : +{LevelSystem.getLevelBonus(newLevel)} chi par technique
            </span>
          </div>
        </div>

        {/* Bouton d'action kung fu */}
        <Button
          onClick={handleClose}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Osu ! Continuons l'entraînement !
        </Button>
      </Card>
    </div>
  );
};

// Hook pour gérer les notifications de level up
export const useLevelUpNotification = () => {
  const [notification, setNotification] = useState<{
    newLevel: string;
    oldLevel?: string;
    isVisible: boolean;
  } | null>(null);
  
  const showLevelUp = (newLevel: string, oldLevel?: string) => {
    setNotification({
      newLevel,
      oldLevel,
      isVisible: true
    });
  };
  
  const hideLevelUp = () => {
    setNotification(prev => 
      prev ? { ...prev, isVisible: false } : null
    );
    
    // Nettoyer après l'animation
    setTimeout(() => {
      setNotification(null);
    }, 300);
  };
  
  const LevelUpComponent = notification ? (
    <LevelUpNotification
      newLevel={notification.newLevel}
      oldLevel={notification.oldLevel}
      onClose={hideLevelUp}
      isVisible={notification.isVisible}
    />
  ) : null;
  
  return {
    showLevelUp,
    hideLevelUp,
    LevelUpComponent
  };
};
