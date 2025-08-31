import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string | React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend = 'neutral',
  className 
}: StatsCardProps) => {
  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground'
  };

  return (
    <Card className={cn(
      "p-4 gradient-card border-border/50 transition-smooth hover:shadow-md",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className={cn("text-sm", trendColors[trend])}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {icon && (
          <div className="text-2xl ml-3 text-muted-foreground">{icon}</div>
        )}
      </div>
    </Card>
  );
};