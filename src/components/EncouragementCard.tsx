import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LevelSystem } from "@/lib/levelSystem";
import { cn } from "@/lib/utils";
import { MessageCircle, Sparkles } from "lucide-react";

interface EncouragementCardProps {
  currentLevel: string;
  currentXP: number;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export const EncouragementCard = ({ 
  currentLevel, 
  currentXP, 
  className,
  variant = 'default' 
}: EncouragementCardProps) => {
  const levelConfig = LevelSystem.getLevelConfig(currentLevel);
  const character = LevelSystem.getCharacter(currentLevel);
  const progress = LevelSystem.getLevelProgress(currentXP);
  const encouragementMessage = LevelSystem.getEncouragementMessage(currentLevel, progress);
  
  if (!levelConfig || !character) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        "flex items-center space-x-2 p-2 rounded-lg",
        `bg-gradient-to-r ${character.backgroundColor}`,
        character.borderColor,
        className
      )}>
        <span className="text-lg">{character.emoji}</span>
        <p className="text-sm font-medium text-gray-700 flex-1">
          {encouragementMessage}
        </p>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={cn(
        "p-6",
        `bg-gradient-to-br ${character.backgroundColor}`,
        character.borderColor,
        className
      )}>
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center border-2 border-white/20">
            <span className="text-2xl">{character.emoji}</span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {character.name}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {levelConfig.name}
              </Badge>
            </div>
            
            <div className="mb-3">
              <MessageCircle className="w-4 h-4 inline mr-2 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {encouragementMessage}
              </span>
            </div>
            
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Trait: {character.personalityTrait}</span>
              </div>
              <div>
                Bonus niveau: +{LevelSystem.getLevelBonus(currentLevel)} points par tâche
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Variant 'default'
  return (
    <Card className={cn(
      "p-4",
      `bg-gradient-to-r ${character.backgroundColor}`,
      character.borderColor,
      className
    )}>
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
          <span className="text-xl">{character.emoji}</span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-800 text-sm">
              {character.name}
            </span>
            <Badge variant="secondary" className="text-xs">
              {levelConfig.name}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-700">
            {encouragementMessage}
          </p>
        </div>
      </div>
    </Card>
  );
};

// Hook pour obtenir un message d'encouragement aléatoire
export const useRandomEncouragement = (currentLevel: string) => {
  const character = LevelSystem.getCharacter(currentLevel);
  
  const getRandomMessage = () => {
    if (!character) return '';
    
    const messages = [
      `${character.name}: "Continue comme ça, tu es sur la bonne voie !"`,
      `${character.name}: "Chaque tâche terminée te rapproche de la perfection !"`,
      `${character.name}: "Tu fais du très bon travail !"`,
      `${character.name}: "Ta motivation est inspirante !"`,
      `${character.name}: "${character.catchPhrase.replace(/"/g, '')}"`,
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  return { getRandomMessage };
};
