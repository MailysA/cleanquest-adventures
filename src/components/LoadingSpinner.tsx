import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12'
};

export const LoadingSpinner = ({ 
  size = 'md', 
  className, 
  text 
}: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
      <Loader2 className={cn(
        "animate-spin text-primary",
        sizeClasses[size]
      )} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};