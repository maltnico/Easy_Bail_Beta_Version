import { supabase, isConnected } from '../lib/supabase';
import { activityService } from '../lib/activityService';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  phone: string | null;
  plan: 'starter' | 'professional' | 'expert';
  trial_ends_at: string;
  subscription_status: 'trial' | 'active' | 'cancelled' | 'expired';
  role: 'user' | 'manager' | 'admin';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  phone?: string;
  plan: 'starter' | 'professional' | 'expert';
  role?: 'user' | 'manager' | 'admin';
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  plan?: 'starter' | 'professional' | 'expert';
  role?: 'user' | 'manager' | 'admin';
  subscription_status?: 'trial' | 'active' | 'cancelled' | 'expired';
}

class UserService {
  // Données de démonstration pour le mode hors ligne
  private getDemoUsers(): User[] {
    return [
      {
        id: 'admin-1',
        email: 'admin@easybail.pro',
        first_name: 'Admin',
        last_name: 'EasyBail',
        company_name: 'EasyBail SAS',
        phone: '04 66 89 68 30',
        plan: 'expert',
        trial_ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'active',
        role: 'admin',
        avatar_url: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString()
      },
      {
        id: 'user-1',
        email: 'marie.martin@email.com',
        first_name: 'Marie',
        last_name: 'Martin',
        company_name: null,
        phone: '06 12 34 56 78',
        plan: 'professional',
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'trial',
        role: 'user',
        avatar_url: null,
        created_at: '2024-11-15T00:00:00.000Z',
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'user-2',
        email: 'pierre.dubois@email.com',
        first_name: 'Pierre',
        last_name: 'Dubois',
        company_name: 'Immobilier Dubois',
        phone: '06 98 76 54 32',
        plan: 'starter',
        trial_ends_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'expired',
        role: 'user',
        avatar_url: null,
        created_at: '2024-10-20T00:00:00.000Z',
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'user-3',
        email: 'sophie.bernard@email.com',
        first_name: 'Sophie',
        last_name: 'Bernard',
        company_name: 'SCI Bernard',
        phone: '07 11 22 33 44',
        plan: 'professional',
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'active',
        role: 'manager',
        avatar_url: null,
        created_at: '2024-09-10T00:00:00.000Z',
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'user-4',
        email: 'jean.dupont@email.com',
        first_name: 'Jean',
        last_name: 'Dupont',
        company_name: null,
        phone: null,
        plan: 'starter',
        trial_ends_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'trial',
        role: 'user',
        avatar_url: null,
        created_at: '2024-12-01T00:00:00.000Z',
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'user-5',
        email: 'claire.rousseau@email.com',
        first_name: 'Claire',
        last_name: 'Rousseau',
        company_name: 'Gestion Rousseau',
        phone: '06 55 44 33 22',
        plan: 'expert',
        trial_ends_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'active',
        role: 'manager',
        avatar_url: null,
        created_at: '2024-08-05T00:00:00.000Z',
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'user-6',
        email: 'thomas.leroy@email.com',
        first_name: 'Thomas',
        last_name: 'Leroy',
        company_name: null,
        phone: '07 88 99 00 11',
        plan: 'professional',
        trial_ends_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'cancelled',
        role: 'user',
        avatar_url: null,
        created_at: '2024-07-12T00:00:00.000Z',
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'user-7',
        email: 'isabelle.moreau@email.com',
        first_name: 'Isabelle',
        last_name: 'Moreau',
        company_name: 'Patrimoine Moreau',
        phone: '06 77 66 55 44',
        plan: 'starter',
        trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'trial',
        role: 'user',
        avatar_url: null,
        created_at: '2024-12-10T00:00:00.000Z',
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'user-8',
        email: 'antoine.garcia@email.com',
        first_name: 'Antoine',
        last_name: 'Garcia',
        company_name: 'SCI Garcia',
        phone: '06 33 22 11 00',
        plan: 'professional',
        trial_ends_at: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: 'active',
        role: 'user',
        avatar_url: null,
        created_at: '2024-06-20T00:00:00.000Z',
        updated_at: new Date().toISOString(),
        last_sign_in_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  async getAllUsers(): Promise<{ data: User[] | null; error: string | null }> {
    try {
      if (!isConnected()) {
        console.warn('Supabase non connecté, utilisation des données de démonstration');
        return { data: this.getDemoUsers(), error: null };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        // En cas d'erreur, utiliser les données de démonstration
        return { data: this.getDemoUsers(), error: 'Connexion à la base de données impossible, affichage des données de démonstration' };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Erreur dans getAllUsers:', err);
      return { data: this.getDemoUsers(), error: 'Erreur de connexion, affichage des données de démonstration' };
    }
  }

  async getUserById(id: string): Promise<{ data: User | null; error: string | null }> {
    try {
      if (!isConnected()) {
        const demoUsers = this.getDemoUsers();
        const user = demoUsers.find(u => u.id === id);
        return { data: user || null, error: user ? null : 'Utilisateur non trouvé' };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Erreur dans getUserById:', err);
      return { data: null, error: 'Erreur lors de la récupération de l\'utilisateur' };
    }
  }

  async createUser(userData: CreateUserData): Promise<{ data: User | null; error: string | null }> {
    try {
      if (!isConnected()) {
        console.warn('Mode démonstration: simulation de la création d\'utilisateur');
        const newUser: User = {
          id: 'demo-' + Date.now(),
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          company_name: userData.company_name || null,
          phone: userData.phone || null,
          plan: userData.plan,
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          subscription_status: 'trial',
          role: userData.role || 'user',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return { data: newUser, error: null };
      }

      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          company_name: userData.company_name,
          phone: userData.phone
        }
      });

      if (authError) {
        console.error('Erreur lors de la création de l\'utilisateur Auth:', authError);
        return { data: null, error: authError.message };
      }

      // Mettre à jour le profil avec les informations supplémentaires
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          plan: userData.plan,
          role: userData.role || 'user',
          company_name: userData.company_name,
          phone: userData.phone
        })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (profileError) {
        console.error('Erreur lors de la mise à jour du profil:', profileError);
        return { data: null, error: profileError.message };
      }

      // Log de l'activité
      try {
        await activityService.addActivity({
          type: 'system',
          action: 'user_created',
          title: 'Nouvel utilisateur créé',
          description: `L'utilisateur ${userData.first_name} ${userData.last_name} a été créé`,
          userId: 'current-user',
          priority: 'medium',
          category: 'success'
        });
      } catch (activityError) {
        console.warn('Impossible d\'enregistrer l\'activité:', activityError);
      }

      return { data: profileData, error: null };
    } catch (err) {
      console.error('Erreur dans createUser:', err);
      return { data: null, error: 'Erreur lors de la création de l\'utilisateur' };
    }
  }

  async updateUser(id: string, updates: UpdateUserData): Promise<{ data: User | null; error: string | null }> {
    try {
      if (!isConnected()) {
        console.warn('Mode démonstration: simulation de la mise à jour d\'utilisateur');
        const demoUsers = this.getDemoUsers();
        const user = demoUsers.find(u => u.id === id);
        if (!user) {
          return { data: null, error: 'Utilisateur non trouvé' };
        }
        const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
        return { data: updatedUser, error: null };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
        return { data: null, error: error.message };
      }

      // Log de l'activité
      try {
        await activityService.addActivity({
          type: 'system',
          action: 'user_updated',
          title: 'Utilisateur mis à jour',
          description: `L'utilisateur ${data.first_name} ${data.last_name} a été mis à jour`,
          userId: 'current-user',
          priority: 'medium',
          category: 'info'
        });
      } catch (activityError) {
        console.warn('Impossible d\'enregistrer l\'activité:', activityError);
      }

      return { data, error: null };
    } catch (err) {
      console.error('Erreur dans updateUser:', err);
      return { data: null, error: 'Erreur lors de la mise à jour de l\'utilisateur' };
    }
  }

  async deleteUser(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Empêcher la suppression de l'admin principal
      const { data: user } = await this.getUserById(id);
      if (user?.email === 'admin@easybail.pro') {
        return { success: false, error: 'Impossible de supprimer l\'administrateur principal' };
      }

      if (!isConnected()) {
        console.warn('Mode démonstration: simulation de la suppression d\'utilisateur');
        return { success: true, error: null };
      }

      // Supprimer l'utilisateur de Auth (cela supprimera aussi le profil grâce à CASCADE)
      const { error: authError } = await supabase.auth.admin.deleteUser(id);

      if (authError) {
        console.error('Erreur lors de la suppression de l\'utilisateur Auth:', authError);
        return { success: false, error: authError.message };
      }

      // Log de l'activité
      try {
        await activityService.addActivity({
          type: 'system',
          action: 'user_deleted',
          title: 'Utilisateur supprimé',
          description: `Un utilisateur a été supprimé du système`,
          userId: 'current-user',
          priority: 'high',
          category: 'warning'
        });
      } catch (activityError) {
        console.warn('Impossible d\'enregistrer l\'activité:', activityError);
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Erreur dans deleteUser:', err);
      return { success: false, error: 'Erreur lors de la suppression de l\'utilisateur' };
    }
  }

  async updateUserRole(id: string, role: 'user' | 'manager' | 'admin'): Promise<{ data: User | null; error: string | null }> {
    try {
      // Empêcher de modifier le rôle de l'admin principal
      const { data: user } = await this.getUserById(id);
      if (user?.email === 'admin@easybail.pro' && role !== 'admin') {
        return { data: null, error: 'Impossible de modifier le rôle de l\'administrateur principal' };
      }

      return await this.updateUser(id, { role });
    } catch (err) {
      console.error('Erreur dans updateUserRole:', err);
      return { data: null, error: 'Erreur lors de la modification du rôle' };
    }
  }

  async searchUsers(query: string): Promise<{ data: User[] | null; error: string | null }> {
    try {
      if (!isConnected()) {
        const demoUsers = this.getDemoUsers();
        const filteredUsers = demoUsers.filter(user =>
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.first_name.toLowerCase().includes(query.toLowerCase()) ||
          user.last_name.toLowerCase().includes(query.toLowerCase()) ||
          (user.company_name && user.company_name.toLowerCase().includes(query.toLowerCase()))
        );
        return { data: filteredUsers, error: null };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%,company_name.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Erreur dans searchUsers:', err);
      return { data: null, error: 'Erreur lors de la recherche' };
    }
  }

  async getUsersByPlan(plan: 'starter' | 'professional' | 'expert'): Promise<{ data: User[] | null; error: string | null }> {
    try {
      if (!isConnected()) {
        const demoUsers = this.getDemoUsers();
        const filteredUsers = demoUsers.filter(user => user.plan === plan);
        return { data: filteredUsers, error: null };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('plan', plan)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs par plan:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Erreur dans getUsersByPlan:', err);
      return { data: null, error: 'Erreur lors de la récupération des utilisateurs' };
    }
  }

  async getUsersByStatus(status: 'trial' | 'active' | 'cancelled' | 'expired'): Promise<{ data: User[] | null; error: string | null }> {
    try {
      if (!isConnected()) {
        const demoUsers = this.getDemoUsers();
        const filteredUsers = demoUsers.filter(user => user.subscription_status === status);
        return { data: filteredUsers, error: null };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('subscription_status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs par statut:', error);
        return { data: null, error: error.message };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Erreur dans getUsersByStatus:', err);
      return { data: null, error: 'Erreur lors de la récupération des utilisateurs' };
    }
  }
}

export const userService = new UserService();
