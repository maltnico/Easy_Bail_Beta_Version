import { 
  FinancialFlow, 
  FinancialCategory, 
  FinancialReport, 
  FinancialDashboardData,
  FinancialStats,
  FinancialBudget,
  FinancialSettings
} from '../types/financial';
import { activityService } from './activityService';
import { supabase } from './supabase';

const STORAGE_KEYS = {
  FLOWS: 'easybail_financial_flows',
  CATEGORIES: 'easybail_financial_categories',
  REPORTS: 'easybail_financial_reports',
  BUDGETS: 'easybail_financial_budgets',
  SETTINGS: 'easybail_financial_settings'
};

// Catégories par défaut
const DEFAULT_CATEGORIES: FinancialCategory[] = [
  // Revenus
  { id: 'cat_rent', name: 'Loyer', type: 'income', color: '#4CAF50', isDefault: true, isSystem: true },
  { id: 'cat_charges', name: 'Charges', type: 'income', color: '#8BC34A', isDefault: true, isSystem: true },
  { id: 'cat_deposit', name: 'Dépôt de garantie', type: 'income', color: '#CDDC39', isDefault: true, isSystem: true },
  { id: 'cat_insurance', name: 'Remboursement assurance', type: 'income', color: '#FFEB3B', isDefault: true, isSystem: true },
  { id: 'cat_subsidy', name: 'Subventions', type: 'income', color: '#FFC107', isDefault: true, isSystem: true },
  { id: 'cat_other_income', name: 'Autres revenus', type: 'income', color: '#FF9800', isDefault: true, isSystem: true },
  
  // Dépenses
  { id: 'cat_mortgage', name: 'Crédit immobilier', type: 'expense', color: '#F44336', isDefault: true, isSystem: true },
  { id: 'cat_insurance_expense', name: 'Assurance PNO', type: 'expense', color: '#E91E63', isDefault: true, isSystem: true },
  { id: 'cat_maintenance', name: 'Entretien et réparations', type: 'expense', color: '#9C27B0', isDefault: true, isSystem: true },
  { id: 'cat_property_tax', name: 'Taxe foncière', type: 'expense', color: '#673AB7', isDefault: true, isSystem: true },
  { id: 'cat_condo_fees', name: 'Charges copropriété', type: 'expense', color: '#3F51B5', isDefault: true, isSystem: true },
  { id: 'cat_utilities', name: 'Eau, électricité, gaz', type: 'expense', color: '#2196F3', isDefault: true, isSystem: true },
  { id: 'cat_management_fees', name: 'Frais de gestion', type: 'expense', color: '#03A9F4', isDefault: true, isSystem: true },
  { id: 'cat_accounting', name: 'Comptabilité', type: 'expense', color: '#00BCD4', isDefault: true, isSystem: true },
  { id: 'cat_legal', name: 'Frais juridiques', type: 'expense', color: '#009688', isDefault: true, isSystem: true },
  { id: 'cat_other_expense', name: 'Autres dépenses', type: 'expense', color: '#607D8B', isDefault: true, isSystem: true }
];

// Données de démonstration
const DEMO_FLOWS: FinancialFlow[] = [
  {
    id: 'flow_1',
    type: 'income',
    category: 'cat_rent',
    amount: 1200,
    description: 'Loyer Novembre 2024 - Appartement Bastille',
    date: new Date('2024-11-05'),
    propertyId: '1',
    propertyName: 'Appartement Bastille',
    tenantId: '1',
    tenantName: 'Marie Martin',
    recurring: true,
    recurrenceFrequency: 'monthly',
    status: 'completed',
    paymentMethod: 'bank_transfer',
    reference: 'VIR-NOV2024-MM',
    createdAt: new Date('2024-11-05'),
    updatedAt: new Date('2024-11-05')
  },
  {
    id: 'flow_2',
    type: 'income',
    category: 'cat_charges',
    amount: 150,
    description: 'Charges Novembre 2024 - Appartement Bastille',
    date: new Date('2024-11-05'),
    propertyId: '1',
    propertyName: 'Appartement Bastille',
    tenantId: '1',
    tenantName: 'Marie Martin',
    recurring: true,
    recurrenceFrequency: 'monthly',
    status: 'completed',
    paymentMethod: 'bank_transfer',
    reference: 'VIR-CHARGES-NOV2024-MM',
    createdAt: new Date('2024-11-05'),
    updatedAt: new Date('2024-11-05')
  },
  {
    id: 'flow_3',
    type: 'expense',
    category: 'cat_maintenance',
    amount: 450,
    description: 'Réparation plomberie - Studio Montmartre',
    date: new Date('2024-11-15'),
    propertyId: '2',
    propertyName: 'Studio Montmartre',
    recurring: false,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    reference: 'FAC-PLOMB-2024-11',
    notes: 'Intervention d\'urgence suite à une fuite',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-15')
  },
  {
    id: 'flow_4',
    type: 'expense',
    category: 'cat_insurance_expense',
    amount: 180,
    description: 'Assurance PNO annuelle',
    date: new Date('2024-12-01'),
    recurring: true,
    recurrenceFrequency: 'yearly',
    status: 'pending',
    paymentMethod: 'direct_debit',
    reference: 'ASS-PNO-2024',
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date('2024-11-20')
  },
  {
    id: 'flow_5',
    type: 'income',
    category: 'cat_rent',
    amount: 2200,
    description: 'Loyer Novembre 2024 - Maison Vincennes',
    date: new Date('2024-11-03'),
    propertyId: '3',
    propertyName: 'Maison Vincennes',
    tenantId: '2',
    tenantName: 'Pierre Dubois',
    recurring: true,
    recurrenceFrequency: 'monthly',
    status: 'completed',
    paymentMethod: 'bank_transfer',
    reference: 'VIR-NOV2024-PD',
    createdAt: new Date('2024-11-03'),
    updatedAt: new Date('2024-11-03')
  },
  {
    id: 'flow_6',
    type: 'expense',
    category: 'cat_property_tax',
    amount: 1200,
    description: 'Taxe foncière 2024 - Maison Vincennes',
    date: new Date('2024-10-15'),
    propertyId: '3',
    propertyName: 'Maison Vincennes',
    recurring: true,
    recurrenceFrequency: 'yearly',
    status: 'completed',
    paymentMethod: 'bank_transfer',
    reference: 'TAXE-FONC-2024-VIN',
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-10-15')
  },
  {
    id: 'flow_7',
    type: 'expense',
    category: 'cat_condo_fees',
    amount: 320,
    description: 'Charges copropriété T4 2024 - Appartement Bastille',
    date: new Date('2024-10-10'),
    propertyId: '1',
    propertyName: 'Appartement Bastille',
    recurring: true,
    recurrenceFrequency: 'quarterly',
    status: 'completed',
    paymentMethod: 'direct_debit',
    reference: 'COPRO-T4-2024-BAST',
    createdAt: new Date('2024-10-10'),
    updatedAt: new Date('2024-10-10')
  },
  {
    id: 'flow_8',
    type: 'expense',
    category: 'cat_mortgage',
    amount: 850,
    description: 'Échéance prêt immobilier - Studio Montmartre',
    date: new Date('2024-11-05'),
    propertyId: '2',
    propertyName: 'Studio Montmartre',
    recurring: true,
    recurrenceFrequency: 'monthly',
    status: 'completed',
    paymentMethod: 'direct_debit',
    reference: 'PRET-NOV2024-MONT',
    createdAt: new Date('2024-11-05'),
    updatedAt: new Date('2024-11-05')
  },
  {
    id: 'flow_9',
    type: 'expense',
    category: 'cat_utilities',
    amount: 75,
    description: 'Facture eau - Studio Montmartre',
    date: new Date('2024-11-20'),
    propertyId: '2',
    propertyName: 'Studio Montmartre',
    recurring: true,
    recurrenceFrequency: 'quarterly',
    status: 'completed',
    paymentMethod: 'direct_debit',
    reference: 'EAU-NOV2024-MONT',
    createdAt: new Date('2024-11-20'),
    updatedAt: new Date('2024-11-20')
  },
  {
    id: 'flow_10',
    type: 'income',
    category: 'cat_deposit',
    amount: 2400,
    description: 'Dépôt de garantie - Appartement Bastille',
    date: new Date('2023-09-01'),
    propertyId: '1',
    propertyName: 'Appartement Bastille',
    tenantId: '1',
    tenantName: 'Marie Martin',
    recurring: false,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    reference: 'DEP-2023-MM',
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2023-09-01')
  }
];

// Paramètres financiers par défaut
export const DEFAULT_SETTINGS: FinancialSettings = {
  defaultCurrency: 'EUR',
  defaultPaymentMethod: 'bank_transfer',
  reminderSettings: {
    enableReminders: true,
    daysBeforeDue: 5,
    reminderFrequency: 2
  },
  taxSettings: {
    fiscalYear: {
      start: { month: 1, day: 1 },
      end: { month: 12, day: 31 }
    },
    isVatRegistered: false,
    propertyRegime: 'micro_foncier'
  }
};

class FinancialService {
  private flows: FinancialFlow[] = [];
  private categories: FinancialCategory[] = [];
  private reports: FinancialReport[] = [];
  private budgets: FinancialBudget[] = [];
  private settings: FinancialSettings;

  constructor() {
    this.initializeStorage();
    this.flows = this.getFlows();
    this.categories = this.getCategories();
    this.reports = this.getReports();
    this.budgets = this.getBudgets();
    this.settings = this.getSettings();
  }

  private initializeStorage() {
    // Initialiser les flux financiers
    if (!localStorage.getItem(STORAGE_KEYS.FLOWS)) {
      localStorage.setItem(STORAGE_KEYS.FLOWS, JSON.stringify(DEMO_FLOWS));
    }

    // Initialiser les catégories
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }

    // Initialiser les rapports
    if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify([]));
    }

    // Initialiser les budgets
    if (!localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
    }

    // Initialiser les paramètres
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
  }

  // Méthodes pour les flux financiers
  private getFlows(): FinancialFlow[] {
    const flows = localStorage.getItem(STORAGE_KEYS.FLOWS);
    return flows ? JSON.parse(flows).map((flow: any) => ({
      ...flow,
      date: new Date(flow.date),
      recurrenceEndDate: flow.recurrenceEndDate ? new Date(flow.recurrenceEndDate) : undefined,
      createdAt: new Date(flow.createdAt),
      updatedAt: new Date(flow.updatedAt)
    })) : [];
  }

  private saveFlows() {
    localStorage.setItem(STORAGE_KEYS.FLOWS, JSON.stringify(this.flows));
  }

  async getAllFlows(): Promise<FinancialFlow[]> {
    return this.flows;
  }

  async getFlowById(id: string): Promise<FinancialFlow | null> {
    return this.flows.find(flow => flow.id === id) || null;
  }

  async getFlowsByProperty(propertyId: string): Promise<FinancialFlow[]> {
    return this.flows.filter(flow => flow.propertyId === propertyId);
  }

  async getFlowsByTenant(tenantId: string): Promise<FinancialFlow[]> {
    return this.flows.filter(flow => flow.tenantId === tenantId);
  }

  async getFlowsByDateRange(startDate: Date, endDate: Date): Promise<FinancialFlow[]> {
    return this.flows.filter(flow => flow.date >= startDate && flow.date <= endDate);
  }

  async getFlowsByCategory(categoryId: string): Promise<FinancialFlow[]> {
    return this.flows.filter(flow => flow.category === categoryId);
  }

  async createFlow(flowData: Omit<FinancialFlow, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialFlow> {
    try {
      // Try to save to Supabase first
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData?.user) {
        const flowInsert = {
          user_id: userData.user.id,
          property_id: flowData.propertyId || null,
          tenant_id: flowData.tenantId || null,
          category_id: flowData.category,
          type: flowData.type,
          amount: flowData.amount,
          description: flowData.description,
          date: flowData.date.toISOString().split('T')[0],
          recurring: flowData.recurring,
          recurrence_frequency: flowData.recurrenceFrequency || null,
          recurrence_end_date: flowData.recurrenceEndDate?.toISOString().split('T')[0] || null,
          status: flowData.status,
          payment_method: flowData.paymentMethod || null,
          reference: flowData.reference || null,
          attachments: flowData.attachments || null,
          tags: flowData.tags || null,
          notes: flowData.notes || null,
          metadata: {
            propertyName: flowData.propertyName,
            tenantName: flowData.tenantName
          }
        };
        
        const { data, error } = await supabase
          .from('financial_flows')
          .insert(flowInsert)
          .select()
          .single();
        
        if (!error && data) {
          const newFlow: FinancialFlow = {
            id: data.id,
            type: data.type as 'income' | 'expense',
            category: data.category_id,
            amount: data.amount,
            description: data.description,
            date: new Date(data.date),
            propertyId: data.property_id || undefined,
            propertyName: data.metadata?.propertyName || undefined,
            tenantId: data.tenant_id || undefined,
            tenantName: data.metadata?.tenantName || undefined,
            recurring: data.recurring,
            recurrenceFrequency: data.recurrence_frequency as 'monthly' | 'quarterly' | 'yearly' | undefined,
            recurrenceEndDate: data.recurrence_end_date ? new Date(data.recurrence_end_date) : undefined,
            status: data.status as 'pending' | 'completed' | 'cancelled',
            paymentMethod: data.payment_method as any,
            reference: data.reference || undefined,
            attachments: data.attachments || undefined,
            tags: data.tags || undefined,
            notes: data.notes || undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at)
          };
          
          // Add to local storage as backup
          this.flows.push(newFlow);
          this.saveFlows();
          
          // Log activity
          try {
            await activityService.addActivity({
              type: 'payment',
              action: flowData.type === 'income' ? 'received' : 'paid',
              title: flowData.type === 'income' ? 'Revenu enregistré' : 'Dépense enregistrée',
              description: flowData.description,
              entityId: newFlow.id,
              entityType: 'payment',
              entityName: flowData.description,
              userId: userData.user.id,
              metadata: {
                amount: flowData.amount,
                category: this.getCategoryNameById(flowData.category),
                property: flowData.propertyName,
                tenant: flowData.tenantName
              },
              priority: 'medium',
              category: 'success'
            });
          } catch (activityError) {
            console.warn('Could not log financial flow activity:', activityError);
          }
          
          return newFlow;
        }
      }
    } catch (error) {
      console.warn('Could not save to Supabase, using local storage:', error);
    }
    
    // Fallback to local storage
    const newFlow: FinancialFlow = {
      ...flowData,
      id: 'flow_' + Math.random().toString(36).substring(2, 11),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.flows.push(newFlow);
    this.saveFlows();


    return newFlow;
  }

  async updateFlow(id: string, flowData: Partial<FinancialFlow>): Promise<FinancialFlow> {
    const index = this.flows.findIndex(flow => flow.id === id);
    if (index === -1) {
      throw new Error('Flux financier non trouvé');
    }

    const updatedFlow = {
      ...this.flows[index],
      ...flowData,
      updatedAt: new Date()
    };

    this.flows[index] = updatedFlow;
    this.saveFlows();

    return updatedFlow;
  }

  async deleteFlow(id: string): Promise<void> {
    const flowToDelete = this.flows.find(flow => flow.id === id);
    if (!flowToDelete) {
      throw new Error('Flux financier non trouvé');
    }

    this.flows = this.flows.filter(flow => flow.id !== id);
    this.saveFlows();

    // Ajouter une activité
    activityService.addActivity({
      type: 'payment',
      action: 'deleted',
      title: 'Flux financier supprimé',
      description: flowToDelete.description,
      entityId: id,
      userId: 'current-user',
      metadata: {
        amount: flowToDelete.amount,
        type: flowToDelete.type
      },
      priority: 'low',
      category: 'info'
    });
  }

  // Méthodes pour les catégories
  private getCategories(): FinancialCategory[] {
    const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return categories ? JSON.parse(categories) : DEFAULT_CATEGORIES;
  }

  private saveCategories() {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
  }

  async getAllCategories(): Promise<FinancialCategory[]> {
    return this.categories;
  }

  async getCategoriesByType(type: 'income' | 'expense'): Promise<FinancialCategory[]> {
    return this.categories.filter(category => category.type === type);
  }

  async getCategoryById(id: string): Promise<FinancialCategory | null> {
    return this.categories.find(category => category.id === id) || null;
  }

  getCategoryNameById(id: string): string {
    const category = this.categories.find(category => category.id === id);
    return category ? category.name : 'Catégorie inconnue';
  }

  async createCategory(categoryData: Omit<FinancialCategory, 'id'>): Promise<FinancialCategory> {
    const newCategory: FinancialCategory = {
      ...categoryData,
      id: 'cat_' + Math.random().toString(36).substring(2, 11)
    };

    this.categories.push(newCategory);
    this.saveCategories();

    return newCategory;
  }

  async updateCategory(id: string, categoryData: Partial<FinancialCategory>): Promise<FinancialCategory> {
    const index = this.categories.findIndex(category => category.id === id);
    if (index === -1) {
      throw new Error('Catégorie non trouvée');
    }

    // Empêcher la modification des catégories système
    if (this.categories[index].isSystem) {
      throw new Error('Impossible de modifier une catégorie système');
    }

    const updatedCategory = {
      ...this.categories[index],
      ...categoryData
    };

    this.categories[index] = updatedCategory;
    this.saveCategories();

    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    const categoryToDelete = this.categories.find(category => category.id === id);
    if (!categoryToDelete) {
      throw new Error('Catégorie non trouvée');
    }

    // Empêcher la suppression des catégories système
    if (categoryToDelete.isSystem) {
      throw new Error('Impossible de supprimer une catégorie système');
    }

    // Vérifier si la catégorie est utilisée
    const isUsed = this.flows.some(flow => flow.category === id);
    if (isUsed) {
      throw new Error('Impossible de supprimer une catégorie utilisée par des flux financiers');
    }

    this.categories = this.categories.filter(category => category.id !== id);
    this.saveCategories();
  }

  // Méthodes pour les rapports
  private getReports(): FinancialReport[] {
    const reports = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return reports ? JSON.parse(reports).map((report: any) => ({
      ...report,
      startDate: new Date(report.startDate),
      endDate: new Date(report.endDate),
      createdAt: new Date(report.createdAt),
      generatedAt: report.generatedAt ? new Date(report.generatedAt) : undefined
    })) : [];
  }

  private saveReports() {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(this.reports));
  }

  async getAllReports(): Promise<FinancialReport[]> {
    return this.reports;
  }

  async getReportById(id: string): Promise<FinancialReport | null> {
    return this.reports.find(report => report.id === id) || null;
  }

  async createReport(reportData: Omit<FinancialReport, 'id' | 'createdAt'>): Promise<FinancialReport> {
    const newReport: FinancialReport = {
      ...reportData,
      id: 'report_' + Math.random().toString(36).substring(2, 11),
      createdAt: new Date()
    };

    this.reports.push(newReport);
    this.saveReports();

    return newReport;
  }

  async generateReport(id: string): Promise<FinancialReport> {
    const report = this.reports.find(report => report.id === id);
    if (!report) {
      throw new Error('Rapport non trouvé');
    }

    // Simuler la génération d'un rapport
    const updatedReport = {
      ...report,
      generatedAt: new Date(),
      url: `https://example.com/reports/${id}.${report.format}`
    };

    const index = this.reports.findIndex(r => r.id === id);
    this.reports[index] = updatedReport;
    this.saveReports();

    // Ajouter une activité
    activityService.addActivity({
      type: 'payment',
      action: 'report_generated',
      title: 'Rapport financier généré',
      description: `Le rapport "${report.name}" a été généré`,
      entityId: id,
      userId: 'current-user',
      metadata: {
        startDate: report.startDate.toISOString(),
        endDate: report.endDate.toISOString(),
        format: report.format
      },
      priority: 'low',
      category: 'success'
    });

    return updatedReport;
  }

  async deleteReport(id: string): Promise<void> {
    this.reports = this.reports.filter(report => report.id !== id);
    this.saveReports();
  }

  // Méthodes pour les budgets
  private getBudgets(): FinancialBudget[] {
    const budgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return budgets ? JSON.parse(budgets).map((budget: any) => ({
      ...budget,
      createdAt: new Date(budget.createdAt),
      updatedAt: new Date(budget.updatedAt)
    })) : [];
  }

  private saveBudgets() {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(this.budgets));
  }

  async getAllBudgets(): Promise<FinancialBudget[]> {
    return this.budgets;
  }

  async getBudgetById(id: string): Promise<FinancialBudget | null> {
    return this.budgets.find(budget => budget.id === id) || null;
  }

  async createBudget(budgetData: Omit<FinancialBudget, 'id' | 'createdAt' | 'updatedAt'>): Promise<FinancialBudget> {
    const newBudget: FinancialBudget = {
      ...budgetData,
      id: 'budget_' + Math.random().toString(36).substring(2, 11),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.budgets.push(newBudget);
    this.saveBudgets();

    return newBudget;
  }

  async updateBudget(id: string, budgetData: Partial<FinancialBudget>): Promise<FinancialBudget> {
    const index = this.budgets.findIndex(budget => budget.id === id);
    if (index === -1) {
      throw new Error('Budget non trouvé');
    }

    const updatedBudget = {
      ...this.budgets[index],
      ...budgetData,
      updatedAt: new Date()
    };

    this.budgets[index] = updatedBudget;
    this.saveBudgets();

    return updatedBudget;
  }

  async deleteBudget(id: string): Promise<void> {
    this.budgets = this.budgets.filter(budget => budget.id !== id);
    this.saveBudgets();
  }

  // Méthodes pour les paramètres
  private getSettings(): FinancialSettings {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  }

  private saveSettings() {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
  }

  async getFinancialSettings(): Promise<FinancialSettings> {
    return this.settings;
  }

  async updateFinancialSettings(settingsData: Partial<FinancialSettings>): Promise<FinancialSettings> {
    this.settings = {
      ...this.settings,
      ...settingsData
    };

    this.saveSettings();
    return this.settings;
  }

  // Méthodes pour le tableau de bord
  async getDashboardData(startDate?: Date, endDate?: Date, flowType?: string, propertyType?: string): Promise<FinancialDashboardData> {
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let filteredFlows = this.flows.filter(flow => flow.date >= start && flow.date <= end);
    
    // Filtrer par type de flux si spécifié
    if (flowType && flowType !== 'all') {
      filteredFlows = filteredFlows.filter(flow => flow.type === flowType);
    }
    
    // Filtrer par type de propriété si spécifié
    if (propertyType && propertyType !== 'all') {
      filteredFlows = filteredFlows.filter(flow => {
        // Si le flux a une propriété associée, vérifier son type
        if (flow.propertyId) {
          // Simuler une recherche de propriété par ID
          // Dans un cas réel, cela serait fait via une requête à la base de données
          // ou en utilisant un cache de propriétés
          const property = this.getPropertyById(flow.propertyId);
          return property?.type === propertyType;
        }
        return false;
      });
    }
    
    const incomeFlows = filteredFlows.filter(flow => flow.type === 'income');
    const expenseFlows = filteredFlows.filter(flow => flow.type === 'expense');
    
    const totalIncome = incomeFlows.reduce((sum, flow) => sum + flow.amount, 0);
    const totalExpense = expenseFlows.reduce((sum, flow) => sum + flow.amount, 0);
    
    // Calculer les revenus et dépenses par catégorie
    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};
    
    incomeFlows.forEach(flow => {
      const categoryName = this.getCategoryNameById(flow.category);
      incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + flow.amount;
    });
    
    expenseFlows.forEach(flow => {
      const categoryName = this.getCategoryNameById(flow.category);
      expenseByCategory[categoryName] = (expenseByCategory[categoryName] || 0) + flow.amount;
    });
    
    // Calculer la tendance mensuelle (6 derniers mois)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthFlows = this.flows.filter(flow => flow.date >= monthStart && flow.date <= monthEnd);
      const monthIncome = monthFlows.filter(flow => flow.type === 'income').reduce((sum, flow) => sum + flow.amount, 0);
      const monthExpense = monthFlows.filter(flow => flow.type === 'expense').reduce((sum, flow) => sum + flow.amount, 0);
      
      monthlyTrend.push({
        month: monthName,
        income: monthIncome,
        expense: monthExpense
      });
    }
    
    // Calculer la performance par bien
    const propertyPerformance = [];
    const propertyMap = new Map<string, { propertyId: string, propertyName: string, income: number, expense: number }>();
    
    filteredFlows.forEach(flow => {
      if (flow.propertyId && flow.propertyName) {
        if (!propertyMap.has(flow.propertyId)) {
          propertyMap.set(flow.propertyId, {
            propertyId: flow.propertyId,
            propertyName: flow.propertyName,
            income: 0,
            expense: 0
          });
        }
        
        const property = propertyMap.get(flow.propertyId)!;
        if (flow.type === 'income') {
          property.income += flow.amount;
        } else {
          property.expense += flow.amount;
        }
      }
    });
    
    propertyMap.forEach(property => {
      const netIncome = property.income - property.expense;
      // Calcul simplifié du ROI (retour sur investissement)
      // En réalité, il faudrait connaître la valeur du bien
      const estimatedPropertyValue = property.income * 12 * 20; // Estimation grossière basée sur 20 ans de revenus
      const roi = estimatedPropertyValue > 0 ? (netIncome * 12 / estimatedPropertyValue) * 100 : 0;
      
      propertyPerformance.push({
        ...property,
        netIncome,
        roi
      });
    });
    
    // Montant en attente
    const pendingAmount = this.flows
      .filter(flow => flow.status === 'pending')
      .reduce((sum, flow) => sum + flow.amount, 0);
    
    return {
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense,
      pendingAmount,
      incomeByCategory,
      expenseByCategory,
      monthlyTrend,
      propertyPerformance
    };
  }

  // Méthode utilitaire pour simuler la recherche d'une propriété par ID
  private getPropertyById(propertyId: string) {
    // Ceci est une simulation - dans une application réelle,
    // vous récupéreriez la propriété depuis une base de données ou un cache
    const mockProperties = [
      { id: '1', type: 'apartment', name: 'Appartement Bastille' },
      { id: '2', type: 'studio', name: 'Studio Montmartre' },
      { id: '3', type: 'house', name: 'Maison Vincennes' }
    ];
    
    return mockProperties.find(p => p.id === propertyId);
  }

  async getFinancialStats(): Promise<FinancialStats> {
    const now = new Date();
    
    // Mois courant
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const currentMonthFlows = this.flows.filter(flow => flow.date >= currentMonthStart && flow.date <= currentMonthEnd);
    
    const currentMonthIncome = currentMonthFlows
      .filter(flow => flow.type === 'income')
      .reduce((sum, flow) => sum + flow.amount, 0);
    
    const currentMonthExpense = currentMonthFlows
      .filter(flow => flow.type === 'expense')
      .reduce((sum, flow) => sum + flow.amount, 0);
    
    // Mois précédent
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const prevMonthFlows = this.flows.filter(flow => flow.date >= prevMonthStart && flow.date <= prevMonthEnd);
    
    const prevMonthIncome = prevMonthFlows
      .filter(flow => flow.type === 'income')
      .reduce((sum, flow) => sum + flow.amount, 0);
    
    const prevMonthExpense = prevMonthFlows
      .filter(flow => flow.type === 'expense')
      .reduce((sum, flow) => sum + flow.amount, 0);
    
    // Depuis le début de l'année
    const ytdStart = new Date(now.getFullYear(), 0, 1);
    const ytdFlows = this.flows.filter(flow => flow.date >= ytdStart && flow.date <= now);
    
    const ytdIncome = ytdFlows
      .filter(flow => flow.type === 'income')
      .reduce((sum, flow) => sum + flow.amount, 0);
    
    const ytdExpense = ytdFlows
      .filter(flow => flow.type === 'expense')
      .reduce((sum, flow) => sum + flow.amount, 0);
    
    // Statistiques supplémentaires
    const rentFlows = this.flows.filter(flow => flow.category === 'cat_rent' && flow.type === 'income');
    const totalRentableProperties = new Set(rentFlows.map(flow => flow.propertyId)).size;
    const occupiedProperties = new Set(rentFlows.filter(flow => 
      flow.date.getMonth() === now.getMonth() && 
      flow.date.getFullYear() === now.getFullYear()
    ).map(flow => flow.propertyId)).size;
    
    const occupancyRate = totalRentableProperties > 0 ? (occupiedProperties / totalRentableProperties) * 100 : 0;
    
    const averageRent = rentFlows.length > 0 ? 
      rentFlows.reduce((sum, flow) => sum + flow.amount, 0) / rentFlows.length : 0;
    
    // Rendement locatif (simplifié)
    const annualRent = averageRent * 12 * occupiedProperties;
    const estimatedPropertyValue = annualRent * 20; // Estimation grossière
    const rentalYield = estimatedPropertyValue > 0 ? (annualRent / estimatedPropertyValue) * 100 : 0;
    
    return {
      currentMonth: {
        income: currentMonthIncome,
        expense: currentMonthExpense,
        net: currentMonthIncome - currentMonthExpense
      },
      previousMonth: {
        income: prevMonthIncome,
        expense: prevMonthExpense,
        net: prevMonthIncome - prevMonthExpense
      },
      ytd: {
        income: ytdIncome,
        expense: ytdExpense,
        net: ytdIncome - ytdExpense
      },
      occupancyRate,
      averageRent,
      rentalYield
    };
  }

  // Méthodes pour l'export fiscal
  async generateTaxReport(year: number): Promise<string> {
    // Récupérer les flux de l'année fiscale
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    const yearFlows = this.flows.filter(flow => flow.date >= startDate && flow.date <= endDate);
    
    // Calculer les totaux par catégorie
    const incomeByCategory: Record<string, number> = {};
    const expenseByCategory: Record<string, number> = {};
    
    yearFlows.forEach(flow => {
      const categoryName = this.getCategoryNameById(flow.category);
      if (flow.type === 'income') {
        incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + flow.amount;
      } else {
        expenseByCategory[categoryName] = (expenseByCategory[categoryName] || 0) + flow.amount;
      }
    });
    
    // Calculer les totaux
    const totalIncome = Object.values(incomeByCategory).reduce((sum, amount) => sum + amount, 0);
    const totalExpense = Object.values(expenseByCategory).reduce((sum, amount) => sum + amount, 0);
    const netIncome = totalIncome - totalExpense;
    
    // Générer le rapport (simulé)
    const reportUrl = `https://example.com/tax-reports/${year}.pdf`;
    
    // Ajouter une activité
    activityService.addActivity({
      type: 'payment',
      action: 'tax_report_generated',
      title: 'Rapport fiscal généré',
      description: `Rapport fiscal pour l'année ${year}`,
      userId: 'current-user',
      metadata: {
        year,
        totalIncome,
        totalExpense,
        netIncome
      },
      priority: 'medium',
      category: 'success'
    });
    
    return reportUrl;
  }

  // Méthodes pour les prévisions
  async generateForecast(months: number): Promise<Array<{ month: string, income: number, expense: number, net: number }>> {
    const now = new Date();
    const forecast = [];
    
    // Récupérer les flux récurrents
    const recurringFlows = this.flows.filter(flow => flow.recurring);
    
    for (let i = 0; i < months; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = forecastDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      
      let monthIncome = 0;
      let monthExpense = 0;
      
      // Ajouter les flux récurrents
      recurringFlows.forEach(flow => {
        // Vérifier si le flux est applicable pour ce mois
        let isApplicable = false;
        
        if (flow.recurrenceFrequency === 'monthly') {
          isApplicable = true;
        } else if (flow.recurrenceFrequency === 'quarterly' && i % 3 === 0) {
          isApplicable = true;
        } else if (flow.recurrenceFrequency === 'yearly' && i % 12 === 0) {
          isApplicable = true;
        }
        
        // Vérifier la date de fin de récurrence
        if (isApplicable && flow.recurrenceEndDate) {
          isApplicable = forecastDate <= flow.recurrenceEndDate;
        }
        
        if (isApplicable) {
          if (flow.type === 'income') {
            monthIncome += flow.amount;
          } else {
            monthExpense += flow.amount;
          }
        }
      });
      
      forecast.push({
        month: monthName,
        income: monthIncome,
        expense: monthExpense,
        net: monthIncome - monthExpense
      });
    }
    
    return forecast;
  }
}

export const financialService = new FinancialService();
