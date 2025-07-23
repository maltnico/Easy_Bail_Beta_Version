import React from 'react';
import { formatCurrency } from './utils/formatters';

interface TableFooterProps {
  totalProperties: number;
  totalRevenue: number;
  occupancyRate: number;
}

export const TableFooter: React.FC<TableFooterProps> = ({
  totalProperties,
  totalRevenue,
  occupancyRate
}) => {
  return (
    <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{totalProperties} bien(s) au total</span>
        <div className="flex items-center space-x-4">
          <span>Revenus totaux: {formatCurrency(totalRevenue)}/mois</span>
          <span>Taux d'occupation: {Math.round(occupancyRate)}%</span>
        </div>
      </div>
    </div>
  );
};
