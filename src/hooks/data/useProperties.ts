import { useState, useEffect, useCallback } from 'react';
import { propertyService } from '../../services/database';
import type { Property } from '../../types/entities';
import type { LoadingState } from '../../types/ui';

interface UsePropertiesOptions {
  autoFetch?: boolean;
  filters?: {
    status?: Property['status'];
    type?: Property['type'];
  };
}

export function useProperties(options: UsePropertiesOptions = {}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: undefined,
    lastUpdated: undefined,
  });

  const fetchProperties = useCallback(async () => {
    setLoading(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const response = await propertyService.findAll({
        filters: options.filters,
        orderBy: 'created_at',
        orderDirection: 'desc',
      });

      if (response.success && response.data) {
        setProperties(response.data);
        setLoading({
          isLoading: false,
          error: undefined,
          lastUpdated: new Date(),
        });
      } else {
        setLoading({
          isLoading: false,
          error: response.error || 'Erreur lors du chargement des biens',
          lastUpdated: undefined,
        });
      }
    } catch (error) {
      setLoading({
        isLoading: false,
        error: 'Erreur inattendue lors du chargement des biens',
        lastUpdated: undefined,
      });
    }
  }, [options.filters]);

  const createProperty = useCallback(async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const response = await propertyService.create(propertyData);

      if (response.success && response.data) {
        setProperties(prev => [response.data!, ...prev]);
        setLoading(prev => ({ ...prev, isLoading: false }));
        return { success: true, data: response.data };
      } else {
        setLoading(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erreur lors de la création du bien' 
        }));
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = 'Erreur inattendue lors de la création du bien';
      setLoading(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
    setLoading(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const response = await propertyService.update(id, updates);

      if (response.success && response.data) {
        setProperties(prev => 
          prev.map(property => 
            property.id === id ? response.data! : property
          )
        );
        setLoading(prev => ({ ...prev, isLoading: false }));
        return { success: true, data: response.data };
      } else {
        setLoading(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erreur lors de la mise à jour du bien' 
        }));
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = 'Erreur inattendue lors de la mise à jour du bien';
      setLoading(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const deleteProperty = useCallback(async (id: string) => {
    setLoading(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const response = await propertyService.delete(id);

      if (response.success) {
        setProperties(prev => prev.filter(property => property.id !== id));
        setLoading(prev => ({ ...prev, isLoading: false }));
        return { success: true };
      } else {
        setLoading(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erreur lors de la suppression du bien' 
        }));
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = 'Erreur inattendue lors de la suppression du bien';
      setLoading(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const getPropertyById = useCallback((id: string) => {
    return properties.find(property => property.id === id);
  }, [properties]);

  const getPropertiesByStatus = useCallback((status: Property['status']) => {
    return properties.filter(property => property.status === status);
  }, [properties]);

  // Auto-fetch si demandé
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchProperties();
    }
  }, [fetchProperties, options.autoFetch]);

  return {
    properties,
    loading,
    actions: {
      fetch: fetchProperties,
      create: createProperty,
      update: updateProperty,
      delete: deleteProperty,
    },
    selectors: {
      getById: getPropertyById,
      getByStatus: getPropertiesByStatus,
    },
  };
}
