import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  Search, 
  Filter,
  CheckCircle, 
  AlertTriangle, 
  Info, 
  AlertOctagon,
  ExternalLink,
  Check,
  Trash2,
  EyeOff,
  Clock,
  Calendar,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { Alert } from '../../types';
import { useNavigate } from 'react-router-dom';
import AlertForm from './AlertForm';

const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    stats, 
    loading, 
    error, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteReadNotifications,
    addNotification
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);

  const filteredAlerts = notifications.filter(alert => {
    const matchesSearch = 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority;
    const matchesReadStatus = !showUnreadOnly || !alert.read;
    return matchesSearch && matchesType && matchesPriority && matchesReadStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertOctagon className="h-5 w-5 text-red-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'success':
        return 'Succès';
      case 'warning':
        return 'Avertissement';
      case 'error':
        return 'Erreur';
      case 'info':
        return 'Information';
      default:
        return type;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Haute';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Basse';
      default:
        return priority;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const handleAlertClick = (alert: Alert) => {
    if (!alert.read) {
      markAsRead(alert.id);
    }
    
    if (alert.actionUrl) {
      navigate(alert.actionUrl);
    }
  };

  const handleCreateAlert = (alertData: Omit<Alert, 'id' | 'createdAt' | 'read'>) => {
    addNotification(alertData);
    setShowAlertForm(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des alertes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Alertes</h1>
          <p className="text-gray-600">Gérez vos alertes et notifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAlertForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Créer une alerte</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total alertes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Bell className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Non lues</p>
              <p className="text-3xl font-bold text-red-600">{stats.unread}</p>
            </div>
            <EyeOff className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Priorité haute</p>
              <p className="text-3xl font-bold text-orange-600">{stats.byPriority['high'] || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
              <p className="text-3xl font-bold text-green-600">
                {notifications.filter(n => {
                  const today = new Date();
                  const alertDate = new Date(n.createdAt);
                  return alertDate.getDate() === today.getDate() &&
                         alertDate.getMonth() === today.getMonth() &&
                         alertDate.getFullYear() === today.getFullYear();
                }).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une alerte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Tous les types</option>
              <option value="info">Informations</option>
              <option value="success">Succès</option>
              <option value="warning">Avertissements</option>
              <option value="error">Erreurs</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Toutes priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Non lues uniquement</span>
            </label>
            
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={markAllAsRead}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Check className="h-4 w-4" />
          <span>Tout marquer comme lu</span>
        </button>
        
        <button
          onClick={deleteReadNotifications}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Trash2 className="h-4 w-4" />
          <span>Supprimer lues</span>
        </button>
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredAlerts.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !alert.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getTypeIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-medium text-gray-900">{alert.title}</p>
                      <span className="text-sm text-gray-500">{formatTimeAgo(alert.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                        {getPriorityLabel(alert.priority)}
                      </span>
                      <div className="flex items-center space-x-3">
                        {alert.actionUrl && (
                          <button 
                            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(alert.actionUrl!);
                            }}
                          >
                            <span>Voir détails</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(alert.id);
                          }}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune alerte trouvée</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all' || filterPriority !== 'all' || showUnreadOnly
                ? 'Aucune alerte ne correspond à vos critères de recherche.'
                : 'Vous n\'avez aucune alerte pour le moment.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Alert Form Modal */}
      <AlertForm
        isOpen={showAlertForm}
        onClose={() => setShowAlertForm(false)}
        onSave={handleCreateAlert}
      />
    </div>
  );
};

export default AlertsPage;
