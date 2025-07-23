import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Database, 
  Activity, 
  Settings, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Server,
  HardDrive,
  Cpu,
  Wifi,
  RefreshCw,
  Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  totalDocuments: number;
  totalActivities: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: string;
  lastBackup: Date;
  storageUsed: number;
  storageLimit: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalProperties: 0,
    totalDocuments: 0,
    totalActivities: 0,
    systemHealth: 'healthy',
    uptime: '99.9%',
    lastBackup: new Date(),
    storageUsed: 0,
    storageLimit: 1000
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simuler le chargement des statistiques système
      // En production, ces données viendraient de vraies requêtes à la base de données
      const mockStats: SystemStats = {
        totalUsers: 1247,
        activeUsers: 89,
        totalProperties: 3456,
        totalDocuments: 12890,
        totalActivities: 45678,
        systemHealth: 'healthy',
        uptime: '99.97%',
        lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 heures ago
        storageUsed: 750,
        storageLimit: 1000
      };

      // Essayer de récupérer de vraies statistiques si possible
      try {
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { count: propertiesCount } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true });

        const { count: activitiesCount } = await supabase
          .from('activities')
          .select('*', { count: 'exact', head: true });

        if (usersCount !== null) mockStats.totalUsers = usersCount;
        if (propertiesCount !== null) mockStats.totalProperties = propertiesCount;
        if (activitiesCount !== null) mockStats.totalActivities = activitiesCount;
      } catch (dbError) {
        console.warn('Impossible de récupérer les vraies statistiques, utilisation des données de démonstration');
      }

      setStats(mockStats);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques système');
      console.error('Error loading system stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const storagePercentage = (stats.storageUsed / stats.storageLimit) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des statistiques système...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tableau de bord administrateur</h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadSystemStats}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Exporter rapport</span>
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

      {/* System Health */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">État du système</h4>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getHealthColor(stats.systemHealth)}`}>
            {getHealthIcon(stats.systemHealth)}
            <span className="text-sm font-medium capitalize">{stats.systemHealth}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Server className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.uptime}</p>
            <p className="text-sm text-gray-600">Disponibilité</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Cpu className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">12%</p>
            <p className="text-sm text-gray-600">CPU Usage</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <HardDrive className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{storagePercentage.toFixed(0)}%</p>
            <p className="text-sm text-gray-600">Stockage utilisé</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Wifi className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">45ms</p>
            <p className="text-sm text-gray-600">Latence</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs totaux</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+12% ce mois</span>
              </div>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+5% aujourd'hui</span>
              </div>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Biens gérés</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalProperties.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+8% ce mois</span>
              </div>
            </div>
            <Database className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documents générés</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalDocuments.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+15% ce mois</span>
              </div>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Storage Usage */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Utilisation du stockage</h4>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Stockage utilisé</span>
            <span className="text-sm text-gray-600">{stats.storageUsed} MB / {stats.storageLimit} MB</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${
                storagePercentage > 90 ? 'bg-red-500' : 
                storagePercentage > 75 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(storagePercentage, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Documents</span>
              <span className="text-sm font-medium text-gray-900">450 MB</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base de données</span>
              <span className="text-sm font-medium text-gray-900">200 MB</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Logs</span>
              <span className="text-sm font-medium text-gray-900">100 MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Activités récentes du système</h4>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Sauvegarde automatique terminée</p>
              <p className="text-xs text-gray-500">Il y a 2 heures</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">5 nouveaux utilisateurs inscrits</p>
              <p className="text-xs text-gray-500">Il y a 4 heures</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Pic d'utilisation détecté</p>
              <p className="text-xs text-gray-500">Il y a 6 heures</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-lg">
            <Database className="h-5 w-5 text-purple-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Maintenance de la base de données</p>
              <p className="text-xs text-gray-500">Il y a 1 jour</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Actions rapides</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Database className="h-6 w-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-blue-900">Sauvegarder maintenant</p>
              <p className="text-sm text-blue-700">Créer une sauvegarde manuelle</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Settings className="h-6 w-6 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-green-900">Optimiser la base</p>
              <p className="text-sm text-green-700">Nettoyer et optimiser</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-purple-900">Rapport détaillé</p>
              <p className="text-sm text-purple-700">Générer un rapport complet</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
