import React, { useState } from 'react';
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageSquare, 
  Send, 
  User, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Search,
  Book,
  Video,
  Download,
  ExternalLink,
  Star,
  ThumbsUp,
  MessageCircle,
  Loader2,
  Info,
  X,
  Upload
} from 'lucide-react';

const Support = () => {
  const [activeTab, setActiveTab] = useState('contact');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    priority: 'medium',
    message: '',
    attachments: [] as File[]
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const categories = [
    { value: 'general', label: 'Question générale', icon: '❓' },
    { value: 'technical', label: 'Problème technique', icon: '🔧' },
    { value: 'billing', label: 'Facturation', icon: '💳' },
    { value: 'feature', label: 'Demande de fonctionnalité', icon: '💡' },
    { value: 'bug', label: 'Signaler un bug', icon: '🐛' },
    { value: 'account', label: 'Compte utilisateur', icon: '👤' }
  ];

  const priorities = [
    { value: 'low', label: 'Basse', color: 'bg-green-100 text-green-800', icon: '🟢' },
    { value: 'medium', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
    { value: 'high', label: 'Haute', color: 'bg-red-100 text-red-800', icon: '🔴' }
  ];

  const faqItems = [
    {
      question: "Comment créer mon premier bien immobilier ?",
      answer: "Rendez-vous dans l'onglet 'Mes biens' et cliquez sur 'Ajouter un bien'. Remplissez les informations requises comme le nom, l'adresse, le type de bien, la surface et le loyer.",
      category: "Démarrage"
    },
    {
      question: "Comment générer une quittance de loyer ?",
      answer: "Allez dans 'Documents', sélectionnez le modèle 'Quittance de loyer', remplissez les informations du locataire et du bien, puis générez le document.",
      category: "Documents"
    },
    {
      question: "Comment configurer les automatisations ?",
      answer: "Dans l'onglet 'Automatisations', cliquez sur 'Nouvelle automatisation', choisissez le type (quittances, révision loyer, etc.) et définissez la fréquence d'exécution.",
      category: "Automatisations"
    },
    {
      question: "Comment exporter mes données financières ?",
      answer: "Dans la section 'Finances', onglet 'Rapports', vous pouvez créer et télécharger des rapports personnalisés au format PDF, CSV ou Excel.",
      category: "Finances"
    },
    {
      question: "Comment configurer le serveur mail ?",
      answer: "Accédez au menu Administration (icône bouclier), puis 'Serveur mail'. Configurez vos paramètres SMTP pour l'envoi automatique d'emails.",
      category: "Configuration"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const removeAttachment = (index: number) => {
    setContactForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Vérifier le nombre total de fichiers (max 5)
      if (contactForm.attachments.length + files.length > 5) {
        setMessage({
          type: 'error',
          text: 'Vous ne pouvez joindre que 5 fichiers maximum.'
        });
        return;
      }
      
      // Vérifier la taille de chaque fichier (max 10MB)
      const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setMessage({
          type: 'error',
          text: `Les fichiers suivants dépassent 10MB : ${oversizedFiles.map(f => f.name).join(', ')}`
        });
        return;
      }
      
      // Vérifier les types de fichiers
      const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt', '.zip'];
      const invalidFiles = files.filter(file => {
        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        return !allowedTypes.includes(extension);
      });
      
      if (invalidFiles.length > 0) {
        setMessage({
          type: 'error',
          text: `Types de fichiers non autorisés : ${invalidFiles.map(f => f.name).join(', ')}`
        });
        return;
      }
      
      setContactForm(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
      setMessage(null); // Effacer les messages d'erreur précédents
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validation basique
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.subject.trim() || !contactForm.message.trim()) {
      setMessage({
        type: 'error',
        text: 'Veuillez remplir tous les champs obligatoires.'
      });
      setLoading(false);
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      setMessage({
        type: 'error',
        text: 'Veuillez saisir une adresse email valide.'
      });
      setLoading(false);
      return;
    }

    try {
      // Préparer les données du formulaire
      const formData = {
        ...contactForm,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Sauvegarder la demande localement pour référence
      const existingRequests = JSON.parse(localStorage.getItem('support_requests') || '[]');
      const newRequest = {
        id: Date.now().toString(),
        ...formData,
        status: 'sent'
      };
      existingRequests.push(newRequest);
      localStorage.setItem('support_requests', JSON.stringify(existingRequests));

      // Simuler l'envoi (en production, ceci ferait appel à une API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessage({
        type: 'success',
        text: `Votre demande a été envoyée avec succès ! Référence: #${newRequest.id.slice(-6)}. Notre équipe vous répondra dans les plus brefs délais à l'adresse ${contactForm.email}.`
      });
      
      // Réinitialiser le formulaire
      setContactForm({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        priority: 'medium',
        message: '',
        attachments: []
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'envoi de votre demande. Veuillez vérifier votre connexion et réessayer.'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContactForm = () => (
    <div className="space-y-6">
      {/* Contact Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Nous contacter</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Email</p>
              <a href="mailto:admin@easybail.pro?subject=Demande de support EasyBail" className="text-blue-700 hover:text-blue-800 transition-colors">
                admin@easybail.pro
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Téléphone</p>
              <a href="tel:0180914282" className="text-blue-700 hover:text-blue-800 transition-colors">
                01 80 91 42 82
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-blue-900">Horaires</p>
              <p className="text-blue-700">7j/7 - 9h à 18h</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Temps de réponse moyen</p>
              <p className="text-blue-700">Moins de 2 heures</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-blue-900">Satisfaction client</p>
              <div className="flex items-center space-x-1">
                <span className="text-blue-700">4.9/5</span>
                <div className="flex text-yellow-400">
                  ⭐⭐⭐⭐⭐
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 ${
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

      {/* Contact Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Formulaire de contact</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Jean Dupont"
                  maxLength={100}
                />
              </div>
              {contactForm.name.length > 80 && (
                <p className="mt-1 text-xs text-gray-500">{100 - contactForm.name.length} caractères restants</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jean.dupont@email.com"
                  maxLength={150}
                />
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sujet *
            </label>
            <input
              type="text"
              name="subject"
              value={contactForm.subject}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez brièvement votre demande"
              maxLength={200}
            />
            {contactForm.subject.length > 150 && (
              <p className="mt-1 text-xs text-gray-500">{200 - contactForm.subject.length} caractères restants</p>
            )}
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                name="category"
                value={contactForm.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorité
              </label>
              <select
                name="priority"
                value={contactForm.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.icon} {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez votre demande en détail..."
                maxLength={2000}
              />
            </div>
            {contactForm.message.length > 1800 && (
              <p className="mt-1 text-xs text-gray-500">{2000 - contactForm.message.length} caractères restants</p>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pièces jointes <span className="text-gray-500">(optionnel)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2 font-medium">Glissez-déposez vos fichiers ici</p>
              <p className="text-sm text-gray-500 mb-4">ou cliquez pour sélectionner</p>
              <label className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Choisir des fichiers</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.zip"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Formats acceptés: PDF, DOC, DOCX, JPG, PNG, TXT, ZIP (max 10MB par fichier, 5 fichiers max)
              </p>
            </div>
            
            {/* Attachments List */}
            {contactForm.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">Fichiers sélectionnés :</p>
                {contactForm.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Supprimer ce fichier"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informations légales */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Info className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="text-gray-800 font-medium mb-1">Protection des données</p>
                <p className="text-gray-600">
                  Vos données personnelles sont traitées conformément à notre politique de confidentialité. 
                  Elles ne seront utilisées que pour traiter votre demande de support et ne seront pas transmises à des tiers.
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Temps de réponse :</strong> Nous nous engageons à vous répondre dans les 2 heures suivant la réception de votre demande.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Besoin d'aide urgente ?</span>
              <a href="tel:0180914282" className="text-blue-600 hover:text-blue-700 ml-1">
                Appelez-nous au 01 80 91 42 82
              </a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 font-medium"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span>{loading ? 'Envoi en cours...' : 'Envoyer ma demande'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Questions fréquemment posées</h3>
        
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <HelpCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{item.question}</span>
                  </div>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="bg-blue-50 p-4 rounded-lg mt-3">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mb-2">
                      {item.category}
                    </span>
                    <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResources = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Centre de ressources</h3>
        <p className="text-gray-600">Accédez à notre documentation complète et nos outils d'aide</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Documentation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Book className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Documentation</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Guides complets et documentation technique pour utiliser EasyBail.
          </p>
          <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium">
            <ExternalLink className="h-4 w-4" />
            <span>Accéder à la documentation</span>
          </button>
        </div>

        {/* Video Tutorials */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Video className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Tutoriels vidéo</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Apprenez à utiliser EasyBail avec nos tutoriels vidéo pas à pas.
          </p>
          <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 font-medium">
            <ExternalLink className="h-4 w-4" />
            <span>Voir les tutoriels</span>
          </button>
        </div>

        {/* Downloads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Download className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Téléchargements</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Modèles de documents, guides PDF et autres ressources utiles.
          </p>
          <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 font-medium">
            <Download className="h-4 w-4" />
            <span>Télécharger les ressources</span>
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Liens utiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Book className="h-5 w-5 text-blue-600" />
            <span className="text-gray-900">Guide de démarrage rapide</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="h-5 w-5 text-green-600" />
            <span className="text-gray-900">Modèles de documents</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Video className="h-5 w-5 text-purple-600" />
            <span className="text-gray-900">Formation en ligne</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <MessageCircle className="h-5 w-5 text-orange-600" />
            <span className="text-gray-900">Forum communautaire</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Phone className="h-5 w-5 text-green-600" />
            <span className="text-gray-900">Support téléphonique</span>
          </a>
          <a href="#" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <Mail className="h-5 w-5 text-purple-600" />
            <span className="text-gray-900">Nous écrire</span>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Support & Aide</h1>
        <p className="text-gray-600">Trouvez de l'aide et contactez notre équipe support</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Temps de réponse</p>
              <p className="text-3xl font-bold text-blue-600">2h</p>
              <p className="text-sm text-gray-500">En moyenne</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction</p>
              <p className="text-3xl font-bold text-green-600">98%</p>
              <p className="text-sm text-gray-500">Clients satisfaits</p>
            </div>
            <ThumbsUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disponibilité</p>
              <p className="text-3xl font-bold text-purple-600">7j/7</p>
              <p className="text-sm text-gray-500">Support actif</p>
            </div>
            <MessageCircle className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Note moyenne</p>
              <p className="text-3xl font-bold text-yellow-600">4.9</p>
              <p className="text-sm text-gray-500">⭐⭐⭐⭐⭐</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'contact'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>Nous contacter</span>
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'faq'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>FAQ</span>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'resources'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Book className="h-4 w-4" />
              <span>Ressources</span>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'contact' && renderContactForm()}
          {activeTab === 'faq' && renderFAQ()}
          {activeTab === 'resources' && renderResources()}
        </div>
      </div>
    </div>
  );
};

export default Support;
