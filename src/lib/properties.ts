import { Property, Tenant } from '../types';
import { supabase } from './supabase';
import { Database } from '../types/database';
import { activityService } from './activityService';

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

// Helper function to ensure user profile exists
const ensureUserProfile = async (userId: string): Promise<void> => {
  try {
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkError) {
      throw checkError;
    }
    
    if (existingProfile) {
      // Profile already exists
      return;
    }
    
    // Get user data from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Impossible de récupérer les données utilisateur');
    }
    
    // Create profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || 'Utilisateur',
        last_name: user.user_metadata?.last_name || '',
        company_name: user.user_metadata?.company_name || null,
        phone: user.user_metadata?.phone || null
      });
    
    if (insertError) {
      throw insertError;
    }
  } catch (error) {
    console.error('Erreur lors de la création du profil utilisateur:', error);
    throw new Error('Impossible de créer le profil utilisateur. Veuillez vous reconnecter.');
  }
};

// Type pour les propriétés de la base de données
type PropertyRow = Database['public']['Tables']['properties']['Row'];
type TenantRow = Database['public']['Tables']['tenants']['Row'];

// Convertir une propriété de la base de données en type Property
const convertPropertyFromDB = (property: PropertyRow, tenant?: TenantRow): Property => {
  return {
    id: property.id,
    name: property.name,
    address: property.address,
    type: property.type,
    status: property.status || 'vacant',
    rent: Number(property.rent),
    charges: Number(property.charges || 0),
    surface: Number(property.surface),
    rooms: property.rooms,
    tenant: tenant ? {
      id: tenant.id,
      firstName: tenant.first_name,
      lastName: tenant.last_name,
      email: tenant.email,
      phone: tenant.phone || '',
      propertyId: tenant.property_id,
      leaseStart: new Date(tenant.lease_start),
      leaseEnd: new Date(tenant.lease_end),
      rent: Number(tenant.rent),
      deposit: Number(tenant.deposit || 0),
      status: tenant.status || 'active',
      createdAt: new Date(tenant.created_at || Date.now())
    } : undefined,
    createdAt: new Date(property.created_at || Date.now()),
    updatedAt: new Date(property.updated_at || Date.now())
  };
};

// Convertir un locataire de la base de données en type Tenant
const convertTenantFromDB = (tenant: TenantRow): Tenant => {
  return {
    id: tenant.id,
    firstName: tenant.first_name,
    lastName: tenant.last_name,
    email: tenant.email,
    phone: tenant.phone || '',
    propertyId: tenant.property_id,
    leaseStart: new Date(tenant.lease_start),
    leaseEnd: new Date(tenant.lease_end),
    rent: Number(tenant.rent),
    deposit: Number(tenant.deposit || 0),
    status: tenant.status || 'active',
    createdAt: new Date(tenant.created_at || Date.now())
  };
};

// API pour la gestion des biens
export const propertiesApi = {
  // Récupérer tous les biens de l'utilisateur
  async getProperties(): Promise<Property[]> {
    try {
      // Vérifier le cache local d'abord
      const cachedProperties = localStorage.getItem('easybail_properties_cache');
      const cacheTimestamp = localStorage.getItem('easybail_properties_cache_timestamp');
      
      // Utiliser le cache si disponible et pas plus vieux que 5 minutes
      if (cachedProperties && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          console.log('Using cached properties data');
          return JSON.parse(cachedProperties).map((property: any) => ({
            ...property,
            createdAt: new Date(property.createdAt),
            updatedAt: new Date(property.updatedAt),
            tenant: property.tenant ? {
              ...property.tenant,
              leaseStart: new Date(property.tenant.leaseStart),
              leaseEnd: new Date(property.tenant.leaseEnd),
              createdAt: new Date(property.tenant.createdAt)
            } : undefined
          }));
        }
      }
      
      // Récupérer les biens
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (propertiesError) throw propertiesError;
      
      // Récupérer les locataires actifs
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .in('status', ['active', 'notice']);
      
      if (tenantsError) throw tenantsError;
      
      // Associer les locataires aux biens et mettre en cache
      const result = properties.map(property => {
        const tenant = tenants?.find(t => t.property_id === property.id);
        return convertPropertyFromDB(property, tenant);
      });
      
      // Mettre en cache les résultats
      localStorage.setItem('easybail_properties_cache', JSON.stringify(result));
      localStorage.setItem('easybail_properties_cache_timestamp', Date.now().toString());
      
      return result;
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'getProperties');
      if (isConnectionError) {
        throw error; // Re-throw connection errors to trigger demo data fallback
      }
      throw error;
    }
  },

  // Récupérer les biens disponibles pour location (vacants)
  async getAvailableProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'vacant')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(property => convertPropertyFromDB(property));
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'getAvailableProperties');
      if (isConnectionError) {
        throw error; // Re-throw connection errors to trigger demo data fallback
      }
      throw error;
    }
  },

  // Créer un nouveau bien
  async createProperty(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    try {
      // Invalider le cache des biens
      localStorage.removeItem('easybail_properties_cache');
      
      // Convertir les données pour Supabase
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Ensure user profile exists before creating property
      await ensureUserProfile(userData.user.id);
      
      const propertyInsert = {
        user_id: userData.user.id,
        name: propertyData.name,
        address: propertyData.address,
        type: propertyData.type,
        status: propertyData.status || 'vacant',
        rent: propertyData.rent,
        charges: propertyData.charges || 0,
        surface: propertyData.surface,
        rooms: propertyData.rooms || 1,
        description: propertyData.description || null,
        amenities: propertyData.amenities || null,
        images: propertyData.images || null
      };
      
      const { data, error } = await supabase
        .from('properties')
        .insert(propertyInsert)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log activity
      try {
        await activityService.addActivity({
          type: 'property',
          action: 'created',
          title: 'Nouveau bien ajouté',
          description: `${propertyData.name} a été ajouté à votre portefeuille`,
          entityId: data.id,
          entityType: 'property',
          entityName: propertyData.name,
          userId: userData.user.id,
          metadata: {
            type: propertyData.type,
            rent: propertyData.rent,
            surface: propertyData.surface
          },
          priority: 'medium',
          category: 'success'
        });
      } catch (activityError) {
        console.warn('Could not log property creation activity:', activityError);
      }
      
      return convertPropertyFromDB(data);
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'createProperty');
      if (isConnectionError) {
        throw error; // Re-throw connection errors
      }
      throw error;
    }
  },

  // Mettre à jour un bien
  async updateProperty(id: string, propertyData: Partial<Property>): Promise<Property> {
    try {
      // Invalider le cache des biens
      localStorage.removeItem('easybail_properties_cache');
      
      // Convertir les données pour Supabase
      const propertyUpdate: Partial<PropertyRow> = {};
      
      if (propertyData.name !== undefined) propertyUpdate.name = propertyData.name;
      if (propertyData.address !== undefined) propertyUpdate.address = propertyData.address;
      if (propertyData.type !== undefined) propertyUpdate.type = propertyData.type;
      if (propertyData.status !== undefined) propertyUpdate.status = propertyData.status;
      if (propertyData.rent !== undefined) propertyUpdate.rent = propertyData.rent;
      if (propertyData.charges !== undefined) propertyUpdate.charges = propertyData.charges;
      if (propertyData.surface !== undefined) propertyUpdate.surface = propertyData.surface;
      if (propertyData.rooms !== undefined) propertyUpdate.rooms = propertyData.rooms;
      if (propertyData.description !== undefined) propertyUpdate.description = propertyData.description;
      if (propertyData.amenities !== undefined) propertyUpdate.amenities = propertyData.amenities;
      if (propertyData.images !== undefined) propertyUpdate.images = propertyData.images;
      
      const { data, error } = await supabase
        .from('properties')
        .update(propertyUpdate)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log activity
      try {
        await activityService.addActivity({
          type: 'property',
          action: 'updated',
          title: 'Bien mis à jour',
          description: `${data.name} a été modifié`,
          entityId: data.id,
          entityType: 'property',
          entityName: data.name,
          userId: userData.user.id,
          metadata: propertyUpdate,
          priority: 'low',
          category: 'info'
        });
      } catch (activityError) {
        console.warn('Could not log property update activity:', activityError);
      }
      
      // Récupérer le locataire associé s'il existe
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('property_id', id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (tenantError) throw tenantError;
      
      return convertPropertyFromDB(data, tenant || undefined);
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'updateProperty');
      if (isConnectionError) {
        throw error; // Re-throw connection errors
      }
      throw error;
    }
  },

  // Supprimer un bien
  async deleteProperty(id: string): Promise<void> {
    try {
      // Invalider le cache des biens
      localStorage.removeItem('easybail_properties_cache');
      
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Log activity
      try {
        await activityService.addActivity({
          type: 'property',
          action: 'deleted',
          title: 'Bien supprimé',
          description: `Un bien a été supprimé du portefeuille`,
          userId: userData.user.id,
          priority: 'medium',
          category: 'warning'
        });
      } catch (activityError) {
        console.warn('Could not log property deletion activity:', activityError);
      }
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'deleteProperty');
      if (isConnectionError) {
        throw error; // Re-throw connection errors
      }
      throw error;
    }
  },

  // Récupérer un bien par ID
  async getProperty(id: string): Promise<Property | null> {
    try {
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      
      if (propertyError) throw propertyError;
      
      // Récupérer le locataire associé s'il existe
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('property_id', id)
        .eq('status', 'active')
        .maybeSingle();
      
      if (tenantError) throw tenantError;
      
      return convertPropertyFromDB(property, tenant || undefined);
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'getProperty');
      if (isConnectionError) {
        throw error; // Re-throw connection errors to trigger demo data fallback
      }
      throw error;
    }
  }
};

// API pour la gestion des locataires
export const tenantsApi = {
  // Récupérer tous les locataires de l'utilisateur
  async getTenants(): Promise<Tenant[]> {
    try {
      // Vérifier le cache local d'abord
      const cachedTenants = localStorage.getItem('easybail_tenants_cache');
      const cacheTimestamp = localStorage.getItem('easybail_tenants_cache_timestamp');
      
      // Utiliser le cache si disponible et pas plus vieux que 5 minutes
      if (cachedTenants && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          console.log('Using cached tenants data');
          return JSON.parse(cachedTenants).map((tenant: any) => ({
            ...tenant,
            leaseStart: new Date(tenant.leaseStart),
            leaseEnd: new Date(tenant.leaseEnd),
            createdAt: new Date(tenant.createdAt)
          }));
        }
      }
      
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const result = (data || []).map(tenant => convertTenantFromDB(tenant));
      
      // Mettre en cache les résultats
      localStorage.setItem('easybail_tenants_cache', JSON.stringify(result));
      localStorage.setItem('easybail_tenants_cache_timestamp', Date.now().toString());
      
      return result;
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'getTenants');
      if (isConnectionError) {
        throw error; // Re-throw connection errors to trigger demo data fallback
      }
      throw error;
    }
  },

  // Créer un nouveau locataire
  async createTenant(tenantData: Omit<Tenant, 'id' | 'createdAt'>): Promise<Tenant> {
    try {
      // Invalider les caches
      localStorage.removeItem('easybail_tenants_cache');
      localStorage.removeItem('easybail_properties_cache');
      
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Ensure user profile exists before creating tenant
      await ensureUserProfile(userData.user.id);
      
      // Convertir les données pour Supabase
      const tenantInsert = {
        user_id: userData.user.id,
        property_id: tenantData.propertyId,
        first_name: tenantData.firstName,
        last_name: tenantData.lastName,
        email: tenantData.email,
        phone: tenantData.phone || null,
        lease_start: tenantData.leaseStart.toISOString().split('T')[0],
        lease_end: tenantData.leaseEnd.toISOString().split('T')[0],
        rent: tenantData.rent,
        deposit: tenantData.deposit || 0,
        status: tenantData.status || 'active'
      };
      
      const { data, error } = await supabase
        .from('tenants')
        .insert(tenantInsert)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log activity
      try {
        await activityService.addActivity({
          type: 'tenant',
          action: 'added',
          title: 'Nouveau locataire',
          description: `${data.first_name} ${data.last_name} a été ajouté`,
          entityId: data.id,
          entityType: 'tenant',
          entityName: `${data.first_name} ${data.last_name}`,
          userId: userData.user.id,
          metadata: {
            propertyId: tenantData.propertyId,
            rent: tenantData.rent,
            leaseStart: tenantData.leaseStart.toISOString()
          },
          priority: 'medium',
          category: 'success'
        });
      } catch (activityError) {
        console.warn('Could not log tenant creation activity:', activityError);
      }
      
      // Mettre à jour le statut du bien à "occupied"
      const { error: propertyError } = await supabase
        .from('properties')
        .update({ status: 'occupied' })
        .eq('id', tenantData.propertyId);
      
      if (propertyError) throw propertyError;
      
      return convertTenantFromDB(data);
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'createTenant');
      if (isConnectionError) {
        throw error; // Re-throw connection errors
      }
      throw error;
    }
  },

  // Mettre à jour un locataire
  async updateTenant(id: string, tenantData: Partial<Tenant>): Promise<Tenant> {
    try {
      // Invalider les caches
      localStorage.removeItem('easybail_tenants_cache');
      localStorage.removeItem('easybail_properties_cache');
      
      // Convertir les données pour Supabase
      const tenantUpdate: Partial<TenantRow> = {};
      
      if (tenantData.firstName !== undefined) tenantUpdate.first_name = tenantData.firstName;
      if (tenantData.lastName !== undefined) tenantUpdate.last_name = tenantData.lastName;
      if (tenantData.email !== undefined) tenantUpdate.email = tenantData.email;
      if (tenantData.phone !== undefined) tenantUpdate.phone = tenantData.phone;
      if (tenantData.propertyId !== undefined) tenantUpdate.property_id = tenantData.propertyId;
      if (tenantData.leaseStart !== undefined) tenantUpdate.lease_start = tenantData.leaseStart.toISOString().split('T')[0];
      if (tenantData.leaseEnd !== undefined) tenantUpdate.lease_end = tenantData.leaseEnd.toISOString().split('T')[0];
      if (tenantData.rent !== undefined) tenantUpdate.rent = tenantData.rent;
      if (tenantData.deposit !== undefined) tenantUpdate.deposit = tenantData.deposit;
      if (tenantData.status !== undefined) tenantUpdate.status = tenantData.status;
      
      const { data, error } = await supabase
        .from('tenants')
        .update(tenantUpdate)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return convertTenantFromDB(data);
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'updateTenant');
      if (isConnectionError) {
        throw error; // Re-throw connection errors
      }
      throw error;
    }
  },

  // Supprimer un locataire (fin de bail)
  async deleteTenant(id: string): Promise<void> {
    try {
      // Invalider les caches
      localStorage.removeItem('easybail_tenants_cache');
      localStorage.removeItem('easybail_properties_cache');
      
      // Récupérer d'abord le locataire pour connaître le bien associé
      const { data: tenant, error: tenantGetError } = await supabase
        .from('tenants')
        .select('property_id')
        .eq('id', id)
        .single();
      
      if (tenantGetError) throw tenantGetError;
      
      // Supprimer le locataire
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Mettre à jour le statut du bien à "vacant"
      if (tenant?.property_id) {
        const { error: propertyError } = await supabase
          .from('properties')
          .update({ status: 'vacant' })
          .eq('id', tenant.property_id);
        
        if (propertyError) throw propertyError;
      }
    } catch (error) {
      const isConnectionError = handleSupabaseError(error, 'deleteTenant');
      if (isConnectionError) {
        throw error; // Re-throw connection errors
      }
      throw error;
    }
  }
};
