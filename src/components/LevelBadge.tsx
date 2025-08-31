import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: string;
  className?: string;
}

const levelConfig = {
  Apprenti: {
    label: 'Apprenti',
    icon: '🌱',
    className: 'bg-muted text-muted-foreground'
  },
  Novice: {
    label: 'Novice',
    icon: '🌿',
    className: 'bg-green-100 text-green-800'
  },
  Adepte: {
    label: 'Adepte',
    icon: '⚡',
    className: 'bg-info text-info-foreground'
  },
  Expert: {
    label: 'Expert',
    icon: '⭐',
    className: 'gradient-primary text-primary-foreground'
  },
  Maître: {
    label: 'Maître',
    icon: '🎯',
    className: 'gradient-accent text-accent-foreground'
  },
  Légende: {
    label: 'Légende',
    icon: '👑',
    className: 'bg-yellow-100 text-yellow-800'
  },
  // Fallback for old level names
  apprenti: {
    label: 'Apprenti',
    icon: '🌱',
    className: 'bg-muted text-muted-foreground'
  },
  regulier: {
    label: 'Régulier', 
    icon: '⚡',
    className: 'bg-info text-info-foreground'
  },
  maitre: {
    label: 'Maître',
    icon: '⭐',
    className: 'gradient-primary text-primary-foreground'
  },
  sensei: {
    label: 'Sensei',
    icon: '🎯',
    className: 'gradient-accent text-accent-foreground'
  }
};

export const LevelBadge = ({ level, className }: LevelBadgeProps) => {
  const config = levelConfig[level];
  
  // Fallback si le niveau n'existe pas
  if (!config) {
    console.warn(`Level "${level}" not found in levelConfig`);
    return (
      <Badge className={cn(
        "text-sm font-medium px-3 py-1 transition-smooth bg-muted text-muted-foreground",
        className
      )}>
        <span className="mr-1">🌱</span>
        Apprenti
      </Badge>
    );
  }
  
  return (
    <Badge className={cn(
      "text-sm font-medium px-3 py-1 transition-smooth",
      config.className,
      className
    )}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
};