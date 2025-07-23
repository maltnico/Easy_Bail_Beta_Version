import React from 'react';
import { Ruler, Users } from 'lucide-react';

interface PropertyCharacteristicsProps {
  surface: number;
  rooms: number;
  rent: number;
}

export const PropertyCharacteristics: React.FC<PropertyCharacteristicsProps> = ({
  surface,
  rooms,
  rent
}) => {
  return (
    <td className="py-4 px-6">
      <div className="text-sm text-gray-900">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Ruler className="h-3 w-3 mr-1 text-gray-400" />
            <span>{surface}m²</span>
          </div>
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1 text-gray-400" />
            <span>{rooms}P</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {Math.round(rent / surface)}€/m²
        </div>
      </div>
    </td>
  );
};
