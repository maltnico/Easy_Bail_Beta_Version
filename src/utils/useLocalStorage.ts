import { useState, useEffect } from 'react';

// Hook pour utiliser le localStorage avec un état React
export function useLocalStorage<T>(key: string, initialValue: T) {
  // État pour stocker notre valeur
  // Passer la fonction d'initialisation à useState pour que la logique ne s'exécute qu'une fois
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Récupérer depuis localStorage
      const item = window.localStorage.getItem(key);
      // Parser le JSON stocké ou retourner initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // En cas d'erreur, retourner initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Retourner une version wrappée de la fonction useState's setter
  // qui persiste la nouvelle valeur dans localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permettre à la valeur d'être une fonction pour suivre la même API que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Sauvegarder l'état
      setStoredValue(valueToStore);
      // Sauvegarder dans localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Écouter les changements dans d'autres onglets/fenêtres
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    
    // Ajouter l'écouteur d'événement
    window.addEventListener('storage', handleStorageChange);
    
    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue] as const;
}

// Fonction utilitaire pour vérifier si un cache est valide
export function isCacheValid(key: string, maxAgeInMinutes: number = 5): boolean {
  try {
    const timestampKey = `${key}_timestamp`;
    const timestamp = localStorage.getItem(timestampKey);
    
    if (!timestamp) return false;
    
    const cacheAge = Date.now() - parseInt(timestamp);
    return cacheAge < maxAgeInMinutes * 60 * 1000;
  } catch (error) {
    console.error(`Error checking cache validity for "${key}":`, error);
    return false;
  }
}

// Fonction utilitaire pour mettre en cache des données
export function cacheData(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`${key}_timestamp`, Date.now().toString());
  } catch (error) {
    console.error(`Error caching data for "${key}":`, error);
  }
}

// Fonction utilitaire pour récupérer des données en cache
export function getCachedData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving cached data for "${key}":`, error);
    return defaultValue;
  }
}

// Fonction utilitaire pour invalider un cache
export function invalidateCache(key: string): void {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_timestamp`);
  } catch (error) {
    console.error(`Error invalidating cache for "${key}":`, error);
  }
}
