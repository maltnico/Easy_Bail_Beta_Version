import { Alert } from '../types';
import { activityService } from './activityService';
import { supabase } from './supabase';

// Type pour les résultats structurés
type ServiceResult<T> = {
  data: T;
  error: Error | null;
};

// Helper function to handle Supabase errors gracefully
const handleSupabaseError = (error: any, operation: string): void => {
  if (error?.message?.includes('Failed to fetch') || 
      error?.message?.includes('timeout') ||
      error?.message?.includes('upstream connect error') ||
      error?.message?.includes('signal timed out') ||
      error?.code === 23 || // TimeoutError code
      error?.code === '503' ||
      error?.code === '500' ||
      error?.code === '544' ||
      error?.status === 503 ||
      error?.status === 500 ||
      error?.status === 544) {
    console.warn(`Supabase connection issue during ${operation}:`, error.message || error);
  } else if (error?.code === '42P01') {
    console.warn(`Table does not exist during ${operation}. Please run database migrations.`);
  } else {
    console.error(`Error during ${operation}:`, error);
  }
};

// Convertir une notification de la base de données en type Alert
const convertNotificationFromDB = (notification: any): Alert => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    priority: notification.priority,
    read: notification.read,
    createdAt: new Date(notification.created_at),
    actionUrl: notification.action_url
  };
};

class NotificationService {
  private notifications: Alert[] = [];

  constructor() {
    // Les notifications seront chargées à la demande depuis Supabase
  }

  // Récupérer toutes les notifications
  async getAllNotifications(): Promise<ServiceResult<Alert[]>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        console.warn('Utilisateur non connecté');
        return { data: [], error: null };
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        handleSupabaseError(error, 'getAllNotifications');
        return { data: [], error: null };
      }
      
      return { data: (data || []).map(notification => convertNotificationFromDB(notification)), error: null };
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'getAllNotifications');
      if (isConnectionError) {
        return { data: [], error: error as Error }; // Return connection errors instead of throwing
      }
      return { data: [], error: null };
    }
  }

  // Récupérer les notifications non lues
  async getUnreadNotifications(): Promise<ServiceResult<Alert[]>> {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
                                  !supabaseUrl.includes('your-project-id') && 
                                  !supabaseAnonKey.includes('your-anon-key');
      
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured for notifications. Using mock data.');
        return { data: [], error: null };
      }
      
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        console.warn('Utilisateur non connecté');
        return { data: [], error: null };
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('read', false)
        .order('created_at', { ascending: false });
      
      if (error) {
        handleSupabaseError(error, 'getUnreadNotifications');
        return { data: [], error: null };
      }
      
      return { data: (data || []).map(notification => convertNotificationFromDB(notification)), error: null };
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'getUnreadNotifications');
      if (isConnectionError) {
        return { data: [], error: error as Error }; // Return connection errors instead of throwing
      }
      return { data: [], error: null };
    }
  }

  // Récupérer les notifications par type
  async getNotificationsByType(type: string): Promise<ServiceResult<Alert[]>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('type', type)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { data: (data || []).map(notification => convertNotificationFromDB(notification)), error: null };
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'getNotificationsByType');
      if (isConnectionError) {
        return { data: [], error: error as Error }; // Return connection errors instead of throwing
      }
      return { data: [], error: null };
    }
  }

  // Récupérer les notifications par priorité
  async getNotificationsByPriority(priority: string): Promise<ServiceResult<Alert[]>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('priority', priority)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return { data: (data || []).map(notification => convertNotificationFromDB(notification)), error: null };
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'getNotificationsByPriority');
      if (isConnectionError) {
        return { data: [], error: error as Error }; // Return connection errors instead of throwing
      }
      return { data: [], error: null };
    }
  }

  // Ajouter une nouvelle notification
  async addNotification(notification: Omit<Alert, 'id' | 'createdAt' | 'read'>): Promise<Alert> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Préparer les données pour Supabase
      const notificationInsert = {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        read: false,
        action_url: notification.actionUrl,
        user_id: userData.user.id
      };
      
      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationInsert)
        .select()
        .single();
      
      if (error) throw error;
      
      // Ajouter une activité correspondante
      await activityService.addActivity({
        type: 'system',
        action: 'notification',
        title: 'Nouvelle notification',
        description: notification.title,
        userId: userData.user.id,
        priority: notification.priority,
        category: this.mapTypeToCategory(notification.type)
      });
      
      return convertNotificationFromDB(data);
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'addNotification');
      if (isConnectionError) {
        throw error; // Re-throw connection errors
      }
      throw error;
    }
  }

  // Marquer une notification comme lue
  async markAsRead(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'markAsRead');
      if (isConnectionError) {
        throw error; // Re-throw connection errors
      }
      throw error;
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userData.user.id)
        .eq('read', false);
      
      if (error) throw error;
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'markAllAsRead');
      if (isConnectionError) {
        throw error; // Re-throw connection errors
      }
      throw error;
    }
  }

  // Supprimer une notification
  async deleteNotification(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'deleteNotification');
      if (isConnectionError) {
        throw error; // Re-throw connection errors
      }
      throw error;
    }
  }

  // Supprimer toutes les notifications
  async deleteAllNotifications(): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userData.user.id);
      
      if (error) throw error;
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'deleteAllNotifications');
      if (isConnectionError) {
        throw error; // Re-throw connection errors
      }
      throw error;
    }
  }

  // Supprimer les notifications lues
  async deleteReadNotifications(): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userData.user.id)
        .eq('read', true);
      
      if (error) throw error;
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'deleteReadNotifications');
      if (isConnectionError) {
        throw error; // Re-throw connection errors
      }
      throw error;
    }
  }

  // Obtenir les statistiques des notifications
  async getNotificationStats(): Promise<ServiceResult<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }>> {
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
                                  !supabaseUrl.includes('your-project-id') && 
                                  !supabaseAnonKey.includes('your-anon-key');
      
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured for notification stats. Using mock data.');
        return { data: {
          total: 0,
          unread: 0,
          byType: {},
          byPriority: {}
        }, error: null };
      }
      
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        console.warn('Utilisateur non connecté pour les statistiques de notifications');
        return { data: {
          total: 0,
          unread: 0,
          byType: {},
          byPriority: {}
        }, error: null };
      }
      
      // Récupérer le nombre total de notifications
      const { count: total, error: totalError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.user.id);
      
      if (totalError) {
        handleSupabaseError(totalError, 'getNotificationStats - total count');
        return { data: {
          total: 0,
          unread: 0,
          byType: {},
          byPriority: {}
        }, error: null };
      }
      
      // Récupérer le nombre de notifications non lues
      const { count: unread, error: unreadError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.user.id)
        .eq('read', false);
      
      if (unreadError) {
        handleSupabaseError(unreadError, 'getNotificationStats - unread count');
        return { data: {
          total: total || 0,
          unread: 0,
          byType: {},
          byPriority: {}
        }, error: null };
      }
      
      // Récupérer les statistiques par type et priorité
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('type, priority')
        .eq('user_id', userData.user.id);
      
      if (notificationsError) {
        handleSupabaseError(notificationsError, 'getNotificationStats - notifications for stats');
        return { data: {
          total: total || 0,
          unread: unread || 0,
          byType: {},
          byPriority: {}
        }, error: null };
      }
      
      const byType: Record<string, number> = {};
      const byPriority: Record<string, number> = {};
      
      notifications?.forEach(notification => {
        byType[notification.type] = (byType[notification.type] || 0) + 1;
        byPriority[notification.priority] = (byPriority[notification.priority] || 0) + 1;
      });
      
      return { data: {
        total: total || 0,
        unread: unread || 0,
        byType,
        byPriority
      }, error: null };
    } catch (error) {
      handleSupabaseError(error, 'getNotificationStats');
      return { data: {
        total: 0,
        unread: 0,
        byType: {},
        byPriority: {}
      }, error: null };
    }
  }

  // Mapper le type de notification vers une catégorie d'activité
  private mapTypeToCategory(type: string): 'success' | 'warning' | 'error' | 'info' {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  }
}

export const notificationService = new NotificationService();
