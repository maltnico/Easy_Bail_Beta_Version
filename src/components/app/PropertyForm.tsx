import React, { useState } from 'react';
import { 
  X, 
  Save, 
  MapPin, 
  Home, 
  DollarSign, 
  Ruler, 
  Users,
  Camera,
  Upload
} from 'lucide-react';
import { Property } from '../../types';

interface PropertyFormProps {
  property?: Property;
  onSave: (property: Partial<Property>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ 
  property, 
  onSave, 
  onCancel, 
  isOpen 
}) => {
  const [formData, setFormData] = useState({
    name: property?.name || '',
    address: property?.address || '',
    city: property?.city || '',
    postalCode: property?.postalCode || '',
    type: property?.type || '',
    status: property?.status || '',
    rent: property?.rent || 0,
    charges: property?.charges || 0,
    surface: property?.surface || 0,
    rooms: property?.rooms || 0,
    description: property?.description || '',
    amenities: property?.amenities || [] as string[],
    images: property?.images || [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const propertyTypes = [
    { value: '', label: 'Choisissez le type de bien *' },
    { value: 'apartment', label: 'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'studio', label: 'Studio' },
    { value: 'parking', label: 'Parking' },
    { value: 'commercial', label: 'Local commercial' }
  ];

  const propertyStatuses = [
    { value: '', label: 'Sélectionnez le statut *' },
    { value: 'vacant', label: 'Vacant' },
    { value: 'occupied', label: 'Occupé' },
    { value: 'maintenance', label: 'En maintenance' }
  ];

  const amenitiesList = [
    'Balcon', 'Terrasse', 'Parking', 'Cave', 'Ascenseur', 
    'Climatisation', 'Chauffage central', 'Cheminée', 
    'Cuisine équipée', 'Lave-vaisselle', 'Lave-linge'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Marquer le champ comme touché
    setTouched(prev => ({ ...prev, [name]: true }));
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du bien est requis';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'La ville est requise';
    }
    
    if (formData.postalCode && !/^\d{5}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'Le code postal doit contenir 5 chiffres';
    }
    
    if (!formData.type) {
      newErrors.type = 'Le type de bien est requis';
    }
    
    if (!formData.status) {
      newErrors.status = 'Le statut est requis';
    }
    
    if (!formData.rent || formData.rent <= 0) {
      newErrors.rent = 'Le loyer doit être supérieur à 0';
    }
    
    if (!formData.surface || formData.surface <= 0) {
      newErrors.surface = 'La surface doit être supérieure à 0';
    }
    
    if (!formData.rooms || formData.rooms <= 0) {
      newErrors.rooms = 'Le nombre de pièces doit être supérieur à 0';
    }
    
    // Validation conditionnelle pour les charges
    if (formData.charges && formData.charges < 0) {
      newErrors.charges = 'Les charges ne peuvent pas être négatives';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const propertyToSave = {
      ...formData,
      rent: parseFloat(formData.rent),
      charges: parseFloat(formData.charges) || 0,
      surface: parseFloat(formData.surface),
      rooms: parseInt(formData.rooms),
      ...(property && { id: property.id }),
      ...(property && { createdAt: property.createdAt }),
      ...(property && { updatedAt: new Date() })
    };
    
    onSave(propertyToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {property ? 'Modifier le bien' : 'Ajouter un bien'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Home className="h-5 w-5 mr-2 text-blue-600" />
              Informations générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du bien *
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Donnez un nom à votre bien"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de bien *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.type ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>
            </div>
          </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
              Localisation
            </h3>
            <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Numéro et nom de rue"
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
            </div>
          </div>

          {/* City and Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nom de la ville"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code postal
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.postalCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Code postal (5 chiffres)"
                maxLength={5}
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
              )}
            </div>
            </div>
            </div>
          </div>

          {/* Property Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Ruler className="h-5 w-5 mr-2 text-purple-600" />
              Caractéristiques
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Surface (m²) *
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="surface"
                  value={formData.surface}
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.surface ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Surface en m²"
                />
              </div>
              {errors.surface && (
                <p className="mt-1 text-sm text-red-600">{errors.surface}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de pièces *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.rooms ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Nombre de pièces"
                />
              </div>
              {errors.rooms && (
                <p className="mt-1 text-sm text-red-600">{errors.rooms}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loyer (€) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="rent"
                  value={formData.rent}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.rent ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Montant du loyer"
                />
              </div>
              {errors.rent && (
                <p className="mt-1 text-sm text-red-600">{errors.rent}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Charges (€)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="charges"
                  value={formData.charges}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Montant des charges"
                />
              </div>
              {errors.charges && (
                <p className="mt-1 text-sm text-red-600">{errors.charges}</p>
              )}
            </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-indigo-600" />
              Statut et description
            </h3>
            <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut du bien *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.status ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            >
              {propertyStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">{errors.status}</p>
            )}
            </div>
          </div>

          {/* Description */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description du bien
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez votre bien, ses particularités, son environnement..."
            />
            </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-emerald-600" />
              Équipements et commodités
            </h3>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Sélectionnez les équipements disponibles
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {amenitiesList.map(amenity => (
                <label key={amenity} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
            </div>
          </div>

          {/* Images Upload */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-pink-600" />
              Photos du bien
            </h3>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Ajoutez des photos pour valoriser votre bien
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2 font-medium">Ajoutez des photos de qualité</p>
              <p className="text-sm text-gray-500 mb-4">Glissez-déposez vos fichiers ou cliquez pour sélectionner</p>
              <label
                type="button"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Choisir des fichiers</span>
                <input type="file" multiple accept="image/*" className="hidden" />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Formats acceptés : JPG, PNG, WebP • Taille max : 5MB par photo
              </p>
            </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium shadow-sm hover:shadow-md"
            >
              <Save className="h-5 w-5" />
              <span>{property ? 'Mettre à jour' : 'Créer le bien'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
