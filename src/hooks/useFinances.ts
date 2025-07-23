import { useState, useEffect } from 'react';
import { useProperties } from './data/useProperties';
import { 
  FinancialFlow, 
  FinancialCategory, 
  FinancialReport, 
  FinancialDashboardData,
  FinancialStats,
  FinancialBudget,
  FinancialSettings
} from '../types/financial';
import { financialService } from '../lib/financialService';

interface UseFinancesReturn {
  // Données
  flows: FinancialFlow[];
  categories: FinancialCategory[];
  reports: FinancialReport[];
  budgets: FinancialBudget[];
  settings: FinancialSettings;
  dashboardData: FinancialDashboardData | null;
  stats: FinancialStats | null;
  
  // États
  loading: boolean;
  error: string | null;
  
  // Méthodes pour les flux
  createFlow: (flow: Omit<FinancialFlow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FinancialFlow>;
  updateFlow: (id: string, flow: Partial<FinancialFlow>) => Promise<FinancialFlow>;
  deleteFlow: (id: string) => Promise<void>;
  getFlowById: (id: string) => Promise<FinancialFlow | null>;
  getFlowsByProperty: (propertyId: string) => Promise<FinancialFlow[]>;
  getFlowsByTenant: (tenantId: string) => Promise<FinancialFlow[]>;
  getFlowsByDateRange: (startDate: Date, endDate: Date) => Promise<FinancialFlow[]>;
  getFlowsByCategory: (categoryId: string) => Promise<FinancialFlow[]>;
  
  // Méthodes pour les catégories
  createCategory: (category: Omit<FinancialCategory, 'id'>) => Promise<FinancialCategory>;
  updateCategory: (id: string, category: Partial<FinancialCategory>) => Promise<FinancialCategory>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoriesByType: (type: 'income' | 'expense') => Promise<FinancialCategory[]>;
  
  // Méthodes pour les rapports
  createReport: (report: Omit<FinancialReport, 'id' | 'createdAt'>) => Promise<FinancialReport>;
  generateReport: (id: string) => Promise<FinancialReport>;
  deleteReport: (id: string) => Promise<void>;
  
  // Méthodes pour les budgets
  createBudget: (budget: Omit<FinancialBudget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FinancialBudget>;
  updateBudget: (id: string, budget: Partial<FinancialBudget>) => Promise<FinancialBudget>;
  deleteBudget: (id: string) => Promise<void>;
  
  // Méthodes pour les paramètres
  updateSettings: (settings: Partial<FinancialSettings>) => Promise<FinancialSettings>;
  
  // Méthodes pour les rapports fiscaux
  generateTaxReport: (year: number) => Promise<string>;
  
  // Méthodes pour les prévisions
  generateForecast: (months: number) => Promise<Array<{ month: string, income: number, expense: number, net: number }>>;
  
  // Méthodes de rafraîchissement
  refreshData: () => Promise<void>;
  refreshDashboard: (startDate?: Date, endDate?: Date) => Promise<void>;
}

export const useFinances = (): UseFinancesReturn => {
  const [flows, setFlows] = useState<FinancialFlow[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [budgets, setBudgets] = useState<FinancialBudget[]>([]);
  const [settings, setSettings] = useState<FinancialSettings | null>(null);
  const [dashboardData, setDashboardData] = useState<FinancialDashboardData | null>(null);
  const [stats, setStats] = useState<FinancialStats | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger toutes les données
      const flowsData = await financialService.getAllFlows();
      const categoriesData = await financialService.getAllCategories();
      const reportsData = await financialService.getAllReports();
      const budgetsData = await financialService.getAllBudgets();
      const settingsData = await financialService.getFinancialSettings();
      
      // Charger les données du tableau de bord
      const dashboardData = await financialService.getDashboardData();
      const statsData = await financialService.getFinancialStats();
      
      // Mettre à jour l'état
      setFlows(flowsData);
      setCategories(categoriesData);
      setReports(reportsData);
      setBudgets(budgetsData);
      setSettings(settingsData);
      setDashboardData(dashboardData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des données');
      console.error('Erreur lors du chargement des données financières:', err);
    } finally {
      setLoading(false);
    }
  };

  // Méthodes pour les flux financiers
  const createFlow = async (flowData: Omit<FinancialFlow, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newFlow = await financialService.createFlow(flowData);
      setFlows(prev => [newFlow, ...prev]);
      await refreshDashboard();
      return newFlow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du flux');
      throw err;
    }
  };

  const updateFlow = async (id: string, flowData: Partial<FinancialFlow>) => {
    try {
      setError(null);
      const updatedFlow = await financialService.updateFlow(id, flowData);
      setFlows(prev => prev.map(flow => flow.id === id ? updatedFlow : flow));
      await refreshDashboard();
      return updatedFlow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du flux');
      throw err;
    }
  };

  const deleteFlow = async (id: string) => {
    try {
      setError(null);
      await financialService.deleteFlow(id);
      setFlows(prev => prev.filter(flow => flow.id !== id));
      await refreshDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du flux');
      throw err;
    }
  };

  const getFlowById = async (id: string) => {
    try {
      return await financialService.getFlowById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du flux');
      throw err;
    }
  };

  const getFlowsByProperty = async (propertyId: string) => {
    try {
      return await financialService.getFlowsByProperty(propertyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des flux');
      throw err;
    }
  };

  const getFlowsByTenant = async (tenantId: string) => {
    try {
      return await financialService.getFlowsByTenant(tenantId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des flux');
      throw err;
    }
  };

  const getFlowsByDateRange = async (startDate: Date, endDate: Date) => {
    try {
      return await financialService.getFlowsByDateRange(startDate, endDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des flux');
      throw err;
    }
  };

  const getFlowsByCategory = async (categoryId: string) => {
    try {
      return await financialService.getFlowsByCategory(categoryId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des flux');
      throw err;
    }
  };

  // Méthodes pour les catégories
  const createCategory = async (categoryData: Omit<FinancialCategory, 'id'>) => {
    try {
      setError(null);
      const newCategory = await financialService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la catégorie');
      throw err;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<FinancialCategory>) => {
    try {
      setError(null);
      const updatedCategory = await financialService.updateCategory(id, categoryData);
      setCategories(prev => prev.map(category => category.id === id ? updatedCategory : category));
      return updatedCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la catégorie');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      setError(null);
      await financialService.deleteCategory(id);
      setCategories(prev => prev.filter(category => category.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de la catégorie');
      throw err;
    }
  };

  const getCategoriesByType = async (type: 'income' | 'expense') => {
    try {
      return await financialService.getCategoriesByType(type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des catégories');
      throw err;
    }
  };

  // Méthodes pour les rapports
  const createReport = async (reportData: Omit<FinancialReport, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const newReport = await financialService.createReport(reportData);
      setReports(prev => [...prev, newReport]);
      return newReport;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du rapport');
      throw err;
    }
  };

  const generateReport = async (id: string) => {
    try {
      setError(null);
      const generatedReport = await financialService.generateReport(id);
      setReports(prev => prev.map(report => report.id === id ? generatedReport : report));
      return generatedReport;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du rapport');
      throw err;
    }
  };

  const deleteReport = async (id: string) => {
    try {
      setError(null);
      await financialService.deleteReport(id);
      setReports(prev => prev.filter(report => report.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du rapport');
      throw err;
    }
  };

  // Méthodes pour les budgets
  const createBudget = async (budgetData: Omit<FinancialBudget, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newBudget = await financialService.createBudget(budgetData);
      setBudgets(prev => [...prev, newBudget]);
      return newBudget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du budget');
      throw err;
    }
  };

  const updateBudget = async (id: string, budgetData: Partial<FinancialBudget>) => {
    try {
      setError(null);
      const updatedBudget = await financialService.updateBudget(id, budgetData);
      setBudgets(prev => prev.map(budget => budget.id === id ? updatedBudget : budget));
      return updatedBudget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du budget');
      throw err;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      setError(null);
      await financialService.deleteBudget(id);
      setBudgets(prev => prev.filter(budget => budget.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du budget');
      throw err;
    }
  };

  // Méthodes pour les paramètres
  const updateSettings = async (settingsData: Partial<FinancialSettings>) => {
    try {
      setError(null);
      const updatedSettings = await financialService.updateFinancialSettings(settingsData);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour des paramètres');
      throw err;
    }
  };

  // Méthodes pour les rapports fiscaux
  const generateTaxReport = async (year: number) => {
    try {
      setError(null);
      return await financialService.generateTaxReport(year);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération du rapport fiscal');
      throw err;
    }
  };

  // Méthodes pour les prévisions
  const generateForecast = async (months: number) => {
    try {
      setError(null);
      return await financialService.generateForecast(months);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération des prévisions');
      throw err;
    }
  };

  // Méthodes de rafraîchissement
  const refreshData = async () => {
    await loadInitialData();
  };

  const refreshDashboard = async (startDate?: Date, endDate?: Date, flowType?: string, propertyType?: string) => {
    try {
      const dashboardData = await financialService.getDashboardData(startDate, endDate, flowType, propertyType);
      const statsData = await financialService.getFinancialStats();
      
      setDashboardData(dashboardData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du rafraîchissement du tableau de bord');
      throw err;
    }
  };

  return {
    // Données
    flows,
    categories,
    reports,
    budgets,
    settings: settings as FinancialSettings,
    dashboardData,
    stats,
    
    // États
    loading,
    error,
    
    // Méthodes pour les flux
    createFlow,
    updateFlow,
    deleteFlow,
    getFlowById,
    getFlowsByProperty,
    getFlowsByTenant,
    getFlowsByDateRange,
    getFlowsByCategory,
    
    // Méthodes pour les catégories
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByType,
    
    // Méthodes pour les rapports
    createReport,
    generateReport,
    deleteReport,
    
    // Méthodes pour les budgets
    createBudget,
    updateBudget,
    deleteBudget,
    
    // Méthodes pour les paramètres
    updateSettings,
    
    // Méthodes pour les rapports fiscaux
    generateTaxReport,
    
    // Méthodes pour les prévisions
    generateForecast,
    
    // Méthodes de rafraîchissement
    refreshData,
    refreshDashboard,
  };
};
