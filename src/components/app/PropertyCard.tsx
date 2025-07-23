import React from 'react';
import { 
  Building, 
  MapPin, 
  Users, 
  DollarSign, 
  Edit, 
  Eye, 
  Trash2,
  Ruler,
  Calendar
} from 'lucide-react';
import { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-green-100 text-green-800';
      case 'vacant':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'Occupé';
      case 'vacant':
        return 'Vacant';
      case 'maintenance':
        return 'Maintenance';
      default:
        return status;
    }
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
      {/* Property Image */}
      <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 relative overflow-hidden">
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
            {getStatusLabel(property.status)}
          </span>
        </div>
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-2">
            <button
              onClick={onView}
              className="p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg hover:bg-opacity-30 transition-colors"
              title="Voir les détails"
            >
              <Eye className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg hover:bg-opacity-30 transition-colors"
              title="Modifier"
            >
              <Edit className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center space-x-2 text-sm font-medium">
            <Building className="h-4 w-4" />
            <span>{getTypeLabel(property.type)}</span>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {property.name}
          </h3>
          <div className="flex items-start text-gray-600">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm line-clamp-2">{property.address}</span>
          </div>
        </div>

        {/* Property Specs */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Ruler className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Surface</p>
              <p className="font-medium text-gray-900">{property.surface}m²</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Pièces</p>
              <p className="font-medium text-gray-900">{property.rooms}</p>
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Loyer mensuel</span>
            <span className="text-lg font-bold text-gray-900">{property.rent}€</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Charges</span>
            <span className="text-sm font-medium text-gray-700">{property.charges}€</span>
          </div>
          <div className="border-t border-gray-200 mt-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Total</span>
              <span className="text-lg font-bold text-blue-600">
                {property.rent + property.charges}€
              </span>
            </div>
          </div>
        </div>

        {/* Tenant Info */}
        {property.tenant ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                {property.tenant.firstName} {property.tenant.lastName}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-green-700">
              <Calendar className="h-3 w-3" />
              <span>Bail jusqu'au {property.tenant.leaseEnd.toLocaleDateString()}</span>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-center">
            <span className="text-sm font-medium text-yellow-800">Bien vacant</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={onView}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            <span>Détails</span>
          </button>
          <button
            onClick={onEdit}
            className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
