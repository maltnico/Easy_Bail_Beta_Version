import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Plus, 
  Calendar, 
  Building, 
  Tag,
  FileDown,
  Printer,
  Share2,
  X,
  Save,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useFinances } from '../../hooks/useFinances';
import { FinancialReport } from '../../types/financial';
import { useProperties } from '../../hooks/useProperties';

const FinancialReports: React.FC = () => {
  const { reports, createReport, generateReport, deleteReport, loading, error } = useFinances();
  const { properties } = useProperties();
  
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  
  const [formData, setFormData] = useState<Omit<FinancialReport, 'id' | 'createdAt'>>({
    name: '',
    type: 'monthly',
    startDate: new Date(),
    endDate: new Date(),
    properties: [],
    categories: [],
    format: 'pdf'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startDate' || name === 'endDate') {
      setFormData(prev => ({
        ...prev,
        [name]: new Date(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePropertyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedProperties = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedProperties.push(options[i].value);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      properties: selectedProperties
    }));
  };

  const handleTypeChange = (type: FinancialReport['type']) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    switch (type) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        break;
      case 'quarterly':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case 'custom':
        // Keep current dates
        return setFormData(prev => ({ ...prev, type }));
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }
    
    setFormData(prev => ({
      ...prev,
      type,
      startDate,
      endDate
    }));
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newReport = await createReport(formData);
      setShowReportForm(false);
      setFormData({
        name: '',
        type: 'monthly',
        startDate: new Date(),
        endDate: new Date(),
        properties: [],
        categories: [],
        format: 'pdf'
      });
    } catch (err) {
      console.error('Erreur lors de la création du rapport:', err);
    }
  };

  const handleGenerateReport = async (reportId: string) => {
    try {
      setGeneratingReport(true);
      const generatedReport = await generateReport(reportId);
      
      if (generatedReport.url) {
        window.open(generatedReport.url, '_blank');
      }
    } catch (err) {
      console.error('Erreur lors de la génération du rapport:', err);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      try {
        await deleteReport(reportId);
      } catch (err) {
        console.error('Erreur lors de la suppression du rapport:', err);
      }
    }
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'Mensuel';
      case 'quarterly':
        return 'Trimestriel';
      case 'yearly':
        return 'Annuel';
      case 'custom':
        return 'Personnalisé';
      default:
        return type;
    }
  };

  const getReportFormatLabel = (format: string) => {
    switch (format) {
      case 'pdf':
        return 'PDF';
      case 'csv':
        return 'CSV';
      case 'excel':
        return 'Excel';
      default:
        return format;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Rapports financiers</h3>
        <button
          onClick={() => setShowReportForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Créer un rapport</span>
        </button>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Rapport mensuel</h4>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Résumé complet des revenus et dépenses du mois en cours ou précédent.
          </p>
          <button
            onClick={() => {
              handleTypeChange('monthly');
              setShowReportForm(true);
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Générer
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Rapport trimestriel</h4>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Analyse détaillée des performances financières sur un trimestre complet.
          </p>
          <button
            onClick={() => {
              handleTypeChange('quarterly');
              setShowReportForm(true);
            }}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Générer
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Rapport annuel</h4>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Bilan annuel complet avec analyses de tendances et performances.
          </p>
          <button
            onClick={() => {
              handleTypeChange('yearly');
              setShowReportForm(true);
            }}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            Générer
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Rapport personnalisé</h4>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Créez un rapport sur mesure en sélectionnant la période et les biens.
          </p>
          <button
            onClick={() => {
              handleTypeChange('custom');
              setShowReportForm(true);
            }}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            Créer
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Rapports récents</h3>
          <Download className="h-5 w-5 text-gray-400" />
        </div>
        
        {reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Nom</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Période</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Format</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Créé le</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{report.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{getReportTypeLabel(report.type)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{formatDateRange(report.startDate, report.endDate)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{getReportFormatLabel(report.format)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{report.createdAt.toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {report.generatedAt ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Généré</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-yellow-600">En attente</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {report.url ? (
                          <a
                            href={report.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Télécharger"
                          >
                            <FileDown className="h-4 w-4" />
                          </a>
                        ) : (
                          <button
                            onClick={() => handleGenerateReport(report.id)}
                            disabled={generatingReport}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Générer"
                          >
                            {generatingReport ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileDown className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedReport(report);
                            setShowReportDetails(true);
                          }}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
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
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport</h3>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore créé de rapports financiers.
            </p>
            <button 
              onClick={() => setShowReportForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un rapport
            </button>
          </div>
        )}
      </div>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Créer un rapport financier</h2>
              <button
                onClick={() => setShowReportForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="p-6 space-y-6">
              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de rapport
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'monthly', label: 'Mensuel', icon: Calendar },
                    { value: 'quarterly', label: 'Trimestriel', icon: Calendar },
                    { value: 'yearly', label: 'Annuel', icon: Calendar },
                    { value: 'custom', label: 'Personnalisé', icon: Calendar }
                  ].map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleTypeChange(type.value as any)}
                        className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                          formData.type === type.value
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mb-1 ${formData.type === type.value ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span className="text-sm font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Report Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du rapport *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Rapport financier Novembre 2024"
                  required
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate.toISOString().split('T')[0]}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate.toISOString().split('T')[0]}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Properties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biens immobiliers (optionnel)
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="properties"
                    multiple
                    value={formData.properties || []}
                    onChange={handlePropertyChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    size={3}
                  >
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>{property.name}</option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs biens. Laissez vide pour inclure tous les biens.
                </p>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format du rapport
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'pdf', label: 'PDF' },
                    { value: 'csv', label: 'CSV' },
                    { value: 'excel', label: 'Excel' }
                  ].map((format) => (
                    <button
                      key={format.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, format: format.value as any }))}
                      className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                        formData.format === format.value
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <FileText className={`h-5 w-5 ${formData.format === format.value ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className="text-sm font-medium">{format.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
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
                  <span>Créer le rapport</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showReportDetails && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedReport.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500">
                      {getReportTypeLabel(selectedReport.type)}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {getReportFormatLabel(selectedReport.format)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowReportDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Report Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Informations générales</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Période:</span>
                      <span className="text-gray-900 font-medium">
                        {formatDateRange(selectedReport.startDate, selectedReport.endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Format:</span>
                      <span className="text-gray-900 font-medium">
                        {getReportFormatLabel(selectedReport.format)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Créé le:</span>
                      <span className="text-gray-900">
                        {selectedReport.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    {selectedReport.generatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Généré le:</span>
                        <span className="text-gray-900">
                          {selectedReport.generatedAt.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Filtres appliqués</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biens:</span>
                      <span className="text-gray-900">
                        {selectedReport.properties && selectedReport.properties.length > 0
                          ? `${selectedReport.properties.length} bien(s) sélectionné(s)`
                          : 'Tous les biens'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Catégories:</span>
                      <span className="text-gray-900">
                        {selectedReport.categories && selectedReport.categories.length > 0
                          ? `${selectedReport.categories.length} catégorie(s) sélectionnée(s)`
                          : 'Toutes les catégories'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  {selectedReport.generatedAt ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-900">Rapport généré</h3>
                    </>
                  ) : (
                    <>
                      <Clock className="h-6 w-6 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-yellow-900">Rapport en attente de génération</h3>
                    </>
                  )}
                </div>
                
                {selectedReport.generatedAt ? (
                  <div className="flex space-x-3">
                    <a
                      href={selectedReport.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <FileDown className="h-4 w-4" />
                      <span>Télécharger</span>
                    </a>
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
                      <Printer className="h-4 w-4" />
                      <span>Imprimer</span>
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                      <Share2 className="h-4 w-4" />
                      <span>Partager</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateReport(selectedReport.id)}
                    disabled={generatingReport}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    {generatingReport ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Génération en cours...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="h-4 w-4" />
                        <span>Générer maintenant</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => handleDeleteReport(selectedReport.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Supprimer</span>
              </button>
              <button
                onClick={() => setShowReportDetails(false)}
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

export default FinancialReports;
