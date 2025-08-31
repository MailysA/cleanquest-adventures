import { supabase, TaskTemplateRow, UserTaskRow, UserProfileRow, BadgeRow } from '@/lib/supabase';
import { taskTemplates, mockUserProfile, mockUserTasks, mockBadges, mockUserStats } from '@/data/mockData';

// Service pour injecter les données mockées en base
export class SupabaseService {
  
  // Injecter les templates de tâches
  static async insertTaskTemplates() {
    try {
      const templatesForDB: TaskTemplateRow[] = taskTemplates.map(template => ({
        id: template.id,
        room: template.room,
        title: template.title,
        frequency: template.frequency,
        duration_min: template.durationMin,
        points: template.points,
        condition: template.condition
      }));

      const { data, error } = await supabase
        .from('task_templates')
        .upsert(templatesForDB, { onConflict: 'id' });

      if (error) throw error;
      console.log('✅ Task templates inserted:', data);
      return data;
    } catch (error) {
      console.error('❌ Error inserting task templates:', error);
      throw error;
    }
  }

  // Créer un profil utilisateur
  static async createUserProfile(userId: string) {
    try {
      const profileForDB: Omit<UserProfileRow, 'created_at' | 'updated_at'> = {
        id: `profile_${userId}`,
        user_id: userId,
        housing_type: mockUserProfile.housingType,
        family_status: mockUserProfile.familyStatus,
        has_pets: mockUserProfile.hasPets,
        has_garden: mockUserProfile.hasGarden,
        current_level: mockUserProfile.currentLevel,
        total_points: mockUserStats.totalPoints,
        weekly_points: mockUserStats.weeklyPoints,
        weekly_completion: mockUserStats.weeklyCompletion,
        xp: mockUserStats.xp,
        xp_to_next_level: mockUserStats.xpToNextLevel
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert([profileForDB], { onConflict: 'user_id' });

      if (error) throw error;
      console.log('✅ User profile created:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
  }

  // Injecter les tâches utilisateur
  static async insertUserTasks(userId: string) {
    try {
      const userTasksForDB: Omit<UserTaskRow, 'created_at'>[] = mockUserTasks.map((task, index) => ({
        id: `${userId}_task_${index}`,
        user_id: userId,
        template_id: task.templateId,
        status: task.status,
        last_done_at: task.lastDoneAt?.toISOString(),
        next_due_at: task.nextDueAt.toISOString(),
        points: task.points,
        is_custom: false,
        custom_title: undefined,
        custom_room: undefined,
        custom_duration: undefined
      }));

      const { data, error } = await supabase
        .from('user_tasks')
        .upsert(userTasksForDB, { onConflict: 'id' });

      if (error) throw error;
      console.log('✅ User tasks inserted:', data);
      return data;
    } catch (error) {
      console.error('❌ Error inserting user tasks:', error);
      throw error;
    }
  }

  // Injecter les badges utilisateur
  static async insertUserBadges(userId: string) {
    try {
      const badgesForDB: Omit<BadgeRow, 'created_at'>[] = mockBadges.map((badge, index) => ({
        id: `${userId}_badge_${index}`,
        user_id: userId,
        badge_id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        condition: badge.condition,
        unlocked: badge.unlocked,
        unlocked_at: badge.unlocked ? new Date().toISOString() : undefined
      }));

      const { data, error } = await supabase
        .from('user_badges')
        .upsert(badgesForDB, { onConflict: 'id' });

      if (error) throw error;
      console.log('✅ User badges inserted:', data);
      return data;
    } catch (error) {
      console.error('❌ Error inserting user badges:', error);
      throw error;
    }
  }

  // Fonction principale pour initialiser toutes les données
  static async initializeMockData(userId: string) {
    try {
      console.log('🚀 Starting database initialization...');
      
      // 1. Injecter les templates (données communes)
      await this.insertTaskTemplates();
      
      // 2. Créer le profil utilisateur
      await this.createUserProfile(userId);
      
      // 3. Injecter les tâches utilisateur
      await this.insertUserTasks(userId);
      
      // 4. Injecter les badges utilisateur
      await this.insertUserBadges(userId);
      
      console.log('✅ Database initialization completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  // Récupérer les données utilisateur
  static async getUserData(userId: string) {
    try {
      const [profileResult, tasksResult, badgesResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single(),
        
        supabase
          .from('user_tasks')
          .select(`
            *,
            task_templates (*)
          `)
          .eq('user_id', userId),
        
        supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', userId)
      ]);

      return {
        profile: profileResult.data,
        tasks: tasksResult.data,
        badges: badgesResult.data,
        errors: {
          profile: profileResult.error,
          tasks: tasksResult.error,
          badges: badgesResult.error
        }
      };
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'une tâche
  static async updateTaskStatus(taskId: string, status: 'pending' | 'done' | 'snoozed') {
    try {
      const updates: any = { status };
      
      if (status === 'done') {
        updates.last_done_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('user_tasks')
        .update(updates)
        .eq('id', taskId)
        .select();

      if (error) throw error;
      console.log('✅ Task status updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating task status:', error);
      throw error;
    }
  }

  // Mettre à jour les points utilisateur
  static async updateUserPoints(userId: string, pointsToAdd: number) {
    try {
      // Récupérer le profil actuel
      const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('total_points, weekly_points, xp')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      const newTotalPoints = profile.total_points + pointsToAdd;
      const newWeeklyPoints = profile.weekly_points + pointsToAdd;
      const newXp = profile.xp + pointsToAdd;

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          total_points: newTotalPoints,
          weekly_points: newWeeklyPoints,
          xp: newXp,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();

      if (error) throw error;
      console.log('✅ User points updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating user points:', error);
      throw error;
    }
  }

  // Supprimer une tâche
  static async deleteTask(taskId: string) {
    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .delete()
        .eq('id', taskId)
        .select();

      if (error) throw error;
      console.log('✅ Task deleted:', data);
      return data;
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      throw error;
    }
  }

  // Ajouter une tâche personnalisée
  static async addCustomTask(userId: string, customTask: {
    title: string;
    room: string;
    durationMin: number;
    points: number;
  }) {
    try {
      const taskId = `${userId}_custom_${Date.now()}`;
      
      const newTask = {
        id: taskId,
        user_id: userId,
        template_id: 'custom',
        status: 'pending',
        next_due_at: new Date().toISOString(),
        points: customTask.points,
        is_custom: true,
        custom_title: customTask.title,
        custom_room: customTask.room,
        custom_duration: customTask.durationMin
      };

      const { data, error } = await supabase
        .from('user_tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Custom task added:', data);
      return data;
    } catch (error) {
      console.error('❌ Error adding custom task:', error);
      throw error;
    }
  }
}