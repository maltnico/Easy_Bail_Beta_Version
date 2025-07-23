import { useState, useEffect } from 'react';
import { Tenant } from '../types';
import { tenantsApi } from '../lib/properties';
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
        tenantsApi.getTenants().then(freshData => {
          setTenants(freshData);
          cacheData(TENANTS_CACHE_KEY, freshData);
        }).catch(err => {
          console.warn('Erreur lors du rafraîchissement des locataires en arrière-plan:', err);
        });
      } else {
        // Pas de cache valide, charger depuis l'API
        const data = await tenantsApi.getTenants();
        setTenants(data);
        cacheData(TENANTS_CACHE_KEY, data);
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
      
      const newTenant = await tenantsApi.createTenant(tenantData);
      setTenants(prev => [newTenant, ...prev]);
      
      // Ajouter une activité
      activityService.addActivity({
        type: 'tenant',
        action: 'added',
        title: 'Nouveau locataire',
        description: `${newTenant.firstName} ${newTenant.lastName} a été ajouté`,
        entityId: newTenant.id,
        entityType: 'tenant',
        entityName: `${newTenant.firstName} ${newTenant.lastName}`,
        userId: 'current-user',
        metadata: {
          propertyId: newTenant.propertyId,
          rent: newTenant.rent,
          leaseStart: newTenant.leaseStart.toISOString()
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
      
      const updatedTenant = await tenantsApi.updateTenant(id, tenantData);
      setTenants(prev => prev.map(t => t.id === id ? updatedTenant : t));
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
      
      await tenantsApi.deleteTenant(id);
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
