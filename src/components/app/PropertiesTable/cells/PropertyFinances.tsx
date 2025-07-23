import React from 'react';
import { formatCurrency } from '../utils/formatters';

interface PropertyFinancesProps {
  rent: number;
  charges: number;
}

export const PropertyFinances: React.FC<PropertyFinancesProps> = ({
  rent,
  charges
}) => {
  return (
    <td className="py-4 px-6">
      <div className="text-sm">
        <div className="font-medium text-gray-900">
          {formatCurrency(rent)}
        </div>
        <div className="text-gray-500">
          + {formatCurrency(charges)} charges
        </div>
        <div className="text-xs text-blue-600 font-medium mt-1">
          {formatCurrency(rent + charges)} total
        </div>
      </div>
    </td>
  );
};
