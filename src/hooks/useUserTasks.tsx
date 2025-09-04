import { useState, useEffect } from 'react';
import { UserTask, TaskTemplate } from '@/types/game';
import { SupabaseService } from '@/services/supabaseService';
import { supabase } from '@/lib/supabase';
import { taskTemplates } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LevelSystem } from '@/lib/levelSystem';

export const useUserTasks = (onLevelUp?: (newLevel: string, oldLevel: string) => void) => {
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>(taskTemplates);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserXP, setCurrentUserXP] = useState<number>(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const loadUserTasks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const userData = await SupabaseService.getUserData(user.id);

      // Charger l'XP de l'utilisateur
      if (userData.profile?.xp !== undefined) {
        setCurrentUserXP(userData.profile.xp);
      }

      if (userData.tasks) {
        const formattedTasks: UserTask[] = userData.tasks
          .filter((task: any) => task.status !== 'deleted') // Exclude deleted tasks
          .map((task: any) => ({
            id: task.id,
            userId: task.user_id,
            templateId: task.template_id,
            status: task.status,
            lastDoneAt: task.last_done_at ? new Date(task.last_done_at) : undefined,
            nextDueAt: new Date(task.next_due_at),
            points: task.points,
            isCustom: task.is_custom || false,
            customTitle: task.custom_title
          }));
        setTasks(formattedTasks);
      }

      // Utiliser les templates filtrés du service au lieu des mocks
      if (userData.templates) {
        const formattedTemplates: TaskTemplate[] = userData.templates.map((template: any) => ({
          id: template.id,
          room: template.room,
          title: template.title,
          frequency: template.frequency,
          durationMin: template.duration_min,
          points: template.points,
          condition: template.condition,
          isCustom: false
        }));
        setTemplates(formattedTemplates);
      }
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      setError(error.message || 'Erreur lors du chargement des tâches');
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger tes tâches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    if (!user) return;

    try {
      const task = tasks.find(t => t.id === taskId);
      const template = templates.find(t => t.id === task?.templateId);

      if (!task || !template) return;

      // Calculer les points et bonus
      const isEarlyExecution = canExecuteEarly(task, template);
      const basePoints = template.points;
      const bonusPoints = isEarlyExecution ? 2 : 0;

      // Obtenir le niveau actuel de l'utilisateur
      const currentLevel = LevelSystem.calculateLevel(currentUserXP);
      const levelBonus = LevelSystem.getLevelBonus(currentLevel);

      const totalPoints = basePoints + bonusPoints + levelBonus;
      const newXP = currentUserXP + totalPoints;

      // Vérifier s'il y a un level up
      const levelUpResult = LevelSystem.checkLevelUp(currentUserXP, newXP);

      // Mettre à jour la base de données
      await SupabaseService.updateTaskStatus(taskId, 'done');
      await SupabaseService.updateUserPoints(user.id, totalPoints);

      // Mettre à jour l'état local
      setTasks(prev => prev.map(t =>
        t.id === taskId
          ? { ...t, status: 'done' as const, lastDoneAt: new Date() }
          : t
      ));

      setCurrentUserXP(newXP);

      // Afficher le toast approprié avec thème kung fu
      if (levelUpResult && onLevelUp) {
        onLevelUp(levelUpResult, currentLevel);
        toast({
          title: "🐉 KUNG FU ÉVOLUÉ ! 🐉",
          description: `Tu es maintenant ${LevelSystem.getLevelConfig(levelUpResult)?.name} ! +${totalPoints} chi`,
        });
      } else if (isEarlyExecution) {
        toast({
          title: "Technique anticipée maîtrisée ! 🥋",
          description: `+${basePoints} chi + ${bonusPoints} bonus + ${levelBonus} pouvoir = ${totalPoints} chi`,
        });
      } else {
        let description = `+${basePoints} chi`;
        if (levelBonus > 0) {
          description += ` + ${levelBonus} pouvoir martial`;
        }
        description += ` = ${totalPoints} chi total`;

        toast({
          title: "Technique maîtrisée ! 🥋",
          description,
        });
      }
    } catch (error: any) {
      console.error('Error completing task:', error);
      toast({
        title: "Erreur",
        description: "Impossible de terminer la tâche",
        variant: "destructive"
      });
    }
  };

  const snoozeTask = async (taskId: string) => {
    try {
      await SupabaseService.updateTaskStatus(taskId, 'snoozed');
      
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, status: 'snoozed' as const }
          : t
      ));

      toast({
        title: "Technique reportée ⏸️",
        description: "Tu t'entraîneras plus tard, maître !",
      });
    } catch (error: any) {
      console.error('Error snoozing task:', error);
      toast({
        title: "Erreur",
        description: "Impossible de reporter la tâche",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await SupabaseService.deleteTask(taskId);

      setTasks(prev => prev.filter(t => t.id !== taskId));

      toast({
        title: "Technique abandonnée",
        description: "Cette technique ne fait plus partie de ton entraînement !",
      });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la tâche",
        variant: "destructive"
      });
    }
  };

  const addCustomTask = async (customTask: {
    title: string;
    room: string;
    durationMin: number;
    points: number;
  }) => {
    if (!user) return;

    try {
      const newTask = await SupabaseService.addCustomTask(user.id, customTask);
      
      if (newTask) {
        // No need to update local state, real-time will handle it
        toast({
          title: "Nouvelle technique créée ! ✨",
          description: `"${customTask.title}" a été ajoutée à ton entraînement`,
        });
      }
    } catch (error: any) {
      console.error('Error adding custom task:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la tâche personnalisée",
        variant: "destructive"
      });
    }
  };

  const canExecuteEarly = (task: UserTask, template?: TaskTemplate) => {
    if (!template) return false;
    
    // Pour les tâches hebdomadaires, on peut les faire dans la semaine courante
    if (template.frequency === 'weekly') {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      return task.nextDueAt >= startOfWeek && task.nextDueAt <= endOfWeek;
    }
    
    return false;
  };

  const addTemplateToToday = async (templateId: string) => {
    if (!user) return;
    
    try {
      const newUserTask = await SupabaseService.addTemplateToToday(user.id, templateId);
      
      if (newUserTask) {
        // No need to refresh manually, real-time will handle it
        toast({
          title: "Tâche ajoutée !",
          description: "La tâche a été ajoutée à ta journée d'aujourd'hui",
        });
      }
    } catch (error) {
      console.error('Error adding template to today:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter cette tâche",
        variant: "destructive"
      });
    }
  };

  const removeFromToday = async (taskId: string) => {
    if (!user) return;
    
    try {
      await SupabaseService.deleteTask(taskId);
      
      // No need to refresh manually, real-time will handle it
      toast({
        title: "Tâche retirée",
        description: "La tâche a été retirée de ta journée",
      });
    } catch (error) {
      console.error('Error removing task from today:', error);
      toast({
        title: "Erreur", 
        description: "Impossible de retirer cette tâche",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadUserTasks();
      
      // Set up real-time subscription for task changes
      const tasksChannel = supabase
        .channel('user-tasks-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_tasks',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time task change:', payload);
            // Refresh tasks when changes occur
            loadUserTasks();
          }
        )
        .subscribe();

      // Set up real-time subscription for profile changes
      const profileChannel = supabase
        .channel('user-profile-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_profiles',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Real-time profile change:', payload);
            // Refresh tasks when profile changes (affects task filtering)
            loadUserTasks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(tasksChannel);
        supabase.removeChannel(profileChannel);
      };
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  return {
    tasks,
    templates,
    loading,
    error,
    currentUserXP,
    completeTask,
    snoozeTask,
    deleteTask,
    addCustomTask,
    addTemplateToToday,
    removeFromToday,
    canExecuteEarly,
    refreshTasks: loadUserTasks
  };
};
