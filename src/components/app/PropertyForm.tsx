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
    type: property?.type || 'apartment',
    status: property?.status || 'vacant',
    rent: property?.rent || 0,
    charges: property?.charges || 0,
    surface: property?.surface || 0,
    rooms: property?.rooms || 1,
    description: '',
    amenities: [] as string[],
    images: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const propertyTypes = [
    { value: 'apartment', label: 'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'studio', label: 'Studio' },
    { value: 'parking', label: 'Parking' },
    { value: 'commercial', label: 'Local commercial' }
  ];

  const propertyStatuses = [
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
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rent' || name === 'charges' || name === 'surface' || name === 'rooms' 
        ? parseFloat(value) || 0 
        : value
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
    if (formData.rent <= 0) {
      newErrors.rent = 'Le loyer doit être supérieur à 0';
    }
    if (formData.surface <= 0) {
      newErrors.surface = 'La surface doit être supérieure à 0';
    }
    if (formData.rooms <= 0) {
      newErrors.rooms = 'Le nombre de pièces doit être supérieur à 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const propertyToSave = {
      ...formData,
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
                  placeholder="Ex: Appartement Bastille"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse complète *
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
                placeholder="15 rue de la Roquette, 75011 Paris"
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Property Details */}
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
                  min="1"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.surface ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="45"
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
                  min="1"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.rooms ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="2"
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
                  placeholder="1200"
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
                  placeholder="150"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut du bien
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {propertyStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
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
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Description détaillée du bien..."
            />
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Équipements et commodités
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {amenitiesList.map(amenity => (
                <label key={amenity} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <label key={amenity} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
                </label>
              ))}
            </div>
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Photos du bien
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Glissez-déposez vos photos ici</p>
              <p className="text-sm text-gray-500 mb-4">ou</p>
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
              >
                <Upload className="h-4 w-4" />
                <span>Choisir des fichiers</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Formats acceptés: JPG, PNG, WebP (max 5MB par photo)
              </p>
            </div>
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
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
