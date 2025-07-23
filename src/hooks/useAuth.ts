import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, AuthUser, auth, isConnected } from '../lib/supabase';
import { activityService } from '../lib/activityService';

interface UseAuthReturn {
  user: User | null;
  profile: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    companyName?: string;
    phone?: string;
  }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  showLoginPage: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Si il y a une erreur liée à un utilisateur inexistant ou un refresh token invalide, nettoyer la session
        if (error && (
          error.message.includes('User from sub claim in JWT does not exist') || 
          error.message.includes('user_not_found') ||
          error.message.includes('Invalid Refresh Token') ||
          error.message.includes('refresh_token_not_found') ||
          error.code === 'refresh_token_not_found'
        )) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          return;
        }
        
        // Si il y a une erreur liée à un utilisateur inexistant ou un refresh token invalide, nettoyer la session
        if (error && (
          error.message.includes('User from sub claim in JWT does not exist') || 
          error.message.includes('user_not_found') ||
          error.message.includes('Invalid Refresh Token') ||
          error.message.includes('refresh_token_not_found') ||
          error.code === 'refresh_token_not_found'
        )) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          return;
        }
        
        setSession(session);
        setUser(session?.user || null);
        
        // Fetch user profile if user is logged in
        if (session?.user) {
          fetchUserProfile(session.user.id);
        }
      } catch (error) {
        let errorMessage = error instanceof Error ? error.message : 'Erreur lors de la connexion';
        
        if (error instanceof Error && (
          error.message.includes('Failed to fetch') ||
          error.message.includes('timeout') ||
          error.message.includes('NetworkError')
        )) {
          console.warn('Network error during sign in. Attempting to use demo mode.');
          // Try to use demo mode instead of failing completely
          try {
            const demoResult = await auth.signIn(email, password);
            if (demoResult.data?.user) {
              setUser(demoResult.data.user);
              setSession(demoResult.data.session);
              return;
            }
          } catch (demoError) {
            console.error('Failed to use demo mode:', demoError);
          }
        }
        
        throw new Error(errorMessage);
        // Ne pas déconnecter l'utilisateur en cas d'erreur réseau
        if (error.message === 'Network connection failed. Switching to offline mode.' ||
            error.message === 'Failed to fetch' ||
            error.message.includes('fetch') ||
            error.name === 'TimeoutError' ||
            error.name === 'AbortError' ||
            error instanceof TypeError) {
          // Garder l'état d'authentification actuel en mode hors ligne
          // Silently handle network errors
        } else {
          // En cas d'erreur inattendue (non réseau), nettoyer la session
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.error('Error signing out after session error:', signOutError);
          }
          setSession(null);
          setUser(null);
        }
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        // Fetch user profile when auth state changes
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      // Ensure user profile exists before fetching
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        // Check if profile exists, create if not
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
        
        if (checkError) {
          console.error('Error checking user profile:', checkError);
          return;
        }
        
        if (!existingProfile) {
          // Create profile if it doesn't exist
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: userData.user.email || '',
              first_name: userData.user.user_metadata?.first_name || 'Utilisateur',
              last_name: userData.user.user_metadata?.last_name || '',
              company_name: userData.user.user_metadata?.company_name || null,
              phone: userData.user.user_metadata?.phone || null
            });
          
          if (insertError) {
            console.error('Error creating user profile:', insertError);
            return;
          }
        }
      }
      
      const { data, error } = await auth.getProfile(userId);
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }
      
      // Vérifier si l'utilisateur est admin et mettre à jour le rôle
      if (data && data.email === 'admin@easybail.pro' && data.role !== 'admin') {
        try {
          await auth.updateProfile(userId, { 
            role: 'admin',
            plan: 'expert',
            subscription_status: 'active'
          });
          data.role = 'admin';
          data.plan = 'expert';
          data.subscription_status = 'active';
        } catch (updateError) {
          console.warn('Could not update admin role:', updateError);
        }
      }
      
      setProfile(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    userData: {
      firstName: string;
      lastName: string;
      companyName?: string;
      phone?: string;
    }
  ) => {
    setLoading(true);
    try {
      const { data, error } = await auth.signUp(email, password, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        companyName: userData.companyName,
        phone: userData.phone
      });
      
      if (error) throw error;
      
      setUser(data.user);
      setProfile(null); // Will be fetched on auth state change
      setSession(data.session);
      
    } catch (error: any) {
      // Handle specific Supabase errors with user-friendly messages
      let errorMessage = error.message || 'Erreur lors de l\'inscription';
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'Un compte avec cette adresse email existe déjà';
      } else if (error.message?.includes('Database error saving new user')) {
        errorMessage = 'Erreur de configuration de la base de données. Veuillez contacter le support.';
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = 'Format d\'email invalide';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await auth.signIn(email, password);
      
      if (error) throw error;
      
      setUser(data.user);
      setProfile(null); // Will be fetched on auth state change
      setSession(data.session);
      
      // Refresh activities on successful sign in
      try {
        localStorage.removeItem('easybail_activities_loaded');
        activityService.getActivities().catch(err => console.warn('Error refreshing activities after login:', err));
      } catch (err) {
        console.warn('Error refreshing activities after login:', err);
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Erreur lors de la connexion';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Trop de tentatives. Veuillez réessayer dans quelques minutes';
      }
      
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('timeout') ||
        error.message.includes('NetworkError')
      )) {
        console.warn('Network error during sign in. Attempting to use demo mode.');
        // Try to use demo mode instead of failing completely
        try {
          const demoResult = await auth.signIn(email, password);
          if (demoResult.data?.user) {
            setUser(demoResult.data.user);
            setSession(demoResult.data.session);
            return;
          }
        } catch (demoError) {
          console.error('Failed to use demo mode:', demoError);
        }
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error: any) {
      console.warn('Error signing out:', error);
      // Even if there's an error, we should still clear the local state
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Only throw if it's not a network error
      if (!(error.message?.includes('Failed to fetch') || 
            error.message?.includes('timeout') || 
            error.message?.includes('NetworkError'))) {
        throw new Error('Erreur lors de la déconnexion');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) throw new Error('Utilisateur non connecté');
    
    setLoading(true);
    try {
      const { data, error } = await auth.updateProfile(user.id, updates);
      
      if (error) throw error;
      
      // Mettre à jour l'utilisateur local
      setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, ...updates } } : null);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await auth.resetPassword(email);
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la réinitialisation du mot de passe');
    }
  };

  const showLoginPage = () => {
    // Cette fonction peut être utilisée pour forcer l'affichage de la page de login
    // Pour l'instant, on ne fait rien car la logique est gérée dans App.tsx
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    showLoginPage,
  };
};
