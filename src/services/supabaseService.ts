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
  static async createUserProfile(userId: string, profileData?: any) {
    try {
      const client = checkSupabaseConnection();
      const profileForDB = {
        user_id: userId,
        home_type: profileData?.home_type || 'apartment',
        family_status: profileData?.family_status || 'single',
        has_pets: profileData?.has_pets || false,
        has_garden: profileData?.has_garden || false,
        level_label: profileData?.level_label || 'apprenti',
        weekly_completion: 0.00,
        xp: 0
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
      
      // Récupérer le profil utilisateur pour filtrer les templates
      const { data: profile } = await client
        .from('user_profiles')
        .select('has_pets, has_garden')
        .eq('user_id', userId)
        .single();

      // Récupérer les templates filtrés selon le profil
      let templatesQuery = client.from('task_templates').select('*');
      
      if (profile) {
        const conditions = ['condition.eq.none'];
        if (profile.has_pets) conditions.push('condition.eq.petsOnly');
        if (profile.has_garden) conditions.push('condition.eq.gardenOnly');
        templatesQuery = templatesQuery.or(conditions.join(','));
      }

      const { data: templates, error: templatesError } = await templatesQuery;
      if (templatesError) throw templatesError;

      // Créer des tâches basées sur les templates
      const userTasksForDB = templates?.slice(0, 5).map((template, index) => ({
        id: `${userId}_task_${index}`,
        user_id: userId,
        template_id: template.id,
        title: template.title,
        room: template.room,
        frequency: template.frequency,
        status: 'due' as const,
        points: template.points,
        duration_min: template.duration_min,
        next_due_at: new Date().toISOString()
      })) || [];

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
      const badgesForDB = mockBadges.slice(0, 3).map((badge, index) => ({
        id: `${userId}_badge_${index}`,
        user_id: userId,
        badge_code: badge.id,
        title: badge.name,
        description: badge.description,
        level: 1,
        earned_at: badge.unlocked ? new Date().toISOString() : new Date().toISOString()
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
      let { data: profile, error: profileError } = await client
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Si le profil n'existe pas, le créer automatiquement
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Profile not found, creating new profile for user:', userId);
        await this.createUserProfile(userId);
        
        // Récupérer le profil nouvellement créé
        const { data: newProfile, error: newProfileError } = await client
          .from('user_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (newProfileError) throw newProfileError;
        profile = newProfile;
      } else if (profileError) {
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

      // Générer les tâches quotidiennes manquantes pour aujourd'hui
      if (templatesResult.data) {
        await this.generateMissingDailyTasks(userId, templatesResult.data, tasksResult.data || []);
        
        // Recharger les tâches après génération
        const { data: updatedTasks } = await client
          .from('user_tasks')
          .select('*')
          .eq('user_id', userId);
          
        tasksResult.data = updatedTasks;
      }

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

  // Générer les tâches quotidiennes manquantes pour aujourd'hui
  static async generateMissingDailyTasks(userId: string, templates: any[], existingTasks: any[]) {
    try {
      const client = checkSupabaseConnection();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Identifier les templates quotidiens
      const dailyTemplates = templates.filter(template => template.frequency === 'daily');
      
      // Pour chaque template quotidien, vérifier s'il existe une tâche disponible pour aujourd'hui
      const tasksToCreate = [];
      
      for (const template of dailyTemplates) {
        // Chercher une tâche existante pour ce template qui soit disponible aujourd'hui
        const existingTask = existingTasks.find(task => 
          task.template_id === template.id && 
          task.status === 'due' &&
          new Date(task.next_due_at) >= today &&
          new Date(task.next_due_at) < tomorrow
        );
        
        // Si aucune tâche n'existe pour aujourd'hui, en créer une
        if (!existingTask) {
          const newTaskId = `${userId}_template_${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          tasksToCreate.push({
            id: newTaskId,
            user_id: userId,
            template_id: template.id,
            title: template.title,
            room: template.room,
            frequency: template.frequency,
            status: 'due',
            points: template.points,
            duration_min: template.duration_min,
            next_due_at: new Date().toISOString() // Disponible maintenant
          });
        }
      }
      
      // Créer toutes les tâches manquantes en une seule fois
      if (tasksToCreate.length > 0) {
        const { data, error } = await client
          .from('user_tasks')
          .insert(tasksToCreate)
          .select();
          
        if (error) throw error;
        console.log(`✅ Generated ${tasksToCreate.length} missing daily tasks for today:`, data);
      }
      
      return tasksToCreate;
    } catch (error) {
      console.error('❌ Error generating missing daily tasks:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'une tâche
  static async updateTaskStatus(taskId: string, status: 'due' | 'done' | 'snoozed' | 'deleted') {
    try {
      const client = checkSupabaseConnection();
      
      // Si on marque une tâche comme terminée, d'abord récupérer les infos de la tâche
      let taskToUpdate = null;
      if (status === 'done') {
        const { data: taskData, error: fetchError } = await client
          .from('user_tasks')
          .select('*, task_templates(*)')
          .eq('id', taskId)
          .single();
          
        if (fetchError) throw fetchError;
        taskToUpdate = taskData;
      }
      
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
      
      // Si c'est une tâche quotidienne qui vient d'être terminée, créer une nouvelle instance pour demain
      if (status === 'done' && taskToUpdate && taskToUpdate.frequency === 'daily') {
        await this.regenerateDailyTask(taskToUpdate);
      }
      
      console.log('✅ Task status updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating task status:', error);
      throw error;
    }
  }

  // Régénérer une tâche quotidienne pour le jour suivant
  static async regenerateDailyTask(completedTask: any) {
    try {
      const client = checkSupabaseConnection();
      
      // Créer un nouvel ID pour la tâche de demain
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(6, 0, 0, 0); // Programmée pour 6h du matin
      
      const newTaskId = `${completedTask.user_id}_template_${completedTask.template_id}_${Date.now()}`;
      
      const newTask = {
        id: newTaskId,
        user_id: completedTask.user_id,
        template_id: completedTask.template_id,
        title: completedTask.title,
        room: completedTask.room,
        frequency: completedTask.frequency,
        status: 'due',
        points: completedTask.points,
        duration_min: completedTask.duration_min,
        next_due_at: tomorrow.toISOString()
      };

      const { data, error } = await client
        .from('user_tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Daily task regenerated for tomorrow:', data);
      return data;
    } catch (error) {
      console.error('❌ Error regenerating daily task:', error);
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
        .select('xp')
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      const newXp = profile.xp + pointsToAdd;

      const { data, error } = await client
        .from('user_profiles')
        .update({
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
      
      // S'assurer que le profil utilisateur existe
      await this.ensureUserProfileExists(userId);
      
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

  // S'assurer qu'un profil utilisateur existe
  static async ensureUserProfileExists(userId: string) {
    try {
      const client = checkSupabaseConnection();
      
      const { data: profile, error: profileError } = await client
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      // Si le profil n'existe pas, le créer
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Creating missing profile for user:', userId);
        await this.createUserProfile(userId);
      } else if (profileError) {
        throw profileError;
      }
    } catch (error) {
      console.error('❌ Error ensuring user profile exists:', error);
      throw error;
    }
  }

  // Réinitialiser la progression utilisateur
  static async resetUserProgress(userId: string) {
    try {
      const client = checkSupabaseConnection();
      
      // Réinitialiser le profil utilisateur (XP et progression)
      await client
        .from('user_profiles')
        .update({
          xp: 0,
          weekly_completion: 0.00,
          level_label: 'apprenti',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // Remettre toutes les tâches à "due"
      await client
        .from('user_tasks')
        .update({
          status: 'due',
          last_done_at: null,
          snooze_count: 0,
          next_due_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      console.log('✅ User progress reset successfully');
      return true;
    } catch (error) {
      console.error('❌ Error resetting user progress:', error);
      throw error;
    }
  }

  // Calculer les statistiques utilisateur en temps réel
  static async getUserStats(userId: string) {
    try {
      const client = checkSupabaseConnection();
      
      // Récupérer le profil utilisateur
      const { data: profile, error: profileError } = await client
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Récupérer toutes les tâches de l'utilisateur
      const { data: tasks, error: tasksError } = await client
        .from('user_tasks')
        .select('*')
        .eq('user_id', userId);

      if (tasksError) throw tasksError;

      // Calculer les statistiques de la semaine
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Début de semaine (dimanche)
      startOfWeek.setHours(0, 0, 0, 0);

      const weeklyTasks = tasks?.filter(task => {
        if (!task.last_done_at) return false;
        const doneDate = new Date(task.last_done_at);
        return doneDate >= startOfWeek;
      }) || [];

      const weeklyPoints = weeklyTasks.reduce((sum, task) => sum + task.points, 0);
      
      // Calculer la complétude hebdomadaire
      const allTasksThisWeek = tasks?.filter(task => {
        const dueDate = new Date(task.next_due_at);
        return dueDate >= startOfWeek;
      }) || [];
      
      const completedTasksThisWeek = allTasksThisWeek.filter(task => task.status === 'done');
      const weeklyCompletion = allTasksThisWeek.length > 0 
        ? Math.round((completedTasksThisWeek.length / allTasksThisWeek.length) * 100)
        : 0;

      // Calculer le niveau et XP
      const xp = profile.xp || 0;
      const level = this.calculateLevel(xp);
      const xpToNextLevel = this.getXpToNextLevel(xp);

      // Récupérer les badges
      const { data: badges, error: badgesError } = await client
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

      if (badgesError) throw badgesError;

      return {
        totalPoints: xp,
        weeklyPoints,
        weeklyCompletion,
        currentLevel: level,
        xp,
        xpToNextLevel,
        badges: badges?.map(badge => ({
          id: badge.id,
          name: badge.title,
          description: badge.description || '',
          icon: '🏆',
          condition: badge.badge_code,
          unlocked: true
        })) || []
      };
    } catch (error) {
      console.error('❌ Error calculating user stats:', error);
      throw error;
    }
  }

  // Calculer le niveau basé sur l'XP
  private static calculateLevel(xp: number): string {
    if (xp < 100) return 'Apprenti';
    if (xp < 300) return 'Novice';
    if (xp < 600) return 'Adepte';
    if (xp < 1000) return 'Expert';
    if (xp < 1500) return 'Maître';
    return 'Légende';
  }

  // Calculer l'XP nécessaire pour le prochain niveau
  private static getXpToNextLevel(currentXp: number): number {
    const levels = [100, 300, 600, 1000, 1500];
    for (const levelXp of levels) {
      if (currentXp < levelXp) {
        return levelXp - currentXp;
      }
    }
    return 0; // Max level atteint
  }

  // Récupérer les astuces depuis la base avec rotation tous les 5 jours
  static async getTips(limit: number = 6) {
    try {
      const client = checkSupabaseConnection();
      
      // Calculer le cycle actuel basé sur la date (renouvellement tous les 5 jours)
      const startDate = new Date('2025-01-01'); // Date de référence pour commencer les cycles
      const currentDate = new Date();
      const daysDifference = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Chaque cycle dure 5 jours, il y a 12 cycles au total (60 jours = 2 mois)
      const cycleNumber = Math.floor(daysDifference / 5) % 12; // 0 à 11
      
      // Calculer la plage d'astuces pour ce cycle (6 astuces par cycle)
      const startOrder = (cycleNumber * 6) + 1; // +1 car display_order commence à 1
      const endOrder = startOrder + 5; // 6 astuces par cycle
      
      const { data, error } = await client
        .from('tips')
        .select('*')
        .eq('is_active', true)
        .gte('display_order', startOrder)
        .lte('display_order', endOrder)
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching tips:', error);
      throw error;
    }
  }
}