import { Activity, ActivityFilter, ActivityStats } from '../types/activity';
import { supabase } from './supabase';

// Type pour les résultats structurés
type ServiceResult<T> = {
  data: T;
  error: Error | null;
};

// Helper function to handle Supabase errors gracefully
const handleSupabaseError = (error: any, operation: string): boolean => {
  // Extract error properties safely
  const message = error?.message || '';
  const status = error?.status || error?.code;
  const numericStatus = typeof status === 'string' ? parseInt(status) : status;
  
  const isConnectionError = 
    message.includes('Failed to fetch') || 
    message.includes('timeout') ||
    message.includes('upstream connect error') ||
    message.includes('signal timed out') ||
    message.includes('connection timeout') ||
    message.includes('disconnect/reset before headers') ||
    numericStatus === 503 ||
    numericStatus === 500 ||
    numericStatus === 544 ||
    numericStatus === 23; // TimeoutError code

  if (isConnectionError) {
    console.warn(`Supabase connection issue during ${operation}:`, error.message || error);
  } else if (error?.code === '42P01') {
    console.warn(`Table does not exist during ${operation}. Please run database migrations.`);
  } else {
    console.error(`Error during ${operation}:`, error);
  }
  
  return isConnectionError;
};

// Convertir une activité de la base de données en type Activity
const convertActivityFromDB = (activity: any): Activity => {
  return {
    id: activity.id,
    type: activity.type,
    action: activity.action,
    title: activity.title,
    description: activity.description,
    entityId: activity.entity_id,
    entityType: activity.entity_type,
    entityName: activity.entity_name,
    userId: activity.user_id,
    metadata: activity.metadata,
    createdAt: new Date(activity.created_at),
    readAt: activity.read_at ? new Date(activity.read_at) : undefined,
    priority: activity.priority,
    category: activity.category
  };
};

class ActivityService {
  private activities: Activity[] = [];

  constructor() {
    // Les activités seront chargées à la demande depuis Supabase
  }

  // Ajouter une nouvelle activité
  async addActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        console.warn('User not connected, cannot log activity');
        // Return a mock activity for offline mode
        return {
          id: 'offline_' + Date.now(),
          ...activity,
          createdAt: new Date()
        };
      }
      
      // Préparer les données pour Supabase
      const activityInsert = {
        type: activity.type,
        action: activity.action,
        title: activity.title,
        description: activity.description,
        entity_id: activity.entityId,
        entity_type: activity.entityType,
        entity_name: activity.entityName,
        user_id: userData.user.id,
        metadata: activity.metadata,
        priority: activity.priority,
        category: activity.category,
        read_at: null
      };
      
      const { data, error } = await supabase
        .from('activities')
        .insert(activityInsert)
        .select()
        .single();
      
      if (error) throw error;
      
      return convertActivityFromDB(data);
    } catch (error) {
      console.warn('Could not save activity to database:', error);
      // Return a mock activity for offline mode
      return {
        id: 'offline_' + Date.now(),
        ...activity,
        createdAt: new Date()
      };
    }
  }

  // Récupérer les activités avec filtres
  async getActivities(filter?: ActivityFilter, limit?: number): Promise<ServiceResult<Activity[]>> {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
                                  !supabaseUrl.includes('your-project-id') && 
                                  !supabaseAnonKey.includes('your-anon-key');
      
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured for activities. Using mock data.');
        return { data: [], error: null };
      }
      
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        console.warn('Utilisateur non connecté');
        return { data: [], error: null };
      }
      
      // Construire la requête
      let query = supabase
        .from('activities')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });
      
      // Appliquer les filtres
      if (filter) {
        if (filter.type) {
          query = query.eq('type', filter.type);
        }
        if (filter.category) {
          query = query.eq('category', filter.category);
        }
        if (filter.entityType) {
          query = query.eq('entity_type', filter.entityType);
        }
        if (filter.unreadOnly) {
          query = query.is('read_at', null);
        }
        if (filter.dateRange) {
          query = query
            .gte('created_at', filter.dateRange.start.toISOString())
            .lte('created_at', filter.dateRange.end.toISOString());
        }
      }
      
      // Appliquer la limite
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        handleSupabaseError(error, 'getActivities');
        return { data: [], error: null };
      }
      
      return { data: (data || []).map(activity => convertActivityFromDB(activity)), error: null };
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'getActivities');
      if (isConnectionError) {
        return { data: [], error: error as Error }; // Return connection errors instead of throwing
      }
      return { data: [], error: null };
    }
  }

  // Marquer une activité comme lue
  async markAsRead(activityId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ read_at: new Date().toISOString() })
        .eq('id', activityId);
      
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'markAsRead');
      throw error;
    }
  }

  // Marquer toutes les activités comme lues
  async markAllAsRead(): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      const { error } = await supabase
        .from('activities')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', userData.user.id)
        .is('read_at', null);
      
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, 'markAllAsRead');
      throw error;
    }
  }

  // Obtenir les statistiques
  async getStats(): Promise<ServiceResult<ActivityStats>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        console.warn('Utilisateur non connecté pour les statistiques');
        return { data: {
          total: 0,
          unread: 0,
          byType: {},
          byCategory: {},
          recent: 0
        }, error: null };
      }
      
      // Récupérer le nombre total d'activités
      const { count: total, error: totalError } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.user.id);
      
      if (totalError) {
        handleSupabaseError(totalError, 'getStats - total count');
        return { data: {
          total: 0,
          unread: 0,
          byType: {},
          byCategory: {},
          recent: 0
        }, error: null };
      }
      
      // Récupérer le nombre d'activités non lues
      const { count: unread, error: unreadError } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.user.id)
        .is('read_at', null);
      
      if (unreadError) {
        handleSupabaseError(unreadError, 'getStats - unread count');
        return { data: {
          total: total || 0,
          unread: 0,
          byType: {},
          byCategory: {},
          recent: 0
        }, error: null };
      }
      
      // Récupérer le nombre d'activités récentes (24h)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: recent, error: recentError } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.user.id)
        .gte('created_at', yesterday.toISOString());
      
      if (recentError) {
        handleSupabaseError(recentError, 'getStats - recent count');
        return { data: {
          total: total || 0,
          unread: unread || 0,
          byType: {},
          byCategory: {},
          recent: 0
        }, error: null };
      }
      
      // Récupérer les statistiques par type et catégorie
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('type, category')
        .eq('user_id', userData.user.id);
      
      if (activitiesError) {
        handleSupabaseError(activitiesError, 'getStats - activities for stats');
        return { data: {
          total: total || 0,
          unread: unread || 0,
          byType: {},
          byCategory: {},
          recent: recent || 0
        }, error: null };
      }
      
      const byType: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      
      activities?.forEach(activity => {
        byType[activity.type] = (byType[activity.type] || 0) + 1;
        byCategory[activity.category] = (byCategory[activity.category] || 0) + 1;
      });
      
      return { data: {
        total: total || 0,
        unread: unread || 0,
        byType,
        byCategory,
        recent: recent || 0
      }, error: null };
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'getStats');
      if (isConnectionError) {
        return { data: {
          total: 0,
          unread: 0,
          byType: {},
          byCategory: {},
          recent: 0
        }, error: error as Error }; // Return connection errors instead of throwing
      }
      return { data: {
        total: 0,
        unread: 0,
        byType: {},
        byCategory: {},
        recent: 0
      }, error: null };
    }
  }

  // Supprimer les anciennes activités
  async cleanOldActivities(daysToKeep: number = 30): Promise<number> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      // Compter les activités à supprimer
      const { count, error: countError } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.user.id)
        .lt('created_at', cutoffDate.toISOString());
      
      if (countError) throw countError;
      
      // Supprimer les activités
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('user_id', userData.user.id)
        .lt('created_at', cutoffDate.toISOString());
      
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'cleanOldActivities');
      if (isConnectionError) {
        throw error; // Re-throw connection errors
      }
      return 0;
    }
  }
}

export const activityService = new ActivityService();
