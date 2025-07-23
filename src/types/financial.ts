export interface FinancialFlow {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  propertyId?: string;
  propertyName?: string;
  tenantId?: string;
  tenantName?: string;
  recurring: boolean;
  recurrenceFrequency?: 'monthly' | 'quarterly' | 'yearly';
  recurrenceEndDate?: Date;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod?: 'bank_transfer' | 'cash' | 'check' | 'direct_debit' | 'other';
  reference?: string;
  attachments?: string[];
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
  isDefault: boolean;
  isSystem: boolean;
}

export interface FinancialReport {
  id: string;
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  startDate: Date;
  endDate: Date;
  properties?: string[];
  categories?: string[];
  format: 'pdf' | 'csv' | 'excel';
  createdAt: Date;
  generatedAt?: Date;
  url?: string;
}

export interface FinancialDashboardData {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  pendingAmount: number;
  incomeByCategory: Record<string, number>;
  expenseByCategory: Record<string, number>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  propertyPerformance: Array<{
    propertyId: string;
    propertyName: string;
    income: number;
    expense: number;
    netIncome: number;
    roi: number;
  }>;
}

export interface TaxSettings {
  fiscalYear: {
    start: { month: number; day: number };
    end: { month: number; day: number };
  };
  vatRate?: number;
  isVatRegistered: boolean;
  propertyRegime: 'micro_foncier' | 'reel' | 'meuble_non_pro' | 'meuble_pro' | 'lmnp' | 'lmp';
  taxId?: string;
}

export interface FinancialSettings {
  defaultCurrency: string;
  defaultPaymentMethod: string;
  reminderSettings: {
    enableReminders: boolean;
    daysBeforeDue: number;
    reminderFrequency: number;
  };
  taxSettings: TaxSettings;
}

export interface FinancialStats {
  currentMonth: {
    income: number;
    expense: number;
    net: number;
  };
  previousMonth: {
    income: number;
    expense: number;
    net: number;
  };
  ytd: {
    income: number;
    expense: number;
    net: number;
  };
  occupancyRate: number;
  averageRent: number;
  rentalYield: number;
}

export interface FinancialBudget {
  id: string;
  name: string;
  year: number;
  month?: number;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    budgetAmount: number;
    actualAmount: number;
  }>;
  totalBudget: number;
  totalActual: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
