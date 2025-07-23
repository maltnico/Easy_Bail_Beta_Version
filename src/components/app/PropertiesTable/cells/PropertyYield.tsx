import React from 'react';
import { calculateYield } from '../utils/calculations';

interface PropertyYieldProps {
  rent: number;
}

export const PropertyYield: React.FC<PropertyYieldProps> = ({ rent }) => {
  const yieldValue = calculateYield(rent);

  return (
    <td className="py-4 px-6">
      <div className="text-sm">
        <div className="font-medium text-gray-900">
          {yieldValue}%
        </div>
        <div className="text-xs text-gray-500">
          Rendement estimé
        </div>
      </div>
    </td>
  );
};
