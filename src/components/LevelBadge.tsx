import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LevelSystem } from "@/lib/levelSystem";

interface LevelBadgeProps {
  level: string;
  className?: string;
  showCharacterName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LevelBadge = ({ level, className, showCharacterName = false, size = 'md' }: LevelBadgeProps) => {
  const config = LevelSystem.getLevelConfig(level);
  const character = LevelSystem.getCharacter(level);

  // Fallback si le niveau n'existe pas
  if (!config || !character) {
    console.warn(`Level "${level}" not found in levelSystem`);
    const fallbackConfig = LevelSystem.getLevelConfig('apprenti');
    const fallbackCharacter = LevelSystem.getCharacter('apprenti');

    return (
      <Badge className={cn(
        "font-medium transition-all duration-200 bg-green-500 text-white",
        size === 'sm' && "text-xs px-2 py-0.5",
        size === 'md' && "text-sm px-3 py-1",
        size === 'lg' && "text-base px-4 py-2",
        className
      )}>
        <span className="mr-1">{fallbackCharacter?.emoji}</span>
        {showCharacterName ? fallbackCharacter?.name : fallbackConfig?.name}
      </Badge>
    );
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2"
  };

  return (
    <Badge className={cn(
      "font-medium transition-all duration-200 hover:scale-105 active:scale-95",
      config.badgeClass,
      sizeClasses[size],
      className
    )}>
      <span className="mr-1 animate-pulse">{character.emoji}</span>
      {showCharacterName ? character.name : config.name}
    </Badge>
  );
};
