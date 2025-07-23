import { Home, Building, Car, Store, Building2 } from 'lucide-react';

export const getTypeLabel = (type: string): string => {
  const typeLabels = {
    apartment: 'Appartement',
    house: 'Maison',
    studio: 'Studio',
    parking: 'Parking',
    commercial: 'Commercial',
  };
  return typeLabels[type as keyof typeof typeLabels] || type;
};

export const getTypeIcon = (type: string): string => {
  const iconMap = {
    apartment: '🏢', // Building emoji
    house: '🏠',     // House emoji
    studio: '🏘️',    // Houses emoji
    parking: '🚗',   // Car emoji
    commercial: '🏪', // Store emoji
  };
  return iconMap[type as keyof typeof iconMap] || '🏠';
};

export const getPropertyIconComponent = (type: string) => {
  const iconMap = {
    apartment: Building,
    house: Home,
    studio: Building2,
    parking: Car,
    commercial: Store,
  };
  return iconMap[type as keyof typeof iconMap] || Home;
};

export const getPropertyIconColor = (type: string): string => {
  const colorMap = {
    apartment: 'text-blue-600',
    house: 'text-green-600',
    studio: 'text-purple-600',
    parking: 'text-gray-600',
    commercial: 'text-orange-600',
  };
  return colorMap[type as keyof typeof colorMap] || 'text-gray-400';
};

export const getPropertyIconBg = (type: string): string => {
  const bgMap = {
    apartment: 'bg-blue-50',
    house: 'bg-green-50',
    studio: 'bg-purple-50',
    parking: 'bg-gray-50',
    commercial: 'bg-orange-50',
  };
  return bgMap[type as keyof typeof bgMap] || 'bg-gray-50';
};
