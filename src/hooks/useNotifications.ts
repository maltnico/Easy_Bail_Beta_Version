import { useState, useEffect } from 'react';
import { Alert } from '../types';
import { notificationService } from '../lib/notificationService';

interface UseNotificationsReturn {
  notifications: Alert[];
  unreadCount: number;
  stats: {
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  };
  loading: boolean;
  error: string | null;
  addNotification: (notification: Omit<Alert, 'id' | 'createdAt' | 'read'>) => Alert;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
  deleteReadNotifications: () => void;
  refreshNotifications: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Alert[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    byType: {},
    byPriority: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = () => {
    setLoading(true);
    setError(null);
    
    Promise.all([
      notificationService.getAllNotifications(),
      notificationService.getNotificationStats()
    ]).then(([notificationsResult, statsResult]) => {
      // Vérifier s'il y a des erreurs de connexion
      if (notificationsResult.error || statsResult.error) {
        // Utiliser les données de démonstration en cas d'erreur de connexion
        const demoNotifications = [
          {
            id: '1',
            title: 'Assurance habitation à renouveler',
            message: 'L\'assurance habitation de Marie Martin expire le 15 décembre 2024',
            type: 'warning',
            priority: 'high',
            read: false,
            createdAt: new Date('2024-12-01'),
            actionUrl: '/documents'
          },
          {
            id: '2',
            title: 'Nouveau locataire potentiel',
            message: 'Une demande de visite a été reçue pour le Studio Montmartre',
            type: 'info',
            priority: 'medium',
            read: false,
            createdAt: new Date('2024-11-28')
          },
          {
            id: '3',
            title: 'Quittance générée automatiquement',
            message: 'La quittance de novembre 2024 a été générée et envoyée à Marie Martin',
            type: 'success',
            priority: 'low',
            read: true,
            createdAt: new Date('2024-11-05')
          }
        ];
        
        // Créer des statistiques de démonstration
        const demoStats = {
          total: demoNotifications.length,
          unread: demoNotifications.filter(n => !n.read).length,
          byType: {
            warning: demoNotifications.filter(n => n.type === 'warning').length,
            info: demoNotifications.filter(n => n.type === 'info').length,
            success: demoNotifications.filter(n => n.type === 'success').length,
            error: demoNotifications.filter(n => n.type === 'error').length
          },
          byPriority: {
            high: demoNotifications.filter(n => n.priority === 'high').length,
            medium: demoNotifications.filter(n => n.priority === 'medium').length,
            low: demoNotifications.filter(n => n.priority === 'low').length
          }
        };
        
        setNotifications(demoNotifications);
        setStats(demoStats);
        setError('Impossible de se connecter à la base de données. Affichage des données de démonstration.');
      } else {
        // Utiliser les données réelles si pas d'erreur
        setNotifications(notificationsResult.data);
        setStats(statsResult.data);
      }
      
      setLoading(false);
    }).catch(err => {
      // Cette partie ne devrait plus être atteinte avec la nouvelle structure
      console.error('Erreur lors du chargement des notifications:', err);
      setError('Les tables de base de données ne sont pas encore configurées. Veuillez utiliser le menu d\'administration pour configurer Supabase.');
      setLoading(false);
    });
  };

  const addNotification = (notification: Omit<Alert, 'id' | 'createdAt' | 'read'>): Alert => {
    try {
      // Créer une notification temporaire pour l'UI
      const tempNotification: Alert = {
        ...notification,
        id: 'temp_' + Date.now(),
        createdAt: new Date(),
        read: false
      };
      
      // Mettre à jour l'UI immédiatement
      setNotifications(prev => [tempNotification, ...prev]);
      
      // Envoyer à Supabase et recharger
      notificationService.addNotification(notification).then(() => {
        loadNotifications();
      });
      
      return tempNotification;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la notification');
      throw err;
    }
  };

  const markAsRead = (id: string) => {
    try {
      // Mettre à jour l'UI immédiatement
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      
      // Mettre à jour dans Supabase
      notificationService.markAsRead(id).then(() => {
        loadNotifications();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage comme lu');
    }
  };

  const markAllAsRead = () => {
    try {
      // Mettre à jour l'UI immédiatement
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      // Mettre à jour dans Supabase
      notificationService.markAllAsRead().then(() => {
        loadNotifications();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage global comme lu');
    }
  };

  const deleteNotification = (id: string) => {
    try {
      // Mettre à jour l'UI immédiatement
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // Supprimer dans Supabase
      notificationService.deleteNotification(id).then(() => {
        loadNotifications();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const deleteAllNotifications = () => {
    try {
      // Mettre à jour l'UI immédiatement
      setNotifications([]);
      
      // Supprimer dans Supabase
      notificationService.deleteAllNotifications().then(() => {
        loadNotifications();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression globale');
    }
  };

  const deleteReadNotifications = () => {
    try {
      // Mettre à jour l'UI immédiatement
      setNotifications(prev => prev.filter(n => !n.read));
      
      // Supprimer dans Supabase
      notificationService.deleteReadNotifications().then(() => {
        loadNotifications();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression des notifications lues');
    }
  };

  const refreshNotifications = () => {
    loadNotifications();
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return {
    notifications,
    unreadCount: stats.unread,
    stats,
    loading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    deleteReadNotifications,
    refreshNotifications
  };
};
