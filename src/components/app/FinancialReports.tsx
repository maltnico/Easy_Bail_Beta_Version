import React, { useState, useEffect } from 'react';
import { useFinances } from '../../hooks/useFinances';
import { useProperties } from '../../hooks/data';
import { useTenants } from '../../hooks/data';
import { BarChart, PieChart, TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Download, Eye } from 'lucide-react';
import type { FinancialFlow } from '../../types/financial';

interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  propertyPerformance: Array<{
    propertyName: string;
    income: number;
    expenses: number;
    net: number;
    roi: number;
  }>;
}

const FinancialReports: React.FC = () => {
  const { flows, loading } = useFinances();
  const { properties } = useProperties();
  const { tenants } = useTenants();
  
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'detailed' | 'charts'>('overview');

  useEffect(() => {
    if (flows && flows.length > 0) {
      generateReportData();
    }
  }, [flows, selectedPeriod, selectedProperty]);

  const generateReportData = () => {
    if (!flows) return;

    const filteredFlows = flows.filter(flow => {
      if (selectedProperty !== 'all' && flow.property_id !== selectedProperty) {
        return false;
      }
      
      const flowDate = new Date(flow.date);
      const now = new Date();
      
      switch (selectedPeriod) {
        case 'month':
          return flowDate.getMonth() === now.getMonth() && 
                 flowDate.getFullYear() === now.getFullYear();
        case 'quarter':
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const flowQuarter = Math.floor(flowDate.getMonth() / 3);
          return flowQuarter === currentQuarter && 
                 flowDate.getFullYear() === now.getFullYear();
        case 'year':
          return flowDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });

    const totalIncome = filteredFlows
      .filter(f => f.type === 'income')
      .reduce((sum, f) => sum + f.amount, 0);
    
    const totalExpenses = filteredFlows
      .filter(f => f.type === 'expense')
      .reduce((sum, f) => sum + f.amount, 0);

    // Generate monthly data for the last 12 months
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthFlows = flows.filter(f => {
        const flowDate = new Date(f.date);
        return flowDate.getFullYear() === date.getFullYear() && 
               flowDate.getMonth() === date.getMonth();
      });

      const income = monthFlows
        .filter(f => f.type === 'income')
        .reduce((sum, f) => sum + f.amount, 0);
      
      const expenses = monthFlows
        .filter(f => f.type === 'expense')
        .reduce((sum, f) => sum + f.amount, 0);

      monthlyData.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        income,
        expenses,
        net: income - expenses
      });
    }

    // Category breakdown
    const categoryMap = new Map<string, number>();
    filteredFlows.forEach(flow => {
      const current = categoryMap.get(flow.category) || 0;
      categoryMap.set(flow.category, current + flow.amount);
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / (totalIncome + totalExpenses)) * 100
      }))
      .sort((a, b) => b.amount - a.amount);

    // Property performance
    const propertyPerformance = properties?.map(property => {
      const propertyFlows = filteredFlows.filter(f => f.property_id === property.id);
      const income = propertyFlows
        .filter(f => f.type === 'income')
        .reduce((sum, f) => sum + f.amount, 0);
      const expenses = propertyFlows
        .filter(f => f.type === 'expense')  
        .reduce((sum, f) => sum + f.amount, 0);
      const net = income - expenses;
      const roi = income > 0 ? (net / income) * 100 : 0;

      return {
        propertyName: property.name,
        income,
        expenses,
        net,
        roi
      };
    }).filter(p => p.income > 0 || p.expenses > 0) || [];

    setReportData({
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      monthlyData,
      categoryBreakdown,
      propertyPerformance
    });
  };

  const exportReport = () => {
    if (!reportData) return;
    
    const csvContent = [
      ['Période', selectedPeriod],
      ['Propriété', selectedProperty === 'all' ? 'Toutes' : properties?.find(p => p.id === selectedProperty)?.name || 'Inconnue'],
      [''],
      ['Revenus totaux', reportData.totalIncome.toFixed(2) + '€'],
      ['Dépenses totales', reportData.totalExpenses.toFixed(2) + '€'],
      ['Résultat net', reportData.netIncome.toFixed(2) + '€'],
      [''],
      ['Données mensuelles'],
      ['Mois', 'Revenus', 'Dépenses', 'Net'],
      ...reportData.monthlyData.map(m => [m.month, m.income.toFixed(2), m.expenses.toFixed(2), m.net.toFixed(2)])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rapport-financier-${selectedPeriod}-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <BarChart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune donnée financière</h3>
        <p className="mt-1 text-sm text-gray-500">
          Commencez par ajouter des flux financiers pour générer des rapports.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports Financiers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Analyse détaillée de vos performances financières
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={exportReport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Période
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="month">Ce mois</option>
              <option value="quarter">Ce trimestre</option>
              <option value="year">Cette année</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Propriété
            </label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">Toutes les propriétés</option>
              {properties?.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Vue d\'ensemble', icon: Eye },
            { id: 'detailed', name: 'Détaillé', icon: BarChart },
            { id: 'charts', name: 'Graphiques', icon: PieChart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeView === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Revenus totaux
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {reportData.totalIncome.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingDown className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Dépenses totales
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {reportData.totalExpenses.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign
                      className={`h-6 w-6 ${
                        reportData.netIncome >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Résultat net
                      </dt>
                      <dd className={`text-lg font-medium ${
                        reportData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {reportData.netIncome.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Performance */}
          {reportData.propertyPerformance.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Performance par propriété
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Propriété
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenus
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dépenses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ROI
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.propertyPerformance.map((property, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {property.propertyName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {property.income.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {property.expenses.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            })}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                            property.net >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {property.net.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            })}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                            property.roi >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {property.roi.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeView === 'detailed' && (
        <div className="space-y-6">
          {/* Monthly Breakdown */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Évolution mensuelle
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mois
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenus
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dépenses
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.monthlyData.map((month, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {month.month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {month.income.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {month.expenses.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          })}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          month.net >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {month.net.toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'EUR'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Répartition par catégorie
              </h3>
              <div className="space-y-3">
                {reportData.categoryBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-indigo-500 mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">
                        {category.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {category.percentage.toFixed(1)}%
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {category.amount.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'charts' && (
        <div className="text-center py-12">
          <PieChart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Graphiques bientôt disponibles</h3>
          <p className="mt-1 text-sm text-gray-500">
            Les graphiques interactifs seront ajoutés dans une prochaine version.
          </p>
        </div>
      )}
    </div>
  );
};

export default FinancialReports;