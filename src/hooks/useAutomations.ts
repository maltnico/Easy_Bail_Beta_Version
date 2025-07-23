import { useState, useEffect } from 'react';
import { Automation } from '../types';
import { automationService } from '../lib/automationService';
import { automationScheduler } from '../lib/automationScheduler';

interface UseAutomationsReturn {
  automations: Automation[];
  loading: boolean;
  error: string | null;
  createAutomation: (automation: Omit<Automation, 'id' | 'createdAt'>) => Promise<Automation>;
  updateAutomation: (id: string, updates: Partial<Automation>) => Promise<Automation>;
  deleteAutomation: (id: string) => Promise<void>;
  toggleAutomation: (id: string) => Promise<Automation>;
  executeAutomation: (id: string) => Promise<boolean>;
  executeAllDueAutomations: () => Promise<number>;
  refreshAutomations: () => void;
  isSchedulerActive: () => boolean;
  startScheduler: () => void;
  stopScheduler: () => void;
}

export const useAutomations = (): UseAutomationsReturn => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAutomations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await automationService.getAutomations();
      setAutomations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Erreur lors du chargement des automatisations:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAutomation = async (automationData: Omit<Automation, 'id' | 'createdAt'>): Promise<Automation> => {
    try {
      setError(null);
      const newAutomation = automationService.createAutomation(automationData);
      setAutomations(prev => [newAutomation, ...prev]);
      return newAutomation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'automatisation');
      throw err;
    }
  };

  const updateAutomation = async (id: string, updates: Partial<Automation>): Promise<Automation> => {
    try {
      setError(null);
      const updatedAutomation = automationService.updateAutomation(id, updates);
      setAutomations(prev => prev.map(a => a.id === id ? updatedAutomation : a));
      return updatedAutomation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'automatisation');
      throw err;
    }
  };

  const deleteAutomation = async (id: string): Promise<void> => {
    try {
      setError(null);
      automationService.deleteAutomation(id);
      setAutomations(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'automatisation');
      throw err;
    }
  };

  const toggleAutomation = async (id: string): Promise<Automation> => {
    try {
      setError(null);
      const success = automationService.toggleAutomation(id);
      const updatedAutomation = automationService.getById(id);
      if (!success || !updatedAutomation) {
        throw new Error('Erreur lors de la modification de l\'automatisation');
      }
      setAutomations(prev => prev.map(a => a.id === id ? updatedAutomation : a));
      return updatedAutomation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification de l\'automatisation');
      throw err;
    }
  };

  const executeAutomation = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await automationService.executeAutomation(id);
      
      // Rafraîchir la liste des automatisations pour refléter les changements
      loadAutomations();
      
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'exécution de l\'automatisation');
      throw err;
    }
  };

  const executeAllDueAutomations = async (): Promise<number> => {
    try {
      setError(null);
      const count = await automationService.executeAllDueAutomations();
      
      // Rafraîchir la liste des automatisations pour refléter les changements
      loadAutomations();
      
      return count;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'exécution des automatisations');
      throw err;
    }
  };

  const refreshAutomations = () => {
    loadAutomations();
  };

  const isSchedulerActive = (): boolean => {
    return automationScheduler.isActive();
  };

  const startScheduler = (): void => {
    automationScheduler.start();
  };

  const stopScheduler = (): void => {
    automationScheduler.stop();
  };

  useEffect(() => {
    (async () => {
      await loadAutomations();
    })();
    
    // Démarrer le planificateur automatiquement
    if (!automationScheduler.isActive()) {
      automationScheduler.start();
    }
    
    // Nettoyer lors du démontage du composant
    return () => {
      // Ne pas arrêter le planificateur lors du démontage pour qu'il continue en arrière-plan
    };
  }, []);

  return {
    automations,
    loading,
    error,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    executeAutomation,
    executeAllDueAutomations,
    refreshAutomations,
    isSchedulerActive,
    startScheduler,
    stopScheduler
  };
};
