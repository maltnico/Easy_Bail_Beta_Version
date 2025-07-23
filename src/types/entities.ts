// Types d'entités métier (transformés depuis la DB)
export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  type: 'apartment' | 'house' | 'studio' | 'parking' | 'commercial';
  status: 'occupied' | 'vacant' | 'maintenance';
  rent: number;
  charges: number;
  surface: number;
  rooms: number;
  description?: string;
  amenities?: string[];
  images?: string[];
  tenant?: Tenant;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId: string;
  leaseStart: Date;
  leaseEnd: Date;
  rent: number;
  deposit: number;
  status: 'active' | 'notice' | 'former';
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  propertyId?: string;
  propertyName?: string;
  tenantId?: string;
  tenantName?: string;
  category: 'maintenance' | 'administrative' | 'financial' | 'visit' | 'other';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface Document {
  id: string;
  name: string;
  type: 'lease' | 'inventory' | 'receipt' | 'notice' | 'insurance' | 'other';
  status: 'draft' | 'pending' | 'signed' | 'archived';
  propertyId?: string;
  tenantId?: string;
  createdAt: Date;
  signedAt?: Date;
  url?: string;
}

export interface FinancialFlow {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  propertyId?: string;
  recurring: boolean;
  status: 'pending' | 'completed';
}

export interface Automation {
  id: string;
  name: string;
  type: 'rent_review' | 'receipt' | 'notice' | 'insurance' | 'maintenance' | 'reminder';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextExecution: Date;
  lastExecution?: Date;
  active: boolean;
  propertyId?: string;
  description: string;
  documentTemplateId?: string;
  createdAt: Date;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}
