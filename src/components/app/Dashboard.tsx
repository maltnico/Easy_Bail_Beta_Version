import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  FileText,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDatabase } from '../../hooks/useDatabase';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const { isConnected } = useDatabase();
  const [stats, setStats] = useState({
    properties: 0,
    tenants: 0,
    documents: 0,
    revenue: 0
  });

  useEffect(() => {
    // Charger les statistiques
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    // Simuler le chargement des stats
    setStats({
      properties: 12,
      tenants: 28,
      documents: 156,
      revenue: 45250
    });
  };

  const quickActions = [
    {
      title: 'Ajouter un bien',
      description: 'Créer une nouvelle propriété',
      icon: Home,
      action: () => setActiveTab('properties'),
      color: 'bg-blue-500'
    },
    {
      title: 'Nouveau locataire',
      description: 'Enregistrer un locataire',
      icon: Users,
      action: () => setActiveTab('tenants'),
      color: 'bg-green-500'
    },
    {
      title: 'Générer document',
      description: 'Créer un contrat ou état des lieux',
      icon: FileText,
      action: () => setActiveTab('documents'),
      color: 'bg-purple-500'
    },
    {
      title: 'Finances',
      description: 'Voir les revenus et dépenses',
      icon: DollarSign,
      action: () => setActiveTab('finances'),
      color: 'bg-yellow-500'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'property',
      title: 'Nouveau bien ajouté',
      description: 'Appartement 3 pièces - 15 rue de la Paix',
      time: '2 heures',
      icon: Home
    },
    {
      id: 2,
      type: 'tenant',
      title: 'Locataire enregistré',
      description: 'Marie Dubois - Appartement A12',
      time: '4 heures',
      icon: Users
    },
    {
      id: 3,
      type: 'document',
      title: 'Contrat généré',
      description: 'Bail commercial - Local rue du Commerce',
      time: '1 jour',
      icon: FileText
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* En-tête du tableau de bord */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.first_name} !
          </h1>
          <p className="text-gray-600">
            Voici un aperçu de votre activité de gestion locative
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!isConnected && (
            <div className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Mode hors ligne
            </div>
          )}
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Propriétés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.properties}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Locataires</p>
              <p className="text-2xl font-bold text-gray-900">{stats.tenants}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.documents}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Revenus (€)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.revenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${action.color} rounded-lg`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">{action.title}</p>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Activités récentes */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Activités récentes</h2>
        </div>
        <div className="divide-y">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="p-6 flex items-center space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <activity.icon className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;