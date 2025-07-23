import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Phone, 
  Mail,
  MapPin,
  Calendar,
  Edit3,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useDatabase } from '../../hooks/useDatabase';
import TenantForm from './TenantForm';

interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  property_name?: string;
  lease_start?: string;
  lease_end?: string;
  rent: number;
  status: 'active' | 'inactive' | 'pending' | 'terminated';
}

const Tenants: React.FC = () => {
  const { user } = useAuth();
  const { isConnected } = useDatabase();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      // Simuler le chargement des locataires
      const mockTenants: Tenant[] = [
        {
          id: '1',
          first_name: 'Marie',
          last_name: 'Dubois',
          email: 'marie.dubois@email.com',
          phone: '06 12 34 56 78',
          property_name: 'Appartement A12 - 15 rue de la Paix',
          lease_start: '2024-01-01',
          lease_end: '2025-01-01',
          rent: 850,
          status: 'active'
        },
        {
          id: '2',
          first_name: 'Pierre',
          last_name: 'Martin',
          email: 'pierre.martin@email.com',
          phone: '06 98 76 54 32',
          property_name: 'Studio B5 - 8 avenue des Fleurs',
          lease_start: '2024-03-15',
          lease_end: '2025-03-15',
          rent: 650,
          status: 'active'
        },
        {
          id: '3',
          first_name: 'Sophie',
          last_name: 'Bernard',
          email: 'sophie.bernard@email.com',
          phone: '06 11 22 33 44',
          property_name: 'Maison C1 - 25 rue du Commerce',
          lease_start: '2023-09-01',
          lease_end: '2024-09-01',
          rent: 1200,
          status: 'terminated'
        }
      ];
      
      setTenants(mockTenants);
    } catch (error) {
      console.error('Erreur lors du chargement des locataires:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.property_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'pending':
        return 'En attente';
      case 'terminated':
        return 'Terminé';
      case 'inactive':
        return 'Inactif';
      default:
        return status;
    }
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowForm(true);
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce locataire ?')) {
      try {
        setTenants(tenants.filter(t => t.id !== tenantId));
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Locataires</h1>
          <p className="text-gray-600">Gérez vos locataires et leurs contrats</p>
        </div>
        <button
          onClick={() => {
            setSelectedTenant(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau locataire
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un locataire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="terminated">Terminé</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des locataires */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {filteredTenants.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun locataire trouvé</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucun locataire ne correspond à vos critères de recherche.'
                : 'Commencez par ajouter votre premier locataire.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredTenants.map((tenant) => (
              <div key={tenant.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {tenant.first_name} {tenant.last_name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(tenant.status)}`}>
                            {getStatusLabel(tenant.status)}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {tenant.email}
                          </div>
                          {tenant.phone && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              {tenant.phone}
                            </div>
                          )}
                          {tenant.property_name && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {tenant.property_name}
                            </div>
                          )}
                          {tenant.lease_start && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Bail: {new Date(tenant.lease_start).toLocaleDateString()} - {tenant.lease_end && new Date(tenant.lease_end).toLocaleDateString()}
                            </div>
                          )}
                          <div className="flex items-center font-medium">
                            Loyer: {tenant.rent}€/mois
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditTenant(tenant)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTenant(tenant.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de formulaire */}
      {showForm && (
        <TenantForm
          tenant={selectedTenant}
          onClose={() => {
            setShowForm(false);
            setSelectedTenant(null);
          }}
          onSave={() => {
            setShowForm(false);
            setSelectedTenant(null);
            loadTenants();
          }}
        />
      )}
    </div>
  );
};

export default Tenants;