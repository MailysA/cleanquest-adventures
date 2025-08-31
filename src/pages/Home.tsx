import { TaskCard } from "@/components/TaskCard";
import { StatsCard } from "@/components/StatsCard";
import { LevelBadge } from "@/components/LevelBadge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AddCustomTaskDialog } from "@/components/AddCustomTaskDialog";
import { useUserTasks } from "@/hooks/useUserTasks";
import { taskTemplates, mockUserStats } from "@/data/mockData";
import { Clock, Trophy, Target, Zap, Plus } from "lucide-react";

export default function Home() {
  const { 
    tasks, 
    templates, 
    loading, 
    completeTask, 
    snoozeTask, 
    deleteTask, 
    addCustomTask,
    canExecuteEarly 
  } = useUserTasks();
  
  const stats = mockUserStats; // Keep using mock stats for now

  // Get tasks due today or can be executed early
  const todayTasks = tasks
    .filter(task => {
      if (task.status !== 'pending') return false;
      
      const template = templates.find(t => t.id === task.templateId);
      if (!template && !task.isCustom) return false;
      
      // Include custom tasks
      if (task.isCustom) return true;
      
      // Include tasks due today
      const today = new Date();
      const taskDate = new Date(task.nextDueAt);
      const isToday = taskDate.toDateString() === today.toDateString();
      
      // Include tasks that can be executed early
      const earlyExecution = template ? canExecuteEarly(task, template) : false;
      
      return isToday || earlyExecution;
    })
    .slice(0, 8); // Limit to 8 tasks for better UX

  const todayDuration = todayTasks.reduce((sum, task) => {
    const template = templates.find(t => t.id === task.templateId);
    return sum + (template?.durationMin || 15); // Default 15min for custom tasks
  }, 0);
  
  const todayPoints = todayTasks.reduce((sum, task) => {
    const template = templates.find(t => t.id === task.templateId);
    return sum + (template?.points || task.points);
  }, 0);

  const mainTask = todayTasks[0];
  const mainTemplate = mainTask ? templates.find(t => t.id === mainTask.templateId) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-primary animate-bounce"></div>
          <p className="text-muted-foreground">Chargement de tes missions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with avatar and level */}
      <div className="gradient-hero text-primary-foreground p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl sm:text-3xl animate-bounce-in">
                🧹
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">Salut, Champion ! 👋</h1>
                <LevelBadge level={stats.currentLevel} className="mt-1" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-sm opacity-90">Points cette semaine</div>
              <div className="text-xl sm:text-2xl font-bold">{stats.weeklyPoints}</div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="bg-white/10 rounded-lg p-3 sm:p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm opacity-90">Progression XP</span>
              <span className="text-xs sm:text-sm opacity-90">{stats.xp}/{stats.xp + stats.xpToNextLevel} XP</span>
            </div>
            <ProgressBar 
              value={stats.xp} 
              max={stats.xp + stats.xpToNextLevel}
              className="bg-white/20"
              variant="default"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 -mt-4 sm:-mt-6">
        {/* Mission du jour */}
        {mainTask && (mainTemplate || mainTask.isCustom) && (
          <Card className="p-4 sm:p-6 mb-6 gradient-card border-2 border-primary/20 shadow-primary animate-slide-up">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold">🎯 Mission du jour</h2>
              {canExecuteEarly(mainTask, mainTemplate) && (
                <Badge className="bg-accent text-accent-foreground text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Exécution anticipée</span>
                  <span className="sm:hidden">Anticipée</span>
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold mb-2 leading-tight">
                  {mainTask.isCustom ? mainTask.customTitle : mainTemplate?.title}
                </h3>
                <div className="flex items-center space-x-3 sm:space-x-4 text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{mainTemplate?.durationMin || 15} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">+{mainTemplate?.points || mainTask.points} pts</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
                <Button 
                  variant="outline"
                  onClick={() => snoozeTask(mainTask.id)}
                  className="text-warning border-warning/20 hover:bg-warning/10 flex-1 sm:flex-none min-h-[44px]"
                  size="sm"
                >
                  <span className="hidden sm:inline">⏸ Snooze</span>
                  <span className="sm:hidden">⏸</span>
                </Button>
                <Button 
                  onClick={() => completeTask(mainTask.id)}
                  className="gradient-primary hover:opacity-90 flex-1 sm:flex-none min-h-[44px]"
                  size="sm"
                >
                  ✅ Fait !
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard
            title="Temps estimé aujourd'hui"
            value={`${todayDuration} min`}
            icon="⏰"
            subtitle={`${todayTasks.length} tâches`}
          />
          <StatsCard
            title="Points à gagner"
            value={`+${todayPoints}`}
            icon="⭐"
            trend="up"
            subtitle="pts disponibles"
          />
          <StatsCard
            title="Complétude hebdo"
            value={`${stats.weeklyCompletion}%`}
            icon="📊"
            trend={stats.weeklyCompletion >= 70 ? 'up' : 'neutral'}
            subtitle={stats.weeklyCompletion >= 70 ? 'Excellent !' : 'En progrès'}
          />
        </div>

        {/* Badge débloqué */}
        {stats.badges.some(b => b.unlocked) && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-accent/20 to-primary/20 border-accent/30 animate-fade-in">
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-accent" />
              <div>
                <h3 className="font-semibold">Badge débloqué !</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {stats.badges.filter(b => b.unlocked).map(badge => (
                    <Badge key={badge.id} className="bg-accent text-accent-foreground">
                      {badge.icon} {badge.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Liste des tâches du jour */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <span>📝 Tâches d'aujourd'hui</span>
              <Badge variant="secondary">{todayTasks.length}</Badge>
            </h2>
            <AddCustomTaskDialog onAddTask={addCustomTask} />
          </div>
          
          <div className="space-y-3">
            {todayTasks.map((task) => {
              const template = templates.find(t => t.id === task.templateId);
              const displayTemplate = template || {
                id: 'custom',
                room: 'Autre',
                title: task.customTitle || 'Tâche personnalisée',
                frequency: 'daily' as const,
                durationMin: 15,
                points: task.points,
                condition: 'none' as const,
                isCustom: true
              };
              
              return (
                <TaskCard
                  key={task.id}
                  task={displayTemplate}
                  userTask={task}
                  status={task.status}
                  onComplete={() => completeTask(task.id)}
                  onSnooze={() => snoozeTask(task.id)}
                  onDelete={() => deleteTask(task.id)}
                  canExecuteEarly={template ? canExecuteEarly(task, template) : false}
                />
              );
            })}
          </div>

          {todayTasks.length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold mb-2">Aucune mission aujourd'hui !</h3>
              <p className="text-muted-foreground mb-4">
                Tu peux te reposer ou ajouter une tâche personnalisée.
              </p>
              <AddCustomTaskDialog onAddTask={addCustomTask} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}