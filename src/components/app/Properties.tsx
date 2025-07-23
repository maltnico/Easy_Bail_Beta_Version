import React, { useState } from 'react';
import { 
  Building, 
  Plus, 
  Search, 
  Filter,
  Grid3X3,
  List,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Users,
  DollarSign,
  Ruler
} from 'lucide-react';
import { useProperties } from '../../hooks/useProperties';
import { Property } from '../../types';
import PropertyCard from './PropertyCard';
import PropertyDetails from './PropertyDetails';
import PropertyFilters from './PropertyFilters';
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
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Biens immobiliers</h1>
            <p className="text-sm text-gray-500">
              {properties.length} bien{properties.length > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>
        <button
          onClick={handleAddProperty}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un bien
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par titre ou adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </button>
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <PropertyFilters onFiltersChange={(filters) => console.log(filters)} />
      )}

      {/* Properties Display */}
      <div className="space-y-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onView={() => handleViewProperty(property)}
                onEdit={() => handleEditProperty(property)}
                onDelete={() => handleDeleteProperty(property.id)}
              />
            ))}
          </div>
        ) : (
          <PropertiesTable
            properties={filteredProperties}
            onView={handleViewProperty}
            onEdit={handleEditProperty}
            onDelete={handleDeleteProperty}
          />
        )}

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun bien trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? 'Aucun bien ne correspond à votre recherche.'
                : 'Commencez par ajouter votre premier bien immobilier.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={handleAddProperty}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un bien
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Property Form Modal */}
      <PropertyForm
        property={editingProperty}
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
          isOpen={showPropertyDetails}
        />
      )}
    </div>
  );
};

export default PropertyList;