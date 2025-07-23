import { useState, useEffect } from 'react';
import { Tenant } from '../types';
import { tenantService } from '../services/database';
import { activityService } from '../lib/activityService';
import { isCacheValid, getCachedData, cacheData, invalidateCache } from '../utils/useLocalStorage';

interface UseTenantsReturn {
  tenants: Tenant[];
  loading: boolean;
  error: string | null;
  createTenant: (tenant: Omit<Tenant, 'id' | 'createdAt'>) => Promise<void>;
  updateTenant: (id: string, tenant: Partial<Tenant>) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
  refreshTenants: () => Promise<void>;
}

export const useTenants = (): UseTenantsReturn => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clé de cache
  const TENANTS_CACHE_KEY = 'easybail_tenants_cache';

  const handleSupabaseError = (err: any): string => {
    // Gestion d'erreur générique pour le stockage local
    return err instanceof Error ? err.message : 'Une erreur est survenue';
  };

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);      

      // Vérifier si nous avons des données en cache valides
      if (isCacheValid(TENANTS_CACHE_KEY)) {
        const cachedData = getCachedData<Tenant[]>(TENANTS_CACHE_KEY, []);
        setTenants(cachedData);
        
        // Charger les données fraîches en arrière-plan
        tenantService.findAll().then(response => {
          if (response.success) {
            setTenants(response.data);
            cacheData(TENANTS_CACHE_KEY, response.data);
          }
        }).catch(err => {
          console.warn('Erreur lors du rafraîchissement des locataires en arrière-plan:', err);
        });
      } else {
        // Pas de cache valide, charger depuis l'API
        const response = await tenantService.findAll();
        if (response.success) {
          setTenants(response.data);
          cacheData(TENANTS_CACHE_KEY, response.data);
        } else {
          throw new Error(response.error || 'Erreur lors du chargement des locataires');
        }
      }
    } catch (err) {
      setError(handleSupabaseError(err));
      console.error('Erreur lors du chargement des locataires:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTenant = async (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      
      // Invalider le cache
      invalidateCache(TENANTS_CACHE_KEY);
      invalidateCache('easybail_properties_cache'); // Invalider aussi le cache des biens
      
      const response = await tenantService.create(tenantData);
      if (response.success) {
        const newTenant = response.data;
        setTenants(prev => [newTenant, ...prev]);
      } else {
        throw new Error(response.error || 'Erreur lors de la création du locataire');
      }
      
      // Ajouter une activité
      activityService.addActivity({
        type: 'tenant',
        action: 'added',
        title: 'Nouveau locataire',
        description: `${response.data.firstName} ${response.data.lastName} a été ajouté`,
        entityId: response.data.id,
        entityType: 'tenant',
        entityName: `${response.data.firstName} ${response.data.lastName}`,
        userId: 'current-user',
        metadata: {
          propertyId: response.data.propertyId,
          rent: response.data.rent,
          leaseStart: response.data.leaseStart.toISOString()
        },
        priority: 'medium',
        category: 'success'
      });
    } catch (err) {
      setError(handleSupabaseError(err));
      throw err;
    }
  };

  const updateTenant = async (id: string, tenantData: Partial<Tenant>) => {
    try {
      setError(null);
      
      // Invalider le cache
      invalidateCache(TENANTS_CACHE_KEY);
      invalidateCache('easybail_properties_cache'); // Invalider aussi le cache des biens
      
      const response = await tenantService.update(id, tenantData);
      if (response.success) {
        setTenants(prev => prev.map(t => t.id === id ? response.data : t));
      } else {
        throw new Error(response.error || 'Erreur lors de la mise à jour du locataire');
      }
    } catch (err) {
      setError(handleSupabaseError(err));
      throw err;
    }
  };

  const deleteTenant = async (id: string) => {
    try {
      setError(null);
      
      // Invalider le cache
      invalidateCache(TENANTS_CACHE_KEY);
      invalidateCache('easybail_properties_cache'); // Invalider aussi le cache des biens
      
      const response = await tenantService.delete(id);
      if (!response.success) {
        throw new Error(response.error || 'Erreur lors de la suppression du locataire');
      }
      setTenants(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(handleSupabaseError(err));
      throw err;
    }
  };

  const refreshTenants = async () => {
    // Invalider le cache pour forcer un rechargement complet
    invalidateCache(TENANTS_CACHE_KEY);
    await loadTenants();
  };

  useEffect(() => {
    loadTenants();
  }, []);

  return {
    tenants,
    loading,
    error,
    createTenant,
    updateTenant,
    deleteTenant,
    refreshTenants
  };
};
