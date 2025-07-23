import React, { useState } from 'react';
import { 
  Building, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Users,
  DollarSign,
  Ruler,
  Grid3X3,
  List
} from 'lucide-react';
import { useProperties } from '../../hooks/useProperties';
import { Property } from '../../types';
import PropertyCard from './PropertyCard';
import PropertyDetails from './PropertyDetails';
import PropertyForm from './PropertyForm';
import { PropertiesTable } from './PropertiesTable';

const PropertyList: React.FC = () => {
  const { 
    properties, 
    loading, 
    error, 
    createProperty, 
    updateProperty, 
    deleteProperty 
  } = useProperties();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProperty = () => {
    setEditingProperty(null);
    setShowPropertyForm(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowPropertyForm(true);
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setShowPropertyDetails(true);
  };

  const handleDeleteProperty = (propertyId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bien ?')) {
      deleteProperty(propertyId).catch(err => {
        console.error('Erreur lors de la suppression:', err);
      });
    }
  };

  const handleSaveProperty = async (propertyData: Partial<Property>) => {
    try {
      if (editingProperty) {
        await updateProperty(editingProperty.id, propertyData);
      } else {
        await createProperty(propertyData as Omit<Property, 'id' | 'createdAt' | 'updatedAt'>);
      }
      setShowPropertyForm(false);
      setEditingProperty(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erreur lors du chargement des biens
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const rentedProperties = properties.filter(p => p.status === 'rented').length;
  const availableProperties = properties.filter(p => p.status === 'available').length;
  const totalRevenue = properties.reduce((sum, p) => sum + (p.status === 'rented' ? p.rent + p.charges : 0), 0);

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Statistics */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <Building className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Biens immobiliers</h1>
              <p className="text-gray-600 mt-1">
                Gérez votre portfolio immobilier en toute simplicité
              </p>
            </div>
          </div>
          <button
            onClick={handleAddProperty}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un bien
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Occupés</p>
                <p className="text-2xl font-bold text-green-600">{rentedProperties}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold text-yellow-600">{availableProperties}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MapPin className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus/mois</p>
                <p className="text-2xl font-bold text-blue-600">{totalRevenue.toLocaleString()}€</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, adresse ou type de bien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-3 border rounded-xl text-sm font-medium transition-all duration-200 ${
                showFilters
                  ? 'border-blue-300 text-blue-700 bg-blue-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
              {showFilters && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">ON</span>}
            </button>
            <div className="flex border border-gray-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title="Vue grille"
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                title="Vue liste"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredProperties.length} bien{filteredProperties.length > 1 ? 's' : ''} 
            {searchTerm && ` trouvé${filteredProperties.length > 1 ? 's' : ''} pour "${searchTerm}"`}
          </p>
          {filteredProperties.length > 0 && (
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {rentedProperties} loué{rentedProperties > 1 ? 's' : ''}
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                {availableProperties} disponible{availableProperties > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="animate-in slide-in-from-top-4 duration-300 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center text-gray-500">
            <Filter className="h-8 w-8 mx-auto mb-2" />
            <p>Filtres avancés - Fonctionnalité en cours de développement</p>
          </div>
        </div>
      )}

      {/* Properties Display */}
      <div className="space-y-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredProperties.map((property, index) => (
              <div
                key={property.id}
                className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PropertyCard
                  property={property}
                  onView={() => handleViewProperty(property)}
                  onEdit={() => handleEditProperty(property)}
                  onDelete={() => handleDeleteProperty(property.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <PropertiesTable
              properties={filteredProperties}
              onView={handleViewProperty}
              onEdit={handleEditProperty}
              onDelete={handleDeleteProperty}
            />
          </div>
        )}

        {/* Enhanced Empty State */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-16 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Building className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Aucun bien trouvé' : 'Aucun bien immobilier'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchTerm
                ? `Aucun bien ne correspond à votre recherche "${searchTerm}". Essayez avec d'autres mots-clés.`
                : 'Commencez par ajouter votre premier bien immobilier pour démarrer la gestion de votre portfolio.'}
            </p>
            {!searchTerm ? (
              <button
                onClick={handleAddProperty}
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter votre premier bien
              </button>
            ) : (
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        )}
      </div>

      {/* Property Form Modal */}
      <PropertyForm
        property={editingProperty || undefined}
        onSave={handleSaveProperty}
        onCancel={() => {
          setShowPropertyForm(false);
          setEditingProperty(null);
        }}
        isOpen={showPropertyForm}
      />

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => {
            setSelectedProperty(null);
            setShowPropertyDetails(false);
          }}
          onEdit={() => {
            handleEditProperty(selectedProperty);
            setSelectedProperty(null);
            setShowPropertyDetails(false);
          }}
          onDelete={() => {
            handleDeleteProperty(selectedProperty.id);
            setSelectedProperty(null);
            setShowPropertyDetails(false);
          }}
          isOpen={showPropertyDetails}
        />
      )}
    </div>
  );
};

export default PropertyList;
