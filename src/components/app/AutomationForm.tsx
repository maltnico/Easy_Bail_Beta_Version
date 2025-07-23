import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Zap, 
  Calendar, 
  Clock,
  Building,
  FileText,
  DollarSign,
  Bell,
  Mail,
  Settings,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Automation } from '../../types';
import { useProperties } from '../../hooks/data';
import { emailTemplateService } from '../../lib/emailTemplateService';
import { useEffect } from 'react';
import { documentStorage } from '../../lib/documentStorage';
import { GeneratedDocument } from '../../types/documents';

interface AutomationFormProps {
  automation?: Automation;
  onSave: (automation: Omit<Automation, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

const AutomationForm: React.FC<AutomationFormProps> = ({
  automation,
  onSave,
  onCancel,
  isOpen
}) => {
  const { properties } = useProperties();
  const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  
  // Charger les templates d'email
  useEffect(() => {
    if (isOpen) {
      setLoadingTemplates(true);
      emailTemplateService.getTemplates()
        .then(templates => {
          setEmailTemplates(templates);
        })
        .catch(error => {
          console.error('Erreur lors du chargement des templates d\'email:', error);
        })
        .finally(() => {
          setLoadingTemplates(false);
        });
    }
  }, [isOpen]);
  
  // Charger les documents générés
  useEffect(() => {
    if (isOpen) {
      setLoadingDocuments(true);
      documentStorage.getDocumentsList()
        .then(docs => {
          setDocuments(docs);
        })
        .catch(error => {
          console.error('Erreur lors du chargement des documents:', error);
        })
        .finally(() => {
          setLoadingDocuments(false);
        });
    }
  }, [isOpen]);
  
  const [formData, setFormData] = useState<Omit<Automation, 'id' | 'createdAt'>>({
    name: automation?.name || '',
    type: automation?.type || 'receipt',
    frequency: automation?.frequency || 'monthly',
    nextExecution: automation?.nextExecution || new Date(),
    lastExecution: automation?.lastExecution,
    active: automation?.active ?? true,
    propertyId: automation?.propertyId || null,
    description: automation?.description || '',
    emailTemplateId: automation?.emailTemplateId || null,
    documentTemplateId: automation?.documentTemplateId || null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const automationTypes = [
    { value: 'receipt', label: 'Génération de quittances', icon: FileText },
    { value: 'rent_review', label: 'Révision des loyers', icon: DollarSign },
    { value: 'insurance', label: 'Rappel d\'assurance', icon: Bell },
    { value: 'notice', label: 'Rappel de préavis', icon: Mail },
    { value: 'maintenance', label: 'Rappel de maintenance', icon: Settings },
    { value: 'reminder', label: 'Rappel de paiement', icon: AlertTriangle }
  ];

  const frequencies = [
    { value: 'daily', label: 'Quotidienne' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuelle' },
    { value: 'quarterly', label: 'Trimestrielle' },
    { value: 'yearly', label: 'Annuelle' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'nextExecution') {
      setFormData(prev => ({
        ...prev,
        [name]: new Date(value)
      }));
    } else if (name === 'active') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (name === 'propertyId' || name === 'emailTemplateId' || name === 'documentTemplateId') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (!formData.type) {
      newErrors.type = 'Le type est requis';
    }
    
    if (!formData.frequency) {
      newErrors.frequency = 'La fréquence est requise';
    }
    
    if (!formData.nextExecution) {
      newErrors.nextExecution = 'La date d\'exécution est requise';
    }
    
    // Vérifier que le bien immobilier est requis pour certains types d'automatisation
    const propertyRequiredTypes = ['receipt', 'rent_review', 'insurance', 'notice', 'maintenance', 'reminder'];
    if (propertyRequiredTypes.includes(formData.type) && !formData.propertyId) {
      newErrors.propertyId = 'Le bien immobilier est requis pour ce type d\'automatisation';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setErrors({ submit: 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {automation ? 'Modifier l\'automatisation' : 'Nouvelle automatisation'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'automatisation *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Ex: Génération quittances mensuelles"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Automation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'automatisation *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {automationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
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
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fréquence *
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.frequency ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
            </div>
            {errors.frequency && (
              <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>
            )}
          </div>

          {/* Next Execution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prochaine exécution *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="nextExecution"
                value={formData.nextExecution.toISOString().split('T')[0]}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nextExecution ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.nextExecution && (
              <p className="mt-1 text-sm text-red-600">{errors.nextExecution}</p>
            )}
          </div>

          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bien immobilier {['receipt', 'rent_review', 'insurance', 'notice', 'maintenance', 'reminder'].includes(formData.type) ? '*' : '(optionnel)'}
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="propertyId"
                value={formData.propertyId ?? ''}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.propertyId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">{['receipt', 'rent_review', 'insurance', 'notice', 'maintenance', 'reminder'].includes(formData.type) ? 'Sélectionner un bien' : 'Tous les biens'}</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>{property.name}</option>
                ))}
              </select>
            </div>
            {errors.propertyId && (
              <p className="mt-1 text-sm text-red-600">{errors.propertyId}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {['receipt', 'rent_review', 'insurance', 'notice', 'maintenance', 'reminder'].includes(formData.type) 
                ? 'Un bien spécifique doit être sélectionné pour ce type d\'automatisation.'
                : 'Si aucun bien n\'est sélectionné, l\'automatisation s\'appliquera à tous les biens.'
              }
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Description détaillée de l'automatisation..."
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
              Automatisation active
            </label>
          </div>
          
          {/* Help Text */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-800 font-medium">À propos des automatisations</p>
                <p className="text-blue-700 text-sm mt-1">
                  Les automatisations sont exécutées automatiquement à la date programmée si le planificateur est actif.
                  Vous pouvez également les exécuter manuellement à tout moment depuis la liste des automatisations.
                </p>
                <p className="text-blue-700 text-sm mt-2">
                  La date de prochaine exécution sera automatiquement mise à jour selon la fréquence choisie après chaque exécution réussie.
                </p>
              </div>
            </div>
          </div>
          
          {/* Email Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template d'email (optionnel)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="emailTemplateId"
                value={formData.emailTemplateId ?? ''}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Aucun template</option>
                {loadingTemplates && <option disabled>Chargement des templates...</option>}
                {emailTemplates.map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Sélectionnez un template d'email à utiliser pour cette automatisation. Si aucun template n'est sélectionné, aucun email ne sera envoyé.
            </p>
          </div>
            
          {/* Document Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document à joindre (optionnel)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="documentTemplateId"
                value={formData.documentTemplateId ?? ''}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Aucun document</option>
                {documents.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Sélectionnez un document à générer et joindre automatiquement à l'email. Fonctionne uniquement si un template d'email est également sélectionné.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
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
              <span>{automation ? 'Mettre à jour' : 'Créer l\'automatisation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutomationForm;
