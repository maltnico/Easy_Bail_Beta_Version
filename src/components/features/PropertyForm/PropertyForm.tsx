import React, { useState } from 'react';
import { useProperties } from '../../../hooks/data';
import { Button, Input } from '../../ui';
import type { Property } from '../../../types/entities';

interface PropertyFormProps {
  property?: Property;
  onSuccess: () => void;
  onCancel: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  onSuccess,
  onCancel,
}) => {
  const { actions } = useProperties();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: property?.name || '',
    address: property?.address || '',
    type: property?.type || 'apartment',
    status: property?.status || 'vacant',
    rent: property?.rent || 0,
    charges: property?.charges || 0,
    surface: property?.surface || 0,
    rooms: property?.rooms || 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rent' || name === 'charges' || name === 'surface' || name === 'rooms'
        ? Number(value)
        : value,
    }));
    
    // Effacer l'erreur si elle existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }

    if (formData.rent <= 0) {
      newErrors.rent = 'Le loyer doit être supérieur à 0';
    }

    if (formData.surface <= 0) {
      newErrors.surface = 'La surface doit être supérieure à 0';
    }

    if (formData.rooms <= 0) {
      newErrors.rooms = 'Le nombre de pièces doit être supérieur à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let result;
      
      if (property) {
        result = await actions.update(property.id, formData);
      } else {
        result = await actions.create(formData);
      }

      if (result.success) {
        onSuccess();
      } else {
        setErrors({ submit: result.error || 'Une erreur est survenue' });
      }
    } catch (error) {
      setErrors({ submit: 'Une erreur inattendue est survenue' });
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'apartment', label:'Appartement' },
    { value: 'house', label: 'Maison' },
    { value: 'studio', label: 'Studio' },
    { value: 'parking', label: 'Parking' },
    { value: 'commercial', label: 'Commercial' },
  ];

  const statusOptions = [
    { value: 'vacant', label: 'Vacant' },
    { value: 'occupied', label: 'Occupé' },
    { value: 'maintenance', label: 'En maintenance' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nom du bien"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Ex: Appartement T3 Centre-ville"
          required
        />

        <Input
          label="Adresse"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de bien
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Loyer (€)"
          name="rent"
          type="number"
          value={formData.rent}
          onChange={handleChange}
          error={errors.rent}
          placeholder="800"
          min="0"
          step="0.01"
          required
        />

        <Input
          label="Charges (€)"
          name="charges"
          type="number"
          value={formData.charges}
          onChange={handleChange}
          error={errors.charges}
          placeholder="100"
          min="0"
          step="0.01"
        />

        <Input
          label="Surface (m²)"
          name="surface"
          type="number"
          value={formData.surface}
          onChange={handleChange}
          error={errors.surface}
          placeholder="65"
          min="0"
          step="0.01"
          required
        />

        <Input
          label="Nombre de pièces"
          name="rooms"
          type="number"
          value={formData.rooms}
          onChange={handleChange}
          error={errors.rooms}
          placeholder="3"
          min="1"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          loading={loading}
        >
          {property ? 'Modifier' : 'Créer'} le bien
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
