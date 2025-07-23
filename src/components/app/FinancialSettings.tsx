import React, { useState } from 'react';
import { 
  Settings, 
  DollarSign, 
  Bell, 
  Calendar, 
  Save,
  CreditCard,
  FileText,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useFinances } from '../../hooks/useFinances';
import { FinancialSettings as FinancialSettingsType } from '../../types/financial';
import { DEFAULT_SETTINGS } from '../../lib/financialService';

const FinancialSettings: React.FC = () => {
  const { settings, updateSettings, loading, error } = useFinances();
  
  const [formData, setFormData] = useState<FinancialSettingsType>(settings || DEFAULT_SETTINGS);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FinancialSettingsType],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FinancialSettingsType],
          [child]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof FinancialSettingsType],
          [child]: parseInt(value, 10) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10) || 0
      }));
    }
  };

  const handleFiscalYearChange = (part: 'start' | 'end', field: 'day' | 'month', value: string) => {
    const intValue = parseInt(value, 10) || 1;
    
    setFormData(prev => ({
      ...prev,
      taxSettings: {
        ...prev.taxSettings,
        fiscalYear: {
          ...prev.taxSettings.fiscalYear,
          [part]: {
            ...prev.taxSettings.fiscalYear[part],
            [field]: intValue
          }
        }
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setMessage(null);
      await updateSettings(formData);
      setMessage({ type: 'success', text: 'Paramètres financiers mis à jour avec succès' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour des paramètres' });
      console.error('Erreur lors de la mise à jour des paramètres:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Chargement des paramètres financiers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Paramètres financiers</h3>
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          <span>Enregistrer les modifications</span>
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Paramètres généraux</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Devise par défaut
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">€</span>
              <select
                name="defaultCurrency"
                value={formData.defaultCurrency}
                onChange={handleInputChange}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar américain ($)</option>
                <option value="GBP">Livre Sterling (£)</option>
                <option value="CHF">Franc Suisse (CHF)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Méthode de paiement par défaut
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="defaultPaymentMethod"
                value={formData.defaultPaymentMethod}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bank_transfer">Virement bancaire</option>
                <option value="cash">Espèces</option>
                <option value="check">Chèque</option>
                <option value="direct_debit">Prélèvement</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Paramètres de rappel</h4>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="enableReminders"
            name="reminderSettings.enableReminders"
            checked={formData.reminderSettings.enableReminders}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="enableReminders" className="ml-2 block text-sm text-gray-700">
            Activer les rappels automatiques pour les paiements
          </label>
        </div>
        
        {formData.reminderSettings.enableReminders && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2 border-blue-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jours avant échéance
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="reminderSettings.daysBeforeDue"
                  value={formData.reminderSettings.daysBeforeDue}
                  onChange={handleNumberChange}
                  min="1"
                  max="30"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Nombre de jours avant l'échéance pour envoyer le premier rappel
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fréquence des rappels
              </label>
              <div className="relative">
                <Bell className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="reminderSettings.reminderFrequency"
                  value={formData.reminderSettings.reminderFrequency}
                  onChange={handleNumberChange}
                  min="1"
                  max="7"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Nombre de jours entre chaque rappel
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tax Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Paramètres fiscaux</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Régime fiscal
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="taxSettings.propertyRegime"
                value={formData.taxSettings.propertyRegime}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="micro_foncier">Micro-foncier</option>
                <option value="reel">Régime réel</option>
                <option value="lmnp">LMNP (Loueur Meublé Non Professionnel)</option>
                <option value="lmp">LMP (Loueur Meublé Professionnel)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro fiscal (optionnel)
            </label>
            <input
              type="text"
              name="taxSettings.taxId"
              value={formData.taxSettings.taxId || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Votre numéro fiscal"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Année fiscale
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Début de l'année fiscale</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Jour</label>
                  <input
                    type="number"
                    value={formData.taxSettings.fiscalYear.start.day}
                    onChange={(e) => handleFiscalYearChange('start', 'day', e.target.value)}
                    min="1"
                    max="31"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mois</label>
                  <select
                    value={formData.taxSettings.fiscalYear.start.month}
                    onChange={(e) => handleFiscalYearChange('start', 'month', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{getMonthName(month)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">Fin de l'année fiscale</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Jour</label>
                  <input
                    type="number"
                    value={formData.taxSettings.fiscalYear.end.day}
                    onChange={(e) => handleFiscalYearChange('end', 'day', e.target.value)}
                    min="1"
                    max="31"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Mois</label>
                  <select
                    value={formData.taxSettings.fiscalYear.end.month}
                    onChange={(e) => handleFiscalYearChange('end', 'month', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{getMonthName(month)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="isVatRegistered"
            name="taxSettings.isVatRegistered"
            checked={formData.taxSettings.isVatRegistered}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isVatRegistered" className="ml-2 block text-sm text-gray-700">
            Assujetti à la TVA
          </label>
        </div>
        
        {formData.taxSettings.isVatRegistered && (
          <div className="pl-6 border-l-2 border-blue-200 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Taux de TVA (%)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">€</span>
              <input
                type="number"
                name="taxSettings.vatRate"
                value={formData.taxSettings.vatRate || 20}
                onChange={handleNumberChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
        
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-800 font-medium">Conseil fiscal</p>
              <p className="text-blue-700 text-sm mt-1">
                Assurez-vous que vos paramètres fiscaux correspondent à votre situation réelle. 
                En cas de doute, consultez un expert-comptable ou un conseiller fiscal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fonction utilitaire pour obtenir le nom du mois
const getMonthName = (month: number) => {
  const date = new Date();
  date.setMonth(month - 1);
  return date.toLocaleDateString('fr-FR', { month: 'long' });
};

export default FinancialSettings;
