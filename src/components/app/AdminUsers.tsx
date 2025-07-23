import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Save,
  Eye,
  EyeOff,
  Lock,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { activityService } from '../../lib/activityService';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  phone: string | null;
  plan: 'starter' | 'professional' | 'expert';
  trial_ends_at: string;
  subscription_status: 'trial' | 'active' | 'cancelled' | 'expired';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
  role?: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    company_name: '',
    phone: '',
    plan: 'starter' as 'starter' | 'professional' | 'expert',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all users from profiles table (admin can see all users - no user filter)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      
      // En cas d'erreur de connexion, utiliser des données de démonstration
      if (err instanceof Error && (
        err.message.includes('Failed to fetch') ||
        err.message.includes('timeout') ||
        err.message.includes('NetworkError')
      )) {
        console.warn('Erreur de connexion, utilisation des données de démonstration');
        
        // Données de démonstration - tous les utilisateurs de l'app
        const demoUsers: User[] = [
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
            avatar_url: null,
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            role: 'admin'
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
            avatar_url: null,
            created_at: '2024-11-15T00:00:00.000Z',
            updated_at: new Date().toISOString(),
            last_sign_in_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            role: 'user'
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
            avatar_url: null,
            created_at: '2024-10-20T00:00:00.000Z',
            updated_at: new Date().toISOString(),
            last_sign_in_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            role: 'user'
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
            avatar_url: null,
            created_at: '2024-09-10T00:00:00.000Z',
            updated_at: new Date().toISOString(),
            last_sign_in_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            role: 'manager'
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
            avatar_url: null,
            created_at: '2024-12-01T00:00:00.000Z',
            updated_at: new Date().toISOString(),
            last_sign_in_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            role: 'user'
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
            avatar_url: null,
            created_at: '2024-08-05T00:00:00.000Z',
            updated_at: new Date().toISOString(),
            last_sign_in_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            role: 'manager'
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
            avatar_url: null,
            created_at: '2024-07-12T00:00:00.000Z',
            updated_at: new Date().toISOString(),
            last_sign_in_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            role: 'user'
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
            avatar_url: null,
            created_at: '2024-12-10T00:00:00.000Z',
            updated_at: new Date().toISOString(),
            last_sign_in_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            role: 'user'
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
            avatar_url: null,
            created_at: '2024-06-20T00:00:00.000Z',
            updated_at: new Date().toISOString(),
            last_sign_in_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            role: 'user'
          }
        ];
        
        setUsers(demoUsers);
        setError('Impossible de se connecter à la base de données. Affichage des données de démonstration.');
      } else {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.email) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!formData.first_name) {
      errors.first_name = 'Le prénom est requis';
    }
    
    if (!formData.last_name) {
      errors.last_name = 'Le nom est requis';
    }
    
    if (!editingUser) {
      if (!formData.password) {
        errors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 6) {
        errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setFormSuccess(null);
      
      if (editingUser) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            company_name: formData.company_name || null,
            phone: formData.phone || null,
            plan: formData.plan
          })
          .eq('id', editingUser.id);
        
        if (error) throw error;
        
        // Log activity
        activityService.addActivity({
          type: 'system',
          action: 'user_updated',
          title: 'Utilisateur mis à jour',
          description: `L'utilisateur ${formData.first_name} ${formData.last_name} a été mis à jour`,
          userId: 'current-user',
          priority: 'medium',
          category: 'info'
        });
        
        setFormSuccess('Utilisateur mis à jour avec succès');
      } else {
        // Create new user
        // Note: In a real app, this would use admin API to create users
        // This is a simplified version for demonstration
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.first_name,
              last_name: formData.last_name,
              company_name: formData.company_name || null,
              phone: formData.phone || null
            }
          }
        });
        
        if (error) throw error;
        
        // Log activity
        activityService.addActivity({
          type: 'system',
          action: 'user_created',
          title: 'Nouvel utilisateur créé',
          description: `L'utilisateur ${formData.first_name} ${formData.last_name} a été créé`,
          userId: 'current-user',
          priority: 'medium',
          category: 'success'
        });
        
        setFormSuccess('Utilisateur créé avec succès');
      }
      
      // Reload users
      await loadUsers();
      
      // Reset form
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        company_name: '',
        phone: '',
        plan: 'starter',
        password: '',
        confirmPassword: ''
      });
      
      setShowUserForm(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Error creating/updating user:', err);
      
      // Gestion des erreurs avec fallback pour mode démo
      if (err instanceof Error && (
        err.message.includes('Failed to fetch') ||
        err.message.includes('timeout') ||
        err.message.includes('NetworkError')
      )) {
        // En mode démo, simuler la création/modification
        if (editingUser) {
          // Simuler la mise à jour
          setUsers(prev => prev.map(user => 
            user.id === editingUser.id 
              ? { 
                  ...user, 
                  first_name: formData.first_name,
                  last_name: formData.last_name,
                  company_name: formData.company_name || null,
                  phone: formData.phone || null,
                  plan: formData.plan,
                  updated_at: new Date().toISOString()
                }
              : user
          ));
          setFormSuccess('Utilisateur mis à jour avec succès (mode démo)');
        } else {
          // Simuler la création
          const newUser: User = {
            id: 'demo-' + Date.now(),
            email: formData.email,
            first_name: formData.first_name,
            last_name: formData.last_name,
            company_name: formData.company_name || null,
            phone: formData.phone || null,
            plan: formData.plan,
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            subscription_status: 'trial',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: 'user'
          };
          setUsers(prev => [newUser, ...prev]);
          setFormSuccess('Utilisateur créé avec succès (mode démo)');
        }
        
        // Reset form
        setFormData({
          email: '',
          first_name: '',
          last_name: '',
          company_name: '',
          phone: '',
          plan: 'starter',
          password: '',
          confirmPassword: ''
        });
        
        setShowUserForm(false);
        setEditingUser(null);
      } else {
        setFormErrors({
          submit: err instanceof Error ? err.message : 'Une erreur est survenue'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      company_name: user.company_name || '',
      phone: user.phone || '',
      plan: user.plan,
      password: '',
      confirmPassword: ''
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = async (userId: string) => {
    // Empêcher la suppression de l'admin principal
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.email === 'admin@easybail.pro') {
      alert('Impossible de supprimer l\'administrateur principal');
      return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      setLoading(true);
      
      // Delete user from profiles table (admin action)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Log activity
      activityService.addActivity({
        type: 'system',
        action: 'user_deleted',
        title: 'Utilisateur supprimé',
        description: `Un utilisateur a été supprimé du système`,
        userId: 'current-user',
        priority: 'high',
        category: 'warning'
      });
      
      // Reload users
      await loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      
      // Gestion des erreurs avec fallback pour mode démo
      if (err instanceof Error && (
        err.message.includes('Failed to fetch') ||
        err.message.includes('timeout') ||
        err.message.includes('NetworkError')
      )) {
        // En mode démo, simuler la suppression
        setUsers(prev => prev.filter(user => user.id !== userId));
        setError('Utilisateur supprimé avec succès (mode démo)');
        
        // Effacer le message après 3 secondes
        setTimeout(() => setError(null), 3000);
      } else {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      setLoading(true);
      
      // Empêcher de modifier le rôle de l'admin principal
      const userToUpdate = users.find(u => u.id === userId);
      if (userToUpdate?.email === 'admin@easybail.pro' && role !== 'admin') {
        alert('Impossible de modifier le rôle de l\'administrateur principal');
        return;
      }
      
      // Update role in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role } : user
      ));
      
      // Log activity
      activityService.addActivity({
        type: 'system',
        action: 'role_changed',
        title: 'Rôle utilisateur modifié',
        description: `Le rôle d'un utilisateur a été changé en ${role}`,
        userId: 'current-user',
        priority: 'medium',
        category: 'warning'
      });
      
    } catch (err) {
      console.error('Error changing user role:', err);
      
      // Gestion des erreurs avec fallback pour mode démo
      if (err instanceof Error && (
        err.message.includes('Failed to fetch') ||
        err.message.includes('timeout') ||
        err.message.includes('NetworkError')
      )) {
        // En mode démo, simuler le changement de rôle
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role } : user
        ));
        setError('Rôle modifié avec succès (mode démo)');
        
        // Effacer le message après 3 secondes
        setTimeout(() => setError(null), 3000);
      } else {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company_name && user.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || user.subscription_status === filterStatus;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'trial':
        return 'Essai';
      case 'active':
        return 'Actif';
      case 'cancelled':
        return 'Annulé';
      case 'expired':
        return 'Expiré';
      default:
        return status;
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'starter':
        return 'Starter';
      case 'professional':
        return 'Professionnel';
      case 'expert':
        return 'Expert';
      default:
        return plan;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'manager':
        return 'Gestionnaire';
      case 'user':
        return 'Utilisateur';
      default:
        return role || 'Utilisateur';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'user':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tous les utilisateurs de l'application</h3>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({
              email: '',
              first_name: '',
              last_name: '',
              company_name: '',
              phone: '',
              plan: 'starter',
              password: '',
              confirmPassword: ''
            });
            setShowUserForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <UserPlus className="h-5 w-5" />
          <span>Nouvel utilisateur</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Erreur</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {formSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 font-medium">{formSuccess}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les plans</option>
              <option value="starter">Starter</option>
              <option value="professional">Professionnel</option>
              <option value="expert">Expert</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="trial">Essai</option>
              <option value="active">Actif</option>
              <option value="cancelled">Annulé</option>
              <option value="expired">Expiré</option>
            </select>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Utilisateur</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Email</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Rôle</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Plan</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Créé le</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Dernière connexion</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        {user.company_name && (
                          <p className="text-sm text-gray-500">{user.company_name}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{user.phone}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="user">Utilisateur</option>
                        <option value="manager">Gestionnaire</option>
                        <option value="admin">Administrateur</option>
                      </select>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role || 'user')}`}>
                        {getRoleLabel(user.role || 'user')}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">{getPlanLabel(user.plan)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.subscription_status)}`}>
                      {getStatusLabel(user.subscription_status)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString() 
                        : 'Jamais'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterPlan !== 'all' || filterStatus !== 'all'
              ? 'Aucun utilisateur ne correspond à vos critères de recherche.'
              : 'Aucun utilisateur trouvé dans le système.'
            }
          </p>
          <button 
            onClick={() => {
              setEditingUser(null);
              setFormData({
                email: '',
                first_name: '',
                last_name: '',
                company_name: '',
                phone: '',
                plan: 'starter',
                password: '',
                confirmPassword: ''
              });
              setShowUserForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ajouter un utilisateur
          </button>
        </div>
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h2>
              <button
                onClick={() => setShowUserForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-6">
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 font-medium">{formErrors.submit}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Jean"
                  />
                  {formErrors.first_name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Dupont"
                  />
                  {formErrors.last_name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!!editingUser}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  } ${editingUser ? 'bg-gray-100' : ''}`}
                  placeholder="jean.dupont@example.com"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
                {editingUser && (
                  <p className="mt-1 text-xs text-gray-500">L'email ne peut pas être modifié</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Société (optionnel)
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ma société"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan
                </label>
                <select
                  name="plan"
                  value={formData.plan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="starter">Starter</option>
                  <option value="professional">Professionnel</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {!editingUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le mot de passe *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    {formErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                    )}
                  </div>
                </>
              )}

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  <span>{editingUser ? 'Mettre à jour' : 'Créer l\'utilisateur'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
