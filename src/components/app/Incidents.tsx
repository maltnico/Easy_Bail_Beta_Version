import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  User,
  Home,
  Wrench,
  DollarSign,
  FileText,
  Camera,
  Send
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description: string;
  type: 'maintenance' | 'payment' | 'neighbor' | 'damage' | 'legal' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  propertyId: string;
  propertyName: string;
  tenantId?: string;
  tenantName?: string;
  reportedBy: 'tenant' | 'landlord' | 'neighbor' | 'maintenance';
  reportedAt: Date;
  resolvedAt?: Date;
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  photos: string[];
  comments: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const Incidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: '1',
      title: 'Fuite d\'eau dans la salle de bain',
      description: 'Fuite importante au niveau du robinet de la douche. L\'eau coule en permanence.',
      type: 'maintenance',
      priority: 'high',
      status: 'in_progress',
      propertyId: '1',
      propertyName: 'Appartement Bastille',
      tenantId: '1',
      tenantName: 'Marie Martin',
      reportedBy: 'tenant',
      reportedAt: new Date('2024-11-28'),
      estimatedCost: 150,
      photos: [],
      comments: [
        {
          id: '1',
          author: 'Marie Martin',
          content: 'La fuite s\'aggrave, il y a maintenant de l\'eau qui coule sur le sol.',
          createdAt: new Date('2024-11-28')
        },
        {
          id: '2',
          author: 'Propriétaire',
          content: 'J\'ai contacté le plombier, il passera demain matin.',
          createdAt: new Date('2024-11-28')
        }
      ],
      createdAt: new Date('2024-11-28'),
      updatedAt: new Date('2024-11-28')
    },
    {
      id: '2',
      title: 'Retard de paiement loyer novembre',
      description: 'Le loyer de novembre n\'a pas été payé à la date prévue.',
      type: 'payment',
      priority: 'medium',
      status: 'open',
      propertyId: '3',
      propertyName: 'Maison Vincennes',
      tenantId: '2',
      tenantName: 'Pierre Dubois',
      reportedBy: 'landlord',
      reportedAt: new Date('2024-11-10'),
      photos: [],
      comments: [],
      createdAt: new Date('2024-11-10'),
      updatedAt: new Date('2024-11-10')
    },
    {
      id: '3',
      title: 'Problème de chauffage',
      description: 'Le chauffage ne fonctionne plus dans le salon depuis hier.',
      type: 'maintenance',
      priority: 'high',
      status: 'resolved',
      propertyId: '1',
      propertyName: 'Appartement Bastille',
      tenantId: '1',
      tenantName: 'Marie Martin',
      reportedBy: 'tenant',
      reportedAt: new Date('2024-11-20'),
      resolvedAt: new Date('2024-11-22'),
      actualCost: 85,
      photos: [],
      comments: [
        {
          id: '1',
          author: 'Technicien',
          content: 'Problème résolu, c\'était un fusible défaillant.',
          createdAt: new Date('2024-11-22')
        }
      ],
      createdAt: new Date('2024-11-20'),
      updatedAt: new Date('2024-11-22')
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showIncidentDetails, setShowIncidentDetails] = useState(false);

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || incident.type === filterType;
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || incident.priority === filterPriority;
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="h-5 w-5 text-orange-600" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-red-600" />;
      case 'neighbor':
        return <User className="h-5 w-5 text-purple-600" />;
      case 'damage':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'legal':
        return <FileText className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'maintenance': 'Maintenance',
      'payment': 'Paiement',
      'neighbor': 'Voisinage',
      'damage': 'Dégâts',
      'legal': 'Juridique',
      'other': 'Autre'
    };
    return labels[type] || type;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      'urgent': 'Urgent',
      'high': 'Élevée',
      'medium': 'Moyenne',
      'low': 'Faible'
    };
    return labels[priority] || priority;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'open': 'Ouvert',
      'in_progress': 'En cours',
      'resolved': 'Résolu',
      'closed': 'Fermé'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setShowIncidentDetails(true);
  };

  const updateIncidentStatus = (id: string, status: Incident['status']) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === id 
        ? { 
            ...incident, 
            status, 
            resolvedAt: status === 'resolved' ? new Date() : incident.resolvedAt,
            updatedAt: new Date() 
          }
        : incident
    ));
  };

  const openIncidents = incidents.filter(i => i.status === 'open').length;
  const inProgressIncidents = incidents.filter(i => i.status === 'in_progress').length;
  const urgentIncidents = incidents.filter(i => i.priority === 'urgent').length;
  const totalCost = incidents.reduce((sum, i) => sum + (i.actualCost || i.estimatedCost || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des incidents</h1>
          <p className="text-gray-600">Suivez et résolvez les problèmes de vos biens</p>
        </div>
        <button
          onClick={() => setShowIncidentForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Signaler un incident</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Incidents ouverts</p>
              <p className="text-3xl font-bold text-blue-600">{openIncidents}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En cours</p>
              <p className="text-3xl font-bold text-yellow-600">{inProgressIncidents}</p>
            </div>
            <Wrench className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgents</p>
              <p className="text-3xl font-bold text-red-600">{urgentIncidents}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coût total</p>
              <p className="text-3xl font-bold text-purple-600">{totalCost}€</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un incident..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Tous les types</option>
              <option value="maintenance">Maintenance</option>
              <option value="payment">Paiement</option>
              <option value="neighbor">Voisinage</option>
              <option value="damage">Dégâts</option>
              <option value="legal">Juridique</option>
              <option value="other">Autre</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="open">Ouverts</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolus</option>
              <option value="closed">Fermés</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Toutes priorités</option>
              <option value="urgent">Urgent</option>
              <option value="high">Élevée</option>
              <option value="medium">Moyenne</option>
              <option value="low">Faible</option>
            </select>
            
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Incident</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Type</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Priorité</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Bien</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Signalé le</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-start space-x-3">
                      {getTypeIcon(incident.type)}
                      <div>
                        <p className="font-medium text-gray-900">{incident.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-2">{incident.description}</p>
                        {incident.tenantName && (
                          <p className="text-xs text-blue-600 mt-1">Signalé par: {incident.tenantName}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">{getTypeLabel(incident.type)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(incident.priority)}`}>
                      {getPriorityLabel(incident.priority)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(incident.status)}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                        {getStatusLabel(incident.status)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="text-gray-900">{incident.propertyName}</div>
                      {incident.estimatedCost && (
                        <div className="text-gray-500">
                          Coût: {incident.actualCost || incident.estimatedCost}€
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">
                      {incident.reportedAt.toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewIncident(incident)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {incident.status !== 'resolved' && incident.status !== 'closed' && (
                        <button
                          onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Marquer comme résolu"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredIncidents.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun incident trouvé</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterPriority !== 'all'
              ? 'Aucun incident ne correspond à vos critères.'
              : 'Aucun incident signalé pour le moment.'
            }
          </p>
        </div>
      )}

      {/* Incident Details Modal */}
      {showIncidentDetails && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {getTypeIcon(selectedIncident.type)}
                <h2 className="text-2xl font-bold text-gray-900">{selectedIncident.title}</h2>
              </div>
              <button
                onClick={() => setShowIncidentDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Incident Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Informations générales</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-900">{getTypeLabel(selectedIncident.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priorité:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedIncident.priority)}`}>
                        {getPriorityLabel(selectedIncident.priority)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedIncident.status)}`}>
                        {getStatusLabel(selectedIncident.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Signalé le:</span>
                      <span className="text-gray-900">{selectedIncident.reportedAt.toLocaleDateString()}</span>
                    </div>
                    {selectedIncident.resolvedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Résolu le:</span>
                        <span className="text-gray-900">{selectedIncident.resolvedAt.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Bien et locataire</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bien:</span>
                      <span className="text-gray-900">{selectedIncident.propertyName}</span>
                    </div>
                    {selectedIncident.tenantName && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Locataire:</span>
                        <span className="text-gray-900">{selectedIncident.tenantName}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Signalé par:</span>
                      <span className="text-gray-900 capitalize">{selectedIncident.reportedBy}</span>
                    </div>
                    {selectedIncident.estimatedCost && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coût estimé:</span>
                        <span className="text-gray-900">{selectedIncident.estimatedCost}€</span>
                      </div>
                    )}
                    {selectedIncident.actualCost && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Coût réel:</span>
                        <span className="text-gray-900">{selectedIncident.actualCost}€</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedIncident.description}</p>
              </div>
              
              {/* Comments */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Commentaires ({selectedIncident.comments.length})</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedIncident.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-500">{comment.createdAt.toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                  {selectedIncident.comments.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Aucun commentaire</p>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  {selectedIncident.status !== 'resolved' && selectedIncident.status !== 'closed' && (
                    <button
                      onClick={() => {
                        updateIncidentStatus(selectedIncident.id, 'resolved');
                        setShowIncidentDetails(false);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Marquer comme résolu</span>
                    </button>
                  )}
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Ajouter un commentaire</span>
                  </button>
                </div>
                <button
                  onClick={() => setShowIncidentDetails(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incident Form Modal - Placeholder */}
      {showIncidentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Signaler un incident</h2>
              <button
                onClick={() => setShowIncidentForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Formulaire de signalement d'incident à implémenter...</p>
              <button
                onClick={() => setShowIncidentForm(false)}
                className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;
