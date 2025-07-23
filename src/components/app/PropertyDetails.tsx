import React, { useState } from 'react';
import { 
  X, 
  Edit, 
  Trash2, 
  MapPin, 
  Home, 
  DollarSign, 
  Ruler, 
  Users,
  Calendar,
  Phone,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle,
  Camera,
  Download,
  Share2
} from 'lucide-react';
import { Property } from '../../types';

interface PropertyDetailsProps {
  property: Property;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  isOpen: boolean;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ 
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
      case 'occupied':
        return 'bg-green-100 text-green-800';
      case 'vacant':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'Occupé';
      case 'vacant':
        return 'Vacant';
      case 'maintenance':
        return 'En maintenance';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment':
        return 'Appartement';
      case 'house':
        return 'Maison';
      case 'studio':
        return 'Studio';
      case 'parking':
        return 'Parking';
      case 'commercial':
        return 'Local commercial';
      default:
        return type;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Home },
    { id: 'tenant', label: 'Locataire', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'finances', label: 'Finances', icon: DollarSign },
    { id: 'maintenance', label: 'Maintenance', icon: AlertTriangle }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Property Images */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="h-64 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Camera className="h-16 w-16 text-white opacity-50" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-30 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
            <Camera className="h-8 w-8 text-white opacity-50" />
          </div>
          <div className="h-30 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg flex items-center justify-center">
            <Camera className="h-8 w-8 text-white opacity-50" />
          </div>
        </div>
      </div>

      {/* Property Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Home className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900">{getTypeLabel(property.type)}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900">{property.address}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Ruler className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900">{property.surface}m²</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-gray-900">{property.rooms} pièces</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informations financières</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Loyer mensuel</span>
              <span className="font-semibold text-gray-900">{property.rent}€</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Charges</span>
              <span className="font-semibold text-gray-900">{property.charges}€</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-gray-900 font-medium">Total mensuel</span>
              <span className="font-bold text-lg text-gray-900">
                {property.rent + property.charges}€
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
          <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-900">Créer bail</span>
        </button>
        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
          <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-900">Planifier visite</span>
        </button>
        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
          <Download className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-900">Export PDF</span>
        </button>
        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
          <Share2 className="h-6 w-6 text-orange-600 mx-auto mb-2" />
          <span className="text-sm font-medium text-gray-900">Partager</span>
        </button>
      </div>
    </div>
  );

  const renderTenant = () => (
    <div className="space-y-6">
      {property.tenant ? (
        <>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Bien occupé</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Informations locataire</h4>
                <div className="space-y-2">
                  <p className="text-gray-900">
                    <span className="font-medium">Nom:</span> {property.tenant.firstName} {property.tenant.lastName}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{property.tenant.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{property.tenant.phone}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Informations bail</h4>
                <div className="space-y-2">
                  <p className="text-gray-900">
                    <span className="font-medium">Début:</span> {property.tenant.leaseStart.toLocaleDateString()}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-medium">Fin:</span> {property.tenant.leaseEnd.toLocaleDateString()}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-medium">Dépôt de garantie:</span> {property.tenant.deposit}€
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Contacter le locataire
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Voir le bail
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Bien vacant</h3>
          <p className="text-yellow-700 mb-4">
            Ce bien n'a actuellement pas de locataire.
          </p>
          <button className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
            Rechercher un locataire
          </button>
        </div>
      )}
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Documents du bien</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Nouveau document
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucun document associé à ce bien</p>
        <p className="text-sm text-gray-500 mt-2">
          Créez votre premier document pour ce bien
        </p>
      </div>
    </div>
  );

  const renderFinances = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Suivi financier</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">Revenus ce mois</p>
              <p className="text-xl font-bold text-green-900">{property.rent + property.charges}€</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Revenus annuels</p>
              <p className="text-xl font-bold text-blue-900">{(property.rent + property.charges) * 12}€</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Ruler className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600">€/m²</p>
              <p className="text-xl font-bold text-purple-900">
                {Math.round(property.rent / property.surface)}€
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Historique financier détaillé</p>
        <p className="text-sm text-gray-500 mt-2">
          Consultez l'onglet Finances pour plus de détails
        </p>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Maintenance et incidents</h3>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          Signaler un incident
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
        <p className="text-gray-600">Aucun incident signalé</p>
        <p className="text-sm text-gray-500 mt-2">
          Ce bien ne présente actuellement aucun problème
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'tenant':
        return renderTenant();
      case 'documents':
        return renderDocuments();
      case 'finances':
        return renderFinances();
      case 'maintenance':
        return renderMaintenance();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{property.name}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                  {getStatusLabel(property.status)}
                </span>
                <span className="text-sm text-gray-500">{getTypeLabel(property.type)}</span>
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

export default PropertyDetails;
