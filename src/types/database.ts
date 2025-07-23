// Types spécifiques à la base de données
export interface DatabaseProperty {
  id: string;
  name: string;
  address: string;
  type: 'apartment' | 'house' | 'studio' | 'parking' | 'commercial';
  status: 'occupied' | 'vacant' | 'maintenance';
  rent: number;
  charges: number;
  surface: number;
  rooms: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  property_id: string;
  lease_start: string;
  lease_end: string;
  rent: number;
  deposit: number;
  status: 'active' | 'notice' | 'former';
  created_at: string;
}

export interface DatabaseTask {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  property_id?: string;
  tenant_id?: string;
  category: 'maintenance' | 'administrative' | 'financial' | 'visit' | 'other';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface DatabaseDocument {
  id: string;
  name: string;
  type: 'lease' | 'inventory' | 'receipt' | 'notice' | 'insurance' | 'other';
  status: 'draft' | 'pending' | 'signed' | 'archived';
  property_id?: string;
  tenant_id?: string;
  file_url?: string;
  created_at: string;
  signed_at?: string;
}

export interface DatabaseFinancialFlow {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  property_id?: string;
  recurring: boolean;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface DatabaseAutomation {
  id: string;
  name: string;
  type: 'rent_review' | 'receipt' | 'notice' | 'insurance' | 'maintenance' | 'reminder';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_execution: string;
  last_execution?: string;
  active: boolean;
  property_id?: string;
  description: string;
  document_template_id?: string;
  created_at: string;
}

export interface DatabaseAlert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  action_url?: string;
  created_at: string;
}
