import React from 'react';
import { MapPin } from 'lucide-react';
import { Property } from '../../../../types';
import { getTypeIcon } from '../utils/propertyUtils';

interface PropertyInfoProps {
  property: Property;
  onToggleExpansion: () => void;
}

export const PropertyInfo: React.FC<PropertyInfoProps> = ({
  property,
  onToggleExpansion
}) => {
  return (
    <td className="py-4 px-6">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{getTypeIcon(property.type)}</div>
        <div className="min-w-0 flex-1">
          <button
            onClick={onToggleExpansion}
            className="text-left hover:text-blue-600 transition-colors"
          >
            <p className="font-medium text-gray-900 truncate">{property.name}</p>
            <div className="flex items-center text-gray-500 mt-1">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="text-sm truncate">{property.address}</span>
            </div>
          </button>
        </div>
      </div>
    </td>
  );
};
