import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Pause, Trash2, Zap } from "lucide-react";
import { TaskTemplate, UserTask } from "@/types/game";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskTemplate;
  userTask?: UserTask;
  status?: 'pending' | 'done' | 'snoozed';
  onComplete?: () => void;
  onSnooze?: () => void;
  onDelete?: () => void;
  canExecuteEarly?: boolean;
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
  userTask,
  status = 'pending', 
  onComplete, 
  onSnooze, 
  onDelete,
  canExecuteEarly = false,
  className 
}: TaskCardProps) => {
  const isDone = status === 'done';
  const isSnoozed = status === 'snoozed';
  const isCustom = userTask?.isCustom || task.isCustom;
  const displayTitle = userTask?.customTitle || task.title;
  const displayRoom = isCustom ? (userTask as any)?.customRoom || task.room : task.room;

  return (
    <Card className={cn(
      "p-4 transition-smooth hover:shadow-md animate-fade-in",
      isDone && "bg-success/10 border-success/20",
      isSnoozed && "bg-warning/10 border-warning/20",
      canExecuteEarly && status === 'pending' && "border-accent/30 bg-accent/5",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="text-2xl">{getRoomIcon(displayRoom)}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {displayRoom}
              </span>
              {isCustom && (
                <Badge variant="secondary" className="text-xs">
                  ✨ Personnalisée
                </Badge>
              )}
              {canExecuteEarly && status === 'pending' && (
                <Badge className="text-xs bg-accent text-accent-foreground">
                  <Zap className="w-3 h-3 mr-1" />
                  Exécution anticipée
                </Badge>
              )}
              {!isCustom && (
                <>
                  {task.frequency === 'daily' && <span className="text-xs text-accent">Quotidien</span>}
                  {task.frequency === 'weekly' && <span className="text-xs text-info">Hebdo</span>}
                  {task.frequency === 'monthly' && <span className="text-xs text-primary">Mensuel</span>}
                  {task.frequency === 'quarterly' && <span className="text-xs text-success">Trimestriel</span>}
                </>
              )}
            </div>
            <h3 className={cn(
              "font-medium mb-2",
              isDone && "line-through text-muted-foreground"
            )}>
              {displayTitle}
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
          <div className="flex items-center space-x-2 ml-4">
            {onDelete && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={onDelete}
                className="text-destructive border-destructive/20 hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
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
        
        {isSnoozed && (
          <div className="text-warning ml-4">
            <Pause className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
};