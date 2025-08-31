import { useState, useEffect } from 'react';
import { UserTask, TaskTemplate } from '@/types/game';
import { SupabaseService } from '@/services/supabaseService';
import { supabase } from '@/lib/supabase';
import { taskTemplates } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

export const useUserTasks = () => {
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>(taskTemplates);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadUserTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userData = await SupabaseService.getUserData(user.id);
      if (userData.tasks) {
        const formattedTasks: UserTask[] = userData.tasks.map((task: any) => ({
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
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      await SupabaseService.updateTaskStatus(taskId, 'done');
      
      const task = tasks.find(t => t.id === taskId);
      const template = templates.find(t => t.id === task?.templateId);
      
      if (task && template) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await SupabaseService.updateUserPoints(user.id, template.points);
        }
        
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, status: 'done' as const, lastDoneAt: new Date() }
            : t
        ));

        toast({
          title: "Tâche terminée ! 🎉",
          description: `+${template.points} points gagnés`,
        });
      }
    } catch (error) {
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
        title: "Tâche reportée ⏸️",
        description: "Tu pourras la faire plus tard !",
      });
    } catch (error) {
      console.error('Error snoozing task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await SupabaseService.deleteTask(taskId);
      
      setTasks(prev => prev.filter(t => t.id !== taskId));

      toast({
        title: "Tâche supprimée",
        description: "Cette tâche ne t'embêtera plus !",
      });
    } catch (error) {
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newTask = await SupabaseService.addCustomTask(user.id, customTask);
      
      if (newTask) {
        const formattedTask: UserTask = {
          id: newTask.id,
          userId: newTask.user_id,
          templateId: 'custom',
          status: 'pending',
          nextDueAt: new Date(),
          points: newTask.points,
          isCustom: true,
          customTitle: newTask.custom_title
        };
        
        setTasks(prev => [...prev, formattedTask]);

        toast({
          title: "Tâche ajoutée ! ✨",
          description: `"${customTask.title}" a été ajoutée à tes missions`,
        });
      }
    } catch (error) {
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

  useEffect(() => {
    loadUserTasks();
  }, []);

  return {
    tasks,
    templates,
    loading,
    completeTask,
    snoozeTask,
    deleteTask,
    addCustomTask,
    canExecuteEarly,
    refreshTasks: loadUserTasks
  };
};