import React from 'react';
import { 
  Eye, 
  Edit, 
  MoreHorizontal, 
  Copy, 
  ExternalLink, 
  FileText, 
  Trash2 
} from 'lucide-react';

interface PropertyActionsProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopyAddress: () => void;
  onOpenInMaps: () => void;
  onGenerateReport: () => void;
  actionMenuOpen: boolean;
  onToggleActionMenu: () => void;
}

export const PropertyActions: React.FC<PropertyActionsProps> = ({
  onView,
  onEdit,
  onDelete,
  onCopyAddress,
  onOpenInMaps,
  onGenerateReport,
  actionMenuOpen,
  onToggleActionMenu
}) => {
  return (
    <td className="py-4 px-6">
      <div className="flex items-center space-x-2">
        <button
          onClick={onView}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Voir les détails"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          onClick={onEdit}
          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Modifier"
        >
          <Edit className="h-4 w-4" />
        </button>
        <div className="relative">
          <button
            onClick={onToggleActionMenu}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            title="Plus d'actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          
          {actionMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
              <button
                onClick={() => {
                  onCopyAddress();
                  onToggleActionMenu();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier l'adresse
              </button>
              <button
                onClick={() => {
                  onOpenInMaps();
                  onToggleActionMenu();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Voir sur Maps
              </button>
              <button
                onClick={() => {
                  onGenerateReport();
                  onToggleActionMenu();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                Générer rapport
              </button>
              <hr className="my-2" />
              <button
                onClick={() => {
                  onDelete();
                  onToggleActionMenu();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    </td>
  );
};
