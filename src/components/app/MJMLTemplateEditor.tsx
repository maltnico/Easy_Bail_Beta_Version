import React from 'react';
import { X, Mail, Info } from 'lucide-react';

interface MJMLTemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

const MJMLTemplateEditor: React.FC<MJMLTemplateEditorProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Éditeur MJML</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 text-center">
            <Info className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-blue-900 mb-2">Fonctionnalité remplacée</h3>
            <p className="text-blue-700 mb-4">
              L'éditeur MJML a été remplacé par l'éditeur HTML standard pour une meilleure compatibilité.
              Veuillez utiliser l'éditeur HTML pour créer et modifier vos templates d'emails.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MJMLTemplateEditor;
