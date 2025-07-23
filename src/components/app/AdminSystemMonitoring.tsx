import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Database,
  Users,
  FileText,
  Zap,
  BarChart3
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  activeUsers: number;
  requests: number;
  errors: number;
  responseTime: number;
}

interface PerformanceData {
  timestamp: string;
  cpu: number;
  memory: number;
  requests: number;
  responseTime: number;
}

const AdminSystemMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    activeUsers: 0,
    requests: 0,
    errors: 0,
    responseTime: 0
  });
  
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    loadMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(loadMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadMetrics = async () => {
    try {
      // Simuler des métriques système réalistes
      const newMetrics: SystemMetrics = {
        cpu: Math.random() * 30 + 10, // 10-40%
        memory: Math.random() * 20 + 60, // 60-80%
        disk: Math.random() * 10 + 70, // 70-80%
        network: Math.random() * 50 + 20, // 20-70 Mbps
        activeUsers: Math.floor(Math.random() * 20) + 80, // 80-100 users
        requests: Math.floor(Math.random() * 1000) + 2000, // 2000-3000 req/min
        errors: Math.floor(Math.random() * 5), // 0-5 errors
        responseTime: Math.random() * 100 + 50 // 50-150ms
      };
      
      setMetrics(newMetrics);
      
      // Ajouter aux données de performance
      const now = new Date();
      const newDataPoint: PerformanceData = {
        timestamp: now.toLocaleTimeString(),
        cpu: newMetrics.cpu,
        memory: newMetrics.memory,
        requests: newMetrics.requests,
        responseTime: newMetrics.responseTime
      };
      
      setPerformanceData(prev => {
        const updated = [...prev, newDataPoint];
        // Garder seulement les 20 derniers points
        return updated.slice(-20);
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des métriques:', error);
      setLoading(false);
    }
  };

  const getMetricColor = (value: number, thresholds: {warning: number, critical: number}) => {
    if (value >= thresholds.critical) return 'text-red-600 bg-red-100';
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getMetricIcon = (value: number, thresholds: {warning: number, critical: number}) => {
    if (value >= thresholds.critical) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (value >= thresholds.warning) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const chartData = {
    labels: performanceData.map(d => d.timestamp),
    datasets: [
      {
        label: 'CPU (%)',
        data: performanceData.map(d => d.cpu),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Mémoire (%)',
        data: performanceData.map(d => d.memory),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Temps de réponse (ms)',
        data: performanceData.map(d => d.responseTime),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.1,
        yAxisID: 'y1',
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Métriques système en temps réel',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        max: 100,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Monitoring système</h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              disabled={!autoRefresh}
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="1000">1s</option>
              <option value="5000">5s</option>
              <option value="10000">10s</option>
              <option value="30000">30s</option>
            </select>
          </div>
          <button
            onClick={loadMetrics}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Actualiser maintenant"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">CPU</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.cpu.toFixed(1)}%</p>
              <div className="flex items-center mt-1">
                {getMetricIcon(metrics.cpu, {warning: 70, critical: 90})}
                <span className={`text-sm ml-1 ${getMetricColor(metrics.cpu, {warning: 70, critical: 90}).split(' ')[0]}`}>
                  {metrics.cpu < 70 ? 'Normal' : metrics.cpu < 90 ? 'Élevé' : 'Critique'}
                </span>
              </div>
            </div>
            <Cpu className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mémoire</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.memory.toFixed(1)}%</p>
              <div className="flex items-center mt-1">
                {getMetricIcon(metrics.memory, {warning: 80, critical: 95})}
                <span className={`text-sm ml-1 ${getMetricColor(metrics.memory, {warning: 80, critical: 95}).split(' ')[0]}`}>
                  {metrics.memory < 80 ? 'Normal' : metrics.memory < 95 ? 'Élevé' : 'Critique'}
                </span>
              </div>
            </div>
            <HardDrive className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disque</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.disk.toFixed(1)}%</p>
              <div className="flex items-center mt-1">
                {getMetricIcon(metrics.disk, {warning: 85, critical: 95})}
                <span className={`text-sm ml-1 ${getMetricColor(metrics.disk, {warning: 85, critical: 95}).split(' ')[0]}`}>
                  {metrics.disk < 85 ? 'Normal' : metrics.disk < 95 ? 'Élevé' : 'Critique'}
                </span>
              </div>
            </div>
            <Database className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Réseau</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.network.toFixed(0)} Mbps</p>
              <div className="flex items-center mt-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">Stable</span>
              </div>
            </div>
            <Wifi className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Application Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
              <p className="text-3xl font-bold text-blue-600">{metrics.activeUsers}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+5% vs hier</span>
              </div>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Requêtes/min</p>
              <p className="text-3xl font-bold text-green-600">{metrics.requests.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+12% vs hier</span>
              </div>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Erreurs</p>
              <p className="text-3xl font-bold text-red-600">{metrics.errors}</p>
              <div className="flex items-center mt-1">
                <TrendingDown className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-sm text-green-600">-2% vs hier</span>
              </div>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Temps de réponse</p>
              <p className="text-3xl font-bold text-orange-600">{metrics.responseTime.toFixed(0)}ms</p>
              <div className="flex items-center mt-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">Excellent</span>
              </div>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Performance en temps réel</h4>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {autoRefresh ? 'En direct' : 'Arrêté'}
            </span>
          </div>
        </div>
        
        <div className="h-80">
          {performanceData.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Collecte des données en cours...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Alertes système</h4>
        
        <div className="space-y-4">
          {metrics.cpu > 80 && (
            <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Utilisation CPU élevée</p>
                <p className="text-sm text-red-700">Le CPU est utilisé à {metrics.cpu.toFixed(1)}%</p>
              </div>
            </div>
          )}
          
          {metrics.memory > 90 && (
            <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Mémoire critique</p>
                <p className="text-sm text-red-700">La mémoire est utilisée à {metrics.memory.toFixed(1)}%</p>
              </div>
            </div>
          )}
          
          {metrics.errors > 3 && (
            <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">Erreurs détectées</p>
                <p className="text-sm text-yellow-700">{metrics.errors} erreurs dans la dernière minute</p>
              </div>
            </div>
          )}
          
          {metrics.cpu <= 80 && metrics.memory <= 90 && metrics.errors <= 3 && (
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Système en bonne santé</p>
                <p className="text-sm text-green-700">Toutes les métriques sont dans les limites normales</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSystemMonitoring;
