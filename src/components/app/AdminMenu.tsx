import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  X,
  ChevronRight,
  BarChart3,
  Mail,
  Send
} from 'lucide-react';
import MailServerConfig from './MailServerConfig';
import EmailTemplateEditor from './EmailTemplateEditor';
import MJMLTemplateEditor from './MJMLTemplateEditor';
import EmailTemplates from './EmailTemplates';
import EmailQueue from './EmailQueue.tsx';
import AdminUsers from './AdminUsers';
import AdminLogs from './AdminLogs';
import AdminDashboard from './AdminDashboard';
import { supabase } from '../../lib/supabase';

// Fonction pour vérifier si l'utilisateur est admin
const isUserAdmin = (user: any): boolean => {
  // Vérifier l'email admin
  if (user?.email === 'admin@easybail.pro' || user?.user_metadata?.email === 'admin@easybail.pro') {
    return true;
  }
  
  // Vérifier le rôle dans les métadonnées utilisateur
  if (user?.user_metadata?.role === 'admin') {
    return true;
  }
  
  // Vérifier le rôle dans le profil
  if (user?.role === 'admin' || user?.user_metadata?.role === 'admin') {
    return true;
  }
  
  return false;
};

interface AdminMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminMenu: React.FC<AdminMenuProps> = ({ isOpen, onClose }) => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showEmailTemplateEditor, setShowEmailTemplateEditor] = useState(false);
  const [showMJMLTemplateEditor, setShowMJMLTemplateEditor] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Vérifier l'utilisateur au chargement
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Récupérer aussi le profil complet pour vérifier le rôle
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setCurrentUser(profile);
      }
    };
    
    if (isOpen) {
      checkUser();
    }
  }, [isOpen]);
  
  // Vérifier les droits d'accès
  const userIsAdmin = isUserAdmin(user) || currentUser?.role === 'admin';

  if (!isOpen) return null;
  
  // Si l'utilisateur n'est pas admin, afficher un message d'erreur
  if (!userIsAdmin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Accès refusé</h2>
                <p className="text-sm text-gray-600">Vue globale de tous les comptes utilisateurs</p>
              </div>
            </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">
              Vous n'avez pas les droits nécessaires pour accéder au panneau d'administration.
              Seuls les administrateurs peuvent accéder à cette section.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'mail', label: 'Serveur mail', icon: Mail },
    { id: 'email_templates', label: 'Templates mail', icon: Send },
    { id: 'email_queue', label: 'File d\'attente', icon: Mail },
    { id: 'logs', label: 'Journaux', icon: BarChart3 }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AdminDashboard />
        );
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Gestion des utilisateurs</h3>
              <div className="text-sm text-gray-500">
                Administration des comptes utilisateurs
              </div>
            </div>
            <AdminUsers />
          </div>
        );
      case 'mail':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration du serveur mail</h3>
            <MailServerConfig />
          </div>
        );
      case 'email_queue':
        return (
          <EmailQueue />
        );
      case 'email_templates':
        return (
          <EmailTemplates />
        );
      case 'logs':
        return (
          <AdminLogs />
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <>
        <div className="absolute inset-y-0 right-0 max-w-7xl w-full bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Administration</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
              <nav className="p-4 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 min-w-0">
              {renderTabContent()}
            </div>
          </div>
        </div>
        
        {/* Email Template Editor Modal */}
        <EmailTemplateEditor 
          isOpen={showEmailTemplateEditor} 
          onClose={() => setShowEmailTemplateEditor(false)} 
        />
        
        {/* MJML Template Editor Modal */}
        <MJMLTemplateEditor 
          isOpen={showMJMLTemplateEditor} 
          onClose={() => setShowMJMLTemplateEditor(false)} 
        />
      </>
    </div>
  );
};

export default AdminMenu;
