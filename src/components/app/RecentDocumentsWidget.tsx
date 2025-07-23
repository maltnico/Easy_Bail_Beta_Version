import React from 'react';
import { FileText, Mail, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Document {
  id: string;
  title: string;
  type: 'document' | 'shared';
  date: string;
  status?: 'pending' | 'completed';
}

interface RecentDocumentsWidgetProps {
  setActiveTab: (tab: string) => void;
}

const RecentDocumentsWidget: React.FC<RecentDocumentsWidgetProps> = ({ setActiveTab }) => {
  const navigate = useNavigate();
  
  // Mock data for recent documents
  const recentDocuments: Document[] = [
    {
      id: '1',
      title: 'Quittance de loyer (01/07/2025 - 31/07/2025)',
      type: 'document',
      date: 'il y a 1 semaine'
    },
    {
      id: '2',
      title: 'Demande d\'attestation d\'entretien de la chaudière',
      type: 'document',
      date: 'il y a 2 semaines'
    },
    {
      id: '3',
      title: 'Quittance de loyer (01/06/2025 - 30/06/2025)',
      type: 'shared',
      date: 'il y a 2 semaines',
      status: 'completed'
    },
    {
      id: '4',
      title: 'Avis d\'échéance de loyer',
      type: 'shared',
      date: 'il y a 2 semaines',
      status: 'completed'
    },
    {
      id: '5',
      title: 'Quittance de loyer (01/05/2025 - 31/05/2025)',
      type: 'shared',
      date: 'il y a 1 mois',
      status: 'completed'
    },
    {
      id: '6',
      title: 'Avis d\'échéance de loyer',
      type: 'shared',
      date: 'il y a 1 mois',
      status: 'completed'
    }
  ];

  const handleViewAllDocuments = () => {
    setActiveTab('documents');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Documents</h3>
      
      <div className="space-y-6">
        {/* Recent Documents Section */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-orange-500" />
            <h4 className="font-medium text-gray-900">Derniers documents</h4>
          </div>
          
          <div className="space-y-3">
            {recentDocuments.slice(0, 2).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{doc.title}</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{doc.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Shared Documents Section */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Mail className="h-5 w-5 text-blue-500" />
            <h4 className="font-medium text-gray-900">Derniers documents et fichiers partagés</h4>
          </div>
          
          <div className="space-y-3">
            {recentDocuments.slice(2, 6).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center flex-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <p className="text-sm text-gray-900">{doc.title}</p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{doc.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* View All Button */}
        <button 
          onClick={handleViewAllDocuments}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 font-medium"
        >
          <span>Voir mes documents</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default RecentDocumentsWidget;
