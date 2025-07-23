import React, { useState } from 'react';
import { 
  Activity as ActivityIcon,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  FileText,
  DollarSign,
  Home,
  Users,
  Zap,
  AlertCircle,
  User,
  Settings,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Trash2,
  Calendar,
  Download
} from 'lucide-react';
import { useActivities } from '../../hooks/useActivities';
import { Activity, ActivityFilter } from '../../types/activity';

const RecentActivities = () => {
  const [filter, setFilter] = useState<ActivityFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  
  const {
    activities,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    cleanOldActivities
  } = useActivities(filter, 50);

  // Filtrer par terme de recherche
  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (activity.entityName && activity.entityName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getActivityIcon = (type: string, category: string) => {
    const iconClass = `h-5 w-5 ${
      category === 'success' ? 'text-green-600' :
      category === 'warning' ? 'text-yellow-600' :
      category === 'error' ? 'text-red-600' :
      'text-blue-600'
    }`;

    switch (type) {
      case 'document':
        return <FileText className={iconClass} />;
      case 'payment':
        return <DollarSign className={iconClass} />;
      case 'property':
        return <Home className={iconClass} />;
      case 'tenant':
        return <Users className={iconClass} />;
      case 'automation':
        return <Zap className={iconClass} />;
      case 'incident':
        return <AlertTriangle className={iconClass} />;
      case 'login':
        return <User className={iconClass} />;
      case 'system':
        return <Settings className={iconClass} />;
      default:
        return <ActivityIcon className={iconClass} />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'document': 'Document',
      'payment': 'Paiement',
      'property': 'Bien',
      'tenant': 'Locataire',
      'automation': 'Automatisation',
      'incident': 'Incident',
      'login': 'Connexion',
      'system': 'Système'
    };
    return labels[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'success': 'Succès',
      'warning': 'Attention',
      'error': 'Erreur',
      'info': 'Information'
    };
    return labels[category] || category;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return date.toLocaleDateString();
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const now = new Date();
    let dateRange;

    switch (period) {
      case 'today':
        dateRange = {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          end: now
        };
        break;
      case 'week':
        dateRange = {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now
        };
        break;
      case 'month':
        dateRange = {
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now
        };
        break;
      default:
        dateRange = undefined;
    }

    setFilter(prev => ({ ...prev, dateRange }));
  };

  const handleCleanOldActivities = () => {
    if (window.confirm('Supprimer les activités de plus de 30 jours ?')) {
      const deletedCount = cleanOldActivities(30);
      alert(`${deletedCount} activités supprimées`);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des activités...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activités récentes</h1>
          <p className="text-gray-600">Suivez toutes les actions et événements de votre compte</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <EyeOff className="h-4 w-4" />
            <span>Tout marquer comme lu</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Erreur</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total activités</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <ActivityIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non lues</p>
              <p className="text-3xl font-bold text-orange-600">{stats.unread}</p>
            </div>
            <Eye className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dernières 24h</p>
              <p className="text-3xl font-bold text-green-600">{stats.recent}</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Types actifs</p>
              <p className="text-3xl font-bold text-purple-600">{Object.keys(stats.byType).length}</p>
            </div>
            <Settings className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filter.type || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les types</option>
                <option value="document">Documents</option>
                <option value="payment">Paiements</option>
                <option value="property">Biens</option>
                <option value="tenant">Locataires</option>
                <option value="automation">Automatisations</option>
                <option value="incident">Incidents</option>
                <option value="system">Système</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select
                value={filter.category || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les catégories</option>
                <option value="success">Succès</option>
                <option value="warning">Attention</option>
                <option value="error">Erreur</option>
                <option value="info">Information</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Toute la période</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filter.unreadOnly || false}
                    onChange={(e) => setFilter(prev => ({ ...prev, unreadOnly: e.target.checked || undefined }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Non lues seulement</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher dans les activités..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Activities List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                !activity.readAt ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.type, activity.category)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                      {!activity.readAt && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(activity.category)}
                      <span className="text-xs text-gray-500">{formatTimeAgo(activity.createdAt)}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        {getTypeLabel(activity.type)}
                      </span>
                      {activity.entityName && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {activity.entityName}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full ${
                        activity.priority === 'high' ? 'bg-red-100 text-red-800' :
                        activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {activity.priority === 'high' ? 'Haute' : 
                         activity.priority === 'medium' ? 'Moyenne' : 'Faible'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!activity.readAt && (
                        <button
                          onClick={() => markAsRead(activity.id)}
                          className="text-blue-600 hover:text-blue-700 text-xs"
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <ActivityIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité trouvée</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || Object.keys(filter).length > 0
              ? 'Aucune activité ne correspond à vos critères.'
              : 'Aucune activité récente à afficher.'
            }
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {filteredActivities.length} activité(s) affichée(s)
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCleanOldActivities}
            className="text-red-600 hover:text-red-700 text-sm flex items-center space-x-1"
          >
            <Trash2 className="h-4 w-4" />
            <span>Nettoyer anciennes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
