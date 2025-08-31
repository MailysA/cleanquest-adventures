import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  level: 'apprenti' | 'regulier' | 'maitre' | 'sensei';
  className?: string;
}

const levelConfig = {
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