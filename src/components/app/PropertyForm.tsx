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
  Upload,
  Settings,
  CheckCircle
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
    type: property?.type || '',
    status: property?.status || '',
    rent: property?.rent?.toString() || '',
    charges: property?.charges?.toString() || '',
    surface: property?.surface?.toString() || '',
    rooms: property?.rooms?.toString() || '',
    description: property?.description || '',
    amenities: property?.amenities || [] as string[],
    images: property?.images || [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const propertyTypes = [
    { value: '', label: 'Sélectionnez le type de bien' },
    { value: 'apartment', label: 'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'studio', label: 'Studio' },
    { value: 'parking', label: 'Parking' },
    { value: 'commercial', label: 'Local commercial' }
  ];

  const propertyStatuses = [
    { value: '', label: 'Choisissez le statut' },
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
    
    if (!formData.type) {
      newErrors.type = 'Le type de bien est requis';
    }
    
    if (!formData.status) {
      newErrors.status = 'Le statut est requis';
    }
    
    if (!formData.rent || parseFloat(formData.rent) <= 0) {
      newErrors.rent = 'Le loyer doit être supérieur à 0';
    }
    
    if (!formData.surface || parseFloat(formData.surface) <= 0) {
      newErrors.surface = 'La surface doit être supérieure à 0';
    }
    
    if (!formData.rooms || parseInt(formData.rooms) <= 0) {
      newErrors.rooms = 'Le nombre de pièces doit être supérieur à 0';
    }
    
    // Validation conditionnelle pour les charges
    if (formData.charges && parseFloat(formData.charges) < 0) {
      newErrors.charges = 'Les charges ne peuvent pas être négatives';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Marquer tous les champs comme touchés pour afficher les erreurs
    const allFields = Object.keys(formData);
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    
    if (!validateForm()) return;
    
    const propertyToSave = {
      ...formData,
      rent: parseFloat(formData.rent),
      charges: parseFloat(formData.charges) || 0,
      surface: parseFloat(formData.surface),
      rooms: parseInt(formData.rooms),
      ...(property && { id: property.id }),
      ...(property && { createdAt: property.createdAt })
    };
    
    onSave(propertyToSave);
  };

  const getFieldError = (fieldName: string) => {
    return touched[fieldName] && errors[fieldName] ? errors[fieldName] : '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {property ? 'Modifier le bien' : 'Ajouter un nouveau bien'}
              </h2>
              <p className="text-gray-600 text-sm">
                {property ? 'Modifiez les informations de votre bien' : 'Remplissez les informations de votre bien immobilier'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Section 1: Informations générales */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Home className="h-5 w-5 text-white" />
              </div>
              Informations générales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du bien *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    getFieldError('name') ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Donnez un nom à votre bien"
                />
                {getFieldError('name') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    getFieldError('type') ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {getFieldError('type') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('type')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Localisation */}
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              Localisation
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse complète *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    getFieldError('address') ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Numéro, nom de rue, ville, code postal"
                />
                {getFieldError('address') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('address')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Caractéristiques */}
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Ruler className="h-5 w-5 text-white" />
              </div>
              Caractéristiques du bien
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
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      getFieldError('surface') ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Surface"
                  />
                </div>
                {getFieldError('surface') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('surface')}</p>
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
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      getFieldError('rooms') ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Pièces"
                  />
                </div>
                {getFieldError('rooms') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('rooms')}</p>
                )}
              </div>

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
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      getFieldError('rent') ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Loyer"
                  />
                </div>
                {getFieldError('rent') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('rent')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charges (€)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">€</span>
                  <input
                    type="number"
                    name="charges"
                    value={formData.charges}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      getFieldError('charges') ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Charges"
                  />
                </div>
                {getFieldError('charges') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('charges')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Statut et description */}
          <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <Settings className="h-5 w-5 text-white" />
              </div>
              Statut et description
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut du bien *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    getFieldError('status') ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                >
                  {propertyStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {getFieldError('status') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('status')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du bien
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                  placeholder="Décrivez votre bien, ses particularités, son environnement..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Cette description sera visible par vos locataires potentiels
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Équipements */}
          <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              Équipements et commodités
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Sélectionnez les équipements disponibles dans votre bien
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenitiesList.map(amenity => (
                  <label 
                    key={amenity} 
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer transition-all duration-200 bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 font-medium">{amenity}</span>
                  </label>
                ))}
              </div>
              {formData.amenities.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-100 rounded-lg">
                  <p className="text-sm text-emerald-800">
                    <strong>{formData.amenities.length}</strong> équipement(s) sélectionné(s) : {formData.amenities.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 6: Photos */}
          <div className="bg-pink-50 rounded-xl p-6 border border-pink-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center mr-3">
                <Camera className="h-5 w-5 text-white" />
              </div>
              Photos du bien
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Ajoutez des photos de qualité pour valoriser votre bien
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-400 hover:bg-pink-100 transition-all duration-200 bg-white">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 font-medium">Glissez-déposez vos photos ici</p>
                <p className="text-sm text-gray-500 mb-4">ou cliquez pour sélectionner des fichiers</p>
                <label className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2 mx-auto cursor-pointer w-fit">
                  <Upload className="h-4 w-4" />
                  <span>Choisir des photos</span>
                  <input type="file" multiple accept="image/*" className="hidden" />
                </label>
                <p className="text-xs text-gray-500 mt-3">
                  Formats acceptés : JPG, PNG, WebP • Taille max : 5MB par photo • Jusqu'à 10 photos
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200 bg-gray-50 -mx-6 px-6 py-6 rounded-b-xl">
            <div className="text-sm text-gray-600">
              <span className="text-red-500">*</span> Champs obligatoires
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <Save className="h-5 w-5" />
                <span>{property ? 'Mettre à jour le bien' : 'Créer le bien'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;