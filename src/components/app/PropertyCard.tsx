import React from 'react';
import { 
  Building, 
  MapPin, 
  Users, 
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'vacant':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 group transform hover:-translate-y-1">
      {/* Property Image */}
      <div className="h-52 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
          <div className="absolute top-4 right-4 w-32 h-32 border-2 border-white border-opacity-20 rounded-full"></div>
          <div className="absolute bottom-4 left-4 w-20 h-20 border border-white border-opacity-20 rounded-full"></div>
        </div>
        
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm border ${getStatusColor(property.status)}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              property.status === 'occupied' ? 'bg-green-500' : 
              property.status === 'vacant' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            {getStatusLabel(property.status)}
          </span>
        </div>
        
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <div className="flex space-x-2">
            <button
              onClick={onView}
              className="p-2.5 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl hover:bg-opacity-30 transition-all duration-200 transform hover:scale-110"
              title="Voir les détails"
            >
              <Eye className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={onEdit}
              className="p-2.5 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl hover:bg-opacity-30 transition-all duration-200 transform hover:scale-110"
              title="Modifier"
            >
              <Edit className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-4 text-white">
          <div className="flex items-center space-x-2 text-sm font-semibold">
            <div className="p-1.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
              <Building className="h-4 w-4" />
            </div>
            <span>{getTypeLabel(property.type)}</span>
          </div>
        </div>
        
        {/* Price badge */}
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
          <div className="text-center">
            <p className="text-xs text-gray-600 font-medium">Loyer total</p>
            <p className="text-lg font-bold text-gray-900">{property.rent + property.charges}€</p>
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
            <div className="p-2 bg-blue-50 rounded-lg">
              <Ruler className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Surface</p>
              <p className="font-semibold text-gray-900">{property.surface}m²</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Pièces</p>
              <p className="font-semibold text-gray-900">{property.rooms}</p>
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 font-medium">Loyer mensuel</span>
            <span className="text-lg font-bold text-gray-900">{property.rent}€</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Charges</span>
            <span className="text-sm font-medium text-gray-700">{property.charges}€</span>
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Total mensuel</span>
              <span className="text-xl font-bold text-blue-600">
                {property.rent + property.charges}€
              </span>
            </div>
          </div>
        </div>

        {/* Tenant Info */}
        {property.tenant ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-900">
                {property.tenant.firstName} {property.tenant.lastName}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-green-700">
              <Calendar className="h-3 w-3" />
              <span>Bail jusqu'au {property.tenant.leaseEnd.toLocaleDateString()}</span>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-center">
            <span className="text-sm font-semibold text-yellow-800">Bien vacant</span>
            <p className="text-xs text-yellow-600 mt-1">Disponible à la location</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={onView}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 text-sm font-semibold shadow-sm transform hover:scale-105"
          >
            <Eye className="h-4 w-4" />
            <span>Détails</span>
          </button>
          <button
            onClick={onEdit}
            className="bg-gray-100 text-gray-700 py-2.5 px-3 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="bg-red-100 text-red-700 py-2.5 px-3 rounded-xl hover:bg-red-200 transition-all duration-200 transform hover:scale-105"
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
