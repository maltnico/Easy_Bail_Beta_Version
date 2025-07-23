import { useState, useEffect, useCallback } from 'react';
import { isConnected, checkSupabaseConnection, getConnectionStatus } from '../lib/supabase';

// Hook pour surveiller l'état de la base de données
export const useDatabase = () => {
  const [connectionStatus, setConnectionStatus] = useState(getConnectionStatus());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Vérifier la connexion
  const checkConnection = useCallback(async () => {
    try {
      const connected = await checkSupabaseConnection();
      const status = getConnectionStatus();
      setConnectionStatus(status);
      setLastCheck(new Date());
      return connected;
    } catch (error) {
      console.warn('Erreur lors de la vérification de connexion:', error);
      return false;
    }
  }, []);

  // Surveiller l'état de la connexion internet
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Vérifier la connexion Supabase quand on revient en ligne
      setTimeout(checkConnection, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus(prev => ({ ...prev, connected: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnection]);

  // Vérification périodique de la connexion
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline && !connectionStatus.connected) {
        checkConnection();
      }
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [isOnline, connectionStatus.connected, checkConnection]);

  // Vérification initiale
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    isOnline,
    isConnected: connectionStatus.connected,
    isConfigured: connectionStatus.configured,
    connectionAttempts: connectionStatus.attempts,
    lastCheck,
    checkConnection,
    status: connectionStatus
  };
};

// Hook pour les opérations avec fallback
export const useDatabaseOperation = () => {
  const { isConnected } = useDatabase();

  const executeWithFallback = useCallback(async <T>(
    operation: () => Promise<T>,
    fallback: () => T,
    context: string = 'operation'
  ): Promise<T> => {
    if (!isConnected) {
      console.warn(`Mode hors ligne pour ${context} - utilisation du fallback`);
      return fallback();
    }

    try {
      return await operation();
    } catch (error) {
      console.warn(`Erreur lors de ${context}, utilisation du fallback:`, error);
      return fallback();
    }
  }, [isConnected]);

  return { executeWithFallback, isConnected };
};