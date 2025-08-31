import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning';
}

export const ProgressBar = ({ 
  value, 
  max, 
  className, 
  showLabel = false,
  variant = 'default' 
}: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variantClasses = {
    default: 'gradient-primary',
    success: 'bg-success',
    warning: 'bg-warning'
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-sm text-muted-foreground mt-1">
          <span>{value} XP</span>
          <span>{max} XP</span>
        </div>
      )}
    </div>
  );
};