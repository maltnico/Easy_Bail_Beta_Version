import React, { useState } from 'react';
import { 
  X, 
  FileDown, 
  ChevronLeft,
  ChevronRight,
  Send, 
  Edit, 
  CheckCircle, 
  Clock,
  FileText,
  Share2,
  Printer,
  Copy,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';
import { GeneratedDocument } from '../../types/documents';
import { usePDF } from 'react-to-pdf';

interface DocumentPreviewProps {
  generatedDocument: GeneratedDocument | null;
  onClose: () => void;
  onUpdateStatus: (documentId: string, status: GeneratedDocument['status']) => void;
  isOpen: boolean;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  generatedDocument,
  onClose,
  onUpdateStatus,
  isOpen
}) => {
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const { toPDF, targetRef } = usePDF({
    filename: `${generatedDocument?.name || 'document'}.pdf`,
    page: {
      margin: 20,
      format: 'a4',
      orientation: 'portrait',
    }
  });
  
  // Référence pour le contenu du document

  // Vérifier si le document est défini
  if (!isOpen || !generatedDocument) return null;

  const handleStatusUpdate = async (status: GeneratedDocument['status']) => {
    setLoading(true);
    try {
      await onUpdateStatus(generatedDocument.id, status);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Créer un blob avec le contenu HTML
    const blob = new Blob([generatedDocument.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedDocument.name}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    setLoading(true);
    try {
      await toPDF();
    } catch (error) {
      console.error('Erreur lors de la génération PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${generatedDocument.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .document-header { text-align: center; margin-bottom: 30px; }
              .signature-area { border: 1px solid #ccc; height: 60px; margin: 10px 0; }
              .signature-block { margin: 20px 0; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${generatedDocument.content}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedDocument.content);
    // Optionally show a toast notification
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received':
        return 'text-green-600 bg-green-100';
      case 'sent':
        return 'text-yellow-600 bg-yellow-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'received':
        return 'Reçu';
      case 'sent':
        return 'Envoyé';
      case 'draft':
        return 'Brouillon';
      case 'archived':
        return 'Archivé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'lease': 'Contrat de bail',
      'inventory': 'État des lieux',
      'receipt': 'Quittance',
      'notice': 'Préavis',
      'insurance': 'Assurance',
      'guarantee': 'Caution',
      'amendment': 'Avenant',
      'termination': 'Résiliation',
      'renewal': 'Renouvellement',
      'other': 'Autre'
    };
    return labels[type] || type;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{generatedDocument.name}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(generatedDocument.status)}`}>
                  {getStatusLabel(generatedDocument.status)}
                </span>
                <span className="text-sm text-gray-500">
                  Créé le {generatedDocument.createdAt.toLocaleDateString()}
                </span>
                {generatedDocument.signedAt && (
                  <span className="text-sm text-green-600">
                    Signé le {generatedDocument.signedAt.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-1">
            {/* Navigation */}
            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-2 text-sm text-gray-700 border-x border-gray-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Zoom */}
            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-600 hover:text-gray-800"
                title="Zoom arrière"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="px-3 py-2 text-sm text-gray-700 border-x border-gray-300 min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-600 hover:text-gray-800"
                title="Zoom avant"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            {/* Rotation */}
            <button
              onClick={handleRotate}
              className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:text-gray-800"
              title="Rotation"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              <span>PDF</span>
            </button>
            
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {generatedDocument.status === 'draft' && (
              <button
                onClick={() => handleStatusUpdate('pending_signature')}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Envoyer pour signature</span>
              </button>
            )}
            
            {generatedDocument.status === 'pending_signature' && (
              <button
                onClick={() => handleStatusUpdate('signed')}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Marquer comme signé</span>
              </button>
            )}
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-2 md:p-4" style={{ maxHeight: 'calc(95vh - 180px)' }}>
          <div className="flex justify-center min-h-full w-full">
            <div className="relative w-full max-w-3xl">
              <div 
                ref={targetRef}
                className="bg-white shadow-lg mx-auto overflow-hidden"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center top',
                  transition: 'transform 0.2s ease',
                  width: 'min(210mm, 100%)',
                  maxWidth: '100%',
                  margin: '0 auto'
                }}
              >
                <div 
                  id="document-content"
                  className="p-4 md:p-8 bg-white w-full"
                  dangerouslySetInnerHTML={{ __html: generatedDocument.content }}
                  style={{
                    fontFamily: 'Times New Roman, serif',
                    fontSize: 'clamp(10pt, 2vw, 12pt)',
                    lineHeight: '1.5',
                    color: '#000',
                    minHeight: 'min(297mm, 80vh)',
                    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Document Info */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Informations</h4>
              <div className="space-y-1 text-gray-600">
                <p>ID: {generatedDocument.id}</p>
                <p>Version: {generatedDocument.metadata.version}</p>
                <p>Généré par: {generatedDocument.metadata.generatedBy}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Conformité</h4>
              <p className="text-gray-600">{generatedDocument.metadata.legalFramework}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Signatures</h4>
              <div className="space-y-1">
                {generatedDocument.signatures.length > 0 ? (
                  generatedDocument.signatures.map((signature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {signature.signedAt ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className="text-gray-600">
                        {signature.signerName} - {signature.signerRole}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Aucune signature requise</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
