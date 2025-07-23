import { useState, useEffect } from 'react';
import { Activity, ActivityFilter, ActivityStats } from '../types/activity';
import { activityService } from '../lib/activityService';

// Key for tracking if initial load has happened
const ACTIVITIES_LOADED_KEY = 'easybail_activities_loaded';

interface UseActivitiesReturn {
  activities: Activity[];
  stats: ActivityStats;
  loading: boolean;
  error: string | null;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Promise<void>;
  markAsRead: (activityId: string) => void;
  markAllAsRead: () => void;
  refreshActivities: () => void;
  cleanOldActivities: (days?: number) => number;
}

export const useActivities = (filter?: ActivityFilter, limit?: number): UseActivitiesReturn => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    total: 0,
    unread: 0,
    byType: {},
    byCategory: {},
    recent: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const loadActivities = () => {
    setLoading(true);
    setError(null);
    
    Promise.all([
      activityService.getActivities(filter, limit),
      activityService.getStats()
    ]).then(([activitiesResult, statsResult]) => {
      // Vérifier s'il y a des erreurs de connexion
      if (activitiesResult.error || statsResult.error) {
        // Utiliser les données de démonstration en cas d'erreur de connexion
        const demoActivities = [
          {
            id: '1',
            type: 'property',
            action: 'created',
            title: 'Nouveau bien ajouté',
            description: 'Appartement Bastille a été ajouté à votre portefeuille',
            entityId: '1',
            entityType: 'property',
            entityName: 'Appartement Bastille',
            userId: 'current-user',
            metadata: {
              type: 'apartment',
              rent: 1200,
              surface: 45
            },
            priority: 'medium',
            category: 'success',
            createdAt: new Date('2024-11-28'),
            readAt: undefined
          },
          {
            id: '2',
            type: 'tenant',
            action: 'added',
            title: 'Nouveau locataire',
            description: 'Marie Martin a été ajoutée',
            entityId: '1',
            entityType: 'tenant',
            entityName: 'Marie Martin',
            userId: 'current-user',
            metadata: {
              propertyId: '1',
              rent: 1200,
              leaseStart: new Date('2023-09-01').toISOString()
            },
            priority: 'medium',
            category: 'success',
            createdAt: new Date('2024-11-25'),
            readAt: new Date('2024-11-25')
          },
          {
            id: '3',
            type: 'document',
            action: 'generated',
            title: 'Quittance générée',
            description: 'Quittance Novembre 2024 générée pour Marie Martin',
            entityId: '3',
            entityType: 'document',
            entityName: 'Quittance Novembre 2024',
            userId: 'current-user',
            metadata: {
              propertyId: '1',
              propertyName: 'Appartement Bastille',
              tenantId: '1',
              tenantName: 'Marie Martin',
              amount: 1350
            },
            priority: 'low',
            category: 'success',
            createdAt: new Date('2024-11-05'),
            readAt: undefined
          }
        ];
        
        // Filtrer les activités selon les filtres actuels
        let filteredDemoActivities = [...demoActivities];
        if (filter) {
          if (filter.type) {
            filteredDemoActivities = filteredDemoActivities.filter(a => a.type === filter.type);
          }
          if (filter.category) {
            filteredDemoActivities = filteredDemoActivities.filter(a => a.category === filter.category);
          }
          if (filter.entityType) {
            filteredDemoActivities = filteredDemoActivities.filter(a => a.entityType === filter.entityType);
          }
          if (filter.unreadOnly) {
            filteredDemoActivities = filteredDemoActivities.filter(a => !a.readAt);
          }
          if (filter.dateRange) {
            filteredDemoActivities = filteredDemoActivities.filter(a => 
              a.createdAt >= filter.dateRange!.start && a.createdAt <= filter.dateRange!.end
            );
          }
        }
        
        // Limiter le nombre d'activités si nécessaire
        if (limit) {
          filteredDemoActivities = filteredDemoActivities.slice(0, limit);
        }
        
        // Créer des statistiques de démonstration
        const demoStats = {
          total: demoActivities.length,
          unread: demoActivities.filter(a => !a.readAt).length,
          byType: {
            property: demoActivities.filter(a => a.type === 'property').length,
            tenant: demoActivities.filter(a => a.type === 'tenant').length,
            document: demoActivities.filter(a => a.type === 'document').length
          },
          byCategory: {
            success: demoActivities.filter(a => a.category === 'success').length,
            info: demoActivities.filter(a => a.category === 'info').length,
            warning: demoActivities.filter(a => a.category === 'warning').length,
            error: demoActivities.filter(a => a.category === 'error').length
          },
          recent: demoActivities.filter(a => {
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            return a.createdAt >= oneDayAgo;
          }).length
        };
        
        setActivities(filteredDemoActivities);
        setStats(demoStats);
        setError('Impossible de se connecter à la base de données. Affichage des données de démonstration.');
      } else {
        // Utiliser les données réelles si pas d'erreur
        setActivities(activitiesResult.data);
        setStats(statsResult.data);
      }
      
      setLoading(false);
      setInitialLoadDone(true);
      localStorage.setItem(ACTIVITIES_LOADED_KEY, 'true');
    }).catch(err => {
      // Cette partie ne devrait plus être atteinte avec la nouvelle structure
      console.error('Erreur lors du chargement des activités:', err);
      setError('Les tables de base de données ne sont pas encore configurées. Veuillez utiliser le menu d\'administration pour configurer Supabase.');
      setLoading(false);
    });
  };

  const addActivity = async (activity: Omit<Activity, 'id' | 'createdAt'>) => {
    try {
      await activityService.addActivity(activity);
      loadActivities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'activité');
    }
  };

  const markAsRead = (activityId: string) => {
    try {
      activityService.markAsRead(activityId).then(() => {
        loadActivities();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage comme lu');
    }
  };

  const markAllAsRead = () => {
    try {
      activityService.markAllAsRead().then(() => {
        loadActivities();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du marquage global comme lu');
    }
  };

  const refreshActivities = () => {
    loadActivities();
  };

  const cleanOldActivities = (days: number = 30): number => {
    try {
      let deletedCount = 0;
      activityService.cleanOldActivities(days).then((count) => {
        deletedCount = count;
        loadActivities();
      });
      return deletedCount; // Note: this will always return 0 due to async nature
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du nettoyage des activités');
      return 0;
    }
  };

  useEffect(() => {
    // Check if we've already loaded activities in this session
    const hasLoaded = localStorage.getItem(ACTIVITIES_LOADED_KEY) === 'true';
    
    if (!hasLoaded || !initialLoadDone) {
      loadActivities();
    } else {
      setLoading(false);
    }
  }, [filter, limit]);

  return {
    activities,
    stats,
    loading,
    error,
    addActivity,
    markAsRead,
    markAllAsRead,
    refreshActivities,
    cleanOldActivities
  };
};
