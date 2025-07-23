import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Eye, 
  FileText,
  AlertCircle,
  CheckCircle,
  User,
  Building
} from 'lucide-react';
import { DocumentTemplate, DocumentField, GeneratedDocument } from '../../types/documents';
import { Property, Tenant } from '../../types';
import { documentGenerator } from '../../lib/documentGenerator';

interface DocumentFormProps {
  template: DocumentTemplate;
  userId: string;
  properties: Property[];
  tenants: Tenant[];
  onSave: (document: GeneratedDocument) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const DocumentForm: React.FC<DocumentFormProps> = ({
  template,
  userId,
  properties,
  tenants,
  onSave,
  onCancel,
  isOpen
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [preview, setPreview] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Initialiser les données du formulaire
      const initialData = documentGenerator.getPrefillData(
        template.id,
        properties.find(p => p.id === selectedPropertyId),
        tenants.find(t => t.id === selectedTenantId)
      );
      setFormData(initialData);
    }
  }, [isOpen, template.id, selectedPropertyId, selectedTenantId, properties, tenants]);

  const handleInputChange = (field: DocumentField, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field.name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field.name]) {
      setErrors(prev => ({ ...prev, [field.name]: '' }));
    }
  };

  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      const prefillData = documentGenerator.getPrefillData(template.id, property);
      setFormData(prev => ({ ...prev, ...prefillData }));
    }
  };

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      const prefillData = documentGenerator.getPrefillData(template.id, undefined, tenant);
      setFormData(prev => ({ ...prev, ...prefillData }));
    }
  };

  const handlePreview = async () => {
    try {
      setLoading(true);
      const previewContent = await documentGenerator.previewDocument(template.id, formData);
      setPreview(previewContent);
      setShowPreview(true);
    } catch (error) {
      console.error('Erreur lors de la prévisualisation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Valider les données
      const validation = documentGenerator.validateFormData(template.id, formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }
      
      // Générer le document
      const document = await documentGenerator.generateDocument({
        templateId: template.id,
        data: formData,
        userId: userId,
        propertyId: selectedPropertyId || undefined,
        tenantId: selectedTenantId || undefined
      });
      
      onSave(document);
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      setErrors({ general: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: DocumentField) => {
    const value = formData[field.name] || field.defaultValue || '';
    const hasError = !!errors[field.name];

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={field.placeholder}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            step="0.01"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Sélectionner...</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleInputChange(field, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">{field.label}</span>
          </label>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{template.name}</h2>
              <p className="text-gray-600">{template.description}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {showPreview ? (
            /* Preview Mode */
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Aperçu du document</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Retour au formulaire
                </button>
              </div>
              <div 
                className="bg-white border border-gray-200 rounded-lg p-8 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            </div>
          ) : (
            /* Form Mode */
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Message */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800">{errors.general}</p>
                </div>
              )}

              {/* Property and Tenant Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="h-4 w-4 inline mr-1" />
                    Bien immobilier (optionnel)
                  </label>
                  <select
                    value={selectedPropertyId}
                    onChange={(e) => handlePropertyChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un bien...</option>
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {property.name} - {property.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 inline mr-1" />
                    Locataire (optionnel)
                  </label>
                  <select
                    value={selectedTenantId}
                    onChange={(e) => handleTenantChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un locataire...</option>
                    {tenants.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.firstName} {tenant.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {template.fields.map((field) => (
                  <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(field)}
                    {errors[field.name] && (
                      <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Legal Compliance */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Conformité légale</h4>
                </div>
                <p className="text-green-800 text-sm">
                  Ce document est conforme aux réglementations : {template.legalCompliance.join(', ')}
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handlePreview}
              disabled={loading}
              className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>Aperçu</span>
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Générer le document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentForm;
