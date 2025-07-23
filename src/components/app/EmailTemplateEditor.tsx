import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Mail, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Send,
  Copy,
  FileText,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Upload,
  FileUp
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { emailTemplateService, EmailTemplate } from '../../lib/emailTemplateService';
import { defaultEmailTemplates } from '../../lib/defaultEmailTemplates';
import { mailService } from '../../lib/mailService';

// Importer les types de documents
import { GeneratedDocument } from '../../types/documents';

export interface EmailTemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: EmailTemplate;
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ 
  isOpen, 
  onClose,
  initialTemplate
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(initialTemplate || null);
  const [isEditing, setIsEditing] = useState(!!initialTemplate);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  
  // État pour l'upload de fichier
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // État pour l'upload de fichier
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [editorKey, setEditorKey] = useState<number>(Date.now());
  
  // État pour les documents disponibles
  const [availableDocuments, setAvailableDocuments] = useState<GeneratedDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  
  const [formData, setFormData] = useState<Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>>({
    name: initialTemplate?.name || '',
    subject: initialTemplate?.subject || '',
    content: initialTemplate?.content || '',
    category: initialTemplate?.category || 'other',
    documentTemplateId: initialTemplate?.documentTemplateId
  });

  // Charger les templates depuis la base de données
  const loadTemplates = async () => {
    if (isOpen) {
      setLoadingTemplates(true);
      try {
        const templates = await emailTemplateService.getTemplates();
        setTemplates(templates);
      } catch (error) {
        console.error('Erreur lors du chargement des templates:', error);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des templates' });
      } finally {
        setLoadingTemplates(false);
      }
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [isOpen]);
  
  // Charger les documents disponibles
  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);
  
  // Fonction pour charger les documents disponibles
  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true);
      
      // Importer le service de stockage de documents
      const { documentStorage } = await import('../../lib/documentStorage');
      
      // Récupérer la liste des documents
      const documents = await documentStorage.getDocumentsList();
      setAvailableDocuments(documents);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };
  
  // Mettre à jour le formulaire si initialTemplate change
  useEffect(() => {
    if (initialTemplate) {
      setSelectedTemplate(initialTemplate);
      setFormData({
        name: initialTemplate.name,
        subject: initialTemplate.subject,
        content: initialTemplate.content,
        category: initialTemplate.category,
        documentTemplateId: initialTemplate.documentTemplateId
      });
      setIsEditing(true);
    }
  }, [initialTemplate]);

  // Exemple de template HTML par défaut
  const defaultHTMLTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4F46E5;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 20px;
      background-color: #f9f9f9;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #666;
    }
    .button {
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>EasyBail</h1>
  </div>
  <div class="content">
    <h2>Bonjour,</h2>
    <p>Voici votre message personnalisé.</p>
    <p>Détails de votre bien:</p>
    <ul>
      <li>Adresse: [Adresse du bien]</li>
      <li>Loyer: [Montant du loyer]€</li>
      <li>Charges: [Montant des charges]€</li>
    </ul>
    <a href="https://example.com" class="button">Voir plus de détails</a>
  </div>
  <div class="footer">
    <p>© 2025 EasyBail. Tous droits réservés.</p>
  </div>
</body>
</html>`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Auto-fill name from filename
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      setFormData(prev => ({
        ...prev,
        name: fileName
      }));
    }
  };
  
  const processUploadedFile = async () => {
    if (!uploadedFile) return;
    
    setIsUploading(true);
    try {
      const fileContent = await uploadedFile.text();
      
      // Update form with file content
      setFormData(prev => ({
        ...prev,
        content: fileContent
      }));
      setEditorKey(Date.now()); // Force editor to re-render with new content
      
      // Try to extract subject from HTML title if not set
      if (!formData.subject) {
        const titleMatch = fileContent.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          setFormData(prev => ({
            ...prev,
            subject: titleMatch[1]
          }));
        }
      }
      
      setMessage({ type: 'success', text: 'Template chargé avec succès' });
    } catch (error) {
      console.error('Erreur lors du chargement du fichier:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement du fichier' });
    } finally {
      setIsUploading(false);
      setUploadedFile(null);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setFormData({
      name: '',
      subject: '',
      content: defaultHTMLTemplate,
      category: 'other'
    });
    setIsEditing(true);
    setShowPreview(false);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category
    });
    setIsEditing(true);
    setShowPreview(false);
  };

  const handleViewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category
    });
    setIsEditing(false);
    setShowPreview(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      setLoading(true);
      try {
        const success = await emailTemplateService.deleteTemplate(templateId);
        
        if (success) {
          // Mettre à jour l'état local
          setTemplates(prev => prev.filter(t => t.id !== templateId));
          
          if (selectedTemplate?.id === templateId) {
            setSelectedTemplate(null);
            setIsEditing(false);
            setShowPreview(false);
          }
          
          setMessage({ type: 'success', text: 'Template supprimé avec succès' });
        } else {
          setMessage({ type: 'error', text: 'Erreur lors de la suppression du template' });
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du template:', error);
        setMessage({ type: 'error', text: 'Erreur lors de la suppression du template' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    setLoading(true);
    try {
      const newTemplate: EmailTemplate = {
        ...template,
        id: 'template_' + Date.now(), // ID temporaire qui sera remplacé par Supabase
        name: `${template.name} (copie)`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const success = await emailTemplateService.saveTemplate(newTemplate);
      
      if (success) {
        // Recharger les templates pour obtenir le nouvel ID généré par Supabase
        await loadTemplates();
        setMessage({ type: 'success', text: 'Template dupliqué avec succès' });
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la duplication du template' });
      }
    } catch (error) {
      console.error('Erreur lors de la duplication du template:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la duplication du template' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    setLoading(true);
    setMessage(null);
    
    if (!formData.name || !formData.subject || !formData.content) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires' });
      setLoading(false);
      return;
    }
    
    const templateToSave: EmailTemplate = {
      id: selectedTemplate?.id || '',
      ...formData,
      createdAt: selectedTemplate?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    try {
      const success = await emailTemplateService.saveTemplate(templateToSave);
      
      if (success) {
        // Recharger les templates pour obtenir les données à jour
        await loadTemplates();
        
        // Si c'était un nouveau template, trouver le template nouvellement créé
        if (!selectedTemplate) {
          const newTemplate = templates.find(t => 
            t.name === formData.name && 
            t.subject === formData.subject && 
            t.category === formData.category
          );
          if (newTemplate) {
            setSelectedTemplate(newTemplate);
          }
        }
        
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Template enregistré avec succès' });
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement du template' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du template:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement du template' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Veuillez saisir une adresse email de test' });
      return;
    }
    
    if (!selectedTemplate) {
      setMessage({ type: 'error', text: 'Aucun template sélectionné' });
      return;
    }
    
    setSendingTest(true);
    setMessage(null);
    
    try {
      // Vérifier si le service mail est configuré
      if (!mailService.isConfigured()) {
        setMessage({ 
          type: 'error', 
          text: 'Le service mail n\'est pas configuré. Veuillez configurer le serveur mail dans les paramètres d\'administration.' 
        });
        return;
      }
      
      // Données de test pour les variables
      const testData = {
        "tenant_name": "Jean Dupont",
        "tenant_email": testEmail,
        "property_name": "Appartement Test",
        "property_address": "15 rue de la Paix, 75001 Paris",
        "rent_amount": "1200",
        "charges_amount": "150",
        "total_amount": "1350",
        "month": "Janvier 2025",
        "landlord_name": "Pierre Martin"
      };
      
      // Traiter le template avec les données de test
      const processedTemplate = emailTemplateService.processTemplate(selectedTemplate.id, testData);
      
      if (!processedTemplate) {
        setMessage({ type: 'error', text: 'Erreur lors du traitement du template' });
        return;
      }
      
      // Envoyer l'email de test
      const result = await mailService.sendEmail({
        to: testEmail,
        subject: processedTemplate.subject,
        html: processedTemplate.content
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: `Email de test envoyé avec succès à ${testEmail}` });
        onClose(); // Fermer l'éditeur après l'envoi réussi
      } else {
        setMessage({ type: 'error', text: `Erreur lors de l'envoi: ${result.error}` });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Erreur lors de l'envoi: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      });
    } finally {
      setSendingTest(false);
    }
  };

  // Gérer l'upload de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      
      // Lire le contenu du fichier
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          const content = event.target.result;
          
          // Extraire le titre du document HTML si possible
          let subject = '';
          const titleMatch = content.match(/<title>(.*?)<\/title>/i);
          if (titleMatch && titleMatch[1]) {
            subject = titleMatch[1];
          }
          
          // Mettre à jour le formulaire
          setFormData(prev => ({
            ...prev,
            content,
            name: e.target.files?.[0].name.replace(/\.[^/.]+$/, "") || prev.name,
            subject: subject || prev.subject
          }));
          setEditorKey(Date.now()); // Force editor to re-render with new content
          
          setMessage({ type: 'success', text: 'Fichier HTML chargé avec succès' });
        }
      };
      reader.onerror = () => {
        setMessage({ type: 'error', text: 'Erreur lors de la lecture du fichier' });
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  // Importer un template par défaut
  const handleImportDefaultTemplate = (templateIndex: number) => {
    const template = defaultEmailTemplates[templateIndex];
    if (template) {
      // Reset the editor with new content
      setFormData({
        name: template.name,
        subject: template.subject,
        content: template.content,
        category: template.category
      });
      setEditorKey(Date.now()); // Force editor to re-render with new content
      setMessage({ type: 'success', text: `Template "${template.name}" importé avec succès` });
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'tenant':
        return 'Locataire';
      case 'property':
        return 'Bien';
      case 'financial':
        return 'Financier';
      case 'administrative':
        return 'Administratif';
      case 'other':
        return 'Autre';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tenant':
        return 'bg-blue-100 text-blue-800';
      case 'property':
        return 'bg-green-100 text-green-800';
      case 'financial':
        return 'bg-purple-100 text-purple-800';
      case 'administrative':
        return 'bg-orange-100 text-orange-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Éditeur de templates d'emails</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Templates List */}
          <div className="w-96 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4 space-y-4">
              <button
                onClick={handleCreateTemplate}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Nouveau template</span>
              </button>
              
              {loadingTemplates && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              )}
              
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un template..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <div className="mt-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">Toutes les catégories</option>
                    <option value="tenant">Locataire</option>
                    <option value="property">Bien</option>
                    <option value="financial">Financier</option>
                    <option value="administrative">Administratif</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>
            </div>
            
            {templates.length === 0 && !loadingTemplates && (
              <div className="p-8 text-center">
                <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun template trouvé</p>
                <p className="text-sm text-gray-400 mt-2">Créez votre premier template d'email</p>
              </div>
            )}
            
            <div className="divide-y divide-gray-200 mt-2">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 hover:bg-gray-100 cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => handleViewTemplate(template)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                      {getCategoryLabel(template.category)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{template.subject}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Modifié le {template.updatedAt.toLocaleDateString()}</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTemplate(template);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateTemplate(template);
                        }}
                        className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Dupliquer"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredTemplates.length === 0 && (
                <div className="p-8 text-center">
                  <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun template trouvé</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedTemplate || isEditing ? (
            <>
                {/* Template Editor/Viewer */}
                <div className="flex-1 overflow-y-auto p-6">
                  {message && (
                    <div className={`mb-4 p-4 rounded-lg ${
                      message.type === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-800' 
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {message.type === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        )}
                        <p className="text-sm font-medium">{message.text}</p>
                      </div>
                    </div>
                  )}
                  
                  {isEditing ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom du template *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Bienvenue au locataire"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sujet de l'email *
                          </label>
                          <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: Bienvenue dans votre nouveau logement"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Catégorie
                          </label>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="tenant">Locataire</option>
                            <option value="property">Bien</option>
                            <option value="financial">Financier</option>
                            <option value="administrative">Administratif</option>
                            <option value="other">Autre</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        {/* File Upload */}
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Importer un template HTML</h4>
                          <div className="flex items-center space-x-3">
                            <label className="flex-1">
                              <input
                                type="file"
                                accept=".html,.htm"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <div className="flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                                <FileUp className="h-5 w-5 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {uploadedFile ? uploadedFile.name : 'Choisir un fichier HTML'}
                                </span>
                              </div>
                            </label>
                            {uploadedFile && (
                              <button
                                onClick={processUploadedFile}
                                disabled={isUploading}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 disabled:opacity-50"
                              >
                                {isUploading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Upload className="h-4 w-4" />
                                )}
                                <span>Charger</span>
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Importez un fichier HTML pour créer un template rapidement
                          </p>
                        </div>
                        
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contenu HTML *
                          <span className="ml-2 text-xs text-blue-600">(Vous pouvez aussi importer un fichier HTML)</span>
                        </label>
                        <div className="mb-4 flex items-center space-x-4">
                          <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            <span>Importer un fichier HTML</span>
                            <input 
                              type="file" 
                              accept=".html,.htm" 
                              onChange={handleFileChange}
                              className="hidden" 
                            />
                          </label>
                          {selectedFile && (
                            <span className="text-sm text-gray-600">
                              Fichier sélectionné: {selectedFile.name}
                            </span>
                          )}
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Ou utilisez un template prédéfini :</p>
                          <div className="flex flex-wrap gap-2">
                            {defaultEmailTemplates.map((template, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleImportDefaultTemplate(index)}
                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                              >
                                {template.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-4">
                          <div className="flex-1">
                            <ReactQuill
                              theme="snow"
                              value={formData.content}
                              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                              style={{ height: '500px', marginBottom: '50px' }}
                              modules={{
                                toolbar: [
                                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                                  ['bold', 'italic', 'underline', 'strike'],
                                  [{ 'color': [] }, { 'background': [] }],
                                  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                  [{ 'align': [] }],
                                  ['link', 'image'],
                                  ['clean'],
                                  ['code-block']
                                ]
                              }}
                            />
                          </div>
                          <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                              <span className="font-medium text-gray-700">Aperçu</span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    const win = window.open('', '_blank');
                                    if (win) {
                                      win.document.write(formData.content);
                                      win.document.close();
                                    }
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                  Ouvrir dans un nouvel onglet
                                </button>
                              </div>
                            </div>
                            <div className="h-[468px] overflow-auto p-4">
                              <iframe
                                srcDoc={formData.content}
                                title="Email Preview"
                                className="w-full h-full border-0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Variables disponibles</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="space-y-1">
                            <p className="text-blue-800 font-medium">Locataire</p>
                            <ul className="list-disc list-inside text-blue-700">
                              <li>{"{{tenant_name}}"} - Nom du locataire</li>
                              <li>{"{{tenant_email}}"} - Email du locataire</li>
                              <li>{"{{tenant_phone}}"} - Téléphone du locataire</li>
                            </ul>
                          </div>
                          <div className="space-y-1">
                            <p className="text-blue-800 font-medium">Bien</p>
                            <ul className="list-disc list-inside text-blue-700">
                              <li>{"{{property_name}}"} - Nom du bien</li>
                              <li>{"{{property_address}}"} - Adresse du bien</li>
                              <li>{"{{property_type}}"} - Type de bien</li>
                            </ul>
                          </div>
                          <div className="md:col-span-2 mt-2 space-y-1">
                            <p className="text-blue-800 font-medium">Financier</p>
                            <ul className="list-disc list-inside text-blue-700">
                              <li>{"{{rent_amount}}"} - Montant du loyer</li>
                              <li>{"{{charges_amount}}"} - Montant des charges</li>
                              <li>{"{{total_amount}}"} - Montant total</li>
                              <li>{"{{month}}"} - Mois concerné</li>
                              <li>{"{{lease_start_date}}"} - Date de début du bail</li>
                              <li>{"{{lease_end_date}}"} - Date de fin du bail</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    
                    {/* Document à joindre */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document à joindre (optionnel)
                      </label>
                      <select
                        name="documentTemplateId"
                        value={formData.documentTemplateId || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Aucun document</option>
                        {loadingDocuments ? (
                          <option disabled>Chargement des documents...</option>
                        ) : (
                          availableDocuments.map(doc => (
                            <option key={doc.id} value={doc.id}>{doc.name}</option>
                          ))
                        )}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Sélectionnez un document à joindre automatiquement aux emails envoyés avec ce template.
                      </p>
                    </div>
                    </div>
                  ) : showPreview && selectedTemplate ? (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Aperçu du template</h3>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Modifier
                          </button>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Sujet:</p>
                          <p className="text-gray-900 bg-white p-2 rounded border border-gray-300">{selectedTemplate.subject}</p>
                        </div>
                        <div>
                      {selectedTemplate.documentTemplateId && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Document joint:</p>
                          <p className="text-gray-900 bg-white p-2 rounded border border-gray-300">
                            {availableDocuments.find(doc => doc.id === selectedTemplate.documentTemplateId)?.name || selectedTemplate.documentTemplateId}
                          </p>
                        </div>
                      )}
                          <p className="text-sm font-medium text-gray-700 mb-1">Contenu:</p>
                          <div className="bg-white p-4 rounded border border-gray-300 overflow-auto max-h-[500px]">
                            <iframe
                              srcDoc={selectedTemplate.content}
                              title="Aperçu de l'email"
                              className="w-full h-[400px] border-0"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Envoyer un email de test</h3>
                        <div className="flex items-end space-x-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-blue-700 mb-2">
                              Adresse email de test *
                            </label>
                            <input
                              type="email"
                              value={testEmail}
                              onChange={(e) => setTestEmail(e.target.value)}
                              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="votre-email@example.com"
                            />
                          </div>
                          <button
                            onClick={handleSendTestEmail}
                            disabled={sendingTest || !mailService.isConfigured()}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                          >
                            {sendingTest ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Send className="h-5 w-5" />
                            )}
                            <span>Envoyer un test</span>
                          </button>
                        </div>
                        {!mailService.isConfigured() && (
                          <div className="mt-2 text-sm text-red-600">
                            Le service mail n'est pas configuré. Veuillez configurer le serveur mail dans les paramètres d'administration.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Mail className="h-16 w-16 text-blue-300 mx-auto mb-6" />
                        <h3 className="text-xl font-medium text-gray-900 mb-4">Éditeur de templates d'emails</h3>
                        <p className="text-gray-600 mb-6">
                          Créez et gérez des templates d'emails personnalisés pour communiquer avec vos locataires,
                          envoyer des quittances, des rappels de paiement et plus encore.
                        </p>
                        <button
                          onClick={handleCreateTemplate}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                        >
                          <Plus className="h-5 w-5" />
                          <span>Créer un template</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Footer Actions */}
                <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          if (selectedTemplate) {
                            setShowPreview(true);
                          } else {
                            setSelectedTemplate(null);
                          }
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveTemplate}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Save className="h-5 w-5" />
                        )}
                        <span>Enregistrer</span>
                      </button>
                    </>
                  ) : selectedTemplate ? (
                    <>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditTemplate(selectedTemplate)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        >
                          <Edit className="h-5 w-5" />
                          <span>Modifier</span>
                        </button>
                        <button
                          onClick={() => handleDuplicateTemplate(selectedTemplate)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
                        >
                          <Copy className="h-5 w-5" />
                          <span>Dupliquer</span>
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowPreview(!showPreview)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          {showPreview ? (
                            <>
                              <Edit className="h-5 w-5" />
                              <span>Modifier</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-5 w-5" />
                              <span>Aperçu</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        >
                          <Trash2 className="h-5 w-5" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
            </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md px-6">
                  <Mail className="h-16 w-16 text-blue-300 mx-auto mb-6" />
                  <h3 className="text-xl font-medium text-gray-900 mb-4">Éditeur de templates d'emails</h3>
                  <p className="text-gray-600 mb-6">
                    Créez et gérez des templates d'emails personnalisés pour communiquer avec vos locataires,
                    envoyer des quittances, des rappels de paiement et plus encore.
                  </p>
                  <button
                    onClick={handleCreateTemplate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Créer un template</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;
