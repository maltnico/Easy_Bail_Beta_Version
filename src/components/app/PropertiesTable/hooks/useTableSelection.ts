import { useState, useCallback } from 'react';
import { Property } from '../../../../types';

export const useTableSelection = (properties: Property[]) => {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const handleSelectProperty = useCallback((propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedProperties.length === properties.length) {
      setSelectedProperties([]);
    } else {
      setSelectedProperties(properties.map(p => p.id));
    }
  }, [selectedProperties.length, properties]);

  const clearSelection = useCallback(() => {
    setSelectedProperties([]);
  }, []);

  return {
    selectedProperties,
    handleSelectProperty,
    handleSelectAll,
    clearSelection
  };
};
