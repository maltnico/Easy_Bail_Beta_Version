import React from 'react';
import { getStatusColor, getStatusLabel } from '../utils/propertyUtils';

interface PropertyStatusProps {
  status: string;
}

export const PropertyStatus: React.FC<PropertyStatusProps> = ({ status }) => {
  return (
    <td className="py-4 px-6">
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
        {getStatusLabel(status)}
      </span>
    </td>
  );
};
