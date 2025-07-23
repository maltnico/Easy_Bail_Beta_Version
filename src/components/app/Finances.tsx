import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Calendar,
  Download,
  Filter,
  PieChart,
  BarChart3,
  Search,
  FileText,
  Edit,
  Trash2,
  Eye,
  ArrowRight,
  ArrowLeft,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  Repeat,
  Tag,
  Printer,
  FileDown,
  CreditCard,
  Building,
  Users,
  Zap,
  Settings,
  Loader2
} from 'lucide-react';
import { useFinances } from '../../hooks/useFinances';
import { useProperties } from '../../hooks/useProperties';
import { FinancialFlow, FinancialCategory } from '../../types/financial';
import FinancialFlowForm from './FinancialFlowForm';
import FinancialDashboard from './FinancialDashboard';
import FinancialReports from './FinancialReports';
import FinancialBudgets from './FinancialBudgets';
import FinancialSettings from './FinancialSettings';
import FinancialTaxes from './FinancialTaxes';

const Finances = () => {
  const {
    flows,
    categories,
    dashboardData,
    stats,
    loading,
    error,
    createFlow,
    updateFlow,
    deleteFlow,
    refreshData,
    refreshDashboard
  } = useFinances();

  const { properties } = useProperties();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPropertyType, setFilterPropertyType] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<{start: Date, end: Date} | null>(null);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'semester' | 'year' | 'custom'>('month');
  
  const [showFlowForm, setShowFlowForm] = useState(false);
  const [editingFlow, setEditingFlow] = useState<FinancialFlow | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<FinancialFlow | null>(null);
  const [showFlowDetails, setShowFlowDetails] = useState(false);

  useEffect(() => {
    // Définir la plage de dates par défaut (mois en cours)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setFilterDateRange({ start: startOfMonth, end: endOfMonth });
    
    // Charger les données initiales
    refreshDashboard(startOfMonth, endOfMonth);
  }, []);

  const filteredFlows = flows.filter(flow => {
    // Filtre par terme de recherche
    const matchesSearch = 
      flow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flow.propertyName && flow.propertyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (flow.tenantName && flow.tenantName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtre par type
    const matchesType = filterType === 'all' || flow.type === filterType;
    
    // Filtre par catégorie
    const matchesCategory = filterCategory === 'all' || flow.category === filterCategory;
    
    // Filtre par statut
    const matchesStatus = filterStatus === 'all' || flow.status === filterStatus;
    
    // Filtre par type de bien
    const matchesPropertyType = filterPropertyType === 'all' || 
      (flow.propertyId && properties.find(p => p.id === flow.propertyId)?.type === filterPropertyType);
    
    // Filtre par plage de dates
    const matchesDateRange = !filterDateRange || 
      (flow.date >= filterDateRange.start && flow.date <= filterDateRange.end);
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesPropertyType && matchesDateRange;
  });

  // Trier les flux
  const sortedFlows = [...filteredFlows].sort((a, b) => {
    let aValue: any = a[sortBy as keyof FinancialFlow];
    let bValue: any = b[sortBy as keyof FinancialFlow];
    
    // Gestion spéciale pour les dates
    if (sortBy === 'date' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleAddFlow = () => {
    setEditingFlow(null);
    setShowFlowForm(true);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period as any);
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    let periodType: 'month' | 'quarter' | 'semester' | 'year' | 'custom' = 'month';
    
    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        periodType = 'month';
        break;
      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59);
        periodType = 'quarter';
        break;
      case 'semester':
        const currentSemester = Math.floor(now.getMonth() / 6);
        startDate = new Date(now.getFullYear(), currentSemester * 6, 1);
        endDate = new Date(now.getFullYear(), (currentSemester + 1) * 6, 0, 23, 59, 59);
        periodType = 'semester';
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        periodType = 'year';
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        periodType = 'ytd';
        break;
      case 'custom':
        // Pour les dates personnalisées, on garde les dates actuelles
        if (filterDateRange) {
          startDate = filterDateRange.start;
          endDate = filterDateRange.end;
        } else {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }
        periodType = 'custom';
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        periodType = 'month';
    }
    
    setSelectedPeriod(periodType);
    setFilterDateRange({ start: startDate, end: endDate });
    
    // Appliquer les filtres supplémentaires au tableau de bord
    refreshDashboard(startDate, endDate, filterType, filterPropertyType);
  };

  const handleEditFlow = (flow: FinancialFlow) => {
    setEditingFlow(flow);
    setShowFlowForm(true);
  };

  const handleViewFlow = (flow: FinancialFlow) => {
    setSelectedFlow(flow);
    setShowFlowDetails(true);
  };

  const handleDeleteFlow = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce flux financier ?')) {
      try {
        await deleteFlow(id);
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
      }
    }
  };

  const handleSaveFlow = async (flowData: Omit<FinancialFlow, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingFlow) {
        await updateFlow(editingFlow.id, flowData);
      } else {
        await createFlow(flowData);
      }
      setShowFlowForm(false);
      setEditingFlow(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    }
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Catégorie inconnue';
  };

  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : '#808080';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Validé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const renderDashboardTab = () => (
    <FinancialDashboard 
      dashboardData={dashboardData}
      filterType={filterType}
      filterPropertyType={filterPropertyType}
      filterDateRange={filterDateRange}
      stats={stats}
      onDateRangeChange={handlePeriodChange}
      onFilterTypeChange={setFilterType}
      onFilterPropertyTypeChange={setFilterPropertyType}
      onAddFlow={handleAddFlow}
    />
  );

  const renderTransactionsTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-6">
        {/* Period Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres d'analyse</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Période</p>
              <div className="flex space-x-2">
              {[
                { value: 'month', label: 'Ce mois' },
                { value: 'quarter', label: 'Ce trimestre' },
                { value: 'semester', label: 'Ce semestre' },
                { value: 'year', label: 'Cette année' }
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => handlePeriodChange(period.value)}
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
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Type de bien</p>
              <select
                value={filterPropertyType}
                onChange={(e) => setFilterPropertyType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous les types</option>
                <option value="apartment">Appartements</option>
                <option value="house">Maisons</option>
                <option value="studio">Studios</option>
                <option value="parking">Parkings</option>
                <option value="commercial">Commerciaux</option>
              </select>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Type de flux</p>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous les types</option>
                <option value="income">Revenus</option>
                <option value="expense">Dépenses</option>
              </select>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Statut</p>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Validés</option>
                <option value="pending">En attente</option>
                <option value="cancelled">Annulés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une transaction..."
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
                <option value="income">Revenus</option>
                <option value="expense">Dépenses</option>
              </select>
              
              <select
                value={filterPropertyType}
                onChange={(e) => setFilterPropertyType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous les types de bien</option>
                <option value="apartment">Appartements</option>
                <option value="house">Maisons</option>
                <option value="studio">Studios</option>
                <option value="parking">Parkings</option>
                <option value="commercial">Commerciaux</option>
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Validés</option>
                <option value="pending">En attente</option>
                <option value="cancelled">Annulés</option>
              </select>
              
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Date Range */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Du:</span>
            <input
              type="date"
              value={filterDateRange?.start.toISOString().split('T')[0] || ''}
              onChange={(e) => setFilterDateRange(prev => ({
                start: new Date(e.target.value),
                end: prev?.end || new Date()
              }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Au:</span>
            <input
              type="date"
              value={filterDateRange?.end.toISOString().split('T')[0] || ''}
              onChange={(e) => setFilterDateRange(prev => ({
                start: prev?.start || new Date(),
                end: new Date(e.target.value)
              }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDateRangeChange('month')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ce mois
            </button>
            <button
              onClick={() => handleDateRangeChange('quarter')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ce trimestre
            </button>
            <button
              onClick={() => handleDateRangeChange('year')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cette année
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
          <button
            onClick={handleAddFlow}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Ajouter une transaction</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  <button 
                    onClick={() => {
                      if (sortBy === 'date') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('date');
                        setSortOrder('desc');
                      }
                    }}
                    className="flex items-center space-x-1"
                  >
                    <span>Date</span>
                    {sortBy === 'date' && (
                      sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Catégorie</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Bien/Locataire</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  <button 
                    onClick={() => {
                      if (sortBy === 'amount') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('amount');
                        setSortOrder('desc');
                      }
                    }}
                    className="flex items-center space-x-1"
                  >
                    <span>Montant</span>
                    {sortBy === 'amount' && (
                      sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedFlows.map((flow) => (
                <tr key={flow.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">
                      {flow.date.toLocaleDateString()}
                    </div>
                    {flow.recurring && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Repeat className="h-3 w-3 mr-1" />
                        <span>
                          {flow.recurrenceFrequency === 'monthly' ? 'Mensuel' :
                           flow.recurrenceFrequency === 'quarterly' ? 'Trimestriel' : 'Annuel'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {flow.type === 'income' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{flow.description}</div>
                        {flow.reference && (
                          <div className="text-xs text-gray-500">Réf: {flow.reference}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getCategoryColor(flow.category) }}
                      ></div>
                      <span className="text-sm text-gray-900">{getCategoryName(flow.category)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {flow.propertyName && (
                        <div className="flex items-center text-gray-900">
                          <Building className="h-3 w-3 mr-1 text-gray-500" />
                          <span>{flow.propertyName}</span>
                        </div>
                      )}
                      {flow.tenantName && (
                        <div className="flex items-center text-gray-500 mt-1">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{flow.tenantName}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-bold ${
                      flow.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {flow.type === 'income' ? '+' : '-'}{formatCurrency(flow.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flow.status)}`}>
                      {getStatusLabel(flow.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewFlow(flow)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditFlow(flow)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFlow(flow.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sortedFlows.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction trouvée</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Aucune transaction ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter votre première transaction.'
              }
            </p>
            <button 
              onClick={handleAddFlow}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter une transaction
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      {sortedFlows.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Total revenus</p>
                  <p className="text-xl font-bold text-green-900">
                    {formatCurrency(sortedFlows.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0))}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Total dépenses</p>
                  <p className="text-xl font-bold text-red-900">
                    {formatCurrency(sortedFlows.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0))}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Solde</p>
                  <p className="text-xl font-bold text-blue-900">
                    {formatCurrency(
                      sortedFlows.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0) -
                      sortedFlows.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0)
                    )}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReportsTab = () => (
    <FinancialReports />
  );

  const renderBudgetsTab = () => (
    <FinancialBudgets />
  );

  const renderTaxesTab = () => (
    <FinancialTaxes />
  );

  const renderSettingsTab = () => (
    <FinancialSettings />
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboardTab();
      case 'transactions':
        return renderTransactionsTab();
      case 'reports':
        return renderReportsTab();
      case 'budgets':
        return renderBudgetsTab();
      case 'taxes':
        return renderTaxesTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderDashboardTab();
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données financières...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Finances</h1>
          <p className="text-gray-600">Suivi financier et fiscal de votre portefeuille</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleAddFlow}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Ajouter un flux</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Rapports</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Erreur</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <PieChart className="h-4 w-4" />
              <span>Tableau de bord</span>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'transactions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              <span>Transactions</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reports'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Rapports</span>
            </button>
            <button
              onClick={() => setActiveTab('budgets')}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'budgets'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Budgets</span>
            </button>
            <button
              onClick={() => setActiveTab('taxes')}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'taxes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileDown className="h-4 w-4" />
              <span>Fiscalité</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Paramètres</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Flow Form Modal */}
      {showFlowForm && (
        <FinancialFlowForm
          flow={editingFlow}
          categories={categories}
          onSave={handleSaveFlow}
          onCancel={() => {
            setShowFlowForm(false);
            setEditingFlow(null);
          }}
          isOpen={showFlowForm}
        />
      )}

      {/* Flow Details Modal */}
      {showFlowDetails && selectedFlow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getCategoryColor(selectedFlow.category) + '20' }}>
                  {selectedFlow.type === 'income' ? (
                    <TrendingUp className="h-6 w-6" style={{ color: getCategoryColor(selectedFlow.category) }} />
                  ) : (
                    <TrendingDown className="h-6 w-6" style={{ color: getCategoryColor(selectedFlow.category) }} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedFlow.description}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFlow.status)}`}>
                      {getStatusLabel(selectedFlow.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {selectedFlow.date.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowFlowDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Amount */}
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-600 mb-1">Montant</p>
                <p className={`text-3xl font-bold ${
                  selectedFlow.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedFlow.type === 'income' ? '+' : '-'}{formatCurrency(selectedFlow.amount)}
                </p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Informations générales</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Catégorie:</span>
                      <span className="text-gray-900 font-medium">{getCategoryName(selectedFlow.category)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-900 font-medium">
                        {selectedFlow.type === 'income' ? 'Revenu' : 'Dépense'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">{selectedFlow.date.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Référence:</span>
                      <span className="text-gray-900">{selectedFlow.reference || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Méthode de paiement:</span>
                      <span className="text-gray-900">
                        {selectedFlow.paymentMethod === 'bank_transfer' ? 'Virement bancaire' :
                         selectedFlow.paymentMethod === 'cash' ? 'Espèces' :
                         selectedFlow.paymentMethod === 'check' ? 'Chèque' :
                         selectedFlow.paymentMethod === 'direct_debit' ? 'Prélèvement' : 
                         selectedFlow.paymentMethod || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Détails associés</h3>
                  <div className="space-y-3">
                    {selectedFlow.propertyName && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bien:</span>
                        <span className="text-gray-900">{selectedFlow.propertyName}</span>
                      </div>
                    )}
                    {selectedFlow.tenantName && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Locataire:</span>
                        <span className="text-gray-900">{selectedFlow.tenantName}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Récurrent:</span>
                      <span className="text-gray-900">
                        {selectedFlow.recurring ? (
                          <span className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                            {selectedFlow.recurrenceFrequency === 'monthly' ? 'Mensuel' :
                             selectedFlow.recurrenceFrequency === 'quarterly' ? 'Trimestriel' : 'Annuel'}
                          </span>
                        ) : 'Non'}
                      </span>
                    </div>
                    {selectedFlow.recurrenceEndDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fin de récurrence:</span>
                        <span className="text-gray-900">{selectedFlow.recurrenceEndDate.toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Créé le:</span>
                      <span className="text-gray-900">{selectedFlow.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedFlow.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900">{selectedFlow.notes}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedFlow.tags && selectedFlow.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFlow.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowFlowDetails(false);
                    handleEditFlow(selectedFlow);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={() => {
                    setShowFlowDetails(false);
                    handleDeleteFlow(selectedFlow.id);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Supprimer</span>
                </button>
              </div>
              <button
                onClick={() => setShowFlowDetails(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composants flèches pour le tri
const ArrowUp = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
);

const ArrowDown = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);

export default Finances;
