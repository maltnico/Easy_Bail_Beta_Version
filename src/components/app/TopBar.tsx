import React, { useState } from 'react';
import { Search, User, ChevronDown, LogOut, Shield, X, FileText, Building, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';
import AdminMenu from './AdminMenu';
import { useProperties } from '../../hooks/useProperties';
import { useTenants } from '../../hooks/useTenants';
import { SimpleThemeToggle } from '../ThemeToggle';

interface TopBarProps {
  onLogout?: () => void;
  onNavigateToSection?: (section: string) => void;
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
  
  // Vérifier si l'utilisateur est admin
  const userIsAdmin = isUserAdmin(user);

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
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-96 overflow-y-auto">
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
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <button
                  onClick={() => {
                    if (onNavigateToSection) {
                      onNavigateToSection('settings');
                    }
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Mon profil
                </button>
                <button
                  onClick={() => {
                    if (onNavigateToSection) {
                      onNavigateToSection('settings');
                    }
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Facturation
                </button>
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Se déconnecter
                </button>
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
