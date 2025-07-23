import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Dashboard from './Dashboard';
import Properties from './Properties';
import Tenants from './Tenants';
import DocumentGenerator from './DocumentGenerator';
import Tasks from './Tasks';
import Finances from './Finances';
import Automations from './Automations';
import Incidents from './Incidents';
import Settings from './Settings';
import RecentActivities from './RecentActivities';
import AlertsPage from './AlertsPage';
import EmailTemplates from './EmailTemplates';
import Support from './Support';

const AppLayout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    navigate('/login');
  };

  const handleNavigateToSection = (section: string) => {
    setActiveTab(section);
  };
  // Si pas d'utilisateur, ne pas afficher le layout (sera géré par App.tsx)
  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'properties':
        return <Properties />;
      case 'tenants':
        return <Tenants />;
      case 'documents':
        return <DocumentGenerator />;
      case 'tasks':
        return <Tasks />;
      case 'finances':
        return <Finances />;
      case 'automations':
        return <Automations />;
      case 'incidents':
        return <Incidents />;
      case 'alerts':
        return <AlertsPage />;
      case 'activities':
        return <RecentActivities />;
      case 'email_templates':
        return <EmailTemplates />;
      case 'settings':
        return <Settings />;
      case 'support':
        return <Support />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <TopBar onLogout={handleLogout} onNavigateToSection={handleNavigateToSection} />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
