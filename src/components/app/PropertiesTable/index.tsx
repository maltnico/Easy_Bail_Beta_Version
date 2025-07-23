import React, { useState, useMemo, useCallback } from 'react';
import { Property } from '../../../types';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';
import { TableFooter } from './TableFooter';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { useTableSelection } from './hooks/useTableSelection';
import { useTableActions } from './hooks/useTableActions';

interface PropertiesTableProps {
  properties: Property[];
  onView: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (propertyId: string) => void;
  loading?: boolean;
}

export const PropertiesTable: React.FC<PropertiesTableProps> = ({ 
  properties, 
  onView, 
  onEdit, 
  onDelete,
  loading = false
}) => {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  
  const {
    selectedProperties,
    handleSelectProperty,
    handleSelectAll,
    clearSelection
  } = useTableSelection(properties);

  const {
    actionMenuOpen,
    setActionMenuOpen,
    handleCopyToClipboard,
    handleOpenInMaps,
    handleGenerateReport
  } = useTableActions();

  const toggleRowExpansion = useCallback((propertyId: string) => {
    setExpandedRows(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  }, []);

  const tableStats = useMemo(() => {
    const totalRevenue = properties.reduce((sum, p) => sum + p.rent, 0);
    const occupiedCount = properties.filter(p => p.status === 'occupied').length;
    const occupancyRate = properties.length > 0 ? (occupiedCount / properties.length) * 100 : 0;
    
    return {
      totalRevenue,
      occupancyRate: Math.round(occupancyRate)
    };
  }, [properties]);

  if (loading) {
    return <LoadingState />;
  }

  if (properties.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <TableHeader
        selectedCount={selectedProperties.length}
        totalCount={properties.length}
        onSelectAll={handleSelectAll}
        onClearSelection={clearSelection}
      />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 font-medium text-gray-900 w-8"></th>
              <th className="text-left py-3 px-6 font-medium text-gray-900">Bien</th>
              <th className="text-left py-3 px-6 font-medium text-gray-900">Type</th>
              <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
              <th className="text-left py-3 px-6 font-medium text-gray-900">Caractéristiques</th>
              <th className="text-left py-3 px-6 font-medium text-gray-900">Finances</th>
              <th className="text-left py-3 px-6 font-medium text-gray-900">Locataire</th>
              <th className="text-left py-3 px-6 font-medium text-gray-900">Rendement</th>
              <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {properties.map((property) => (
              <TableRow
                key={property.id}
                property={property}
                isSelected={selectedProperties.includes(property.id)}
                isExpanded={expandedRows.includes(property.id)}
                actionMenuOpen={actionMenuOpen === property.id}
                onSelect={() => handleSelectProperty(property.id)}
                onToggleExpansion={() => toggleRowExpansion(property.id)}
                onView={() => onView(property)}
                onEdit={() => onEdit(property)}
                onDelete={() => onDelete(property.id)}
                onCopyAddress={() => handleCopyToClipboard(property.address)}
                onOpenInMaps={() => handleOpenInMaps(property.address)}
                onGenerateReport={() => handleGenerateReport(property.id)}
                onToggleActionMenu={() => setActionMenuOpen(
                  actionMenuOpen === property.id ? null : property.id
                )}
              />
            ))}
          </tbody>
        </table>
      </div>

      <TableFooter
        totalProperties={properties.length}
        totalRevenue={tableStats.totalRevenue}
        occupancyRate={tableStats.occupancyRate}
      />
    </div>
  );
};
