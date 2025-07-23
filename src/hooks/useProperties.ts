import { useState, useEffect } from 'react';
import { Property } from '../types';
import { propertiesApi } from '../lib/properties';
import { activityService } from '../lib/activityService';
import { isCacheValid, getCachedData, cacheData, invalidateCache } from '../utils/useLocalStorage';

interface UsePropertiesReturn {
  properties: Property[];
  loading: boolean;
  error: string | null;
  availableProperties: Property[];
  createProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  refreshProperties: () => Promise<void>;
}

export const useProperties = (): UsePropertiesReturn => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [availableProperties, setAvailableProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clés de cache
  const PROPERTIES_CACHE_KEY = 'easybail_properties_cache';
  const AVAILABLE_PROPERTIES_CACHE_KEY = 'easybail_available_properties_cache';

  const handleSupabaseError = (err: any): string => {
    // Gestion d'erreur générique pour le stockage local
    return err instanceof Error ? err.message : 'Une erreur est survenue';
  };

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);      
      
      try {
        // Vérifier si nous avons des données en cache valides
        if (isCacheValid(PROPERTIES_CACHE_KEY)) {
          const cachedData = getCachedData<Property[]>(PROPERTIES_CACHE_KEY, []);
          setProperties(cachedData);
          
          // Charger les données fraîches en arrière-plan
          propertiesApi.getProperties().then(freshData => {
            setProperties(freshData);
            cacheData(PROPERTIES_CACHE_KEY, freshData);
          }).catch(err => {
            console.warn('Erreur lors du rafraîchissement des biens en arrière-plan:', err);
          });
        } else {
          // Pas de cache valide, charger depuis l'API
          const data = await propertiesApi.getProperties();
          setProperties(data);
          cacheData(PROPERTIES_CACHE_KEY, data);
        }
        
        // Charger aussi les biens disponibles
        if (isCacheValid(AVAILABLE_PROPERTIES_CACHE_KEY)) {
          const cachedAvailableData = getCachedData<Property[]>(AVAILABLE_PROPERTIES_CACHE_KEY, []);
          setAvailableProperties(cachedAvailableData);
        } else {
          const availableData = properties.filter(p => p.status === 'vacant' || p.status === 'maintenance');
          setAvailableProperties(availableData);
          cacheData(AVAILABLE_PROPERTIES_CACHE_KEY, availableData);
        }
      } catch (err) {
        // Si l'erreur est liée à une connexion Supabase, utiliser les données de démonstration
        const message = err?.message || '';
        const status = err?.status || err?.code;
        const numericStatus = typeof status === 'string' ? parseInt(status) : status;
        
        const isConnectionError = 
          message.includes('Failed to fetch') || 
          message.includes('timeout') ||
          message.includes('upstream connect error') ||
          message.includes('signal timed out') ||
          message.includes('connection timeout') ||
          message.includes('disconnect/reset before headers') ||
          message.includes('connect error') ||
          numericStatus === 503 ||
          numericStatus === 500 ||
          numericStatus === 544 ||
          numericStatus === 23; // TimeoutError code
        
        if (isConnectionError) {
          console.warn('Utilisation des données de démonstration pour les biens en raison d\'une erreur de connexion:', message);
          
          // Importer les données de démonstration
          const { mockProperties } = await import('../data/mockData');
          setProperties(mockProperties);
          
          // Filtrer les biens disponibles
          const availableData = mockProperties.filter(p => p.status === 'vacant' || p.status === 'maintenance');
          setAvailableProperties(availableData);
          
          // Définir un message d'erreur informatif
          setError('Impossible de se connecter à la base de données. Affichage des données de démonstration.');
        } else {
          // Pour les autres types d'erreurs
          setError(handleSupabaseError(err));
          console.error('Erreur lors du chargement des biens:', err);
        }
      }
    } catch (err) {
      setError(handleSupabaseError(err));
      console.error('Erreur lors du chargement des biens:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProperty = async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      
      // Invalider les caches
      invalidateCache(PROPERTIES_CACHE_KEY);
      invalidateCache(AVAILABLE_PROPERTIES_CACHE_KEY);
      
      const newProperty = await propertiesApi.createProperty(propertyData);
      setProperties(prev => [newProperty, ...prev]);
      
      // Ajouter une activité
      activityService.addActivity({
        type: 'property',
        action: 'created',
        title: 'Nouveau bien ajouté',
        description: `${newProperty.name} a été ajouté à votre portefeuille`,
        entityId: newProperty.id,
        entityType: 'property',
        entityName: newProperty.name,
        userId: 'current-user',
        metadata: {
          type: newProperty.type,
          rent: newProperty.rent,
          surface: newProperty.surface
        },
        priority: 'medium',
        category: 'success'
      });
      
      // Mettre à jour les biens disponibles si le nouveau bien est vacant
      if (newProperty.status === 'vacant') {
        setAvailableProperties(prev => [newProperty, ...prev]);
      }
    } catch (err) {
      setError(handleSupabaseError(err));
      throw err;
    }
  };

  const updateProperty = async (id: string, propertyData: Partial<Property>) => {
    try {
      setError(null);
      
      // Invalider les caches
      invalidateCache(PROPERTIES_CACHE_KEY);
      invalidateCache(AVAILABLE_PROPERTIES_CACHE_KEY);
      
      const updatedProperty = await propertiesApi.updateProperty(id, propertyData);
      setProperties(prev => prev.map(p => p.id === id ? updatedProperty : p));
      
      // Ajouter une activité
      activityService.addActivity({
        type: 'property',
        action: 'updated',
        title: 'Bien mis à jour',
        description: `${updatedProperty.name} a été modifié`,
        entityId: updatedProperty.id,
        entityType: 'property',
        entityName: updatedProperty.name,
        userId: 'current-user',
        metadata: propertyData,
        priority: 'low',
        category: 'info'
      });
      
      // Mettre à jour les biens disponibles
      if (updatedProperty.status === 'vacant') {
        setAvailableProperties(prev => {
          const exists = prev.find(p => p.id === id);
          if (exists) {
            return prev.map(p => p.id === id ? updatedProperty : p);
          } else {
            return [updatedProperty, ...prev];
          }
        });
      } else {
        setAvailableProperties(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      setError(handleSupabaseError(err));
      throw err;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      setError(null);
      
      // Invalider les caches
      invalidateCache(PROPERTIES_CACHE_KEY);
      invalidateCache(AVAILABLE_PROPERTIES_CACHE_KEY);
      
      const propertyToDelete = properties.find(p => p.id === id);
      await propertiesApi.deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      setAvailableProperties(prev => prev.filter(p => p.id !== id));
      
      // Ajouter une activité
      if (propertyToDelete) {
        activityService.addActivity({
          type: 'property',
          action: 'deleted',
          title: 'Bien supprimé',
          description: `${propertyToDelete.name} a été supprimé de votre portefeuille`,
          entityId: propertyToDelete.id,
          entityType: 'property',
          entityName: propertyToDelete.name,
          userId: 'current-user',
          priority: 'medium',
          category: 'warning'
        });
      }
    } catch (err) {
      setError(handleSupabaseError(err));
      throw err;
    }
  };

  const refreshProperties = async () => {
    await loadProperties();
  };

  useEffect(() => {
    loadProperties();
  }, []);

  return {
    properties,
    availableProperties,
    loading,
    error,
    createProperty,
    updateProperty,
    deleteProperty,
    refreshProperties
  };
};
