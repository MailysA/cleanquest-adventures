import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, Clock, Pause, Trash2, Zap, Plus, X, Home, ChefHat, Bed, Bath, TreePine, Shirt } from "lucide-react";
import { TaskTemplate, UserTask } from "@/types/game";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskTemplate;
  userTask?: UserTask;
  status?: 'due' | 'done' | 'snoozed' | 'deleted';
  onComplete?: () => void;
  onSnooze?: () => void;
  onDelete?: () => void;
  onAddToToday?: () => void;
  onRemoveFromToday?: () => void;
  canExecuteEarly?: boolean;
  className?: string;
}

const getRoomIcon = (room: string) => {
  switch (room) {
    case 'Cuisine': return <ChefHat className="w-6 h-6" />;
    case 'Salon': return <Home className="w-6 h-6" />;
    case 'Salle de bain': return <Bath className="w-6 h-6" />;
    case 'WC': return <Bath className="w-6 h-6" />;
    case 'Chambre': return <Bed className="w-6 h-6" />;
    case 'Jardin': return <TreePine className="w-6 h-6" />;
    case 'Buanderie': return <Shirt className="w-6 h-6" />;
    default: return <Home className="w-6 h-6" />;
  }
};

export const TaskCard = ({ 
  task, 
  userTask,
  status = 'due', 
  onComplete, 
  onSnooze, 
  onDelete,
  onAddToToday,
  onRemoveFromToday,
  canExecuteEarly = false,
  className 
}: TaskCardProps) => {
  const isDone = status === 'done';
  const isSnoozed = status === 'snoozed';
  const isDeleted = status === 'deleted';
  const isCustom = userTask?.isCustom || task.isCustom;
  const displayTitle = userTask?.customTitle || task.title;
  const displayRoom = isCustom ? (userTask as any)?.customRoom || task.room : task.room;
  const hasUserTask = !!userTask;

  return (
    <TooltipProvider>
      <Card className={cn(
        "p-4 transition-smooth hover:shadow-md animate-fade-in",
        isDone && "bg-success/10 border-success/20",
        isSnoozed && "bg-warning/10 border-warning/20",
        isDeleted && "bg-muted/30 border-muted opacity-50",
        canExecuteEarly && status === 'due' && "border-accent/30 bg-accent/5",
        className
      )}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="text-muted-foreground">{getRoomIcon(displayRoom)}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {displayRoom}
                </span>
                {isCustom && (
                  <Badge variant="secondary" className="text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Personnalisée
                  </Badge>
                )}
                {canExecuteEarly && status === 'due' && (
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
                    {task.frequency === 'yearly' && <span className="text-xs text-warning">Annuel</span>}
                  </>
                )}
              </div>
              <h3 className={cn(
                "font-medium mb-2",
                isDone && "line-through text-muted-foreground",
                isDeleted && "line-through text-muted-foreground/60"
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
          
          {/* Actions pour tâches actives (avec userTask) */}
          {hasUserTask && (status === 'due' || status === 'snoozed') && (
            <div className="flex items-center space-x-2 ml-4">
              {onDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={onDelete}
                      className="text-destructive border-destructive/20 hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Supprimer définitivement cette tâche</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {status === 'due' && onSnooze && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={onSnooze}
                      className="text-warning border-warning/20 hover:bg-warning/10"
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reporter à plus tard</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {status === 'due' && onComplete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={onComplete}
                      className="gradient-primary text-primary-foreground hover:opacity-90"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Marquer comme terminé</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* Actions pour templates sans userTask */}
          {!hasUserTask && (
            <div className="flex items-center space-x-2 ml-4">
              {onAddToToday && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={onAddToToday}
                      className="text-primary border-primary/20 hover:bg-primary/10"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Ajouter aujourd'hui</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ajouter à la liste d'aujourd'hui</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          )}

          {/* Action pour retirer des tâches d'aujourd'hui */}
          {hasUserTask && task.frequency !== 'daily' && status === 'due' && onRemoveFromToday && (
            <div className="flex items-center space-x-2 ml-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={onRemoveFromToday}
                    className="text-muted-foreground border-border hover:bg-muted/50"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Retirer</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Retirer de la liste d'aujourd'hui</p>
                </TooltipContent>
              </Tooltip>
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
          
          {isDeleted && (
            <div className="text-muted-foreground ml-4 opacity-60">
              <Trash2 className="w-6 h-6" />
            </div>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
};