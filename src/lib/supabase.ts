import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { activityService } from './activityService';

// Types pour l'authentification
export type AuthUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  phone?: string;
  plan: 'starter' | 'professional' | 'expert';
  trial_ends_at: string;
  subscription_status: 'trial' | 'active' | 'cancelled' | 'expired';
  role?: 'user' | 'admin' | 'manager';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

// Configuration et état de la connexion
class SupabaseConnection {
  private client: any = null;
  private isConfigured = false;
  private isConnected = false;
  private connectionAttempts = 0;
  private maxRetries = 3;
  private retryDelay = 2000;
  private lastConnectionCheck = 0;
  private connectionCheckInterval = 30000; // 30 secondes

  constructor() {
    this.initialize();
  }

  private initialize() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

    // Validation des variables d'environnement
    this.isConfigured = this.validateConfig(supabaseUrl, supabaseAnonKey);

    if (this.isConfigured) {
      this.createClient(supabaseUrl, supabaseAnonKey);
    } else {
      console.warn('Configuration Supabase invalide - Mode démo activé');
    }
  }

  private validateConfig(url: string, key: string): boolean {
    if (!url || !key) {
      console.warn('Variables d\'environnement Supabase manquantes');
      return false;
    }

    if (url.includes('your-project-id') || key.includes('your-anon-key')) {
      console.warn('Variables d\'environnement Supabase contiennent des valeurs par défaut');
      return false;
    }

    try {
      new URL(url);
      return true;
    } catch {
      console.warn('URL Supabase invalide');
      return false;
    }
  }

  private createClient(url: string, key: string) {
    this.client = createClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        fetch: this.createFetchWrapper(),
      },
    });
  }

  private createFetchWrapper() {
    return async (url: string, options: any = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        
        // Marquer comme connecté si la requête réussit
        if (response.ok) {
          this.isConnected = true;
          this.connectionAttempts = 0;
        }

        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        this.handleConnectionError(error);
        throw error;
      }
    };
  }

  private handleConnectionError(error: any) {
    const isNetworkError = 
      error.name === 'AbortError' ||
      error.name === 'TimeoutError' ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('NetworkError') ||
      error.message?.includes('timeout');

    if (isNetworkError) {
      this.isConnected = false;
      this.connectionAttempts++;
      
      if (this.connectionAttempts <= this.maxRetries) {
        console.warn(`Tentative de reconnexion ${this.connectionAttempts}/${this.maxRetries}`);
        setTimeout(() => this.attemptReconnection(), this.retryDelay * this.connectionAttempts);
      } else {
        console.warn('Nombre maximum de tentatives de reconnexion atteint');
      }
    }
  }

  private async attemptReconnection() {
    try {
      const connected = await this.checkConnection();
      if (connected) {
        console.log('Reconnexion Supabase réussie');
        this.isConnected = true;
        this.connectionAttempts = 0;
      }
    } catch (error) {
      console.warn('Échec de la reconnexion:', error);
    }
  }

  async checkConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.client) return false;

    const now = Date.now();
    if (now - this.lastConnectionCheck < this.connectionCheckInterval) {
      return this.isConnected;
    }

    try {
      const { error } = await this.client.from('profiles').select('id', { count: 'exact', head: true });
      this.isConnected = !error;
      this.lastConnectionCheck = now;
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      this.lastConnectionCheck = now;
      return false;
    }
  }

  getClient() {
    return this.client;
  }

  isReady(): boolean {
    return this.isConfigured && this.isConnected;
  }

  getConnectionStatus() {
    return {
      configured: this.isConfigured,
      connected: this.isConnected,
      attempts: this.connectionAttempts,
    };
  }
}

// Instance singleton de la connexion
const supabaseConnection = new SupabaseConnection();
export const supabase = supabaseConnection.getClient();

// Fonctions utilitaires
export const checkSupabaseConnection = () => supabaseConnection.checkConnection();
export const isConnected = () => supabaseConnection.isReady();
export const getConnectionStatus = () => supabaseConnection.getConnectionStatus();

// Service d'authentification amélioré
export const auth = {
  // Inscription avec gestion d'erreur améliorée
  async signUp(email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    companyName?: string;
    phone?: string;
  }) {
    try {
      if (!supabaseConnection.isReady()) {
        return this.handleOfflineAuth('signup', email, userData);
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            company_name: userData.companyName,
            phone: userData.phone
          },
        }
      });

      if (error) throw error;

      // Créer le profil utilisateur après l'inscription réussie
      if (data.user?.id) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              first_name: userData.firstName,
              last_name: userData.lastName,
              company_name: userData.companyName,
              phone: userData.phone,
              plan: 'starter',
              trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              subscription_status: 'trial',
              role: 'user'
            });
          
          if (profileError) {
            console.warn('Erreur lors de la création du profil:', profileError);
          }
        } catch (profileCreationError) {
          console.warn('Impossible de créer le profil:', profileCreationError);
        }
      }

      // Log de l'activité si possible
      try {
        await activityService.addActivity({
          type: 'system',
          action: 'user_signup',
          title: 'Nouveau compte créé',
          description: `Compte créé pour ${userData.firstName} ${userData.lastName}`,
          userId: data.user?.id || 'unknown',
          priority: 'medium',
          category: 'success'
        });
      } catch (activityError) {
        console.warn('Impossible de logger l\'activité:', activityError);
      }

      return { data, error: null };
    } catch (error) {
      return this.handleAuthError(error, 'signup', email, userData);
    }
  },

  // Connexion avec gestion d'erreur améliorée
  async signIn(email: string, password: string) {
    try {
      if (!supabaseConnection.isReady()) {
        return this.handleOfflineAuth('signin', email);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Log de l'activité si possible
      try {
        await activityService.addActivity({
          type: 'login',
          action: 'user_signin',
          title: 'Connexion utilisateur',
          description: `Connexion réussie pour ${email}`,
          userId: data.user?.id || 'unknown',
          priority: 'low',
          category: 'info'
        });
      } catch (activityError) {
        console.warn('Impossible de logger l\'activité:', activityError);
      }

      return { data, error: null };
    } catch (error) {
      return this.handleAuthError(error, 'signin', email);
    }
  },

  // Déconnexion
  async signOut() {
    try {
      if (!supabaseConnection.isReady()) {
        return { error: null };
      }

      const { error } = await supabase.auth.signOut();
      return { error: error ? { message: error.message } : null };
    } catch (error) {
      console.warn('Erreur lors de la déconnexion:', error);
      return { error: null }; // Toujours permettre la déconnexion locale
    }
  },

  // Récupérer la session actuelle
  async getSession() {
    try {
      if (!supabaseConnection.isReady()) {
        return this.getDemoSession();
      }

      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        // Gérer les erreurs de session invalide
        if (error.message.includes('User from sub claim in JWT does not exist') ||
            error.message.includes('Invalid Refresh Token')) {
          await supabase.auth.signOut();
          return { data: { session: null }, error: null };
        }
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.warn('Erreur lors de la récupération de session:', error);
      return this.getDemoSession();
    }
  },

  // Récupérer le profil utilisateur
  async getProfile(userId: string) {
    try {
      if (!supabaseConnection.isReady()) {
        return this.getDemoProfile(userId);
      }

      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (session?.session?.user.id === userId) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .limit(1);
        
        if (error) throw error;
        
        const profile = data ? data[0] : null;
        
        // Promouvoir automatiquement admin@easybail.pro en super user
        if (profile && profile.email === 'admin@easybail.pro' && profile.role !== 'admin') {
          try {
            const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles')
              .update({ 
                role: 'admin',
                plan: 'expert',
                subscription_status: 'active',
                company_name: 'EasyBail SAS (Admin)',
                phone: '04 66 89 68 30'
              })
              .eq('id', userId)
              .select()
              .single();
            
            if (!updateError && updatedProfile) {
              return { data: updatedProfile, error: null };
            }
          } catch (updateError) {
            console.warn('Could not update admin profile:', updateError);
          }
        }
        
        return { data: profile, error: null };
      }
      
      throw new Error('Utilisateur non trouvé');
    } catch (error) {
      console.warn('Erreur lors de la récupération du profil:', error);
      return this.getDemoProfile(userId);
    }
  },

  // Mettre à jour le profil
  async updateProfile(userId: string, updates: Partial<AuthUser>) {
    try {
      if (!supabaseConnection.isReady()) {
        console.warn('Mode hors ligne - mise à jour du profil simulée');
        return { data: { ...updates, id: userId }, error: null };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } };
    }
  },

  // Réinitialiser le mot de passe
  async resetPassword(email: string) {
    try {
      if (!supabaseConnection.isReady()) {
        console.warn('Mode hors ligne - réinitialisation simulée');
        return { data: {}, error: null };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data: {}, error: null };
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } };
    }
  },

  // Gestion de l'authentification hors ligne
  handleOfflineAuth(operation: string, email: string, userData?: any) {
    console.warn(`Mode hors ligne activé pour ${operation}`);
    
    const mockUser = {
      id: 'demo-user-id',
      email,
      user_metadata: userData ? {
        first_name: userData.firstName,
        last_name: userData.lastName,
        company_name: userData.companyName,
        phone: userData.phone
      } : {
        first_name: 'Demo',
        last_name: 'User'
      }
    };

    return {
      data: {
        user: mockUser,
        session: {
          access_token: 'demo-token',
          refresh_token: 'demo-refresh-token',
          expires_at: Date.now() + 3600000
        }
      },
      error: null
    };
  },

  // Gestion des erreurs d'authentification
  handleAuthError(error: any, operation: string, email?: string, userData?: any) {
    const errorMessage = (error as Error).message;
    
    // Erreurs réseau - basculer en mode démo
    if (errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('AbortError')) {
      console.warn(`Erreur réseau lors de ${operation} - Mode démo activé`);
      return this.handleOfflineAuth(operation, email || 'demo@example.com', userData);
    }

    // Autres erreurs - retourner l'erreur réelle
    return {
      data: { user: null, session: null },
      error: { message: this.translateError(errorMessage) }
    };
  },

  // Session démo
  getDemoSession() {
    return {
      data: {
        session: {
          user: {
            id: 'demo-user-id',
            email: 'demo@example.com',
            user_metadata: {
              first_name: 'Demo',
              last_name: 'User'
            }
          },
          access_token: 'demo-token',
          refresh_token: 'demo-refresh-token',
          expires_at: Date.now() + 3600000
        }
      },
      error: null
    };
  },

  // Profil démo
  getDemoProfile(userId: string) {
    return {
      data: {
        id: userId,
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User',
        company_name: 'Demo Company',
        phone: '0123456789',
        plan: 'starter',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'trial',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      error: null
    };
  },

  // Traduction des erreurs
  translateError(message: string): string {
    const translations: Record<string, string> = {
      'Invalid login credentials': 'Email ou mot de passe incorrect',
      'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
      'Too many requests': 'Trop de tentatives. Veuillez réessayer dans quelques minutes',
      'User already registered': 'Un compte avec cette adresse email existe déjà',
      'Password should be at least': 'Le mot de passe doit contenir au moins 6 caractères',
      'Invalid email': 'Format d\'email invalide'
    };

    for (const [key, value] of Object.entries(translations)) {
      if (message.includes(key)) {
        return value;
      }
    }

    return message;
  }
};

// Fonctions pour la gestion des abonnements
export const subscription = {
  async updatePlan(userId: string, plan: 'starter' | 'professional' | 'expert') {
    try {
      if (!supabaseConnection.isReady()) {
        console.warn('Mode hors ligne - mise à jour du plan simulée');
        return { data: { plan }, error: null };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          plan,
          subscription_status: 'active'
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } };
    }
  },

  async extendTrial(userId: string, days: number = 14) {
    try {
      if (!supabaseConnection.isReady()) {
        console.warn('Mode hors ligne - extension d\'essai simulée');
        return { data: { trial_ends_at: new Date(Date.now() + days * 24 * 60 * 60 * 1000) }, error: null };
      }

      const newTrialEnd = new Date();
      newTrialEnd.setDate(newTrialEnd.getDate() + days);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          trial_ends_at: newTrialEnd.toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } };
    }
  },

  async cancelSubscription(userId: string) {
    try {
      if (!supabaseConnection.isReady()) {
        console.warn('Mode hors ligne - annulation simulée');
        return { data: { subscription_status: 'cancelled' }, error: null };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'cancelled'
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } };
    }
  }
};

// Fonction pour surveiller l'état de la connexion
export const startConnectionMonitoring = () => {
  setInterval(async () => {
    const status = getConnectionStatus();
    if (!status.connected && status.configured) {
      console.log('Vérification de la reconnexion Supabase...');
      await checkSupabaseConnection();
    }
  }, 60000); // Vérifier toutes les minutes
};

// Démarrer la surveillance automatiquement
if (typeof window !== 'undefined') {
  startConnectionMonitoring();
}