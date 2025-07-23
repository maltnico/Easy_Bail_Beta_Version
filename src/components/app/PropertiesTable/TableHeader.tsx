import React from 'react';

interface TableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection
}) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedCount === totalCount && totalCount > 0}
              onChange={onSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              {selectedCount > 0 
                ? `${selectedCount} sélectionné(s)`
                : 'Tout sélectionner'
              }
            </span>
          </label>
        </div>
        
        {selectedCount > 0 && (
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Actions groupées
            </button>
            <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Supprimer ({selectedCount})
            </button>
            <button
              onClick={onClearSelection}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
