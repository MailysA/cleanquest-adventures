import { useState, useEffect } from "react";
import { TaskCard } from "@/components/TaskCard";
import { StatsCard } from "@/components/StatsCard";
import { LevelBadge } from "@/components/LevelBadge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { taskTemplates, mockUserTasks, mockUserStats } from "@/data/mockData";
import { TaskTemplate, UserTask, UserStats } from "@/types/game";
import { Clock, Trophy, Target, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [userTasks, setUserTasks] = useState<UserTask[]>(mockUserTasks);
  const [stats, setStats] = useState<UserStats>(mockUserStats);
  const { toast } = useToast();

  // Get tasks due today
  const todayTasks = userTasks
    .filter(task => task.status === 'pending')
    .map(userTask => {
      const template = taskTemplates.find(t => t.id === userTask.templateId);
      return { userTask, template };
    })
    .filter(item => item.template)
    .slice(0, 5); // Limit to 5 tasks for demo

  const todayDuration = todayTasks.reduce((sum, item) => sum + (item.template?.durationMin || 0), 0);
  const todayPoints = todayTasks.reduce((sum, item) => sum + (item.template?.points || 0), 0);

  const handleCompleteTask = (taskId: string) => {
    setUserTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'done' as const, lastDoneAt: new Date() }
        : task
    ));
    
    const task = userTasks.find(t => t.id === taskId);
    const template = taskTemplates.find(t => t.id === task?.templateId);
    
    if (template) {
      setStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints + template.points,
        weeklyPoints: prev.weeklyPoints + template.points,
        xp: prev.xp + template.points
      }));

      toast({
        title: "Tâche terminée ! 🎉",
        description: `+${template.points} points gagnés`,
      });
    }
  };

  const handleSnoozeTask = (taskId: string) => {
    setUserTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'snoozed' as const }
        : task
    ));

    toast({
      title: "Tâche reportée ⏸️",
      description: "Tu pourras la faire plus tard !",
    });
  };

  const mainTask = todayTasks[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with avatar and level */}
      <div className="gradient-hero text-primary-foreground p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl animate-bounce-in">
                🧹
              </div>
              <div>
                <h1 className="text-2xl font-bold">Salut, Champion ! 👋</h1>
                <LevelBadge level={stats.currentLevel} className="mt-1" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Points cette semaine</div>
              <div className="text-2xl font-bold">{stats.weeklyPoints}</div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm opacity-90">Progression XP</span>
              <span className="text-sm opacity-90">{stats.xp}/{stats.xp + stats.xpToNextLevel} XP</span>
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

      <div className="max-w-4xl mx-auto p-6 -mt-6">
        {/* Mission du jour */}
        {mainTask && (
          <Card className="p-6 mb-6 gradient-card border-2 border-primary/20 shadow-primary animate-slide-up">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">🎯 Mission du jour</h2>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{mainTask.template?.title}</h3>
                <div className="flex items-center space-x-4 text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{mainTask.template?.durationMin} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>+{mainTask.template?.points} pts</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => handleSnoozeTask(mainTask.userTask.id)}
                  className="text-warning border-warning/20 hover:bg-warning/10"
                >
                  ⏸ Snooze
                </Button>
                <Button 
                  onClick={() => handleCompleteTask(mainTask.userTask.id)}
                  className="gradient-primary hover:opacity-90"
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
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <span>📝 Tâches d'aujourd'hui</span>
            <Badge variant="secondary">{todayTasks.length}</Badge>
          </h2>
          
          <div className="space-y-3">
            {todayTasks.map(({ userTask, template }) => (
              template && (
                <TaskCard
                  key={userTask.id}
                  task={template}
                  status={userTask.status}
                  onComplete={() => handleCompleteTask(userTask.id)}
                  onSnooze={() => handleSnoozeTask(userTask.id)}
                />
              )
            ))}
          </div>

          {todayTasks.length === 0 && (
            <Card className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold mb-2">Toutes tes tâches sont terminées !</h3>
              <p className="text-muted-foreground">Profite de ta journée, champion !</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}