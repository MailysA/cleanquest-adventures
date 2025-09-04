import { useState, useEffect } from "react";
import { TaskCard } from "@/components/TaskCard";
import { StatsCard } from "@/components/StatsCard";
import { LevelBadge } from "@/components/LevelBadge";
import { TipsCard } from "@/components/TipsCard";
import { InfoCard } from "@/components/InfoCard";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AddCustomTaskDialog } from "@/components/AddCustomTaskDialog";
import { KungFuWisdom } from "@/components/KungFuWisdom";
import { useUserTasks } from "@/hooks/useUserTasks";
import { useLevelUpNotification } from "@/components/LevelUpNotification";
import { SupabaseService } from "@/services/supabaseService";
import { useAuth } from "@/contexts/AuthContext";
import { taskTemplates, mockUserStats } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { LevelSystem } from "@/lib/levelSystem";
import { Clock, Trophy, Target, Zap, Plus, Pause, Check, Star, BarChart, ClipboardList, User } from "lucide-react";

export default function Home() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const { showLevelUp, LevelUpComponent } = useLevelUpNotification();

  const {
    tasks,
    templates,
    loading,
    currentUserXP,
    completeTask,
    snoozeTask,
    deleteTask,
    addCustomTask,
    addTemplateToToday,
    removeFromToday,
    canExecuteEarly
  } = useUserTasks(showLevelUp);
  const { user } = useAuth();

  useEffect(() => {
    loadUserProfile();
    
    // Set up real-time subscription for profile changes
    if (user) {
      const profileChannel = supabase
        .channel('user-profile-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_profiles',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Profile updated:', payload);
            // Reload profile data when changes are detected
            loadUserProfile();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_tasks',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Tasks updated:', payload);
            // Reload stats when tasks change
            loadUserProfile();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(profileChannel);
      };
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const userData = await SupabaseService.getUserData(user.id);
      if (userData.profile?.avatar_url) {
        setAvatarUrl(userData.profile.avatar_url);
      }

      // Charger aussi les statistiques utilisateur
      const userStats = await SupabaseService.getUserStats(user.id);

      // Utiliser le niveau du profil utilisateur (settings) plutôt que celui calculé
      if (userData.profile?.level_label) {
        userStats.currentLevel = userData.profile.level_label;
      }

      // Ajouter le nom d'affichage de l'utilisateur
      if (userData.profile?.display_name) {
        userStats.displayName = userData.profile.display_name;
      }

      setStats(userStats);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // En cas d'erreur, utiliser les données fictives
      setStats(mockUserStats);
    }
  };

  // Refresh avatar when returning to home page
  useEffect(() => {
    const handleFocus = () => {
      loadUserProfile();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // Get tasks due today or can be executed early
  console.log('Home: All tasks:', tasks);
  console.log('Home: All templates:', templates);
  
  const todayTasks = tasks
    .filter(task => {
      console.log('Home: Filtering task:', task);

      // Exclude deleted tasks
      if (task.status === 'deleted') {
        console.log('Home: Excluding deleted task:', task.id);
        return false;
      }

      const template = templates.find(t => t.id === task.templateId);
      if (!template && !task.isCustom) {
        console.log('Home: No template found and not custom:', task.templateId);
        return false;
      }

      // Include custom tasks that are due
      if (task.isCustom && task.status === 'due') {
        console.log('Home: Including custom task:', task.customTitle);
        return true;
      }

      // Include daily tasks that are due (should appear every day)
      if (template && template.frequency === 'daily' && task.status === 'due') {
        console.log('Home: Including daily task:', template.title);
        return true;
      }

      // For non-daily tasks, only include if status is due
      if (task.status !== 'due') {
        console.log('Home: Task status not due:', task.status);
        return false;
      }

      // For other frequencies, check if due today or can be executed early
      const today = new Date();
      const taskDate = new Date(task.nextDueAt);
      const isToday = taskDate.toDateString() === today.toDateString();

      // Include tasks that can be executed early
      const earlyExecution = template ? canExecuteEarly(task, template) : false;

      console.log('Home: Task check - isToday:', isToday, 'earlyExecution:', earlyExecution, 'frequency:', template?.frequency);

      return isToday || earlyExecution;
    })
    .slice(0, 8); // Limit to 8 tasks for better UX
    
  console.log('Home: Final todayTasks:', todayTasks);

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

  // Utiliser les données fictives si les vraies stats ne sont pas encore chargées
  const displayStats = stats || mockUserStats;

  // Calculer le niveau actuel et la progression avec le nouveau système
  const currentLevel = LevelSystem.calculateLevel(currentUserXP || displayStats.xp);
  const levelConfig = LevelSystem.getLevelConfig(currentLevel);
  const levelProgress = LevelSystem.getLevelProgress(currentUserXP || displayStats.xp);
  const xpToNext = LevelSystem.getXpToNextLevel(currentUserXP || displayStats.xp);
  const character = LevelSystem.getCharacter(currentLevel);

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
    <div className="min-h-screen bg-background overflow-y-auto safe-area-top">
      {/* Header with avatar and level - Fixed at top */}
      <div className="gradient-hero text-primary-foreground p-4 sm:p-6 sticky top-0 z-10 safe-area-top">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 overflow-hidden flex items-center justify-center animate-bounce-in">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight text-white">
                  Salut {displayStats.displayName || user?.email?.split('@')[0] || ''} !
                </h1>
                <LevelBadge level={currentLevel} className="mt-1" showCharacterName={false} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-sm opacity-90">Complétude hebdo</div>
              <div className="text-xl sm:text-2xl font-bold">{displayStats.weeklyCompletion}%</div>
            </div>
          </div>

          {/* XP Progress avec nouveau système */}
          <div className="bg-white/10 rounded-lg p-3 sm:p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs sm:text-sm opacity-90">
                {levelConfig?.nextLevel ? `Vers ${LevelSystem.getLevelConfig(levelConfig.nextLevel)?.name}` : 'Niveau max atteint !'}
              </span>
              <span className="text-xs sm:text-sm opacity-90">
                {LevelSystem.formatXP(currentUserXP || displayStats.xp)} / {LevelSystem.formatXP(levelConfig?.maxXP || 0)} XP
              </span>
            </div>
            <ProgressBar
              value={levelProgress}
              max={100}
              className="bg-white/20"
              variant="default"
            />
            {xpToNext > 0 && (
              <div className="text-xs opacity-75 mt-1">
                Plus que {LevelSystem.formatXP(xpToNext)} XP !
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20 safe-area-bottom">
        {/* Mission du jour */}
        {mainTask && (mainTemplate || mainTask.isCustom) && (
          <Card className="p-4 sm:p-6 mb-6 gradient-card border-2 border-primary/20 shadow-primary animate-slide-up">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-bold">Mission du jour</h2>
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
                  <Pause className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Snooze</span>
                  <span className="sm:hidden">Pause</span>
                </Button>
                <Button 
                  onClick={() => completeTask(mainTask.id)}
                  className="gradient-primary hover:opacity-90 flex-1 sm:flex-none min-h-[44px]"
                  size="sm"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Fait !
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
            icon={<Clock className="w-5 h-5" />}
            subtitle={`${todayTasks.length} tâches`}
          />
          <StatsCard
            title="Points à gagner"
            value={`+${todayPoints}`}
            icon={<Star className="w-5 h-5" />}
            trend="up"
            subtitle="pts disponibles"
          />
          <StatsCard
            title="Points cette semaine"
            value={`${displayStats.weeklyPoints}`}
            icon={<Trophy className="w-5 h-5" />}
            trend="up"
            subtitle="pts gagnés"
          />
        </div>

        {/* Badge débloqué */}
        {displayStats.badges.some(b => b.unlocked) && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-accent/20 to-primary/20 border-accent/30 animate-fade-in">
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-accent" />
              <div>
                <h3 className="font-semibold">Badge débloqué !</h3>
                <div className="flex items-center space-x-2 mt-1">
                  {displayStats.badges.filter(b => b.unlocked).map(badge => (
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
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <ClipboardList className="w-5 h-5" />
              <span>Tâches d'aujourd'hui</span>
              <Badge variant="secondary">{todayTasks.length}</Badge>
            </h2>
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

          <div className="mb-6">
          {todayTasks.length === 0 && (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aucune mission aujourd'hui !</h3>
              <p className="text-muted-foreground mb-4">
                Tu peux te reposer ou ajouter une tâche personnalisée.
              </p>
              <AddCustomTaskDialog onAddTask={addCustomTask} />
            </Card>
          )}
          </div>
        </div>

        {/* Sagesse kung fu et conseils */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <Star className="w-5 h-5 text-accent" />
              <span>Sagesse du Dojo</span>
            </h2>
          </div>

          {/* Version mobile - Stack vertical */}
          <div className="md:hidden space-y-4">
            <KungFuWisdom variant="daily" />
            <TipsCard />
          </div>

          {/* Version desktop - Scroll horizontal */}
          <div className="hidden md:block overflow-x-auto pb-4 -mx-4 px-4 scroll-snap-x">
            <div className="flex space-x-4 min-w-max">
              <div className="w-80 flex-shrink-0 scroll-snap-start">
                <KungFuWisdom variant="daily" />
              </div>
              <div className="w-80 flex-shrink-0 scroll-snap-start">
                <TipsCard />
              </div>
              <div className="w-80 flex-shrink-0 scroll-snap-start">
                <InfoCard />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Level Up Notification */}
      {LevelUpComponent}
    </div>
  );
}
