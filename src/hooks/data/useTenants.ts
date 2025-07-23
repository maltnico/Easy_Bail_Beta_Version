import { useState, useEffect, useCallback } from 'react';
import { tenantService } from '../../services/database';
import type { Tenant } from '../../types/entities';
import type { LoadingState } from '../../types/ui';

interface UseTenantsOptions {
  autoFetch?: boolean;
  propertyId?: string;
  status?: Tenant['status'];
}

export function useTenants(options: UseTenantsOptions = {}) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: undefined,
    lastUpdated: undefined,
  });

  const fetchTenants = useCallback(async () => {
    setLoading(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      let response;

      if (options.propertyId) {
        response = await tenantService.findByProperty(options.propertyId);
      } else if (options.status) {
        response = await tenantService.findByStatus(options.status);
      } else {
        response = await tenantService.findAll({
          orderBy: 'created_at',
          orderDirection: 'desc',
        });
      }

      if (response.success && response.data) {
        setTenants(response.data);
        setLoading({
          isLoading: false,
          error: undefined,
          lastUpdated: new Date(),
        });
      } else {
        setLoading({
          isLoading: false,
          error: response.error || 'Erreur lors du chargement des locataires',
          lastUpdated: undefined,
        });
      }
    } catch (error) {
      setLoading({
        isLoading: false,
        error: 'Erreur inattendue lors du chargement des locataires',
        lastUpdated: undefined,
      });
    }}, [options.propertyId, options.status]);

  const createTenant = useCallback(async (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => {
    setLoading(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const response = await tenantService.create(tenantData);

      if (response.success && response.data) {
        setTenants(prev => [response.data!, ...prev]);
        setLoading(prev => ({ ...prev, isLoading: false }));
        return { success: true, data: response.data };
      } else {
        setLoading(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erreur lors de la création du locataire' 
        }));
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = 'Erreur inattendue lors de la création du locataire';
      setLoading(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateTenant = useCallback(async (id: string, updates: Partial<Tenant>) => {
    setLoading(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const response = await tenantService.update(id, updates);

      if (response.success && response.data) {
        setTenants(prev => 
          prev.map(tenant => 
            tenant.id === id ? response.data! : tenant
          )
        );
        setLoading(prev => ({ ...prev, isLoading: false }));
        return { success: true, data: response.data };
      } else {
        setLoading(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erreur lors de la mise à jour du locataire' 
        }));
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = 'Erreur inattendue lors de la mise à jour du locataire';
      setLoading(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const deleteTenant = useCallback(async (id: string) => {
    setLoading(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const response = await tenantService.delete(id);

      if (response.success) {
        setTenants(prev => prev.filter(tenant => tenant.id !== id));
        setLoading(prev => ({ ...prev, isLoading: false }));
        return { success: true };
      } else {
        setLoading(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: response.error || 'Erreur lors de la suppression du locataire' 
        }));
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = 'Erreur inattendue lors de la suppression du locataire';
      setLoading(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const getTenantById = useCallback((id: string) => {
    return tenants.find(tenant => tenant.id === id);
  }, [tenants]);

  const getExpiringLeases = useCallback(async (daysAhead: number = 30) => {
    const response = await tenantService.findExpiringLeases(daysAhead);
    return response;
  }, []);

  // Auto-fetch si demandé
  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchTenants();
    }
  }, [fetchTenants, options.autoFetch]);

  return {
    tenants,
    loading,
    actions: {
      fetch: fetchTenants,
      create: createTenant,
      update: updateTenant,
      delete: deleteTenant,
      getExpiringLeases,
    },
    selectors: {
      getById: getTenantById,
    },
  };
}
