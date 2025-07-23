import React from 'react';
import { Property } from '../../../types';
import { formatCurrency } from './utils/formatters';

interface ExpandedRowDetailsProps {
  property: Property;
}

export const ExpandedRowDetails: React.FC<ExpandedRowDetailsProps> = ({ property }) => {
  return (
    <tr className="bg-gray-50">
      <td colSpan={9} className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Property Details */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Détails du bien</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Créé le:</span>
                <span className="text-gray-900">{property.createdAt.toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Modifié le:</span>
                <span className="text-gray-900">{property.updatedAt.toLocaleDateString('fr-FR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Prix/m²:</span>
                <span className="text-gray-900">{Math.round(property.rent / property.surface)}€</span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Résumé financier</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Revenus annuels:</span>
                <span className="text-gray-900 font-medium">{formatCurrency(property.rent * 12)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Charges annuelles:</span>
                <span className="text-gray-900">{formatCurrency(property.charges * 12)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Total annuel:</span>
                <span className="text-gray-900 font-bold">{formatCurrency((property.rent + property.charges) * 12)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Actions rapides</h4>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-3 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Créer bail
              </button>
              <button className="px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Quittance
              </button>
              <button className="px-3 py-2 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                État lieux
              </button>
              <button className="px-3 py-2 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                Visite
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};
