import React from 'react';
import { getTypeLabel } from '../utils/propertyUtils';

interface PropertyTypeProps {
  type: string;
}

export const PropertyType: React.FC<PropertyTypeProps> = ({ type }) => {
  return (
    <td className="py-4 px-6">
      <span className="text-sm text-gray-900">{getTypeLabel(type)}</span>
    </td>
  );
};
