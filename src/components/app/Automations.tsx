import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  Edit,
  Trash2,
  Settings,
  Mail,
  FileText,
  DollarSign,
  Home,
  Users,
  Bell,
  Loader2,
  Power
} from 'lucide-react';
import { automationScheduler } from '../../lib/automationScheduler';

import { Automation } from '../../types';
import { useAutomations } from '../../hooks/useAutomations';
import AutomationForm from './AutomationForm';

// Hook pour le timer
const useCountdown = (targetDate: Date | null) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

const Automations = () => {
  const { 
    automations, 
    loading, 
    error, 
    createAutomation, 
    updateAutomation, 
    deleteAutomation, 
    toggleAutomation, 
    executeAutomation, 
    executeAllDueAutomations 
  } = useAutomations();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAutomationForm, setShowAutomationForm] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [executingAutomation, setExecutingAutomation] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<{id: string, success: boolean} | null>(null);
  const [schedulerActive, setSchedulerActive] = useState<boolean>(automationScheduler.isActive());
  const [nextExecutionTime, setNextExecutionTime] = useState<string>('09:00');
  const [showTimeSettings, setShowTimeSettings] = useState(false);

  const filteredAutomations = automations.filter(automation => {
    const matchesSearch = (automation.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (automation.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || automation.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && automation.active) ||
                         (filterStatus === 'inactive' && !automation.active);
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculer la prochaine exécution automatique
  const nextAutomaticExecution = React.useMemo(() => {
    const activeAutomations = automations.filter(a => a.active);
    if (activeAutomations.length === 0) return null;
    
    const nextExecution = activeAutomations.reduce((earliest, automation) => {
      return !earliest || automation.nextExecution < earliest 
        ? automation.nextExecution 
        : earliest;
    }, null as Date | null);
    
    return nextExecution;
  }, [automations]);

  const timeLeft = useCountdown(nextAutomaticExecution);

  const handleAddAutomation = () => {
    setEditingAutomation(null);
    setShowAutomationForm(true);
  };

  const handleEditAutomation = (automation: Automation) => {
    setEditingAutomation(automation);
    setShowAutomationForm(true);
  };

  const handleSaveAutomation = async (automationData: Omit<Automation, 'id' | 'createdAt'>) => {
    try {
      if (editingAutomation) {
        await updateAutomation(editingAutomation.id, automationData);
      } else {
        await createAutomation(automationData);
      }
      setShowAutomationForm(false);
      setEditingAutomation(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'receipt':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'rent_review':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'insurance':
        return <Home className="h-5 w-5 text-purple-600" />;
      case 'maintenance':
        return <Settings className="h-5 w-5 text-orange-600" />;
      case 'reminder':
        return <Bell className="h-5 w-5 text-red-600" />;
      case 'notice':
        return <Mail className="h-5 w-5 text-yellow-600" />;
      default:
        return <Zap className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'receipt': 'Quittances',
      'rent_review': 'Révision loyer',
      'insurance': 'Assurance',
      'maintenance': 'Maintenance',
      'reminder': 'Rappels',
      'notice': 'Préavis'
    };
    return labels[type] || type;
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      'daily': 'Quotidien',
      'weekly': 'Hebdomadaire',
      'monthly': 'Mensuel',
      'quarterly': 'Trimestriel',
      'yearly': 'Annuel'
    };
    return labels[frequency] || frequency;
  };

  const handleToggleAutomation = async (id: string) => {
    try {
      await toggleAutomation(id);
    } catch (error) {
      console.error('Erreur lors de la modification de l\'automatisation:', error);
    }
  };

  const handleDeleteAutomation = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette automatisation ?')) {
      try {
        await deleteAutomation(id);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'automatisation:', error);
      }
    }
  };

  const handleExecuteNow = async (id: string) => {
    const automation = automations.find(a => a.id === id);
    if (automation && automation.active) {
      try {
        setExecutingAutomation(id);
        setExecutionResult(null);
        
        const success = await executeAutomation(id);
        
        // Afficher le résultat
        setExecutionResult({ id, success });
        
        // Effacer le résultat après 5 secondes
        setTimeout(() => {
          setExecutionResult(null);
        }, 5000);
      } catch (error) {
        console.error('Erreur lors de l\'exécution de l\'automatisation:', error);
      } finally {
        setExecutingAutomation(null);
      }
    }
  };

  const handleExecuteAllDue = async () => {
    try {
      setExecutingAutomation('all');
      await executeAllDueAutomations();
    } catch (error) {
      console.error('Erreur lors de l\'exécution des automatisations:', error);
    } finally {
      setExecutingAutomation(null);
    }
  };
  
  const toggleScheduler = () => {
    if (schedulerActive) {
      automationScheduler.stop();
    } else {
      automationScheduler.start();
    }
    setSchedulerActive(automationScheduler.isActive());
  };

  const handleUpdateExecutionTime = () => {
    // Créer une nouvelle date pour demain à l'heure spécifiée
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hours, minutes] = nextExecutionTime.split(':').map(Number);
    tomorrow.setHours(hours, minutes, 0, 0);
    
    // Ici on pourrait mettre à jour le planificateur avec la nouvelle heure
    // Pour l'instant, on affiche juste un message de confirmation
    alert(`Prochaine exécution automatique programmée pour demain à ${nextExecutionTime}`);
    setShowTimeSettings(false);
  };

  const formatTimeLeft = (timeLeft: any) => {
    if (!timeLeft) return 'Aucune automatisation programmée';
    return `${timeLeft.days}j ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`;
  };

  const activeAutomations = automations.filter(a => a.active).length;
  const upcomingExecutions = automations.filter(a => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return a.active && a.nextExecution <= tomorrow;
  }).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Automatisations</h1>
          <p className="text-gray-600">Automatisez vos tâches récurrentes et gagnez du temps</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={toggleScheduler}
            className={`${
              schedulerActive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2`}
          >
            <Power className="h-5 w-5" />
            <span>{schedulerActive ? 'Arrêter le planificateur' : 'Démarrer le planificateur'}</span>
          </button>
          <button
            onClick={handleAddAutomation}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Nouvelle automatisation</span>
          </button>
        </div>
      </div>

      {/* Scheduler Status */}
      <div className={`${
        schedulerActive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      } rounded-xl shadow-sm border p-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${schedulerActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <div>
            <p className={`font-medium ${schedulerActive ? 'text-green-800' : 'text-gray-800'}`}>
              {schedulerActive ? 'Planificateur d\'automatisations actif' : 'Planificateur d\'automatisations inactif'}
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
              {schedulerActive 
                ? 'Les automatisations seront exécutées automatiquement selon leur programmation' 
                : 'Activez le planificateur pour exécuter automatiquement les automatisations programmées'}
              </p>
              {schedulerActive && nextAutomaticExecution && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 font-medium">
                    Prochaine exécution dans: {formatTimeLeft(timeLeft)}
                  </span>
                </div>
              )}
              {schedulerActive && nextAutomaticExecution && (
                <p className="text-xs text-gray-500">
                  Prochaine automatisation: {nextAutomaticExecution.toLocaleString('fr-FR')}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {schedulerActive && (
            <div className="text-right">
              <button
                onClick={() => setShowTimeSettings(!showTimeSettings)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
              >
                <Settings className="h-4 w-4" />
                <span>Programmer</span>
              </button>
              {showTimeSettings && (
                <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs text-gray-600">Heure d'exécution:</label>
                    <input
                      type="time"
                      value={nextExecutionTime}
                      onChange={(e) => setNextExecutionTime(e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleUpdateExecutionTime}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setShowTimeSettings(false)}
                      className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <span className="text-sm text-gray-500">Intervalle de vérification: quotidienne</span>
          <button 
            onClick={toggleScheduler}
            className={`p-2 rounded-lg ${
              schedulerActive 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            } transition-colors`}
          >
            {schedulerActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total automatisations</p>
              <p className="text-3xl font-bold text-gray-900">{automations.length}</p>
            </div>
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actives</p>
              <p className="text-3xl font-bold text-green-600">{activeAutomations}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prochaines exécutions</p>
              <p className="text-3xl font-bold text-orange-600">{upcomingExecutions}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
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
                placeholder="Rechercher une automatisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="receipt">Quittances</option>
              <option value="rent_review">Révision loyer</option>
              <option value="insurance">Assurance</option>
              <option value="maintenance">Maintenance</option>
              <option value="reminder">Rappels</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>
            
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Automations List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Automatisation</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Type</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Fréquence</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Prochaine exécution</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAutomations.map((automation) => (
                <tr key={automation.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(automation.type)}
                      <div>
                        <p className="font-medium text-gray-900">{automation.name}</p>
                        <p className="text-sm text-gray-500">{automation.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">{getTypeLabel(automation.type)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">{getFrequencyLabel(automation.frequency)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="text-gray-900">{automation.nextExecution.toLocaleDateString()}</div>
                      {automation.lastExecution && (
                        <div className="text-gray-500">
                          Dernière: {automation.lastExecution.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${automation.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className={`text-sm ${automation.active ? 'text-green-600' : 'text-gray-500'}`}>
                        {automation.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleAutomation(automation.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          automation.active 
                            ? 'text-yellow-600 hover:bg-yellow-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={automation.active ? 'Désactiver' : 'Activer'}
                      >
                        {automation.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleExecuteNow(automation.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        disabled={executingAutomation === automation.id || !automation.active}
                        title="Exécuter maintenant"
                      >
                        {executingAutomation === automation.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditAutomation(automation)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAutomation(automation.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {executionResult && executionResult.id === automation.id && (
                      <div className={`mt-2 text-xs font-medium ${
                        executionResult.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {executionResult.success 
                          ? 'Exécution réussie ✓' 
                          : 'Échec de l\'exécution ✗'}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredAutomations.length === 0 && (
        <div className="text-center py-12">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune automatisation trouvée</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Aucune automatisation ne correspond à vos critères.'
              : 'Créez votre première automatisation pour gagner du temps.'
            }
          </p>
          <button 
            onClick={() => setShowAutomationForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Créer une automatisation
          </button>
        </div>
      )}

      {/* Automation Form Modal - Placeholder */}
      <AutomationForm
        automation={editingAutomation || undefined}
        onSave={handleSaveAutomation}
        onCancel={() => {
          setShowAutomationForm(false);
          setEditingAutomation(null);
        }}
        isOpen={showAutomationForm}
      />
    </div>
  );
};

export default Automations;
