import React from 'react';
import { Property } from '../../../types';
import { PropertyInfo } from './cells/PropertyInfo';
import { PropertyType } from './cells/PropertyType';
import { PropertyStatus } from './cells/PropertyStatus';
import { PropertyCharacteristics } from './cells/PropertyCharacteristics';
import { PropertyFinances } from './cells/PropertyFinances';
import { PropertyTenant } from './cells/PropertyTenant';
import { PropertyYield } from './cells/PropertyYield';
import { PropertyActions } from './cells/PropertyActions';
import { ExpandedRowDetails } from './ExpandedRowDetails';

interface TableRowProps {
  property: Property;
  isSelected: boolean;
  isExpanded: boolean;
  actionMenuOpen: boolean;
  onSelect: () => void;
  onToggleExpansion: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopyAddress: () => void;
  onOpenInMaps: () => void;
  onGenerateReport: () => void;
  onToggleActionMenu: () => void;
}

export const TableRow: React.FC<TableRowProps> = ({
  property,
  isSelected,
  isExpanded,
  actionMenuOpen,
  onSelect,
  onToggleExpansion,
  onView,
  onEdit,
  onDelete,
  onCopyAddress,
  onOpenInMaps,
  onGenerateReport,
  onToggleActionMenu
}) => {
  return (
    <>
      <tr 
        className={`hover:bg-gray-50 transition-colors ${
          isSelected ? 'bg-blue-50' : ''
        }`}
      >
        {/* Selection Checkbox */}
        <td className="py-4 px-6">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </td>

        <PropertyInfo 
          property={property} 
          onToggleExpansion={onToggleExpansion} 
        />
        
        <PropertyType type={property.type} />
        
        <PropertyStatus status={property.status} />
        
        <PropertyCharacteristics 
          surface={property.surface}
          rooms={property.rooms}
          rent={property.rent}
        />
        
        <PropertyFinances 
          rent={property.rent}
          charges={property.charges}
        />
        
        <PropertyTenant tenant={property.tenant} />
        
        <PropertyYield rent={property.rent} />
        
        <PropertyActions
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopyAddress={onCopyAddress}
          onOpenInMaps={onOpenInMaps}
          onGenerateReport={onGenerateReport}
          actionMenuOpen={actionMenuOpen}
          onToggleActionMenu={onToggleActionMenu}
        />
      </tr>

      {/* Expanded Row Details */}
      {isExpanded && (
        <ExpandedRowDetails property={property} />
      )}
    </>
  );
};
