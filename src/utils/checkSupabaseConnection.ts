import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

/**
 * Vérifie la connexion à Supabase et la configuration des tables
 */
export async function checkSupabaseConnection() {
  // Vérifier que les variables d'environnement sont définies
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Check if environment variables are properly set
  const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
                              !supabaseUrl.includes('your-project-id') && 
                              !supabaseAnonKey.includes('your-anon-key');

  if (!isSupabaseConfigured) {
    return {
      connected: false,
      error: "Variables d'environnement manquantes ou incorrectes. Cliquez sur le bouton 'Connect to Supabase' dans la barre d'outils pour configurer votre projet Supabase."
    };
  }

  try {
    // Créer un client Supabase
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: (...args) => {
          // Add timeout to fetch requests
          const [resource, config] = args;
          return fetch(resource, {
            ...config,
            signal: AbortSignal.timeout(15000), // 15 second timeout for connection check
          });
        }
      }
    });

    // Vérifier l'authentification
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      if (authError.message.includes('timeout') || 
          authError.message.includes('Failed to fetch') ||
          authError.message.includes('connect error')) {
        return {
          connected: false,
          error: `Impossible de se connecter à Supabase: problème de connexion ou timeout. Vérifiez votre connexion internet et l'état de votre projet Supabase.`
        };
      }
      
      return {
        connected: false,
        error: `Erreur d'authentification: ${authError.message}`
      };
    }

    // Vérifier les tables
    const tables = ['profiles', 'properties', 'tenants'];
    const tableResults: Record<string, boolean> = {};
    let allTablesExist = true;

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          tableResults[table] = false;
          allTablesExist = false;
        } else {
          tableResults[table] = true;
        }
      } catch (error) {
        if (error instanceof Error && 
            (error.message.includes('timeout') || 
             error.message.includes('Failed to fetch') ||
             error.message.includes('connect error'))) {
          return {
            connected: false,
            error: `Impossible de vérifier la table ${table}: problème de connexion ou timeout. Vérifiez votre connexion internet et l'état de votre projet Supabase.`
          };
        }
        
        tableResults[table] = false;
        allTablesExist = false;
      }
    }

    return {
      connected: true,
      authenticated: !!authData.session,
      tables: tableResults,
      allTablesExist
    };
  } catch (error) {
    if (error instanceof Error && 
        (error.message.includes('timeout') || 
         error.message.includes('Failed to fetch') ||
         error.message.includes('connect error'))) {
      return {
        connected: false,
        error: `Impossible de se connecter à Supabase: problème de connexion ou timeout. Vérifiez votre connexion internet et l'état de votre projet Supabase.`
      };
    }
    
    return {
      connected: false,
      error: `Erreur de connexion: ${(error as Error).message}`
    };
  }
}
