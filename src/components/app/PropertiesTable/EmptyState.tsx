import React from 'react';
import { Building } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun bien trouvé</h3>
      <p className="text-gray-600">Commencez par ajouter votre premier bien immobilier.</p>
    </div>
  );
};
