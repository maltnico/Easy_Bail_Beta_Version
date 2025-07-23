import React, { useState } from 'react';
import { 
  X, 
  Save, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  FileText
} from 'lucide-react';
import { Tenant, Property } from '../../types';

interface TenantFormProps {
  tenant?: Tenant;
  properties: Property[];
  onSave: (tenant: Partial<Tenant>) => void;
  onCancel: () => void;
  isOpen: boolean;
  isSaving?: boolean;
}

const TenantForm: React.FC<TenantFormProps> = ({ 
  tenant, 
  properties,
  onSave, 
  onCancel, 
  isOpen,
  isSaving = false
}) => {
  const [formData, setFormData] = useState({
    firstName: tenant?.firstName || '',
    lastName: tenant?.lastName || '',
    email: tenant?.email || '',
    phone: tenant?.phone || '',
    propertyId: tenant?.propertyId || '',
    leaseStart: tenant?.leaseStart ? tenant.leaseStart.toISOString().split('T')[0] : '',
    leaseEnd: tenant?.leaseEnd ? tenant.leaseEnd.toISOString().split('T')[0] : '',
    rent: tenant?.rent || 0,
    deposit: tenant?.deposit || 0,
    status: tenant?.status || 'active'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const tenantStatuses = [
    { value: 'active', label: 'Actif' },
    { value: 'pending', label: 'En attente' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'terminated', label: 'Résilié' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rent' || name === 'deposit' 
        ? parseFloat(value) || 0 
        : value
    }));
    
    // Auto-fill rent from selected property
    if (name === 'propertyId' && value) {
      const selectedProperty = properties.find(p => p.id === value);
      if (selectedProperty && !tenant) { // Only auto-fill for new tenants
        setFormData(prev => ({
          ...prev,
          rent: selectedProperty.rent,
          deposit: selectedProperty.rent * 2 // Suggest 2 months as deposit
        }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validation du prénom
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
    }
    
    // Validation du nom
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
    }
    
    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    // Validation de la propriété
    if (!formData.propertyId) {
      newErrors.propertyId = 'Veuillez sélectionner un bien';
    }
    
    // Validation des dates
    if (!formData.leaseStart) {
      newErrors.leaseStart = 'La date de début de bail est requise';
    }
    if (!formData.leaseEnd) {
      newErrors.leaseEnd = 'La date de fin de bail est requise';
    }
    
    // Validation de l'ordre des dates
    if (formData.leaseStart && formData.leaseEnd) {
      const startDate = new Date(formData.leaseStart);
      const endDate = new Date(formData.leaseEnd);
      
      if (startDate >= endDate) {
        newErrors.leaseEnd = 'La date de fin doit être postérieure à la date de début';
      }
      
      // Vérifier que la durée du bail est raisonnable (au moins 1 mois)
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      if (diffDays < 30) {
        newErrors.leaseEnd = 'La durée du bail doit être d\'au moins 30 jours';
      }
    }
    
    // Validation du loyer
    if (formData.rent <= 0) {
      newErrors.rent = 'Le loyer doit être supérieur à 0';
    } else if (formData.rent > 10000) {
      newErrors.rent = 'Le loyer semble très élevé, veuillez vérifier';
    }
    
    // Validation du dépôt de garantie
    if (formData.deposit < 0) {
      newErrors.deposit = 'Le dépôt de garantie ne peut pas être négatif';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const tenantToSave = {
      ...formData,
      leaseStart: new Date(formData.leaseStart),
      leaseEnd: new Date(formData.leaseEnd),
      ...(tenant && { id: tenant.id }),
      ...(tenant && { createdAt: tenant.createdAt })
    };
    
    console.log('🔄 Création du locataire avec les données:', tenantToSave);
    console.log('📋 Validation:', {
      propertySelected: !!formData.propertyId,
      datesValid: formData.leaseStart && formData.leaseEnd,
      datesOrder: formData.leaseStart < formData.leaseEnd,
      rentValid: formData.rent > 0,
      contactValid: formData.firstName && formData.lastName && formData.email
    });
    
    onSave(tenantToSave);
  };

  const getPropertyDisplayInfo = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return '';
    
    const typeLabel = getTypeLabel(property.type);
    return `${property.name} - ${typeLabel} - ${property.rent}€/mois (${property.surface}m², ${property.rooms}P)`;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment':
        return 'Appartement';
      case 'house':
        return 'Maison';
      case 'studio':
        return 'Studio';
      case 'parking':
        return 'Parking';
      case 'commercial':
        return 'Local commercial';
      default:
        return type;
    }
  };

  const getSelectedPropertyDetails = () => {
    if (!formData.propertyId) return null;
    return properties.find(p => p.id === formData.propertyId);
  };

  const selectedProperty = getSelectedPropertyDetails();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {tenant ? 'Modifier le locataire' : 'Ajouter un locataire'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Marie"
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Martin"
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="marie.martin@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property and Lease Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bail et logement</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bien loué *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="propertyId"
                    value={formData.propertyId}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.propertyId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionner un bien</option>
                    
                    {properties.map(property => (
                      <option key={property.id} value={property.id}>
                        {getPropertyDisplayInfo(property.id)}
                      </option>
                    ))}
                    
                    {properties.length === 0 && (
                      <option disabled>Aucune propriété trouvée</option>
                    )}
                  </select>
                </div>
                {errors.propertyId && (
                  <p className="mt-1 text-sm text-red-600">{errors.propertyId}</p>
                )}
                
                {properties.length === 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    Aucun bien trouvé. Veuillez d'abord créer des biens immobiliers avant d'ajouter des locataires.
                  </p>
                )}
                
                {/* Selected Property Details */}
                {selectedProperty && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Détails du bien sélectionné</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Adresse:</span>
                        <p className="text-blue-800">{selectedProperty.address}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Type:</span>
                        <p className="text-blue-800">{getTypeLabel(selectedProperty.type)}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Surface:</span>
                        <p className="text-blue-800">{selectedProperty.surface}m²</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Pièces:</span>
                        <p className="text-blue-800">{selectedProperty.rooms}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700 font-medium">Loyer actuel:</span>
                          <p className="text-blue-800 font-semibold">{selectedProperty.rent}€/mois</p>
                        </div>
                        <div>
                          <span className="text-blue-700 font-medium">Charges:</span>
                          <p className="text-blue-800">{selectedProperty.charges}€/mois</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Début du bail *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="leaseStart"
                      value={formData.leaseStart}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.leaseStart ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.leaseStart && (
                    <p className="mt-1 text-sm text-red-600">{errors.leaseStart}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fin du bail *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="leaseEnd"
                      value={formData.leaseEnd}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.leaseEnd ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.leaseEnd && (
                    <p className="mt-1 text-sm text-red-600">{errors.leaseEnd}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations financières</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loyer mensuel (€) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">€</span>
                  <input
                    type="number"
                    name="rent"
                    value={formData.rent}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.rent ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="1200"
                  />
                </div>
                {errors.rent && (
                  <p className="mt-1 text-sm text-red-600">{errors.rent}</p>
                )}
                {selectedProperty && formData.rent !== selectedProperty.rent && (
                  <p className="mt-1 text-sm text-blue-600">
                    Loyer du bien: {selectedProperty.rent}€
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dépôt de garantie (€)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">€</span>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2400"
                  />
                </div>
                {selectedProperty && (
                  <p className="mt-1 text-sm text-gray-500">
                    Suggestion: {selectedProperty.rent * 2}€ (2 mois de loyer)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut du locataire
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {tenantStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>{tenant ? 'Mettre à jour' : 'Créer le locataire'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantForm;
