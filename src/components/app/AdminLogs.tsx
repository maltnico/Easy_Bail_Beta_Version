import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  Calendar, 
  Download, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  FileText, 
  DollarSign, 
  Home, 
  Users, 
  Zap, 
  User, 
  Settings,
  Loader2,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { activityService } from '../../lib/activityService';
import { Activity as ActivityType } from '../../types/activity';

const AdminLogs: React.FC = () => {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<{start: string, end: string} | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    byType: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    byPriority: {} as Record<string, number>
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      // Get all activities from the database
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (activitiesError) throw activitiesError;
      
      // Convert database format to application format
      const formattedActivities: ActivityType[] = (activitiesData || []).map(activity => ({
        id: activity.id,
        type: activity.type,
        action: activity.action,
        title: activity.title,
        description: activity.description,
        entityId: activity.entity_id,
        entityType: activity.entity_type as any,
        entityName: activity.entity_name,
        userId: activity.user_id,
        metadata: activity.metadata,
        createdAt: new Date(activity.created_at),
        readAt: activity.read_at ? new Date(activity.read_at) : undefined,
        priority: activity.priority as 'low' | 'medium' | 'high',
        category: activity.category as 'success' | 'warning' | 'error' | 'info'
      }));
      
      setActivities(formattedActivities);
      
      // Calculate statistics
      const total = formattedActivities.length;
      const byType: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      const byPriority: Record<string, number> = {};
      
      formattedActivities.forEach(activity => {
        byType[activity.type] = (byType[activity.type] || 0) + 1;
        byCategory[activity.category] = (byCategory[activity.category] || 0) + 1;
        byPriority[activity.priority] = (byPriority[activity.priority] || 0) + 1;
      });
      
      setStats({ total, byType, byCategory, byPriority });
      
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Erreur lors du chargement des activités');
    } finally {
      setLoading(false);
    }
  };

  const handleClearActivities = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les activités ? Cette action est irréversible.')) {
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .neq('id', '0'); // Delete all activities
      
      if (error) throw error;
      
      // Log this action (will be the only activity left)
      await activityService.addActivity({
        type: 'system',
        action: 'clear_logs',
        title: 'Journaux effacés',
        description: 'Tous les journaux d\'activité ont été effacés',
        userId: 'current-user',
        priority: 'high',
        category: 'warning'
      });
      
      // Reload activities
      await loadActivities();
      
    } catch (err) {
      console.error('Error clearing activities:', err);
      setError('Erreur lors de la suppression des activités');
    } finally {
      setLoading(false);
    }
  };

  const handleExportActivities = () => {
    try {
      // Filter activities based on current filters
      const filteredActivities = filterActivities();
      
      // Convert to CSV
      const headers = ['Date', 'Type', 'Action', 'Titre', 'Description', 'Catégorie', 'Priorité', 'Utilisateur'];
      const rows = filteredActivities.map(activity => [
        activity.createdAt.toLocaleString(),
        activity.type,
        activity.action,
        activity.title,
        activity.description,
        activity.category,
        activity.priority,
        activity.userId
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `activities_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Error exporting activities:', err);
      setError('Erreur lors de l\'exportation des activités');
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('activities')
        .update({ read_at: new Date().toISOString() })
        .is('read_at', null);
      
      if (error) throw error;
      
      // Reload activities
      await loadActivities();
      
    } catch (err) {
      console.error('Error marking activities as read:', err);
      setError('Erreur lors du marquage des activités comme lues');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setActivities(prev => 
        prev.map(activity => 
          activity.id === id 
            ? { ...activity, readAt: new Date() } 
            : activity
        )
      );
      
    } catch (err) {
      console.error('Error marking activity as read:', err);
      setError('Erreur lors du marquage de l\'activité comme lue');
    }
  };

  const filterActivities = () => {
    return activities.filter(activity => {
      // Search term filter
      const matchesSearch = 
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.entityName && activity.entityName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Type filter
      const matchesType = filterType === 'all' || activity.type === filterType;
      
      // Category filter
      const matchesCategory = filterCategory === 'all' || activity.category === filterCategory;
      
      // Priority filter
      const matchesPriority = filterPriority === 'all' || activity.priority === filterPriority;
      
      // Date range filter
      let matchesDateRange = true;
      if (filterDateRange) {
        const activityDate = activity.createdAt;
        const startDate = filterDateRange.start ? new Date(filterDateRange.start) : null;
        const endDate = filterDateRange.end ? new Date(filterDateRange.end) : null;
        
        if (startDate) {
          startDate.setHours(0, 0, 0, 0);
          matchesDateRange = matchesDateRange && activityDate >= startDate;
        }
        
        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && activityDate <= endDate;
        }
      }
      
      return matchesSearch && matchesType && matchesCategory && matchesPriority && matchesDateRange;
    });
  };

  const filteredActivities = filterActivities();

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
      case 'login':
        return <User className={iconClass} />;
      case 'system':
        return <Settings className={iconClass} />;
      default:
        return <Activity className={iconClass} />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
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

  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Journaux d'activité</h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportActivities}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Exporter</span>
          </button>
          <button
            onClick={handleClearActivities}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 className="h-5 w-5" />
            <span>Effacer tout</span>
          </button>
        </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total activités</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Succès</p>
              <p className="text-3xl font-bold text-green-600">{stats.byCategory.success || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avertissements</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.byCategory.warning || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Erreurs</p>
              <p className="text-3xl font-bold text-red-600">{stats.byCategory.error || 0}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les journaux..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Filter className="h-5 w-5 text-gray-600" />
              <span>{showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}</span>
            </button>
            <button
              onClick={loadActivities}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                <option value="document">Documents</option>
                <option value="payment">Paiements</option>
                <option value="property">Biens</option>
                <option value="tenant">Locataires</option>
                <option value="automation">Automatisations</option>
                <option value="login">Connexions</option>
                <option value="system">Système</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Toutes les catégories</option>
                <option value="success">Succès</option>
                <option value="info">Information</option>
                <option value="warning">Avertissement</option>
                <option value="error">Erreur</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Toutes les priorités</option>
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filterDateRange?.start || ''}
                  onChange={(e) => setFilterDateRange(prev => ({ ...prev || { start: '', end: '' }, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Date début"
                />
                <input
                  type="date"
                  value={filterDateRange?.end || ''}
                  onChange={(e) => setFilterDateRange(prev => ({ ...prev || { start: '', end: '' }, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Date fin"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleMarkAllAsRead}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <EyeOff className="h-4 w-4" />
          <span>Tout marquer comme lu</span>
        </button>
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
                        {activity.type}
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
                          onClick={() => handleMarkAsRead(activity.id)}
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
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune activité trouvée</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterPriority !== 'all' || filterDateRange
              ? 'Aucune activité ne correspond à vos critères.'
              : 'Aucune activité n\'a été enregistrée pour le moment.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;
