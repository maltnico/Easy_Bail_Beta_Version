import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Bell, 
  Info, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle,
  Link
} from 'lucide-react';
import { Alert } from '../../types';

interface AlertFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alert: Omit<Alert, 'id' | 'createdAt' | 'read'>) => void;
}

const AlertForm: React.FC<AlertFormProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<Alert, 'id' | 'createdAt' | 'read'>>({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    actionUrl: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const alertTypes = [
    { value: 'info', label: 'Information', icon: Info, color: 'bg-blue-100 text-blue-800' },
    { value: 'success', label: 'Succès', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'warning', label: 'Avertissement', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'error', label: 'Erreur', icon: AlertOctagon, color: 'bg-red-100 text-red-800' }
  ];

  const alertPriorities = [
    { value: 'low', label: 'Basse', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Haute', color: 'bg-red-100 text-red-800' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSave(formData);
    
    // Reset form
    setFormData({
      title: '',
      message: '',
      type: 'info',
      priority: 'medium',
      actionUrl: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Créer une alerte</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Alert Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d'alerte
            </label>
            <div className="grid grid-cols-2 gap-3">
              {alertTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                    className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                      formData.type === type.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${
                      formData.type === type.value 
                        ? 'text-blue-600' 
                        : type.color.split(' ')[1]
                    }`} />
                    <span className="text-sm font-medium text-gray-900">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alert Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorité
            </label>
            <div className="grid grid-cols-3 gap-3">
              {alertPriorities.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.value as any }))}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.priority === priority.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`block text-sm font-medium ${
                    formData.priority === priority.value 
                      ? 'text-blue-600' 
                      : priority.color.split(' ')[1]
                  }`}>
                    {priority.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Alert Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Titre de l'alerte"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Alert Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.message ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Contenu détaillé de l'alerte"
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600">{errors.message}</p>
            )}
          </div>

          {/* Action URL */}
          <div>
            <label htmlFor="actionUrl" className="block text-sm font-medium text-gray-700 mb-2">
              URL d'action (optionnel)
            </label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="actionUrl"
                name="actionUrl"
                value={formData.actionUrl || ''}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="/dashboard/properties"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              URL relative vers laquelle l'utilisateur sera redirigé en cliquant sur l'alerte
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Aperçu</h3>
            <div className={`p-4 rounded-lg ${
              formData.type === 'info' ? 'bg-blue-50 border border-blue-200' :
              formData.type === 'success' ? 'bg-green-50 border border-green-200' :
              formData.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                {formData.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
                {formData.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {formData.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                {formData.type === 'error' && <AlertOctagon className="h-5 w-5 text-red-600" />}
                <div>
                  <p className={`font-medium ${
                    formData.type === 'info' ? 'text-blue-800' :
                    formData.type === 'success' ? 'text-green-800' :
                    formData.type === 'warning' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    {formData.title || 'Titre de l\'alerte'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    formData.type === 'info' ? 'text-blue-700' :
                    formData.type === 'success' ? 'text-green-700' :
                    formData.type === 'warning' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {formData.message || 'Message de l\'alerte'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Créer l'alerte</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertForm;
