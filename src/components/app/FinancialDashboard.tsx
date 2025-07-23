import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download, 
  PieChart,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Plus,
  Zap,
  Clock,
  AlertTriangle,
  Building
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { FinancialDashboardData, FinancialStats } from '../../types/financial';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface FinancialDashboardProps {
  dashboardData: FinancialDashboardData | null;
  stats: FinancialStats | null;
  filterType: string;
  filterPropertyType: string;
  filterDateRange: {start: Date, end: Date} | null;
  onDateRangeChange: (range: 'month' | 'quarter' | 'year' | 'ytd' | 'custom') => void;
  onFilterTypeChange: (type: string) => void;
  onFilterPropertyTypeChange: (type: string) => void;
  onAddFlow: () => void;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  dashboardData,
  stats,
  filterType,
  filterPropertyType,
  filterDateRange,
  onDateRangeChange,
  onFilterTypeChange,
  onFilterPropertyTypeChange,
  onAddFlow
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    filterDateRange ? 
      (filterDateRange.end.getMonth() - filterDateRange.start.getMonth() === 0 ? 'month' : 
       filterDateRange.end.getMonth() - filterDateRange.start.getMonth() === 2 ? 'quarter' : 
       filterDateRange.end.getMonth() - filterDateRange.start.getMonth() === 5 ? 'semester' : 
       filterDateRange.end.getMonth() - filterDateRange.start.getMonth() === 11 ? 'year' : 'custom') 
      : 'month'
  );

  const handlePeriodChange = (period: 'month' | 'quarter' | 'year' | 'ytd' | 'custom') => {
    setSelectedPeriod(period);
    onDateRangeChange(period);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  if (!dashboardData || !stats) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement des données financières...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">Filtres d'analyse</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Période</p>
              <div className="flex space-x-2">
                {[
                  { value: 'month', label: 'Ce mois' },
                  { value: 'quarter', label: 'Ce trimestre' },
                  { value: 'year', label: 'Cette année' },
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => handlePeriodChange(period.value as any)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedPeriod === period.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="border-l border-gray-200 pl-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Type de bien</p>
              <select
                value={filterPropertyType}
                onChange={(e) => onFilterPropertyTypeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous</option>
                <option value="apartment">Appartements</option>
                <option value="house">Maisons</option>
                <option value="studio">Studios</option>
                <option value="parking">Parkings</option>
                <option value="commercial">Commerciaux</option>
              </select>
            </div>
            
            <div className="border-l border-gray-200 pl-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Type de flux</p>
              <select
                value={filterType}
                onChange={(e) => onFilterTypeChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous</option>
                <option value="income">Revenus</option>
                <option value="expense">Dépenses</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(dashboardData.totalIncome)}</p>
              {stats.currentMonth.income !== 0 && stats.previousMonth.income !== 0 && (
                <div className="flex items-center mt-1">
                  {stats.currentMonth.income > stats.previousMonth.income ? (
                    <>
                      <ArrowUp className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">
                        +{getPercentageChange(stats.currentMonth.income, stats.previousMonth.income).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-3 w-3 text-red-600 mr-1" />
                      <span className="text-sm text-red-600">
                        {getPercentageChange(stats.currentMonth.income, stats.previousMonth.income).toFixed(1)}%
                      </span>
                    </>
                  )}
                  <span className="text-xs text-gray-500 ml-1">vs mois précédent</span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dépenses totales</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(dashboardData.totalExpense)}</p>
              {stats.currentMonth.expense !== 0 && stats.previousMonth.expense !== 0 && (
                <div className="flex items-center mt-1">
                  {stats.currentMonth.expense < stats.previousMonth.expense ? (
                    <>
                      <ArrowDown className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-sm text-green-600">
                        -{Math.abs(getPercentageChange(stats.currentMonth.expense, stats.previousMonth.expense)).toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="h-3 w-3 text-red-600 mr-1" />
                      <span className="text-sm text-red-600">
                        +{getPercentageChange(stats.currentMonth.expense, stats.previousMonth.expense).toFixed(1)}%
                      </span>
                    </>
                  )}
                  <span className="text-xs text-gray-500 ml-1">vs mois précédent</span>
                </div>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Résultat net</p>
              <p className={`text-3xl font-bold ${dashboardData.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(dashboardData.netIncome)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Marge: {dashboardData.totalIncome > 0 
                  ? ((dashboardData.netIncome / dashboardData.totalIncome) * 100).toFixed(1)
                  : '0'}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-3xl font-bold text-yellow-600">{formatCurrency(dashboardData.pendingAmount)}</p>
              <p className="text-sm text-gray-500 mt-1">À recevoir/payer</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Income Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Répartition des revenus</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          
          {Object.keys(dashboardData.incomeByCategory || {}).length > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <Pie 
                data={{
                  labels: Object.keys(dashboardData.incomeByCategory),
                  datasets: [
                    {
                      data: Object.values(dashboardData.incomeByCategory),
                      backgroundColor: [
                        '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534',
                        '#84cc16', '#65a30d', '#4d7c0f', '#3f6212', '#365314'
                      ],
                      borderColor: '#ffffff',
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 15,
                        padding: 15,
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw as number;
                          const percentage = ((value / dashboardData.totalIncome) * 100).toFixed(1);
                          return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun revenu pour la période sélectionnée</p>
            </div>
          )}
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Répartition des dépenses</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          
          {Object.keys(dashboardData.expenseByCategory || {}).length > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <Pie
                data={{
                  labels: Object.keys(dashboardData.expenseByCategory),
                  datasets: [
                    {
                      data: Object.values(dashboardData.expenseByCategory),
                      backgroundColor: [
                        '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
                        '#fb7185', '#e11d48', '#be123c', '#9f1239', '#881337'
                      ],
                      borderColor: '#ffffff',
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 15,
                        padding: 15,
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const value = context.raw as number;
                          const percentage = ((value / dashboardData.totalExpense) * 100).toFixed(1);
                          return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune dépense pour la période sélectionnée</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Tendance mensuelle</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Revenus</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Dépenses</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Net</span>
            </div>
          </div>
        </div>
        
        <div className="h-72">
          {dashboardData.monthlyTrend && dashboardData.monthlyTrend.length > 0 ? (
            <Line
              data={{
                labels: [...dashboardData.monthlyTrend.map(item => item.month)].reverse(),
                datasets: [
                  {
                    label: 'Revenus',
                    data: [...dashboardData.monthlyTrend.map(item => item.income)],
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.2,
                    pointBackgroundColor: '#22c55e',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                  },
                  {
                    label: 'Dépenses',
                    data: [...dashboardData.monthlyTrend.map(item => item.expense)],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.2,
                    pointBackgroundColor: '#ef4444',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                  },
                  {
                    label: 'Résultat net',
                    data: [...dashboardData.monthlyTrend.map(item => item.income - item.expense)],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.2,
                    pointBackgroundColor: '#3b82f6',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                  }
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      boxWidth: 12,
                      padding: 15,
                      usePointStyle: true,
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const value = context.raw as number;
                        return `${context.dataset.label}: ${formatCurrency(value)}`;
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
                        return formatCurrency(value as number);
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Aucune donnée disponible pour la période sélectionnée</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Actions rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={onAddFlow}
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Plus className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">Ajouter un revenu</span>
          </button>
          <button
            onClick={onAddFlow}
            className="flex flex-col items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Plus className="h-8 w-8 text-red-600 mb-2" />
            <span className="text-sm font-medium text-red-900">Ajouter une dépense</span>
          </button>
          <button
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Download className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">Exporter les données</span>
          </button>
          <button
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Zap className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">Générer prévisions</span>
          </button>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Taux d'occupation</h3>
            <Building className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  strokeDasharray="100, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeDasharray={`${Math.round(stats.occupancyRate)}, 100`}
                />
                <text x="18" y="20.5" textAnchor="middle" fontSize="8" fill="#3B82F6" fontWeight="bold">
                  {Math.round(stats.occupancyRate)}%
                </text>
              </svg>
            </div>
            <p className="text-sm text-gray-600 mt-2">Taux d'occupation actuel</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Loyer moyen</h3>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.averageRent)}</p>
            <p className="text-sm text-gray-600 mt-2">par mois et par bien</p>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rendement locatif</span>
                <span className="text-sm font-medium text-blue-600">{stats.rentalYield.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Année en cours</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Revenus</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(stats.ytd.income)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(stats.ytd.income / (stats.ytd.income + stats.ytd.expense)) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Dépenses</span>
                <span className="text-sm font-medium text-red-600">{formatCurrency(stats.ytd.expense)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${(stats.ytd.expense / (stats.ytd.income + stats.ytd.expense)) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Net</span>
                <span className={`text-sm font-bold ${stats.ytd.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(stats.ytd.net)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Alertes financières</h3>
          <AlertTriangle className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {stats.currentMonth.net < 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Solde négatif ce mois-ci</p>
                <p className="text-red-700 text-sm">
                  Vos dépenses ({formatCurrency(stats.currentMonth.expense)}) dépassent vos revenus ({formatCurrency(stats.currentMonth.income)})
                </p>
              </div>
            </div>
          )}
          
          {dashboardData.pendingAmount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
              <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="text-yellow-800 font-medium">Transactions en attente</p>
                <p className="text-yellow-700 text-sm">
                  {formatCurrency(dashboardData.pendingAmount)} de transactions sont en attente de validation
                </p>
              </div>
            </div>
          )}
          
          {stats.occupancyRate < 80 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center space-x-3">
              <Building className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-orange-800 font-medium">Taux d'occupation faible</p>
                <p className="text-orange-700 text-sm">
                  Votre taux d'occupation est de {Math.round(stats.occupancyRate)}%, ce qui est inférieur à l'objectif de 80%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant flèche horizontale
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export default FinancialDashboard;
