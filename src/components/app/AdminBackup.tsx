import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  Play, 
  Pause,
  Trash2,
  HardDrive,
  FileText,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BackupItem {
  id: string;
  name: string;
  size: string;
  createdAt: Date;
  type: 'auto' | 'manual';
  status: 'completed' | 'in_progress' | 'failed';
  downloadUrl?: string;
}

const AdminBackup: React.FC = () => {
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('daily');
  const [retentionDays, setRetentionDays] = useState(30);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      
      // Simuler des sauvegardes existantes
      const mockBackups: BackupItem[] = [
        {
          id: '1',
          name: 'Sauvegarde automatique - 2025-01-16',
          size: '45.2 MB',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'auto',
          status: 'completed',
          downloadUrl: '#'
        },
        {
          id: '2',
          name: 'Sauvegarde manuelle - 2025-01-15',
          size: '44.8 MB',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          type: 'manual',
          status: 'completed',
          downloadUrl: '#'
        },
        {
          id: '3',
          name: 'Sauvegarde automatique - 2025-01-15',
          size: '44.1 MB',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          type: 'auto',
          status: 'completed',
          downloadUrl: '#'
        },
        {
          id: '4',
          name: 'Sauvegarde automatique - 2025-01-14',
          size: '43.9 MB',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          type: 'auto',
          status: 'failed'
        }
      ];
      
      setBackups(mockBackups);
    } catch (error) {
      console.error('Erreur lors du chargement des sauvegardes:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des sauvegardes' });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      setCreating(true);
      setMessage(null);
      
      // Simuler la création d'une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newBackup: BackupItem = {
        id: Date.now().toString(),
        name: `Sauvegarde manuelle - ${new Date().toLocaleDateString()}`,
        size: '45.5 MB',
        createdAt: new Date(),
        type: 'manual',
        status: 'completed',
        downloadUrl: '#'
      };
      
      setBackups(prev => [newBackup, ...prev]);
      setMessage({ type: 'success', text: 'Sauvegarde créée avec succès' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la création de la sauvegarde' });
    } finally {
      setCreating(false);
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette sauvegarde ?')) return;
    
    try {
      setBackups(prev => prev.filter(b => b.id !== backupId));
      setMessage({ type: 'success', text: 'Sauvegarde supprimée avec succès' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression de la sauvegarde' });
    }
  };

  const downloadBackup = (backup: BackupItem) => {
    // Simuler le téléchargement
    const link = document.createElement('a');
    link.href = backup.downloadUrl || '#';
    link.download = `${backup.name}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setMessage({ type: 'success', text: 'Téléchargement de la sauvegarde démarré' });
  };

  const restoreBackup = async (backup: BackupItem) => {
    if (!confirm(`Êtes-vous sûr de vouloir restaurer la sauvegarde "${backup.name}" ? Cette action est irréversible.`)) return;
    
    try {
      setMessage({ type: 'success', text: 'Restauration de la sauvegarde en cours...' });
      // Simuler la restauration
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage({ type: 'success', text: 'Sauvegarde restaurée avec succès' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la restauration de la sauvegarde' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'auto':
        return 'bg-blue-100 text-blue-800';
      case 'manual':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Gestion des sauvegardes</h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadBackups}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={createBackup}
            disabled={creating}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Database className="h-5 w-5" />
            )}
            <span>Créer une sauvegarde</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Backup Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Paramètres de sauvegarde</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Sauvegarde automatique</p>
              <p className="text-sm text-gray-500">Activer les sauvegardes automatiques</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoBackupEnabled}
                onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fréquence
            </label>
            <select
              value={backupFrequency}
              onChange={(e) => setBackupFrequency(e.target.value)}
              disabled={!autoBackupEnabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="hourly">Toutes les heures</option>
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuelle</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rétention (jours)
            </label>
            <input
              type="number"
              value={retentionDays}
              onChange={(e) => setRetentionDays(parseInt(e.target.value) || 30)}
              min="1"
              max="365"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Backup Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total sauvegardes</p>
              <p className="text-3xl font-bold text-gray-900">{backups.length}</p>
            </div>
            <Database className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dernière sauvegarde</p>
              <p className="text-lg font-bold text-green-600">
                {backups.length > 0 ? backups[0].createdAt.toLocaleDateString() : 'Aucune'}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taille totale</p>
              <p className="text-lg font-bold text-purple-600">
                {backups.reduce((total, backup) => {
                  const size = parseFloat(backup.size.replace(' MB', ''));
                  return total + size;
                }, 0).toFixed(1)} MB
              </p>
            </div>
            <HardDrive className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de réussite</p>
              <p className="text-lg font-bold text-orange-600">
                {backups.length > 0 
                  ? Math.round((backups.filter(b => b.status === 'completed').length / backups.length) * 100)
                  : 0}%
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Historique des sauvegardes</h4>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Nettoyer anciennes
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Nom</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Taille</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <Database className="h-5 w-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{backup.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(backup.type)}`}>
                        {backup.type === 'auto' ? 'Automatique' : 'Manuelle'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{backup.size}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(backup.status)}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                          {backup.status === 'completed' ? 'Terminée' : 
                           backup.status === 'in_progress' ? 'En cours' : 'Échouée'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">
                        {backup.createdAt.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {backup.status === 'completed' && (
                          <>
                            <button
                              onClick={() => downloadBackup(backup)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Télécharger"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => restoreBackup(backup)}
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Restaurer"
                            >
                              <Upload className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteBackup(backup.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {backups.length === 0 && !loading && (
          <div className="text-center py-12">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune sauvegarde</h3>
            <p className="text-gray-600 mb-4">
              Aucune sauvegarde n'a été créée pour le moment.
            </p>
            <button 
              onClick={createBackup}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer la première sauvegarde
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBackup;
