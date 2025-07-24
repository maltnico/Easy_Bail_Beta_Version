import React, { useState, useEffect } from 'react';
import { Search, User, ChevronDown, LogOut, Shield, X, FileText, Building, Users, DollarSign, Crown, Circle, AlertTriangle, Database, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';
import AdminMenu from './AdminMenu';
import { useProperties } from '../../hooks/useProperties';
import { useTenants } from '../../hooks/useTenants';
import { SimpleThemeToggle } from '../ThemeToggle';
import { supabase, isConnected } from '../../lib/supabase';
import { checkSupabaseConnection } from '../../utils/checkSupabaseConnection';

interface TopBarProps {
  onLogout?: () => void;
  onNavigateToSection?: (section: string) => void;
}

interface ActiveUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  plan: string;
  role?: string;
  subscription_status: string;
  created_at: string;
  last_sign_in_at?: string;
}

// Fonction pour vérifier si l'utilisateur est admin
const isUserAdmin = (user: any): boolean => {
  // Vérifier l'email admin
  if (user?.email === 'admin@easybail.pro' || user?.user_metadata?.email === 'admin@easybail.pro') {
    return true;
  }
  
  // Vérifier le rôle dans les métadonnées utilisateur
  if (user?.user_metadata?.role === 'admin') {
    return true;
  }
  
  // Vérifier le rôle dans le profil
  if (user?.role === 'admin' || user?.user_metadata?.role === 'admin') {
    return true;
  }
  
  return false;
};

const TopBar: React.FC<TopBarProps> = ({ onLogout, onNavigateToSection }) => {
  const { user, profile, signOut } = useAuth();
  const { properties } = useProperties();
  const { tenants } = useTenants();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  
  // Vérifier si l'utilisateur est admin
  const userIsAdmin = isUserAdmin(user);

  // Vérifier la connexion Supabase au chargement
  useEffect(() => {
    checkSupabaseConnectionStatus();
  }, []);

  // Charger les utilisateurs actifs quand le menu s'ouvre
  useEffect(() => {
    if (showUserMenu) {
      loadActiveUsers();
    }
  }, [showUserMenu]);

  const checkSupabaseConnectionStatus = async () => {
    setCheckingConnection(true);
    try {
      const status = await checkSupabaseConnection();
      setConnectionStatus(status);
    } catch (error) {
      setConnectionStatus({
        connected: false,
        error: `Erreur lors de la vérification: ${(error as Error).message}`
      });
    } finally {
      setCheckingConnection(false);
    }
  };

  const loadActiveUsers = async () => {
    setLoadingUsers(true);
    
    // Vérifier d'abord la connexion
    if (!connectionStatus?.connected) {
      console.warn('Supabase non connecté, utilisation des données de démonstration');
      setActiveUsers([
        {
          id: '1',
          email: 'admin@easybail.pro',
          first_name: 'Admin',
          last_name: 'EasyBail',
          company_name: 'EasyBail Pro',
          plan: 'expert',
          role: 'admin',
          subscription_status: 'active',
          created_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString()
        },
        {
          id: '2',
          email: 'demo@example.com',
          first_name: 'Demo',
          last_name: 'User',
          company_name: 'Demo Company',
          plan: 'professional',
          subscription_status: 'active',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_sign_in_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          email: 'user@test.com',
          first_name: 'Test',
          last_name: 'User',
          plan: 'starter',
          subscription_status: 'active',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          last_sign_in_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
      setLoadingUsers(false);
      return;
    }

    try {
      // Récupérer tous les profils utilisateurs actifs
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('subscription_status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        // En cas d'erreur, utiliser des données de démonstration
        setActiveUsers([
          {
            id: '1',
            email: 'admin@easybail.pro',
            first_name: 'Admin',
            last_name: 'EasyBail',
            company_name: 'EasyBail Pro',
            plan: 'expert',
            role: 'admin',
            subscription_status: 'active',
            created_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString()
          },
          {
            id: '2',
            email: 'demo@example.com',
            first_name: 'Demo',
            last_name: 'User',
            company_name: 'Demo Company',
            plan: 'professional',
            subscription_status: 'active',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            last_sign_in_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            email: 'user@test.com',
            first_name: 'Test',
            last_name: 'User',
            plan: 'starter',
            subscription_status: 'active',
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            last_sign_in_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
      } else {
        setActiveUsers(profiles || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      // Utiliser des données de démonstration en cas d'erreur
      setActiveUsers([
        {
          id: '1',
          email: 'admin@easybail.pro',
          first_name: 'Admin',
          last_name: 'EasyBail',
          company_name: 'EasyBail Pro',
          plan: 'expert',
          role: 'admin',
          subscription_status: 'active',
          created_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString()
        },
        {
          id: '2',
          email: 'demo@example.com',
          first_name: 'Demo',
          last_name: 'User',
          company_name: 'Demo Company',
          plan: 'professional',
          subscription_status: 'active',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_sign_in_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Appeler la fonction de callback pour rediriger vers la page de login
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results: any[] = [];
    const lowercaseQuery = query.toLowerCase();

    // Rechercher dans les biens
    properties.forEach(property => {
      if (
        property.name.toLowerCase().includes(lowercaseQuery) ||
        property.address.toLowerCase().includes(lowercaseQuery) ||
        property.type.toLowerCase().includes(lowercaseQuery)
      ) {
        results.push({
          type: 'property',
          id: property.id,
          title: property.name,
          subtitle: property.address,
          icon: Building,
          action: () => {
            if (onNavigateToSection) {
              onNavigateToSection('properties');
            }
            setShowSearchResults(false);
            setSearchQuery('');
          }
        });
      }
    });

    // Rechercher dans les locataires
    tenants.forEach(tenant => {
      const fullName = `${tenant.firstName} ${tenant.lastName}`;
      if (
        fullName.toLowerCase().includes(lowercaseQuery) ||
        tenant.email.toLowerCase().includes(lowercaseQuery) ||
        tenant.phone?.toLowerCase().includes(lowercaseQuery)
      ) {
        const property = properties.find(p => p.id === tenant.propertyId);
        results.push({
          type: 'tenant',
          id: tenant.id,
          title: fullName,
          subtitle: property ? property.name : 'Bien non trouvé',
          icon: Users,
          action: () => {
            if (onNavigateToSection) {
              onNavigateToSection('tenants');
            }
            setShowSearchResults(false);
            setSearchQuery('');
          }
        });
      }
    });

    // Rechercher dans les sections de l'application
    const sections = [
      { name: 'Mes biens', section: 'properties', keywords: ['bien', 'propriété', 'immobilier'], icon: Building },
      { name: 'Locataires', section: 'tenants', keywords: ['locataire', 'tenant'], icon: Users },
      { name: 'Documents', section: 'documents', keywords: ['document', 'contrat', 'bail', 'quittance'], icon: FileText },
      { name: 'Finances', section: 'finances', keywords: ['finance', 'argent', 'loyer', 'paiement'], icon: DollarSign },
      { name: 'Tâches', section: 'tasks', keywords: ['tâche', 'todo', 'rappel'], icon: FileText },
      { name: 'Automatisations', section: 'automations', keywords: ['automatisation', 'auto'], icon: FileText },
      { name: 'Incidents', section: 'incidents', keywords: ['incident', 'problème', 'maintenance'], icon: FileText },
      { name: 'Activités', section: 'activities', keywords: ['activité', 'historique', 'log'], icon: FileText },
      { name: 'Paramètres', section: 'settings', keywords: ['paramètre', 'configuration', 'réglage'], icon: FileText },
    ];

    sections.forEach(section => {
      if (
        section.name.toLowerCase().includes(lowercaseQuery) ||
        section.keywords.some(keyword => keyword.includes(lowercaseQuery))
      ) {
        results.push({
          type: 'section',
          id: section.section,
          title: section.name,
          subtitle: 'Section de l\'application',
          icon: section.icon,
          action: () => {
            if (onNavigateToSection) {
              onNavigateToSection(section.section);
            }
            setShowSearchResults(false);
            setSearchQuery('');
          }
        });
      }
    });

    setSearchResults(results.slice(0, 8)); // Limiter à 8 résultats
    setShowSearchResults(results.length > 0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'property': return 'Bien';
      case 'tenant': return 'Locataire';
      case 'section': return 'Section';
      default: return type;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'expert': return 'text-purple-600 bg-purple-100';
      case 'professional': return 'text-blue-600 bg-blue-100';
      case 'starter': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'expert': return 'Expert';
      case 'professional': return 'Pro';
      case 'starter': return 'Starter';
      default: return plan;
    }
  };

  const formatLastSeen = (lastSignIn: string | undefined) => {
    if (!lastSignIn) return 'Jamais connecté';
    
    const now = new Date();
    const lastSeen = new Date(lastSignIn);
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 5) return 'En ligne';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return lastSeen.toLocaleDateString('fr-FR');
  };

  const getStatusColor = (lastSignIn: string | undefined) => {
    if (!lastSignIn) return 'text-gray-400';
    
    const now = new Date();
    const lastSeen = new Date(lastSignIn);
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 5) return 'text-green-500';
    if (diffMins < 60) return 'text-yellow-500';
    return 'text-gray-400';
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
              placeholder="Rechercher un bien, locataire, document..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {/* Résultats de recherche */}
            {showSearchResults && (<div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <>
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                      Résultats de recherche
                    </div>
                    {searchResults.map((result, index) => {
                      const Icon = result.icon;
                      return (
                        <button
                          key={`${result.type}-${result.id}-${index}`}
                          onClick={result.action}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
                        >
                          <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {result.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {result.subtitle}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {getTypeLabel(result.type)}
                          </span>
                        </button>
                      );
                    })}
                  </>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Search className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucun résultat trouvé</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Essayez avec d'autres mots-clés
                    </p>
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {searchResults.length} résultat(s) trouvé(s)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Overlay pour fermer la recherche */}
        {showSearchResults && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowSearchResults(false)}
          ></div>
        )}

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <SimpleThemeToggle />
          
          {/* Admin Button */}
          {userIsAdmin && (
            <button
              onClick={() => setShowAdminMenu(true)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Administration"
            >
              <Shield className="h-6 w-6" />
            </button>
          )}
          
          <NotificationBell />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {profile?.first_name} {profile?.last_name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {profile?.plan && `Plan ${profile?.plan}`}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-96 overflow-y-auto">
                {/* Section État de la connexion Supabase */}
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      État de la connexion
                    </div>
                    <button
                      onClick={checkSupabaseConnectionStatus}
                      disabled={checkingConnection}
                      className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      {checkingConnection ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  
                  {connectionStatus ? (
                    <div className={`flex items-center space-x-2 p-2 rounded-lg ${
                      connectionStatus.connected 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      {connectionStatus.connected ? (
                        <Database className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${
                          connectionStatus.connected ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {connectionStatus.connected ? 'Supabase connecté' : 'Supabase déconnecté'}
                        </p>
                        {!connectionStatus.connected && (
                          <p className="text-xs text-red-600 truncate">
                            Mode démonstration actif
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                      <Database className="h-4 w-4 text-gray-400 animate-pulse" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Vérification...</p>
                    </div>
                  )}
                </div>

                {/* Section Mon Profil */}
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Mon Profil
                  </div>
                  <button
                    onClick={() => {
                      if (onNavigateToSection) {
                        onNavigateToSection('settings');
                      }
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left block px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                  >
                    Paramètres
                  </button>
                  <button
                    onClick={() => {
                      if (onNavigateToSection) {
                        onNavigateToSection('settings');
                      }
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left block px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                  >
                    Facturation
                  </button>
                </div>

                {/* Section Utilisateurs Actifs */}
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Utilisateurs Actifs
                    </div>
                    <div className="flex items-center space-x-2">
                      {!connectionStatus?.connected && (
                        <span className="text-xs text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-full">
                          Demo
                        </span>
                      )}
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {activeUsers.length} compte(s)
                      </div>
                    </div>
                  </div>
                  
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {activeUsers.map((activeUser) => (
                        <div
                          key={activeUser.id}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="relative">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              activeUser.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                            }`}>
                              {activeUser.role === 'admin' ? (
                                <Crown className="h-4 w-4 text-white" />
                              ) : (
                                <User className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <Circle 
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${getStatusColor(activeUser.last_sign_in_at)} fill-current`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {activeUser.first_name} {activeUser.last_name}
                              </p>
                              {activeUser.role === 'admin' && (
                                <Crown className="h-3 w-3 text-purple-600" />
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {activeUser.email}
                              </p>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${getPlanColor(activeUser.plan)}`}>
                                {getPlanLabel(activeUser.plan)}
                              </span>
                            </div>
                            <p className={`text-xs ${getStatusColor(activeUser.last_sign_in_at)}`}>
                              {formatLastSeen(activeUser.last_sign_in_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section Déconnexion */}
                <div className="px-4 py-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-2 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center rounded"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Admin Menu Modal */}
      {userIsAdmin && (
        <AdminMenu 
          isOpen={showAdminMenu} 
          onClose={() => setShowAdminMenu(false)} 
        />
      )}
    </header>
  );
};

export default TopBar;
