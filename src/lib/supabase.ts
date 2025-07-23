import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { activityService } from './activityService';

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

// Créer le client Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly set
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
                            !supabaseUrl.includes('your-project-id') && 
                            !supabaseAnonKey.includes('your-anon-key');

// Add connection timeout check
let isSupabaseConnected = isSupabaseConfigured;

if (!isSupabaseConnected) {
  console.warn('Les variables d\'environnement Supabase ne sont pas correctement définies. Certaines fonctionnalités seront limitées.');
}

export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      fetch: (...args) => {
        // Add timeout to fetch requests
        const [resource, config] = args;
        return fetch(resource, {
          ...config,
          signal: AbortSignal.timeout(30000), // 30 second timeout
        }).catch(error => {
          // Handle network-related errors including 'Failed to fetch'
          if (error.name === 'TimeoutError' || 
              error.name === 'AbortError' || 
              error.message === 'Failed to fetch' ||
              error.message.includes('fetch') ||
              error instanceof TypeError) {
            isSupabaseConnected = false;
            // Return a controlled error instead of letting the original TypeError propagate
            // Silently handle network errors to prevent console spam
            return Promise.reject(error);
          }
          throw error;
        });
      }
    }
  }
);

// Function to check if Supabase is connected
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured) return false;
  
  try {
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    isSupabaseConnected = !error;
    return isSupabaseConnected;
  } catch (error) {
    console.warn('Supabase connection check failed:', error);
    isSupabaseConnected = false;
    return false;
  }
};

// Export connection status
export const isConnected = () => isSupabaseConnected;

// Fonctions utilitaires pour l'authentification
export const auth = {
  // Inscription
  async signUp(email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    companyName?: string;
    phone?: string;
  }) {
    try {
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured. Using mock authentication.');
        // Return mock data for development
        return { 
          data: { 
            user: { 
              id: 'mock-user-id',
              email,
              user_metadata: {
                first_name: userData.firstName,
                last_name: userData.lastName,
                company_name: userData.companyName,
                phone: userData.phone
              }
            }, 
            session: { 
              access_token: 'mock-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Date.now() + 3600000
            } 
          }, 
          error: null 
        };
      }
      
      // Create the user with Supabase
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
          // No email redirect needed for simple registration
        }
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.warn('Sign up error:', error);
      
      // Check if it's a network-related error
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('TimeoutError') || 
          errorMessage.includes('signal timed out') ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('timeout')) {
        console.warn('Network error detected. Switching to demo mode for sign up.');
        isSupabaseConnected = false;
        
        // Return mock successful signup data
        return { 
          data: { 
            user: { 
              id: 'demo-user-id',
              email,
              user_metadata: {
                first_name: userData.firstName,
                last_name: userData.lastName,
                company_name: userData.companyName,
                phone: userData.phone
              }
            }, 
            session: { 
              access_token: 'demo-token',
              refresh_token: 'demo-refresh-token',
              expires_at: Date.now() + 3600000
            } 
          }, 
          error: null 
        };
      }
      
      // For other errors, return the actual error but don't mark as disconnected
      // since this could be a validation error or other non-connection issue
      return { 
        data: { user: null, session: null }, 
        error: { message: errorMessage } 
      };
    }

    // Log successful signup activity
    if (data?.user) {
      try {
        await activityService.addActivity({
          type: 'system',
          action: 'user_signup',
          title: 'Nouveau compte créé',
          description: `Compte créé pour ${userData.firstName} ${userData.lastName}`,
          userId: data.user.id,
          priority: 'medium',
          category: 'success'
        });
      } catch (activityError) {
        console.warn('Could not log signup activity:', activityError);
      }
    }
  },

  // Connexion
  async signIn(email: string, password: string) {
    try {
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured. Using mock authentication.');
        // Return mock data for development
        return { 
          data: { 
            user: { 
              id: 'mock-user-id',
              email,
              user_metadata: {
                first_name: 'User',
                last_name: 'Demo'
              }
            }, 
            session: { 
              access_token: 'mock-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Date.now() + 3600000
            } 
          }, 
          error: null 
        };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.warn('Sign in error:', error);
      
      // Check if it's a network-related error
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('TimeoutError') || 
          errorMessage.includes('signal timed out') ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('timeout')) {
        console.warn('Network error detected. Switching to demo mode for sign in.');
        isSupabaseConnected = false;
        
        // Return mock successful signin data
        return { 
          data: { 
            user: { 
              id: 'demo-user-id',
              email,
              user_metadata: {
                first_name: 'Demo',
                last_name: 'User'
              }
            }, 
            session: { 
              access_token: 'demo-token',
              refresh_token: 'demo-refresh-token',
              expires_at: Date.now() + 3600000
            } 
          }, 
          error: null 
        };
      }
      
      // For other errors (like invalid credentials), return the actual error
      return { 
        data: { user: null, session: null }, 
        error: { message: errorMessage } 
      };
    }

    // Log successful signin activity
    if (data?.user) {
      try {
        await activityService.addActivity({
          type: 'login',
          action: 'user_signin',
          title: 'Connexion utilisateur',
          description: `Connexion réussie pour ${email}`,
          userId: data.user.id,
          priority: 'low',
          category: 'info'
        });
      } catch (activityError) {
        console.warn('Could not log signin activity:', activityError);
      }
    }
  },

  // Déconnexion
  async signOut() {
    try {
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured. Using mock authentication.');
        return { error: null };
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.warn('Sign out error:', error);
      
      // For network errors, just return success since we're going offline anyway
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('TimeoutError') || 
          errorMessage.includes('signal timed out') ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('timeout')) {
        console.warn('Network error during sign out. Proceeding with local sign out.');
        isSupabaseConnected = false;
        return { error: null };
      }
      
      return { error: { message: errorMessage } };
    }
  },

  // Récupérer la session actuelle
  async getSession() {
    try {
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured. Using mock authentication.');
        // Return mock data for development
        return { 
          data: { 
            session: { 
              user: {
                id: 'mock-user-id',
                email: 'user@example.com',
                user_metadata: {
                  first_name: 'User',
                  last_name: 'Demo'
                }
              },
              access_token: 'mock-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Date.now() + 3600000
            } 
          }, 
          error: null 
        };
      }
      
      const { data, error } = await supabase.auth.getSession();
      return { data, error: null };
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.warn('Get session error:', error);
      
      // Check if it's a network-related error
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('TimeoutError') || 
          errorMessage.includes('signal timed out') ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('timeout')) {
        console.warn('Network error detected. Returning demo session.');
        isSupabaseConnected = false;
        
        // Return mock session data
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
      }
      
      return { data: { session: null }, error: { message: errorMessage } };
    }
  },

  // Récupérer le profil utilisateur
  async getProfile(userId: string) {
    try {
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured. Using mock profile data.');
        // Return mock data for development
        return { 
          data: {
            id: userId,
            email: 'user@example.com',
            first_name: 'User',
            last_name: 'Demo',
            company_name: 'Demo Company',
            phone: '0123456789',
            plan: 'starter',
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_status: 'trial',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, 
          error: null 
        };
      }
      
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (session && session.session?.user.id === userId) {
        // Récupérer le profil complet depuis la table profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        
        return { data, error: null };
      }
      throw new Error('Utilisateur non trouvé');
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } };
    }
  },

  // Mettre à jour le profil
  async updateProfile(userId: string, updates: Partial<AuthUser>) {
    try {
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
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data: {}, error: null };
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } };
    }
  }
};

// Fonctions pour la gestion des abonnements
export const subscription = {
  // Mettre à jour le plan d'abonnement
  async updatePlan(userId: string, plan: 'starter' | 'professional' | 'expert') {
    try {
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

  // Prolonger la période d'essai
  async extendTrial(userId: string, days: number = 14) {
    try {
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

  // Annuler l'abonnement
  async cancelSubscription(userId: string) {
    try {
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
