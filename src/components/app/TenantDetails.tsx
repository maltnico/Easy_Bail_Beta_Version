import React, { useState } from 'react';
import { 
  X, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle,
  Download,
  Send,
  Clock,
  Home
} from 'lucide-react';
import { Tenant, Property } from '../../types';

interface TenantDetailsProps {
  tenant: Tenant;
  property?: Property;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  isOpen: boolean;
}

const TenantDetails: React.FC<TenantDetailsProps> = ({ 
  tenant, 
  property,
  onEdit, 
  onDelete, 
  onClose, 
  isOpen 
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'notice':
        return 'bg-yellow-100 text-yellow-800';
      case 'former':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'notice':
        return 'En préavis';
      case 'former':
        return 'Ancien locataire';
      default:
        return status;
    }
  };

  const daysUntilLeaseEnd = Math.ceil(
    (tenant.leaseEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: User },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'payments', label: 'Paiements', icon: DollarSign },
    { id: 'communication', label: 'Communication', icon: Mail }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Tenant Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900">{tenant.firstName} {tenant.lastName}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <a 
                href={`mailto:${tenant.email}`}
                className="text-blue-600 hover:text-blue-700"
              >
                {tenant.email}
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <a 
                href={`tel:${tenant.phone}`}
                className="text-blue-600 hover:text-blue-700"
              >
                {tenant.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informations du bail</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <span className="text-gray-900">
                  Du {tenant.leaseStart.toLocaleDateString()} au {tenant.leaseEnd.toLocaleDateString()}
                </span>
                <p className="text-sm text-gray-500">
                  {daysUntilLeaseEnd > 0 ? `${daysUntilLeaseEnd} jours restants` : 'Bail expiré'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <span className="text-gray-900">{tenant.rent}€/mois</span>
                <p className="text-sm text-gray-500">Dépôt: {tenant.deposit}€</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Information */}
      {property && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Home className="h-5 w-5 mr-2" />
            Informations du bien
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Nom du bien</p>
              <p className="text-gray-900">{property.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Type</p>
              <p className="text-gray-900 capitalize">{property.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Surface</p>
              <p className="text-gray-900">{property.surface}m²</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pièces</p>
              <p className="text-gray-900">{property.rooms}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Adresse complète</p>
            <p className="text-gray-900">{property.address}</p>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Loyer du bien</p>
              <p className="text-gray-900">{property.rent}€/mois</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Charges</p>
              <p className="text-gray-900">{property.charges}€/mois</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-gray-900 font-semibold">{property.rent + property.charges}€/mois</p>
            </div>
          </div>
        </div>
      )}

      {!property && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-medium text-red-900">Bien introuvable</h4>
              <p className="text-red-700 text-sm">
                Le bien associé à ce locataire n'existe plus ou a été supprimé.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Alert */}
      {tenant.status === 'notice' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-900">Locataire en préavis</h4>
              <p className="text-yellow-700 text-sm">
                Ce locataire a donné son préavis. Pensez à organiser les visites et l'état des lieux de sortie.
              </p>
            </div>
          </div>
        </div>
      )}

      {daysUntilLeaseEnd <= 90 && daysUntilLeaseEnd > 0 && tenant.status === 'active' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <h4 className="font-medium text-orange-900">Fin de bail proche</h4>
              <p className="text-orange-700 text-sm">
                Le bail se termine dans {daysUntilLeaseEnd} jours. Contactez le locataire pour le renouvellement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
          <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-900">Générer quittance</span>
        </button>
        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
          <Send className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-900">Envoyer email</span>
        </button>
        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
          <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-900">Planifier visite</span>
        </button>
        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
          <Download className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-900">Export données</span>
        </button>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Documents du locataire</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Nouveau document
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucun document associé à ce locataire</p>
        <p className="text-sm text-gray-500 mt-2">
          Créez votre premier document pour ce locataire
        </p>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Historique des paiements</h3>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          Enregistrer paiement
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600">Paiements à jour</p>
              <p className="text-xl font-bold text-green-900">100%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600">Total perçu</p>
              <p className="text-xl font-bold text-blue-900">{tenant.rent * 3}€</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600">Prochain paiement</p>
              <p className="text-xl font-bold text-purple-900">
                {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Historique des paiements détaillé</p>
        <p className="text-sm text-gray-500 mt-2">
          Consultez l'onglet Finances pour plus de détails
        </p>
      </div>
    </div>
  );

  const renderCommunication = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Historique des communications</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Nouveau message
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucune communication enregistrée</p>
        <p className="text-sm text-gray-500 mt-2">
          Les emails et appels seront enregistrés ici
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'documents':
        return renderDocuments();
      case 'payments':
        return renderPayments();
      case 'communication':
        return renderCommunication();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {tenant.firstName} {tenant.lastName}
              </h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                  {getStatusLabel(tenant.status)}
                </span>
                <span className="text-sm text-gray-500">
                  Locataire depuis le {tenant.leaseStart.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default TenantDetails;
