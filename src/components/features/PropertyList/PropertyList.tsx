import React, { useState } from 'react';
import { Plus, Edit, Trash2, Home, MapPin } from 'lucide-react';
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

  const columns: TableColumn<Property>[] = [
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      render: (value, property) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Home className="w-5 h-5 text-gray-400" />
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
        const config = statusConfig[value as keyof typeof statusConfig];
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
      render: (value) => `${value}€`,
    },
    {
      key: 'surface',
      label: 'Surface',
      sortable: true,
      render: (value) => `${value}m²`,
    },
    {
      key: 'rooms',
      label: 'Pièces',
      sortable: true,
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
            {properties.reduce((sum, p) => sum + p.rent, 0)}€
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
