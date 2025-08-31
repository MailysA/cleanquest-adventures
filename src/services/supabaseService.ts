import { supabase, TaskTemplateRow, UserTaskRow, UserProfileRow, BadgeRow, checkSupabaseConnection } from '@/lib/supabase';
import { taskTemplates, mockUserProfile, mockUserTasks, mockBadges, mockUserStats } from '@/data/mockData';

// Service pour injecter les données mockées en base
export class SupabaseService {
  
  // Injecter les templates de tâches
  static async insertTaskTemplates() {
    try {
      const client = checkSupabaseConnection();
      const templatesForDB: TaskTemplateRow[] = taskTemplates.map(template => ({
        id: template.id,
        room: template.room,
        title: template.title,
        frequency: template.frequency,
        duration_min: template.durationMin,
        points: template.points,
        condition: template.condition
      }));

      const { data, error } = await client
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
      const client = checkSupabaseConnection();
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

      const { data, error } = await client
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
      const client = checkSupabaseConnection();
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

      const { data, error } = await client
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
      const client = checkSupabaseConnection();
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

      const { data, error } = await client
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

  // Récupérer les données utilisateur avec filtrage des templates selon profil
  static async getUserData(userId: string) {
    try {
      const client = checkSupabaseConnection();
      
      // D'abord récupérer le profil utilisateur pour connaître ses paramètres
      const { data: profile, error: profileError } = await client
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Ensuite récupérer les templates filtrés selon le profil
      let templatesQuery = client.from('task_templates').select('*');
      
      if (profile) {
        // Construire le filtre selon les paramètres utilisateur
        const conditions = [];
        
        // Toujours inclure les tâches sans condition
        conditions.push('condition.eq.none');
        
        // Inclure les tâches pour animaux si l'utilisateur en a
        if (profile.has_pets) {
          conditions.push('condition.eq.petsOnly');
        }
        
        // Inclure les tâches pour jardin si l'utilisateur en a un
        if (profile.has_garden) {
          conditions.push('condition.eq.gardenOnly');
        }
        
        // Appliquer le filtre OR
        templatesQuery = templatesQuery.or(conditions.join(','));
      }

      const [tasksResult, badgesResult, templatesResult] = await Promise.all([
        client
          .from('user_tasks')
          .select('*')
          .eq('user_id', userId),
        
        client
          .from('user_badges')
          .select('*')
          .eq('user_id', userId),
          
        templatesQuery
      ]);

      return {
        profile: profile,
        tasks: tasksResult.data,
        badges: badgesResult.data,
        templates: templatesResult.data,
        errors: {
          profile: profileError,
          tasks: tasksResult.error,
          badges: badgesResult.error,
          templates: templatesResult.error
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
      const client = checkSupabaseConnection();
      const updates: any = { status };
      
      if (status === 'done') {
        updates.last_done_at = new Date().toISOString();
      }

      const { data, error } = await client
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
      const client = checkSupabaseConnection();
      // Récupérer le profil actuel
      const { data: profile, error: fetchError } = await client
        .from('user_profiles')
        .select('total_points, weekly_points, xp')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      const newTotalPoints = profile.total_points + pointsToAdd;
      const newWeeklyPoints = profile.weekly_points + pointsToAdd;
      const newXp = profile.xp + pointsToAdd;

      const { data, error } = await client
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
      const client = checkSupabaseConnection();
      const { data, error } = await client
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
      const client = checkSupabaseConnection();
      const taskId = `${userId}_custom_${Date.now()}`;
      
      const newTask = {
        id: taskId,
        user_id: userId,
        template_id: 'custom',
        title: customTask.title,
        room: customTask.room,
        frequency: 'daily',
        status: 'due',
        points: customTask.points,
        duration_min: customTask.durationMin,
        next_due_at: new Date().toISOString()
      };

      const { data, error } = await client
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

  // Ajouter une tâche template à la journée d'aujourd'hui
  static async addTemplateToToday(userId: string, templateId: string) {
    try {
      const client = checkSupabaseConnection();
      
      // D'abord récupérer le template
      const { data: template, error: templateError } = await client
        .from('task_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      const taskId = `${userId}_template_${templateId}_${Date.now()}`;
      
      const newTask = {
        id: taskId,
        user_id: userId,
        template_id: templateId,
        title: template.title,
        room: template.room,
        frequency: template.frequency,
        status: 'due',
        points: template.points,
        duration_min: template.duration_min,
        next_due_at: new Date().toISOString()
      };

      const { data, error } = await client
        .from('user_tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Template task added to today:', data);
      return data;
    } catch (error) {
      console.error('❌ Error adding template to today:', error);
      throw error;
    }
  }

  // Mettre à jour le profil utilisateur
  static async updateUserProfile(userId: string, updates: {
    has_pets?: boolean;
    has_garden?: boolean;
    home_type?: string;
    family_status?: string;
    display_name?: string;
    avatar_url?: string;
  }) {
    try {
      const client = checkSupabaseConnection();
      const { data, error } = await client
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();

      if (error) throw error;
      console.log('✅ User profile updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating user profile:', error);
      throw error;
    }
  }
}