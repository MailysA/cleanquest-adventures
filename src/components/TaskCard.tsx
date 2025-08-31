import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Clock, Pause } from "lucide-react";
import { TaskTemplate } from "@/types/game";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskTemplate;
  status?: 'pending' | 'done' | 'snoozed';
  onComplete?: () => void;
  onSnooze?: () => void;
  className?: string;
}

const getRoomIcon = (room: string) => {
  switch (room) {
    case 'Cuisine': return '🍽️';
    case 'Salon': return '🛋️';
    case 'Salle de bain': return '🚿';
    case 'WC': return '🚽';
    case 'Chambre': return '🛏️';
    case 'Jardin': return '🌳';
    case 'Buanderie': return '🧺';
    default: return '🏠';
  }
};

export const TaskCard = ({ 
  task, 
  status = 'pending', 
  onComplete, 
  onSnooze, 
  className 
}: TaskCardProps) => {
  const isDone = status === 'done';
  const isSnoozed = status === 'snoozed';

  return (
    <Card className={cn(
      "p-4 transition-smooth hover:shadow-md animate-fade-in",
      isDone && "bg-success/10 border-success/20",
      isSnoozed && "bg-warning/10 border-warning/20",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="text-2xl">{getRoomIcon(task.room)}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {task.room}
              </span>
              {task.frequency === 'daily' && <span className="text-xs text-accent">Quotidien</span>}
              {task.frequency === 'weekly' && <span className="text-xs text-info">Hebdo</span>}
              {task.frequency === 'monthly' && <span className="text-xs text-primary">Mensuel</span>}
            </div>
            <h3 className={cn(
              "font-medium mb-2",
              isDone && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{task.durationMin} min</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium text-accent">+{task.points} pts</span>
              </div>
            </div>
          </div>
        </div>
        
        {status === 'pending' && (
          <div className="flex space-x-2 ml-4">
            <Button 
              size="sm" 
              variant="outline"
              onClick={onSnooze}
              className="text-warning border-warning/20 hover:bg-warning/10"
            >
              <Pause className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="default"
              onClick={onComplete}
              className="gradient-primary text-primary-foreground hover:opacity-90"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {isDone && (
          <div className="text-success ml-4">
            <CheckCircle className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
};