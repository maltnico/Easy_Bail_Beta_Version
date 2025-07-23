import React from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Grid3X3, 
  List,
  X
} from 'lucide-react';

interface PropertyFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (value: 'grid' | 'list') => void;
  onClearFilters: () => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
  onClearFilters
}) => {
  const hasActiveFilters = searchTerm || filterType !== 'all' || filterStatus !== 'all';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou adresse..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => onFilterTypeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">Tous les types</option>
            <option value="apartment">Appartements</option>
            <option value="house">Maisons</option>
            <option value="studio">Studios</option>
            <option value="parking">Parkings</option>
            <option value="commercial">Commerciaux</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="occupied">Occupé</option>
            <option value="vacant">Vacant</option>
            <option value="maintenance">Maintenance</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="name">Nom</option>
            <option value="rent">Loyer</option>
            <option value="surface">Surface</option>
            <option value="createdAt">Date création</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={`Tri ${sortOrder === 'asc' ? 'croissant' : 'décroissant'}`}
          >
            {sortOrder === 'asc' ? 
              <SortAsc className="h-4 w-4 text-gray-600" /> : 
              <SortDesc className="h-4 w-4 text-gray-600" />
            }
          </button>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 ${
                viewMode === 'grid' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              } transition-colors`}
              title="Vue grille"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 border-l border-gray-300 ${
                viewMode === 'list' 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
              } transition-colors`}
              title="Vue liste"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Effacer</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Recherche: "{searchTerm}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-2 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filterType !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Type: {filterType}
              <button
                onClick={() => onFilterTypeChange('all')}
                className="ml-2 hover:text-green-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filterStatus !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Statut: {filterStatus}
              <button
                onClick={() => onFilterStatusChange('all')}
                className="ml-2 hover:text-purple-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyFilters;
