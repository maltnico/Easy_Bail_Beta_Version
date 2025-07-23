/*
  # Schéma complet EasyBail - Base de données de production

  1. Tables principales
    - `profiles` - Profils utilisateurs étendus
    - `properties` - Biens immobiliers
    - `tenants` - Locataires
    - `financial_flows` - Flux financiers
    - `financial_categories` - Catégories financières
    - `documents` - Documents générés
    - `document_templates` - Templates de documents
    - `email_templates` - Templates d'emails
    - `tasks` - Tâches et rappels
    - `automations` - Automatisations
    - `activities` - Journal d'activités
    - `notifications` - Notifications utilisateur
    - `incidents` - Gestion des incidents
    - `financial_reports` - Rapports financiers
    - `financial_budgets` - Budgets
    - `settings` - Paramètres utilisateur

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques de sécurité par utilisateur
    - Triggers pour les timestamps

  3. Fonctionnalités avancées
    - Recherche full-text
    - Indexes optimisés
    - Contraintes d'intégrité
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Profiles table (extended user data)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company_name text,
  phone text,
  avatar_url text,
  plan text NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'expert')),
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  subscription_status text NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired')),
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  type text NOT NULL CHECK (type IN ('apartment', 'house', 'studio', 'parking', 'commercial')),
  status text NOT NULL DEFAULT 'vacant' CHECK (status IN ('occupied', 'vacant', 'maintenance')),
  rent numeric(10,2) NOT NULL CHECK (rent >= 0),
  charges numeric(10,2) DEFAULT 0 CHECK (charges >= 0),
  surface numeric(8,2) NOT NULL CHECK (surface > 0),
  rooms integer NOT NULL DEFAULT 1 CHECK (rooms > 0),
  description text,
  amenities text[],
  images text[],
  coordinates point,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  lease_start date NOT NULL,
  lease_end date NOT NULL,
  rent numeric(10,2) NOT NULL CHECK (rent >= 0),
  deposit numeric(10,2) DEFAULT 0 CHECK (deposit >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'notice', 'former')),
  documents jsonb DEFAULT '[]',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_lease_dates CHECK (lease_end > lease_start)
);

-- Financial categories table
CREATE TABLE IF NOT EXISTS financial_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  color text NOT NULL DEFAULT '#3B82F6',
  icon text,
  is_default boolean DEFAULT false,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Financial flows table
CREATE TABLE IF NOT EXISTS financial_flows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL,
  category_id uuid NOT NULL REFERENCES financial_categories(id) ON DELETE RESTRICT,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  date date NOT NULL,
  recurring boolean DEFAULT false,
  recurrence_frequency text CHECK (recurrence_frequency IN ('monthly', 'quarterly', 'yearly')),
  recurrence_end_date date,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  payment_method text CHECK (payment_method IN ('bank_transfer', 'cash', 'check', 'direct_debit', 'other')),
  reference text,
  attachments text[],
  tags text[],
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id text,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('lease', 'inventory', 'receipt', 'notice', 'insurance', 'guarantee', 'amendment', 'termination', 'renewal', 'other')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'signed', 'archived', 'cancelled')),
  content text NOT NULL,
  data jsonb DEFAULT '{}',
  signatures jsonb DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  signed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('lease', 'inventory', 'receipt', 'notice', 'insurance', 'guarantee', 'amendment', 'termination', 'renewal', 'other')),
  category text NOT NULL CHECK (category IN ('rental_start', 'rental_management', 'rental_end', 'financial', 'legal', 'maintenance', 'administrative')),
  description text,
  content text NOT NULL,
  fields jsonb DEFAULT '[]',
  is_required boolean DEFAULT false,
  is_system boolean DEFAULT false,
  legal_compliance text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('tenant', 'property', 'financial', 'administrative', 'other')),
  document_template_id uuid REFERENCES document_templates(id) ON DELETE SET NULL,
  variables jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  category text NOT NULL CHECK (category IN ('maintenance', 'administrative', 'financial', 'visit', 'other')),
  assigned_to text,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Automations table
CREATE TABLE IF NOT EXISTS automations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  email_template_id uuid REFERENCES email_templates(id) ON DELETE SET NULL,
  document_template_id uuid REFERENCES document_templates(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('rent_review', 'receipt', 'notice', 'insurance', 'maintenance', 'reminder')),
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  next_execution timestamptz NOT NULL,
  last_execution timestamptz,
  active boolean DEFAULT true,
  description text,
  conditions jsonb DEFAULT '{}',
  actions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activities table (journal d'activités)
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('document', 'payment', 'property', 'tenant', 'automation', 'incident', 'login', 'system')),
  action text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  entity_id uuid,
  entity_type text CHECK (entity_type IN ('property', 'tenant', 'document', 'automation', 'incident')),
  entity_name text,
  metadata jsonb DEFAULT '{}',
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category text NOT NULL CHECK (category IN ('success', 'warning', 'error', 'info')),
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  read boolean DEFAULT false,
  action_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('maintenance', 'payment', 'neighbor', 'damage', 'legal', 'other')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  reported_by text NOT NULL CHECK (reported_by IN ('tenant', 'landlord', 'neighbor', 'maintenance')),
  reported_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  assigned_to text,
  estimated_cost numeric(10,2),
  actual_cost numeric(10,2),
  photos text[],
  comments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Financial reports table
CREATE TABLE IF NOT EXISTS financial_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('monthly', 'quarterly', 'yearly', 'custom')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  properties uuid[],
  categories uuid[],
  format text NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'csv', 'excel')),
  generated_at timestamptz,
  url text,
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Financial budgets table
CREATE TABLE IF NOT EXISTS financial_budgets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  year integer NOT NULL,
  month integer CHECK (month BETWEEN 1 AND 12),
  categories jsonb NOT NULL DEFAULT '[]',
  total_budget numeric(12,2) NOT NULL DEFAULT 0,
  total_actual numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for properties
CREATE POLICY "Users can view own properties" ON properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own properties" ON properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own properties" ON properties FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tenants
CREATE POLICY "Users can view own tenants" ON tenants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tenants" ON tenants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tenants" ON tenants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tenants" ON tenants FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for financial_categories
CREATE POLICY "Users can view own categories" ON financial_categories FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own categories" ON financial_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON financial_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON financial_categories FOR DELETE USING (auth.uid() = user_id AND NOT is_system);

-- RLS Policies for financial_flows
CREATE POLICY "Users can view own flows" ON financial_flows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flows" ON financial_flows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flows" ON financial_flows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flows" ON financial_flows FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for documents
CREATE POLICY "Users can view own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON documents FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for document_templates
CREATE POLICY "Users can view templates" ON document_templates FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert own templates" ON document_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON document_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON document_templates FOR DELETE USING (auth.uid() = user_id AND NOT is_system);

-- RLS Policies for email_templates
CREATE POLICY "Users can view own email templates" ON email_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own email templates" ON email_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own email templates" ON email_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own email templates" ON email_templates FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for automations
CREATE POLICY "Users can view own automations" ON automations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own automations" ON automations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own automations" ON automations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own automations" ON automations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for activities
CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activities" ON activities FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for incidents
CREATE POLICY "Users can view own incidents" ON incidents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own incidents" ON incidents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own incidents" ON incidents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own incidents" ON incidents FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for financial_reports
CREATE POLICY "Users can view own reports" ON financial_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON financial_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON financial_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON financial_reports FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for financial_budgets
CREATE POLICY "Users can view own budgets" ON financial_budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON financial_budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON financial_budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON financial_budgets FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON user_settings FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_property_id ON tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_financial_flows_user_id ON financial_flows(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_flows_date ON financial_flows(date);
CREATE INDEX IF NOT EXISTS idx_financial_flows_type ON financial_flows(type);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_property_id ON documents(property_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_properties_search ON properties USING gin(to_tsvector('french', name || ' ' || address));
CREATE INDEX IF NOT EXISTS idx_tenants_search ON tenants USING gin(to_tsvector('french', first_name || ' ' || last_name || ' ' || email));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_flows_updated_at BEFORE UPDATE ON financial_flows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_budgets_updated_at BEFORE UPDATE ON financial_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
