import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LevelSystem, LevelCharacter } from "@/lib/levelSystem";
import { Sparkles, Quote, Heart } from "lucide-react";

interface CharacterCardProps {
  levelId: string;
  isUnlocked?: boolean;
  isActive?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onSelect?: () => void;
}

export const CharacterCard = ({ 
  levelId, 
  isUnlocked = false, 
  isActive = false,
  className,
  size = 'md',
  showDetails = true,
  onSelect 
}: CharacterCardProps) => {
  const config = LevelSystem.getLevelConfig(levelId);
  const character = LevelSystem.getCharacter(levelId);
  
  if (!config || !character) {
    return null;
  }

  const sizeClasses = {
    sm: {
      card: "p-3",
      avatar: "w-12 h-12 text-2xl",
      title: "text-sm",
      description: "text-xs",
      catchPhrase: "text-xs"
    },
    md: {
      card: "p-4", 
      avatar: "w-16 h-16 text-3xl",
      title: "text-base",
      description: "text-sm",
      catchPhrase: "text-sm"
    },
    lg: {
      card: "p-6",
      avatar: "w-24 h-24 text-4xl", 
      title: "text-lg",
      description: "text-base",
      catchPhrase: "text-base"
    }
  };

  const classes = sizeClasses[size];

  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-lg border-2",
        classes.card,
        isActive && "ring-2 ring-primary ring-offset-2",
        isUnlocked 
          ? `bg-gradient-to-br ${character.backgroundColor} ${character.borderColor} ${character.glowColor}` 
          : "bg-muted/30 border-muted grayscale",
        onSelect && "cursor-pointer hover:scale-105 active:scale-95",
        className
      )}
      onClick={onSelect}
    >
      {/* Avatar et nom */}
      <div className="flex items-center space-x-3 mb-3">
        <div className={cn(
          "rounded-full flex items-center justify-center",
          "border-2 border-white/20 shadow-inner",
          classes.avatar,
          !isUnlocked && "opacity-50"
        )}>
          {isUnlocked ? character.emoji : '🔒'}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className={cn(
              "font-bold",
              classes.title,
              !isUnlocked && "text-muted-foreground"
            )}>
              {isUnlocked ? character.name : '???'}
            </h3>
            {isActive && (
              <Badge variant="secondary" className="text-xs">
                <Heart className="w-3 h-3 mr-1 text-red-500" />
                Actuel
              </Badge>
            )}
          </div>
          
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs mt-1",
              !isUnlocked && "opacity-50"
            )}
          >
            {config.name}
          </Badge>
        </div>
      </div>

      {showDetails && isUnlocked && (
        <>
          {/* Description */}
          <p className={cn(
            "text-muted-foreground mb-3 leading-relaxed",
            classes.description
          )}>
            {character.description}
          </p>

          {/* Trait de personnalité */}
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className={cn(
              "font-medium text-amber-700",
              classes.description
            )}>
              {character.personalityTrait}
            </span>
          </div>

          {/* Citation */}
          <div className={cn(
            "border-l-4 border-primary/30 pl-3 italic",
            classes.catchPhrase
          )}>
            <Quote className="w-3 h-3 inline mr-1 text-primary/60" />
            <span className="text-primary/80">
              {character.catchPhrase}
            </span>
          </div>
        </>
      )}

      {showDetails && !isUnlocked && (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">🔒</div>
          <p className="text-sm text-muted-foreground">
            Débloquez ce personnage en atteignant le niveau {config.name}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {config.minXP} XP requis
          </p>
        </div>
      )}
    </Card>
  );
};

// Composant pour afficher une galerie de personnages
interface CharacterGalleryProps {
  currentLevel: string;
  currentXP: number;
  className?: string;
}

export const CharacterGallery = ({ currentLevel, currentXP, className }: CharacterGalleryProps) => {
  const allLevels = LevelSystem.getAllLevels();

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Maîtres du Dojo</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allLevels.map((level) => {
          const isUnlocked = currentXP >= level.minXP;
          const isActive = currentLevel === level.id;
          
          return (
            <CharacterCard
              key={level.id}
              levelId={level.id}
              isUnlocked={isUnlocked}
              isActive={isActive}
              size="md"
              showDetails={true}
            />
          );
        })}
      </div>
    </div>
  );
};
