import { supabase, isConnected, checkSupabaseConnection } from './supabase';
import { activityService } from './activityService';

// Service générique pour les opérations de base de données
export class DatabaseService {
  private tableName: string;
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // Wrapper pour les opérations avec retry automatique
  async withRetry<T>(operation: () => Promise<T>, context: string): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        // Vérifier la connexion avant chaque tentative
        if (!isConnected()) {
          const reconnected = await checkSupabaseConnection();
          if (!reconnected && attempt === this.retryAttempts) {
            throw new Error('Impossible de se connecter à la base de données');
          }
        }

        return await operation();
      } catch (error) {
        lastError = error;
        
        if (this.isRetryableError(error)) {
          console.warn(`Tentative ${attempt}/${this.retryAttempts} échouée pour ${context}:`, error);
          
          if (attempt < this.retryAttempts) {
            await this.delay(this.retryDelay * attempt);
            continue;
          }
        }
        
        // Si ce n'est pas une erreur de réseau ou si on a épuisé les tentatives
        break;
      }
    }

    throw lastError;
  }

  // Vérifier si une erreur justifie une nouvelle tentative
  private isRetryableError(error: any): boolean {
    const message = error?.message || '';
    return (
      message.includes('Failed to fetch') ||
      message.includes('timeout') ||
      message.includes('NetworkError') ||
      message.includes('AbortError') ||
      error?.code === 'PGRST301' || // Supabase timeout
      error?.code === '503' ||
      error?.code === '502'
    );
  }

  // Délai d'attente
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Opération SELECT avec gestion d'erreur
  async select(query: any, context: string = 'select') {
    return this.withRetry(async () => {
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }, `${context} sur ${this.tableName}`);
  }

  // Opération INSERT avec gestion d'erreur
  async insert(data: any, context: string = 'insert') {
    return this.withRetry(async () => {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    }, `${context} sur ${this.tableName}`);
  }

  // Opération UPDATE avec gestion d'erreur
  async update(id: string, updates: any, context: string = 'update') {
    return this.withRetry(async () => {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }, `${context} sur ${this.tableName}`);
  }

  // Opération DELETE avec gestion d'erreur
  async delete(id: string, context: string = 'delete') {
    return this.withRetry(async () => {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    }, `${context} sur ${this.tableName}`);
  }

  // Compter les enregistrements
  async count(filters: any = {}, context: string = 'count') {
    return this.withRetry(async () => {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // Appliquer les filtres
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    }, `${context} sur ${this.tableName}`);
  }
}

// Factory pour créer des services de base de données
export const createDatabaseService = (tableName: string) => {
  return new DatabaseService(tableName);
};

// Services spécialisés
export const propertiesService = createDatabaseService('properties');
export const tenantsService = createDatabaseService('tenants');
export const documentsService = createDatabaseService('documents');
export const activitiesService = createDatabaseService('activities');
export const notificationsService = createDatabaseService('notifications');