import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  FileText,
  CheckSquare,
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Activity,
  Clock,
  Eye,
  BarChart3,
  PieChart,
  Zap,
  Filter,
  Mail,
  RefreshCw
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useActivities } from '../../hooks/useActivities';
import { useProperties } from '../../hooks/useProperties';
import { useNotifications } from '../../hooks/useNotifications';
import { useFinances } from '../../hooks/useFinances';
import { useTasks } from '../../hooks/useTasks';
import { useAutomations } from '../../hooks/useAutomations';
import { documentStorage } from '../../lib/documentStorage';
import RecentDocumentsWidget from './RecentDocumentsWidget';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const { activities, stats, refreshActivities, loading: activitiesLoading } = useActivities({}, 7); // Récupérer les 7 dernières activités
  const { properties, loading: propertiesLoading } = useProperties();
  const { notifications, unreadCount } = useNotifications();
  const { tasks, loading: tasksLoading } = useTasks();
  const { flows, dashboardData, stats: financeStats, loading: financeLoading, refreshDashboard } = useFinances();
  const { automations, isSchedulerActive, startScheduler, stopScheduler } = useAutomations();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'semester' | 'year'>('month');
  const [generatedDocuments, setGeneratedDocuments] = useState(0);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  
  // Charger le nombre de documents générés
  React.useEffect(() => {
    const loadGeneratedDocuments = async () => {
      try {
        setDocumentsLoading(true);
        const documents = await documentStorage.getDocumentsList();
        setGeneratedDocuments(documents.length);
      } catch (error) {
        console.error('Erreur lors du chargement des documents:', error);
        // En cas d'erreur, utiliser des données de démonstration
        setGeneratedDocuments(3);
      } finally {
        setDocumentsLoading(false);
      }
    };
    
    loadGeneratedDocuments();
  }, []);

  const totalProperties = properties.length;
  const occupiedProperties = properties.filter(p => p.status === 'occupied').length;
  const totalRent = properties.reduce((sum, p) => p.status === 'occupied' ? sum + p.rent : sum, 0);
  const activeAutomations = automations.filter(a => a.active).length;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'payment':
        return DollarSign;
      case 'property':
        return Building;
      case 'tenant':
        return Users;
      case 'automation':
        return Activity;
      case 'incident':
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  const getActivityColor = (category: string) => {
    switch (category) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period as 'month' | 'quarter' | 'semester' | 'year');
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59);
        break;
      case 'semester':
        const currentSemester = Math.floor(now.getMonth() / 6);
        startDate = new Date(now.getFullYear(), currentSemester * 6, 1);
        endDate = new Date(now.getFullYear(), (currentSemester + 1) * 6, 0, 23, 59, 59);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }
    
    refreshDashboard(startDate, endDate);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'maintenant';
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}j`;
  };

  // Filtrer les tâches à venir (non terminées, triées par date d'échéance)
  const upcomingTasks = tasks
    .filter(task => task.status === 'pending')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 3); // Limiter à 3 tâches

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre portefeuille immobilier</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Biens totaux</p>
              <p className="text-3xl font-bold text-gray-900">{totalProperties}</p>
              <p className="text-sm text-green-600 mt-1">
                {occupiedProperties} occupés
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus mensuels</p>
              <p className="text-3xl font-bold text-gray-900">{totalRent.toLocaleString()}€</p>
              <p className="text-sm text-green-600 mt-1">
                +5.2% vs mois dernier
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documents générés</p>
              <p className="text-3xl font-bold text-gray-900">
                {documentsLoading ? '...' : generatedDocuments}
              </p>
              <p className="text-sm text-orange-600 mt-1">
                Via le générateur
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Automatisations actives</p>
              <p className="text-3xl font-bold text-gray-900">{activeAutomations}</p>
              <p className="text-sm text-red-600 mt-1">
                {activeAutomations > 0 ? 'En fonctionnement' : 'Aucune automatisation'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Loading State */}
      {propertiesLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">Chargement des données...</span>
        </div>
      )}
      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Overview Widget */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">Aperçu financier</h3>
              <span className="text-sm text-gray-500">
                ({selectedPeriod === 'month' ? 'Mensuel' : 
                  selectedPeriod === 'quarter' ? 'Trimestriel' : 
                  selectedPeriod === 'semester' ? 'Semestriel' : 'Annuel'})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value as 'month' | 'quarter' | 'semester' | 'year')}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="semester">Ce semestre</option>
                <option value="year">Cette année</option>
              </select>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          {financeLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Chargement des données financières...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">
                        Revenus {selectedPeriod === 'month' ? 'mensuels' : 
                                selectedPeriod === 'quarter' ? 'trimestriels' : 
                                selectedPeriod === 'semester' ? 'semestriels' : 'annuels'}
                      </p>
                      <p className="text-xl font-bold text-green-900 whitespace-nowrap">
                        {dashboardData?.totalIncome.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600">
                        Dépenses {selectedPeriod === 'month' ? 'mensuelles' : 
                                selectedPeriod === 'quarter' ? 'trimestrielles' : 
                                selectedPeriod === 'semester' ? 'semestrielles' : 'annuelles'}
                      </p>
                      <p className="text-xl font-bold text-red-900 whitespace-nowrap">
                        {dashboardData?.totalExpense.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">
                        Résultat {selectedPeriod === 'month' ? 'mensuel' : 
                                selectedPeriod === 'quarter' ? 'trimestriel' : 
                                selectedPeriod === 'semester' ? 'semestriel' : 'annuel'}
                      </p>
                      <p className="text-xl font-bold text-blue-900 whitespace-nowrap">
                        {(dashboardData?.netIncome || 0).toLocaleString('fr-FR')} €
                      </p>
                    </div>
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              {/* Graphique à barres */}
              <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Performance financière de mes biens
                </h4>
                <div className="h-64">
                  {dashboardData?.monthlyTrend && dashboardData.monthlyTrend.length > 0 ? (
                    <Bar
                      data={{
                        labels: dashboardData.monthlyTrend.map(item => item.month),
                        datasets: [
                          {
                            label: 'Revenus',
                            data: dashboardData.monthlyTrend.map(item => item.income),
                            backgroundColor: 'rgba(34, 197, 94, 0.7)',
                            borderColor: 'rgba(34, 197, 94, 1)',
                            borderWidth: 1,
                            borderRadius: 4,
                          },
                          {
                            label: 'Dépenses',
                            data: dashboardData.monthlyTrend.map(item => item.expense),
                            backgroundColor: 'rgba(239, 68, 68, 0.7)',
                            borderColor: 'rgba(239, 68, 68, 1)',
                            borderWidth: 1,
                            borderRadius: 4,
                          },
                          {
                            label: 'Résultat net',
                            data: dashboardData.monthlyTrend.map(item => item.income - item.expense),
                            backgroundColor: 'rgba(59, 130, 246, 0.7)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 1,
                            borderRadius: 4,
                          }
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const value = context.raw as number;
                                return `${context.dataset.label}: ${value.toLocaleString('fr-FR')} €`;
                              }
                            }
                          }
                        },
                        scales: {
                          x: {
                            grid: {
                              display: false
                            }
                          },
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return `${value} €`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Aucune donnée disponible</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setActiveTab('finances')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-end"
                >
                  Voir toutes les finances
                  <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Recent Activities - Kept */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activités récentes</h3>
            <button 
              onClick={refreshActivities}
              disabled={activitiesLoading}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Rafraîchir les activités"
            >
              <RefreshCw className={`h-4 w-4 ${activitiesLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-4">
            {activitiesLoading && (
              <div className="flex justify-center py-2">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-6 py-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100">
                    <Icon className={`h-4 w-4 ${getActivityColor(activity.category)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{activity.description}</p>
                    {!activity.readAt && (
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                        <span className="text-xs text-blue-600">Non lu</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatTimeAgo(activity.createdAt)}</span>
                </div>
              );
            })}
            {activities.length === 0 && (
              <div className="text-center py-6">
                <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucune activité récente</p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{stats.unread} non lues</span>
              <button 
                onClick={() => setActiveTab('activities')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Voir toutes les activités
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Documents and Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents Widget */}
        <RecentDocumentsWidget setActiveTab={setActiveTab} />

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tâches à venir</h3>
            {tasksLoading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Calendar className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          {tasksLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des tâches...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      task.priority === 'high' ? 'bg-red-100' : 
                      task.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      <CheckSquare className={`h-5 w-5 ${
                        task.priority === 'high' ? 'text-red-600' : 
                        task.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <span className="text-sm text-gray-500">{task.dueDate.toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{task.propertyName || 'Aucun bien associé'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Aucune tâche à venir</p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button 
              onClick={() => setActiveTab('tasks')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-end"
            >
              Voir toutes les tâches
              <svg className="h-4 w-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button 
              onClick={() => setActiveTab('properties')}
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Building className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">Ajouter un bien</span>
            </button>
            <button 
              onClick={() => setActiveTab('tenants')}
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Nouveau locataire</span>
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <FileText className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Créer document</span>
            </button>
            <button 
              onClick={() => setActiveTab('finances')}
              className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <DollarSign className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-orange-900">Ajouter flux</span>
            </button>
            <button 
              onClick={() => setActiveTab('properties')}
              className="flex flex-col items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <Calendar className="h-8 w-8 text-teal-600 mb-2" />
              <span className="text-sm font-medium text-teal-900">Planifier visite</span>
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <CheckCircle className="h-8 w-8 text-indigo-600 mb-2" />
              <span className="text-sm font-medium text-indigo-900">État des lieux</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
