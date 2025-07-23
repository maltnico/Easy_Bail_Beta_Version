import React, { useState } from 'react';
import { Plus, Edit, Trash2, MapPin, Home, Building, Car, Store, Building2 } from 'lucide-react';
import { useProperties } from '../../../hooks/data';
import { Button, Table, Modal } from '../../ui';
import PropertyForm from '../PropertyForm/PropertyForm';
import type { Property } from '../../../types/entities';
import type { TableColumn } from '../../../types/ui';

interface PropertyListProps {
  onPropertySelect?: (property: Property) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({ onPropertySelect }) => {
  const { properties, loading, actions } = useProperties({ autoFetch: true });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Fonction pour obtenir l'icône selon le type de bien
  const getPropertyIcon = (type: string) => {
    const iconMap = {
      apartment: <Building className="w-5 h-5 text-blue-600" />,
      house: <Home className="w-5 h-5 text-green-600" />,
      studio: <Building2 className="w-5 h-5 text-purple-600" />,
      parking: <Car className="w-5 h-5 text-gray-600" />,
      commercial: <Store className="w-5 h-5 text-orange-600" />,
    };
    return iconMap[type as keyof typeof iconMap] || <Home className="w-5 h-5 text-gray-400" />;
  };

  // Fonction pour obtenir la couleur de fond selon le type
  const getPropertyIconBg = (type: string) => {
    const bgMap = {
      apartment: 'bg-blue-50',
      house: 'bg-green-50',
      studio: 'bg-purple-50',
      parking: 'bg-gray-50',
      commercial: 'bg-orange-50',
    };
    return bgMap[type as keyof typeof bgMap] || 'bg-gray-50';
  };

  const columns: TableColumn<Property>[] = [
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      render: (value, property) => (
        <div className="flex items-center space-x-3">
          <div className={`flex-shrink-0 p-2 rounded-lg ${getPropertyIconBg(property.type)}`}>
            {getPropertyIcon(property.type)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              {property.address}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => {
        const typeLabels = {
          apartment: 'Appartement',
          house: 'Maison',
          studio: 'Studio',
          parking: 'Parking',
          commercial: 'Commercial',
        };
        return typeLabels[value as keyof typeof typeLabels] || value;
      },
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (value) => {
        const statusConfig = {
          occupied: { label: 'Occupé', color: 'bg-green-100 text-green-800' },
          vacant: { label: 'Vacant', color: 'bg-yellow-100 text-yellow-800' },
          maintenance: { label: 'Maintenance', color: 'bg-red-100 text-red-800' },
        };
        
        // Get config with fallback for unknown status values
        const config = statusConfig[value as keyof typeof statusConfig] || {
          label: value || 'Inconnu',
          color: 'bg-gray-100 text-gray-800'
        };
        
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'rent',
      label: 'Loyer',
      sortable: true,
      render: (value) => `${value || 0}€`,
    },
    {
      key: 'surface',
      label: 'Surface',
      sortable: true,
      render: (value) => `${value || 0}m²`,
    },
    {
      key: 'rooms',
      label: 'Pièces',
      sortable: true,
      render: (value) => value || 0,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, property) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              setEditingProperty(property);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(property.id);
            }}
            className="text-red-600 hover:text-red-700"
          />
        </div>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bien ?')) {
      await actions.delete(id);
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleEditSuccess = () => {
    setEditingProperty(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes biens</h2>
          <p className="text-gray-600">Gérez vos propriétés immobilières</p>
        </div>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Ajouter un bien
        </Button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{properties.length}</div>
          <div className="text-sm text-gray-600">Total des biens</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {properties.filter(p => p.status === 'occupied').length}
          </div>
          <div className="text-sm text-gray-600">Occupés</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {properties.filter(p => p.status === 'vacant').length}
          </div>
          <div className="text-sm text-gray-600">Vacants</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {properties.reduce((sum, p) => sum + (p.rent || 0), 0)}€
          </div>
          <div className="text-sm text-gray-600">Revenus mensuels</div>
        </div>
      </div>

      {/* Table */}
      <Table
        data={properties}
        columns={columns}
        loading={loading.isLoading}
        onRowClick={onPropertySelect}
        emptyMessage="Aucun bien trouvé. Commencez par ajouter votre premier bien."
      />

      {/* Modal de création */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Ajouter un nouveau bien"
        size="lg"
      >
        <PropertyForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal d'édition */}
      <Modal
        isOpen={!!editingProperty}
        onClose={() => setEditingProperty(null)}
        title="Modifier le bien"
        size="lg"
      >
        {editingProperty && (
          <PropertyForm
            property={editingProperty}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingProperty(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default PropertyList;
