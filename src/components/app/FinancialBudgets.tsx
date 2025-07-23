import React, { useState } from 'react';
import { 
  BarChart3, 
  Plus, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2, 
  X, 
  Save,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useFinances } from '../../hooks/useFinances';
import { FinancialBudget } from '../../types/financial';

const FinancialBudgets: React.FC = () => {
  const { budgets, categories, createBudget, updateBudget, deleteBudget, loading, error } = useFinances();
  
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<FinancialBudget | null>(null);
  
  const [formData, setFormData] = useState<Omit<FinancialBudget, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    categories: [],
    totalBudget: 0,
    totalActual: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'year' || name === 'month' || name === 'totalBudget') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryBudgetChange = (categoryId: string, amount: number) => {
    setFormData(prev => {
      const updatedCategories = [...prev.categories];
      const categoryIndex = updatedCategories.findIndex(c => c.categoryId === categoryId);
      
      if (categoryIndex >= 0) {
        updatedCategories[categoryIndex] = {
          ...updatedCategories[categoryIndex],
          budgetAmount: amount
        };
      } else {
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          updatedCategories.push({
            categoryId,
            categoryName: category.name,
            budgetAmount: amount,
            actualAmount: 0
          });
        }
      }
      
      // Recalculate total budget
      const totalBudget = updatedCategories.reduce((sum, c) => sum + c.budgetAmount, 0);
      
      return {
        ...prev,
        categories: updatedCategories,
        totalBudget
      };
    });
  };

  const handleAddBudget = () => {
    setEditingBudget(null);
    
    // Initialize with expense categories
    const expenseCategories = categories
      .filter(c => c.type === 'expense')
      .map(c => ({
        categoryId: c.id,
        categoryName: c.name,
        budgetAmount: 0,
        actualAmount: 0
      }));
    
    setFormData({
      name: `Budget ${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      categories: expenseCategories,
      totalBudget: 0,
      totalActual: 0
    });
    
    setShowBudgetForm(true);
  };

  const handleEditBudget = (budget: FinancialBudget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      year: budget.year,
      month: budget.month,
      categories: budget.categories,
      totalBudget: budget.totalBudget,
      totalActual: budget.totalActual,
      notes: budget.notes
    });
    setShowBudgetForm(true);
  };

  const handleDeleteBudget = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce budget ?')) {
      try {
        await deleteBudget(id);
      } catch (err) {
        console.error('Erreur lors de la suppression du budget:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, formData);
      } else {
        await createBudget(formData);
      }
      setShowBudgetForm(false);
      setEditingBudget(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du budget:', err);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const date = new Date();
    date.setMonth(month - 1);
    return date.toLocaleDateString('fr-FR', { month: 'long' });
  };

  const calculateProgress = (budget: FinancialBudget) => {
    if (budget.totalBudget === 0) return 0;
    return (budget.totalActual / budget.totalBudget) * 100;
  };

  const getBudgetStatus = (budget: FinancialBudget) => {
    const progress = calculateProgress(budget);
    if (progress <= 80) return 'good';
    if (progress <= 100) return 'warning';
    return 'over';
  };

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'over':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBudgetStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'over':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Chargement des budgets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Budgets</h3>
        <button
          onClick={handleAddBudget}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Créer un budget</span>
        </button>
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

      {/* Budgets Grid */}
      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const status = getBudgetStatus(budget);
            const progress = calculateProgress(budget);
            
            return (
              <div key={budget.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{budget.name}</h4>
                      <p className="text-sm text-gray-500">
                        {budget.month ? `${getMonthName(budget.month)} ${budget.year}` : budget.year}
                      </p>
                    </div>
                    {getBudgetStatusIcon(status)}
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Progression</span>
                      <span className={`text-sm font-medium ${getBudgetStatusColor(status)}`}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          status === 'good' ? 'bg-green-500' : 
                          status === 'warning' ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Budget total</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(budget.totalBudget)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Dépenses actuelles</span>
                      <span className={`text-sm font-medium ${
                        budget.totalActual <= budget.totalBudget ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(budget.totalActual)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-900">Restant</span>
                      <span className={`text-sm font-bold ${
                        budget.totalBudget - budget.totalActual >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(budget.totalBudget - budget.totalActual)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between">
                  <button
                    onClick={() => handleEditBudget(budget)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun budget</h3>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas encore créé de budgets pour gérer vos dépenses.
          </p>
          <button 
            onClick={handleAddBudget}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer un budget
          </button>
        </div>
      )}

      {/* Budget Form Modal */}
      {showBudgetForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBudget ? 'Modifier le budget' : 'Créer un budget'}
              </h2>
              <button
                onClick={() => {
                  setShowBudgetForm(false);
                  setEditingBudget(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du budget *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Budget Novembre 2024"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="2000"
                      max="2100"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mois (optionnel)
                  </label>
                  <select
                    name="month"
                    value={formData.month || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Année complète</option>
                    <option value="1">Janvier</option>
                    <option value="2">Février</option>
                    <option value="3">Mars</option>
                    <option value="4">Avril</option>
                    <option value="5">Mai</option>
                    <option value="6">Juin</option>
                    <option value="7">Juillet</option>
                    <option value="8">Août</option>
                    <option value="9">Septembre</option>
                    <option value="10">Octobre</option>
                    <option value="11">Novembre</option>
                    <option value="12">Décembre</option>
                  </select>
                </div>
              </div>

              {/* Budget Categories */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Catégories de dépenses</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-12 gap-4 font-medium text-gray-700 mb-2">
                    <div className="col-span-6">Catégorie</div>
                    <div className="col-span-3">Budget</div>
                    <div className="col-span-3">Actuel</div>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.categories
                      .filter(c => categories.find(cat => cat.id === c.categoryId)?.type === 'expense')
                      .map((category, index) => (
                        <div key={category.categoryId} className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-6 flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: categories.find(c => c.id === category.categoryId)?.color || '#808080' }}
                            ></div>
                            <span className="text-sm text-gray-900">{category.categoryName}</span>
                          </div>
                          <div className="col-span-3">
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="number"
                                value={category.budgetAmount}
                                onChange={(e) => handleCategoryBudgetChange(category.categoryId, parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div className="col-span-3">
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="number"
                                value={category.actualAmount}
                                readOnly={editingBudget === null}
                                onChange={(e) => {
                                  const updatedCategories = [...formData.categories];
                                  const categoryIndex = updatedCategories.findIndex(c => c.categoryId === category.categoryId);
                                  updatedCategories[categoryIndex] = {
                                    ...updatedCategories[categoryIndex],
                                    actualAmount: parseFloat(e.target.value) || 0
                                  };
                                  
                                  const totalActual = updatedCategories.reduce((sum, c) => sum + c.actualAmount, 0);
                                  
                                  setFormData(prev => ({
                                    ...prev,
                                    categories: updatedCategories,
                                    totalActual
                                  }));
                                }}
                                min="0"
                                step="0.01"
                                className={`w-full pl-8 pr-2 py-1 text-sm border border-gray-300 rounded-lg ${
                                  editingBudget === null ? 'bg-gray-100' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                
                {/* Totals */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6">
                      <span className="font-medium text-blue-900">TOTAL</span>
                    </div>
                    <div className="col-span-3">
                      <span className="font-bold text-blue-900">{formatCurrency(formData.totalBudget)}</span>
                    </div>
                    <div className="col-span-3">
                      <span className={`font-bold ${
                        formData.totalActual <= formData.totalBudget ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(formData.totalActual)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notes ou commentaires sur ce budget..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowBudgetForm(false);
                    setEditingBudget(null);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  <span>{editingBudget ? 'Mettre à jour' : 'Créer le budget'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialBudgets;
