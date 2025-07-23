import { supabase } from '../../lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface ListResponse<T> extends ServiceResponse<T[]> {
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export abstract class BaseService<TEntity, TDatabase = TEntity> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected handleError(error: PostgrestError | Error | null): string {
    if (!error) return 'Une erreur inconnue s\'est produite';
    
    if ('message' in error) {
      return error.message;
    }
    
    return 'Erreur de base de données';
  }

  protected abstract transformFromDatabase(dbEntity: TDatabase): TEntity;
  protected abstract transformToDatabase(entity: Partial<TEntity>): Partial<TDatabase>;

  async findAll(options?: {
    page?: number;
    limit?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
  }): Promise<ListResponse<TEntity>> {
    try {
      let query = supabase.from(this.tableName).select('*', { count: 'exact' });

      // Appliquer les filtres
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value);
          }
        });
      }

      // Appliquer le tri
      if (options?.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection === 'asc' 
        });
      }

      // Appliquer la pagination
      if (options?.page && options?.limit) {
        const from = (options.page - 1) * options.limit;
        const to = from + options.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) {
        return {
          data: null,
          error: this.handleError(error),
          success: false,
        };
      }

      const transformedData = data?.map(item => this.transformFromDatabase(item)) || [];

      return {
        data: transformedData,
        error: null,
        success: true,
        count: count || 0,
        pagination: options?.page && options?.limit ? {
          page: options.page,
          limit: options.limit,
          total: count || 0,
        } : undefined,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error as Error),
        success: false,
      };
    }
  }

  async findById(id: string): Promise<ServiceResponse<TEntity>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          data: null,
          error: this.handleError(error),
          success: false,
        };
      }

      return {
        data: this.transformFromDatabase(data),
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error as Error),
        success: false,
      };
    }
  }

  async create(entity: Omit<TEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<TEntity>> {
    try {
      const dbEntity = this.transformToDatabase(entity);
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(dbEntity)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: this.handleError(error),
          success: false,
        };
      }

      return {
        data: this.transformFromDatabase(data),
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error as Error),
        success: false,
      };
    }
  }

  async update(id: string, updates: Partial<TEntity>): Promise<ServiceResponse<TEntity>> {
    try {
      const dbUpdates = this.transformToDatabase(updates);
      
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ ...dbUpdates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: this.handleError(error),
          success: false,
        };
      }

      return {
        data: this.transformFromDatabase(data),
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error as Error),
        success: false,
      };
    }
  }

  async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        return {
          data: null,
          error: this.handleError(error),
          success: false,
        };
      }

      return {
        data: true,
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error: this.handleError(error as Error),
        success: false,
      };
    }
  }
}
