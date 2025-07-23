import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Copy,
  Settings,
  FileDown,
  Mail
} from 'lucide-react';
import { DocumentTemplate, GeneratedDocument } from '../../types/documents';
import { documentTemplates } from '../../lib/documentTemplates';
import { documentGenerator } from '../../lib/documentGenerator';
import { documentStorage } from '../../lib/documentStorage';
import { useProperties } from '../../hooks/useProperties';
import { useTenants } from '../../hooks/useTenants';
import DocumentForm from './DocumentForm';
import DocumentViewer from './DocumentViewer';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

const DocumentGenerator = () => {
  const { properties } = useProperties();
  const { tenants } = useTenants();
  
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [templates] = useState<DocumentTemplate[]>(documentTemplates);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<GeneratedDocument | null>(null);
  const [showEmailTemplateEditor, setShowEmailTemplateEditor] = useState(false);
  const [viewMode, setViewMode] = useState<'templates' | 'documents'>('templates');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      try {
        const docs = await documentStorage.getDocumentsList();
        setDocuments(docs);
      } catch (error) {
        // Si l'erreur est liée à une connexion Supabase, utiliser les données de démonstration
        if (error instanceof Error && 
            (error.message.includes('timeout') || 
             error.message.includes('Failed to fetch') ||
             error.message.includes('connect error'))) {
          console.warn('Utilisation des documents de démonstration en raison d\'une erreur de connexion:', error.message);
          
          // Créer des documents de démonstration
          const demoDocuments: GeneratedDocument[] = [
            {
              id: 'doc_1',
              templateId: 'lease-contract',
              name: 'Contrat de bail - Appartement Bastille',
              type: 'lease',
              status: 'received',
              propertyId: '1',
              tenantId: '1',
              userId: 'current-user',
              data: {},
              content: '<div class="document-header"><h1>CONTRAT DE BAIL</h1></div>',
              signatures: [
                {
                  id: 'sig_1',
                  signerName: 'Marie Martin',
                  signerEmail: 'marie.martin@email.com',
                  signerRole: 'tenant',
                  signedAt: new Date('2023-08-20')
                }
              ],
              createdAt: new Date('2023-08-15'),
              updatedAt: new Date('2023-08-20'),
              signedAt: new Date('2023-08-20'),
              metadata: {
                version: '1.0',
                generatedBy: 'EasyBail Document Generator',
                legalFramework: 'Loi du 6 juillet 1989, Loi ALUR'
              }
            },
            {
              id: 'doc_2',
              templateId: 'inventory-report',
              name: 'État des lieux d\'entrée - Appartement Bastille',
              type: 'inventory',
              status: 'received',
              propertyId: '1',
              tenantId: '1',
              userId: 'current-user',
              data: {},
              content: '<div class="document-header"><h1>ÉTAT DES LIEUX</h1></div>',
              signatures: [],
              createdAt: new Date('2023-08-20'),
              updatedAt: new Date('2023-08-20'),
              signedAt: new Date('2023-08-20'),
              metadata: {
                version: '1.0',
                generatedBy: 'EasyBail Document Generator',
                legalFramework: 'Loi du 6 juillet 1989, Décret n°2016-382'
              }
            },
            {
              id: 'doc_3',
              templateId: 'rent-receipt',
              name: 'Quittance Novembre 2024',
              type: 'receipt',
              status: 'received',
              propertyId: '1',
              tenantId: '1',
              userId: 'current-user',
              data: {},
              content: '<div class="document-header"><h1>QUITTANCE DE LOYER</h1></div>',
              signatures: [],
              createdAt: new Date('2024-11-01'),
              updatedAt: new Date('2024-11-05'),
              signedAt: new Date('2024-11-05'),
              metadata: {
                version: '1.0',
                generatedBy: 'EasyBail Document Generator',
                legalFramework: 'Article 21 de la loi du 6 juillet 1989'
              }
            }
          ];
          
          setDocuments(demoDocuments);
        } else {
          console.error('Erreur lors du chargement des documents:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setShowDocumentForm(true);
  };

  const handleViewDocument = (document: GeneratedDocument) => {
    setSelectedDocument(document);
    setShowDocumentPreview(true);
  };

  const handleDocumentSaved = async (document: GeneratedDocument) => {
    try {
      // Générer et stocker le PDF
      await generateAndStorePDF(document);
      
      // Sauvegarder le document (Supabase + localStorage)
      await documentStorage.saveDocument(document);
      
      await loadDocuments();
      setShowDocumentForm(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Fonction pour générer et stocker un PDF à partir du document
  const generateAndStorePDF = async (generatedDoc: GeneratedDocument) => {
    try {
      // Créer un élément temporaire avec le contenu du document
      const tempDiv = window.document.createElement('div');
      tempDiv.innerHTML = generatedDoc.content;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.padding = '20mm';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12pt';
      tempDiv.style.lineHeight = '1.4';
      tempDiv.style.color = '#000';
      tempDiv.style.backgroundColor = '#fff';
      
      window.document.body.appendChild(tempDiv);
      
      // Convertir en canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123 // A4 height in pixels at 96 DPI
      });
      
      // Créer le PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculer les dimensions pour s'adapter à la page A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Convertir le PDF en base64
      const pdfData = pdf.output('datauristring');
      
      // Stocker le PDF dans le document
      generatedDoc.metadata.pdfData = pdfData;
      
      // Nettoyer
      window.document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Erreur lors de la génération PDF:', error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      try {
        // Supprimer du stockage principal
        await documentStorage.deleteDocument(documentId);
        
        await loadDocuments();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleDownloadPDF = async (generatedDocToDownload: GeneratedDocument) => {
    try {
      // Créer un élément temporaire avec le contenu du document
      const tempDiv = window.document.createElement('div');
      tempDiv.innerHTML = generatedDocToDownload.content;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.padding = '20mm';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12pt';
      tempDiv.style.lineHeight = '1.4';
      tempDiv.style.color = '#000';
      tempDiv.style.backgroundColor = '#fff';
      
      window.document.body.appendChild(tempDiv);
      
      // Convertir en canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        height: 1123 // A4 height in pixels at 96 DPI
      });
      
      // Créer le PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculer les dimensions pour s'adapter à la page A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Télécharger le PDF
      pdf.save(`${generatedDocToDownload.name}.pdf`);
      
      // Nettoyer
      window.document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Erreur lors de la génération PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  // Convertir le HTML en texte simple
  const htmlToPlainText = (html: string): string => {
    const tempDiv = window.document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const handleDownloadDOCX = async (generatedDocToDownload: GeneratedDocument) => {
    try {
      // Parse the HTML content
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(generatedDocToDownload.content, 'text/html');
      
      // Create a new DOCX document with proper styling
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
          children: [
            new Paragraph({
              text: generatedDocToDownload.name,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
          ]
        }]
      });
      
      // Get the section to add content to
      const section = doc.sections[0];
      
      // Process HTML elements and convert to DOCX paragraphs
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent && node.textContent.trim()) {
            return [new TextRun({ text: node.textContent.trim() })];
          }
          return [];
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Handle different element types
          if (element.tagName === 'H1') {
            section.children.push(
              new Paragraph({
                text: element.textContent || '',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { before: 400, after: 200 }
              })
            );
          } else if (element.tagName === 'H2') {
            section.children.push(
              new Paragraph({
                text: element.textContent || '',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 200 }
              })
            );
          } else if (element.tagName === 'H3') {
            section.children.push(
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
              section.children.push(
                new Paragraph({
                  children: textRuns,
                  spacing: { after: 200 }
                })
              );
            } else if (element.textContent && element.textContent.trim()) {
              section.children.push(
                new Paragraph({
                  text: element.textContent.trim(),
                  spacing: { after: 200 }
                })
              );
            }
          } else if (element.tagName === 'DIV' && element.className === 'document-header') {
            // Special handling for document header
            section.children.push(
              new Paragraph({
                text: element.textContent || '',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
              })
            );
          } else if (element.tagName === 'TABLE') {
            // Add a header for the table
            section.children.push(
              new Paragraph({
                text: "Tableau",
                bold: true,
                spacing: { before: 240, after: 120 }
              })
            );
            
            // Process table rows
            Array.from(element.querySelectorAll('tr')).forEach(row => {
              const cellTexts = Array.from(row.querySelectorAll('td, th'))
                .map(cell => cell.textContent?.trim() || '')
                .join(' | ');
              
              section.children.push(
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
              section.children.push(
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
              section.children.push(
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
      
      // Générer le blob DOCX
      const blob = await Packer.toBlob(doc);
      
      // Télécharger le fichier
      saveAs(blob, `${generatedDocToDownload.name}.docx`);
    } catch (error) {
      console.error('Erreur lors de la génération DOCX:', error);
      alert('Erreur lors de la génération du document Word');
    }
  };

  const handleSendForSignature = async (generatedDoc: GeneratedDocument) => {
    try {
      // Générer le PDF si pas déjà disponible
      let pdfBlob: Blob | null = null;
      
      if (generatedDoc.metadata.pdfData) {
        // Utiliser le PDF existant
        const pdfData = generatedDoc.metadata.pdfData.split(',')[1];
        const binaryString = window.atob(pdfData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        pdfBlob = new Blob([bytes], { type: 'application/pdf' });
      } else {
        // Générer le PDF à partir du contenu HTML
        const tempDiv = window.document.createElement('div');
        tempDiv.innerHTML = generatedDoc.content;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.width = '210mm';
        tempDiv.style.padding = '20mm';
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        tempDiv.style.fontSize = '12pt';
        tempDiv.style.lineHeight = '1.4';
        tempDiv.style.color = '#000';
        tempDiv.style.backgroundColor = '#fff';
        
        window.document.body.appendChild(tempDiv);
        
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        });
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        pdfBlob = pdf.output('blob');
        window.document.body.removeChild(tempDiv);
      }
      
      if (pdfBlob) {
        // Créer un fichier temporaire pour la pièce jointe
        const pdfFile = new File([pdfBlob], `${generatedDoc.name}.pdf`, { type: 'application/pdf' });
        
        // Créer l'URL du fichier
        const pdfUrl = URL.createObjectURL(pdfFile);
        
        // Préparer le contenu de l'email
        const subject = encodeURIComponent(`Document à signer : ${generatedDoc.name}`);
        const body = encodeURIComponent(`Bonjour,

Vous trouverez en pièce jointe le document suivant à signer :

Document : ${generatedDoc.name}
Type : ${getTypeLabel(generatedDoc.type)}
Date : ${new Date().toLocaleDateString('fr-FR')}

Veuillez consulter le document et nous le retourner signé.

Cordialement,
Votre propriétaire`);
        
        // Ouvrir le client mail par défaut
        const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
        window.open(mailtoLink, '_blank');
        
        // Télécharger automatiquement le PDF pour que l'utilisateur puisse l'attacher manuellement
        const downloadLink = window.document.createElement('a');
        downloadLink.href = pdfUrl;
        downloadLink.download = `${generatedDoc.name}.pdf`;
        downloadLink.style.display = 'none';
        window.document.body.appendChild(downloadLink);
        downloadLink.click();
        window.document.body.removeChild(downloadLink);
        
        // Nettoyer l'URL
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 1000);
        
        // Mettre à jour le statut du document
        await documentStorage.updateDocumentStatus(generatedDoc.id, 'sent');
        await loadDocuments();
        
        alert(`Client mail ouvert avec le document "${generatedDoc.name}". Le fichier PDF a été téléchargé pour que vous puissiez l'attacher à votre email.`);
      } else {
        throw new Error('Impossible de générer le PDF');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      alert(`Erreur lors de l'envoi du document : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleDuplicateDocument = async (generatedDoc: GeneratedDocument) => {
    try {
      const duplicatedDocument: GeneratedDocument = {
        ...generatedDoc,
        id: 'doc_' + Math.random().toString(36).substr(2, 9),
        name: `${generatedDoc.name} (Copie)`,
        userId: generatedDoc.userId,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        signedAt: undefined,
        signatures: generatedDoc.signatures.map(sig => ({
          ...sig,
          id: 'sig_' + Math.random().toString(36).substr(2, 9),
          signedAt: undefined,
          signatureData: undefined
        }))
      };
      
      // Sauvegarder dans le stockage principal
      await documentStorage.saveDocument(duplicatedDocument);
      
      await loadDocuments();
      alert(`Document dupliqué : "${duplicatedDocument.name}"`);
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
    }
  };

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || document.type === filterType;
    const matchesStatus = filterStatus === 'all' || document.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'received':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sent':
        return <Send className="h-4 w-4 text-green-600" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
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

  const documentStats = {
    total: documents.length,
    draft: documents.filter(d => d.status === 'draft').length,
    pending: documents.filter(d => d.status === 'sent').length,
    sent: documents.filter(d => d.status === 'sent').length,
    signed: documents.filter(d => d.status === 'received').length
  };

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Générateur de documents</h1>
            <p className="text-gray-600">Créez et gérez vos documents locatifs</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('templates')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'templates'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Modèles
              </button>
              <button
                onClick={() => setViewMode('documents')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'documents'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mes documents
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {viewMode === 'documents' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total documents</p>
                  <p className="text-3xl font-bold text-gray-900">{documentStats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Brouillons</p>
                  <p className="text-3xl font-bold text-gray-900">{documentStats.draft}</p>
                </div>
                <Edit className="h-8 w-8 text-gray-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-3xl font-bold text-yellow-600">{documentStats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Signés</p>
                  <p className="text-3xl font-bold text-green-600">{documentStats.signed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={
                    viewMode === 'templates' ? "Rechercher un modèle..." : 
                    viewMode === 'documents' ? "Rechercher un document..." :
                    "Rechercher un template d'email..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les types</option>
                  <option value="lease">Contrats de bail</option>
                  <option value="inventory">États des lieux</option>
                  <option value="receipt">Quittances</option>
                  <option value="notice">Préavis</option>
                  <option value="insurance">Assurances</option>
                  <option value="other">Autres</option>
                </select>
                
                {viewMode === 'documents' && (
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="draft">Brouillons</option>
                    <option value="sent">En attente</option>
                    <option value="signed">Signés</option>
                    <option value="archived">Archivés</option>
                  </select>
                )}
                
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="h-5 w-5 text-gray-600" />
                </button>
              </div>
          </div>
        </div>

        {/* Templates Grid */}
        {viewMode === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500">{getTypeLabel(template.type)}</p>
                    </div>
                  </div>
                  {template.isRequired && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Obligatoire
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Conformité légale :</p>
                  <div className="flex flex-wrap gap-1">
                    {template.legalCompliance.map((law, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {law}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => handleCreateDocument(template)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Créer le document</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Documents List */}
        {viewMode === 'documents' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Document</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Bien/Locataire</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Date création</th>
                    <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDocuments.map((document) => {
                    const property = properties.find(p => p.id === document.propertyId);
                    const tenant = tenants.find(t => t.id === document.tenantId);
                    
                    return (
                      <tr key={document.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{document.name}</p>
                              {document.signedAt && (
                                <p className="text-sm text-gray-500">
                                  Signé le {document.signedAt.toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-900">{getTypeLabel(document.type)}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(document.status)}
                            <span className="text-sm text-gray-900">{getStatusLabel(document.status)}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            {property && (
                              <p className="text-gray-900">{property.name}</p>
                            )}
                            {tenant && (
                              <p className="text-gray-500">{tenant.firstName} {tenant.lastName}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-900">
                            {document.createdAt.toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDocument(document)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Voir"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(document)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Télécharger PDF"
                            >
                              <FileDown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleSendForSignature(document)}
                              className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Envoyer par email"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateDocument(document)}
                              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Dupliquer"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(document.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty States */}
        {viewMode === 'templates' && filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun modèle trouvé</h3>
            <p className="text-gray-600">Aucun modèle ne correspond à vos critères de recherche.</p>
          </div>
        )}

        {viewMode === 'documents' && filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Aucun document ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre premier document.'
              }
            </p>
            <button 
              onClick={() => setViewMode('templates')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voir les modèles
            </button>
          </div>
        )}

        {/* Document Form Modal */}
        {showDocumentForm && selectedTemplate && (
          <DocumentForm
            template={selectedTemplate}
            userId={'current-user'}
            properties={properties}
            tenants={tenants}
            onSave={handleDocumentSaved}
            onCancel={() => {
              setShowDocumentForm(false);
              setSelectedTemplate(null);
            }}
            isOpen={showDocumentForm}
          />
        )}

        {/* Document Viewer Modal */}
        {showDocumentPreview && selectedDocument && (
          <DocumentViewer
            document={selectedDocument}
            onClose={() => {
              setShowDocumentPreview(false);
              setSelectedDocument(null);
            }}
            isOpen={showDocumentPreview}
          />
        )}
      </div>
    </>
  );
};

export default DocumentGenerator;
