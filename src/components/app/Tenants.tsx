import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  FileText,
  Clock,
  MapPin,
  Loader2
} from 'lucide-react';
import { useProperties } from '../../hooks/useProperties';
import { useTenants } from '../../hooks/useTenants';
import TenantForm from './TenantForm';
import TenantDetails from './TenantDetails';

const Tenants = () => {
  const { properties, loading: propertiesLoading } = useProperties();
  const { 
    tenants, 
    loading, 
    error, 
    createTenant, 
    updateTenant, 
    deleteTenant 
  } = useTenants();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showTenantForm, setShowTenantForm] = useState(false);
  const [showTenantDetails, setShowTenantDetails] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [editingTenant, setEditingTenant] = useState<any>(null);

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'notice':
        return 'bg-red-100 text-red-800';
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
        return 'Préavis';
      case 'former':
        return 'Ancien';
      default:
        return status;
    }
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.name || 'Bien inconnu';
  };

  const getPropertyDetails = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property || null;
  };
  const handleAddTenant = () => {
    setEditingTenant(null);
    setShowTenantForm(true);
  };

  const handleEditTenant = (tenant: any) => {
    setEditingTenant(tenant);
    setShowTenantForm(true);
  };

  const handleViewTenant = (tenant: any) => {
    setSelectedTenant(tenant);
    setShowTenantDetails(true);
  };

  const handleDeleteTenant = (tenantId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce locataire ?')) {
      deleteTenant(tenantId).catch(err => {
        console.error('Erreur lors de la suppression:', err);
      });
    }
  };

  const handleSaveTenant = async (tenantData: any) => {
    try {
      if (editingTenant) {
        await updateTenant(editingTenant.id, tenantData);
      } else {
        await createTenant(tenantData);
      }
      setShowTenantForm(false);
      setEditingTenant(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
    }
  };

  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const noticeTenants = tenants.filter(t => t.status === 'notice').length;
  const totalRent = tenants
    .filter(t => t.status === 'active')
    .reduce((sum, t) => sum + t.rent, 0);

  const upcomingLeaseEnds = tenants
    .filter(t => t.status === 'active')
    .filter(t => {
      const endDate = new Date(t.leaseEnd);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      return endDate <= threeMonthsFromNow;
    });

  // Afficher un loader si les données sont en cours de chargement
  if (loading || propertiesLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des locataires...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Locataires</h1>
          <p className="text-gray-600">Gérez vos locataires et leurs baux</p>
        </div>
        <button
          onClick={handleAddTenant}
          disabled={loading || properties.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter un locataire</span>
        </button>
      </div>

      {/* No Properties Warning */}
      {properties.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="text-yellow-800 font-medium">Aucun bien disponible</p>
            <p className="text-yellow-700 text-sm">
              Vous devez d'abord créer des biens immobiliers avant d'ajouter des locataires.
            </p>
          </div>
        </div>
      )}
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Erreur</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && !propertiesLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Locataires actifs</p>
              <p className="text-3xl font-bold text-green-600">{activeTenants}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En préavis</p>
              <p className="text-3xl font-bold text-yellow-600">{noticeTenants}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
              <p className="text-3xl font-bold text-blue-600">{totalRent.toLocaleString()}€</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fins de bail</p>
              <p className="text-3xl font-bold text-orange-600">{upcomingLeaseEnds.length}</p>
              <p className="text-xs text-gray-500">Dans 3 mois</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        </div>
      )}

      {/* Alerts */}
      {upcomingLeaseEnds.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="font-medium text-orange-900">Fins de bail à venir</h3>
              <p className="text-orange-700 text-sm">
                {upcomingLeaseEnds.length} bail(s) se termine(nt) dans les 3 prochains mois
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {!loading && !propertiesLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un locataire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="notice">En préavis</option>
              <option value="former">Anciens</option>
            </select>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        </div>
      )}

      {/* Tenants List */}
      {!loading && !propertiesLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Locataire</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Bien</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Bail</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Loyer</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Contact</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTenants.map((tenant) => {
                const propertyDetails = getPropertyDetails(tenant.propertyId);
                return (
                <tr key={tenant.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {tenant.firstName} {tenant.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Depuis le {new Date(tenant.leaseStart).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {propertyDetails ? (
                      <div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {propertyDetails.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 ml-6">
                          {propertyDetails.address}
                        </p>
                        <div className="flex items-center space-x-2 mt-1 ml-6">
                          <span className="text-xs text-gray-500">
                            {propertyDetails.surface}m² • {propertyDetails.rooms} pièces
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-red-600">
                          Bien introuvable
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tenant.status)}`}>
                      {getStatusLabel(tenant.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {new Date(tenant.leaseEnd).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.ceil((new Date(tenant.leaseEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jours restants
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{tenant.rent}€</div>
                      <div className="text-xs text-gray-500">
                        Dépôt: {tenant.deposit}€
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(`mailto:${tenant.email}`)}
                        className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Envoyer un email"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => window.open(`tel:${tenant.phone}`)}
                        className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                        title="Appeler"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewTenant(tenant)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditTenant(tenant)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTenant(tenant.id)}
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

      {filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun locataire trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'Aucun locataire ne correspond à vos critères de recherche.'
              : 'Commencez par ajouter votre premier locataire.'
            }
          </p>
          <button 
            onClick={handleAddTenant}
            disabled={properties.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ajouter un locataire
          </button>
        </div>
      )}

      {/* Tenant Form Modal */}
      <TenantForm
        tenant={editingTenant}
        properties={properties}
        onSave={handleSaveTenant}
        onCancel={() => {
          setShowTenantForm(false);
          setEditingTenant(null);
        }}
        isOpen={showTenantForm}
      />

      {/* Tenant Details Modal */}
      {selectedTenant && (
        <TenantDetails
          tenant={selectedTenant}
          property={getPropertyDetails(selectedTenant.propertyId)}
          onEdit={() => {
            setShowTenantDetails(false);
            handleEditTenant(selectedTenant);
          }}
          onDelete={() => {
            setShowTenantDetails(false);
            handleDeleteTenant(selectedTenant.id);
          }}
          onClose={() => {
            setShowTenantDetails(false);
            setSelectedTenant(null);
          }}
          isOpen={showTenantDetails}
        />
      )}
    </div>
  );
};

export default Tenants;
