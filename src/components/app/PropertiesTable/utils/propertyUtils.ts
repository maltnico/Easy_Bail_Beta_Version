export const getStatusColor = (status: string) => {
  switch (status) {
    case 'occupied':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'vacant':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'maintenance':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'occupied':
      return 'Occupé';
    case 'vacant':
      return 'Vacant';
    case 'maintenance':
      return 'Maintenance';
    default:
      return status;
  }
};

export const getTypeLabel = (type: string) => {
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
      return 'Commercial';
    default:
      return type;
  }
};

export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'house':
      return '🏠';
    case 'apartment':
      return '🏢';
    case 'studio':
      return '🏠';
    case 'parking':
      return '🚗';
    case 'commercial':
      return '🏪';
    default:
      return '🏠';
  }
};
