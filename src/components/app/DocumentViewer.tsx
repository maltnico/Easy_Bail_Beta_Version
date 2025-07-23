import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileDown,
  FileText,
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Printer,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { GeneratedDocument } from '../../types/documents';
import { usePDF } from 'react-to-pdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface DocumentViewerProps {
  document: GeneratedDocument;
  onClose: () => void;
  isOpen: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document: generatedDocument,
  onClose,
  isOpen
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [downloadType, setDownloadType] = useState<'pdf' | 'docx'>('docx');
  const { toPDF, targetRef } = usePDF({
    filename: `${generatedDocument?.name || 'document'}.pdf`,
    page: {
      margin: 20,
      format: 'a4',
      orientation: 'portrait',
    }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Référence pour le contenu du document

  useEffect(() => {
    if (isOpen && generatedDocument) {
      generatePDF();
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, generatedDocument]);

  const generatePDF = async () => {
    if (!generatedDocument) return;
    
    setLoading(true);
    try {
      // Créer un élément temporaire avec le contenu du document
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generatedDocument.content;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // Largeur A4
      tempDiv.style.padding = '20mm';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12pt';
      tempDiv.style.lineHeight = '1.4';
      tempDiv.style.color = '#000';
      tempDiv.style.backgroundColor = '#fff';
      
      document.body.appendChild(tempDiv);
      
      // Compter les sauts de page
      const pageBreaks = tempDiv.querySelectorAll('.page-break');
      const totalPages = pageBreaks.length + 1;
      setTotalPages(totalPages);
      
      // Clean up the temporary element
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Erreur lors de la génération PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour télécharger le PDF
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

  // Fonction pour télécharger le DOCX
  const handleDownloadDOCX = async () => {
    if (!generatedDocument) return;
    
    setLoading(true);
    try {
      // Parse the HTML content
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(generatedDocument.content, 'text/html');
      
      // Create paragraphs array to hold all content
      const paragraphs: any[] = [
        new Paragraph({
          text: generatedDocument.name,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      ];
      
      // Process HTML elements and convert to DOCX paragraphs
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent && node.textContent.trim()) {
            paragraphs.push(
              new Paragraph({
                children: [new TextRun({ text: node.textContent.trim() })],
                spacing: { after: 200 }
              })
            );
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Handle different element types
          if (element.tagName === 'H1') {
            paragraphs.push(
              new Paragraph({
                text: element.textContent || '',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { before: 400, after: 200 }
              })
            );
          } else if (element.tagName === 'H2') {
            paragraphs.push(
              new Paragraph({
                text: element.textContent || '',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 }
              })
            );
          } else if (element.tagName === 'H3') {
            paragraphs.push(
              new Paragraph({
                text: element.textContent || '',
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 240, after: 120 }
              })
            );
          } else if (element.tagName === 'P') {
            const textRuns: TextRun[] = [];
            
            // Process child nodes to handle formatting
            Array.from(element.childNodes).forEach(child => {
              if (child.nodeType === Node.TEXT_NODE) {
                if (child.textContent && child.textContent.trim()) {
                  textRuns.push(new TextRun({ text: child.textContent }));
                }
              } else if (child.nodeType === Node.ELEMENT_NODE) {
                const childElement = child as Element;
                if (childElement.tagName === 'STRONG' || childElement.tagName === 'B') {
                  textRuns.push(new TextRun({ text: childElement.textContent || '', bold: true }));
                } else if (childElement.tagName === 'EM' || childElement.tagName === 'I') {
                  textRuns.push(new TextRun({ text: childElement.textContent || '', italics: true }));
                } else if (childElement.tagName === 'U') {
                  textRuns.push(new TextRun({ text: childElement.textContent || '', underline: {} }));
                } else if (childElement.tagName === 'SPAN') {
                  // Check for special classes or styles
                  if (childElement.classList.contains('important')) {
                    textRuns.push(new TextRun({ text: childElement.textContent || '', bold: true }));
                  } else {
                    textRuns.push(new TextRun({ text: childElement.textContent || '' }));
                  }
                } else {
                  textRuns.push(new TextRun({ text: childElement.textContent || '' }));
                }
              }
            });
            
            if (textRuns.length > 0) {
              paragraphs.push(
                new Paragraph({
                  children: textRuns,
                  spacing: { after: 200 }
                })
              );
            } else if (element.textContent && element.textContent.trim()) {
              paragraphs.push(
                new Paragraph({
                  text: element.textContent.trim(),
                  spacing: { after: 200 }
                })
              );
            }
          } else if (element.tagName === 'DIV' && element.className === 'document-header') {
            // Special handling for document header
            paragraphs.push(
              new Paragraph({
                text: element.textContent || '',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
              })
            );
          } else if (element.tagName === 'TABLE') {
            // Add a header for the table
            paragraphs.push(
              new Paragraph({
                children: [new TextRun({ text: "Tableau", bold: true })],
                spacing: { before: 240, after: 120 }
              })
            );
            
            // Process table rows
            Array.from(element.querySelectorAll('tr')).forEach(row => {
              const cellTexts = Array.from(row.querySelectorAll('td, th'))
                .map(cell => cell.textContent?.trim() || '')
                .join(' | ');
              
              paragraphs.push(
                new Paragraph({
                  text: cellTexts,
                  spacing: { after: 120 },
                  indent: { left: 360 } // 0.25 inch indent
                })
              );
            });
          } else if (element.tagName === 'UL') {
            // Process unordered list
            Array.from(element.querySelectorAll('li')).forEach(li => {
              paragraphs.push(
                new Paragraph({
                  text: `• ${li.textContent || ''}`,
                  style: "ListParagraph",
                  spacing: { after: 120 }
                })
              );
            });
          } else if (element.tagName === 'OL') {
            // Process ordered list
            Array.from(element.querySelectorAll('li')).forEach((li, index) => {
              paragraphs.push(
                new Paragraph({
                  text: `${index + 1}. ${li.textContent || ''}`,
                  style: "ListParagraph",
                  spacing: { after: 120 }
                })
              );
            });
          } else {
            // Process children for other elements
            Array.from(element.childNodes).forEach(child => {
              processNode(child);
            });
          }
        }
      };
      
      // Process the body element
      Array.from(htmlDoc.body.childNodes).forEach(node => {
        processNode(node);
      });

      // Create a new DOCX document with all processed paragraphs
      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: "Normal",
              name: "Normal",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                size: 24, // 12pt
                font: "Times New Roman",
              },
              paragraph: {
                spacing: { line: 360, before: 0, after: 0 }, // 1.5 line spacing
              },
            },
            {
              id: "Heading1",
              name: "Heading 1",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                size: 32, // 16pt
                bold: true,
                font: "Times New Roman",
              },
              paragraph: {
                spacing: { before: 240, after: 120 },
                alignment: AlignmentType.CENTER,
              },
            },
            {
              id: "Heading2",
              name: "Heading 2",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                size: 28, // 14pt
                bold: true,
                font: "Times New Roman",
              },
              paragraph: {
                spacing: { before: 240, after: 120 },
              },
            },
            {
              id: "ListParagraph",
              name: "List Paragraph",
              basedOn: "Normal",
              quickFormat: true,
              paragraph: {
                indent: { left: 720 }, // 0.5 inch indent
              },
            },
          ],
        },
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch in twips (1440 twips = 1 inch)
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: paragraphs
        }]
      });

      // Générer le blob DOCX
      const blob = await Packer.toBlob(doc);
      
      // Télécharger le fichier
      saveAs(blob, `${generatedDocument.name}.docx`);
    } catch (error) {
      console.error('Erreur lors de la génération DOCX:', error);
      alert('Erreur lors de la génération du document Word');
    } finally {
      setLoading(false);
    }
  };

  // Fonction de téléchargement qui choisit le format approprié
  const handleDownload = () => {
    if (downloadType === 'docx') {
      handleDownloadDOCX();
    } else {
      handleDownloadPDF();
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
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

  if (!isOpen || !generatedDocument) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{generatedDocument.name}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(generatedDocument.status)}`}>
                  {getStatusLabel(generatedDocument.status)}
                </span>
                <span className="text-sm text-gray-500">
                  Créé le {generatedDocument.createdAt.toLocaleDateString()}
                </span>
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
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
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

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimer</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                downloadType === 'docx' ? <FileText className="h-4 w-4" /> : <FileDown className="h-4 w-4" />
              )}
              <span>Télécharger {downloadType === 'docx' ? 'Word' : 'PDF'}</span>
              <select 
                value={downloadType}
                onChange={(e) => setDownloadType(e.target.value as 'pdf' | 'docx')}
                className="ml-1 bg-blue-700 text-white border-none rounded-md text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="docx">Word</option>
                <option value="pdf">PDF</option>
              </select>
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="flex justify-center min-h-full w-full">
            <div className="relative w-full max-w-4xl">
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

        {/* Footer Info */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">Document ID:</span> {generatedDocument.id}
            </div>
            <div>
              <span className="font-medium">Dernière modification:</span> {generatedDocument.updatedAt.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
