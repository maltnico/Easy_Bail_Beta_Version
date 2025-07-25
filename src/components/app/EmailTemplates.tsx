import React, { useState, useEffect } from 'react';
import { Mail, Plus, Search, Filter, Edit, Trash2, Copy, Send, Eye } from 'lucide-react';
import { emailTemplateService, EmailTemplate } from '../../lib/emailTemplateService';
import EmailTemplateEditor from './EmailTemplateEditor';

const EmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'tenant', label: 'Locataire' },
    { value: 'property', label: 'Bien' },
    { value: 'financial', label: 'Financier' },
    { value: 'administrative', label: 'Administratif' },
    { value: 'other', label: 'Autre' }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templates = await emailTemplateService.getTemplates();
      setTemplates(templates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    try {
      const newTemplate: EmailTemplate = {
        ...template,
        id: '', // Will be generated by the service
        name: `${template.name} (Copie)`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const success = await emailTemplateService.saveTemplate(newTemplate);
      if (success) {
        loadTemplates();
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return;
    try {
      const success = await emailTemplateService.deleteTemplate(templateId);
      if (success) {
        loadTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleSendTestEmail = async (template: EmailTemplate) => {
    setSendingEmail(template.id);
    try {
      // Simulate sending test email
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Email de test envoyé avec succès !');
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Erreur lors de l\'envoi de l\'email de test');
    } finally {
      setSendingEmail(null);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (category: string) => {
    return categories.find(cat => cat.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      tenant: 'bg-blue-100 text-blue-800',
      property: 'bg-green-100 text-green-800',
      financial: 'bg-purple-100 text-purple-800',
      administrative: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Mail className="mr-3 text-blue-600" />
            Templates Email
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos modèles d'emails pour automatiser vos communications
          </p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Template
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || selectedCategory !== 'all' ? 'Aucun template trouvé' : 'Aucun template créé'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par créer votre premier template email'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button
              onClick={handleCreateTemplate}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer un template
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 truncate flex-1 mr-2">
                    {template.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                    {getCategoryLabel(template.category)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 truncate">
                  <strong>Sujet:</strong> {template.subject}
                </p>
                
                <div className="bg-gray-50 rounded p-3 mb-4 h-20 overflow-hidden">
                  <p className="text-xs text-gray-600 line-clamp-4">
                    {template.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                  <span>Créé le {template.createdAt.toLocaleDateString()}</span>
                  <span>Modifié le {template.updatedAt.toLocaleDateString()}</span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors flex items-center justify-center"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Modifier
                  </button>
                  
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="bg-gray-50 text-gray-600 px-3 py-2 rounded text-sm hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => handleSendTestEmail(template)}
                    disabled={sendingEmail === template.id}
                    className="bg-green-50 text-green-600 px-3 py-2 rounded text-sm hover:bg-green-100 transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {sendingEmail === template.id ? (
                      <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="bg-red-50 text-red-600 px-3 py-2 rounded text-sm hover:bg-red-100 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Template Editor Modal */}
      {showEditor && (
        <EmailTemplateEditor
          isOpen={showEditor}
          onClose={() => {
            setShowEditor(false);
            loadTemplates();
          }}
          initialTemplate={editingTemplate || undefined}
        />
      )}
    </div>
  );
};

export default EmailTemplates;
