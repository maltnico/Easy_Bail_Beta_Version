import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  RefreshCw, 
  Trash2, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Eye, 
  X,
  Loader2,
  Download,
  Play
} from 'lucide-react';
import { localEmailService } from '../../lib/localEmailService';

const EmailQueue: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [showEmailDetails, setShowEmailDetails] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const loadData = () => {
    setLoading(true);
    try {
      const queue = localEmailService.getEmailQueue();
      const sent = localEmailService.getSentEmails();
      setQueue(queue);
      setSentEmails(sent);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleProcessQueue = async () => {
    setProcessing(true);
    try {
      const processedCount = await localEmailService.processEmailQueue();
      alert(`${processedCount} email(s) traité(s) avec succès`);
      handleRefresh();
    } catch (error) {
      console.error('Erreur lors du traitement de la file d\'attente:', error);
      alert('Erreur lors du traitement de la file d\'attente');
    } finally {
      setProcessing(false);
    }
  };

  const handleClearQueue = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider la file d\'attente ?')) {
      localEmailService.clearEmailQueue();
      handleRefresh();
    }
  };

  const handleClearSentEmails = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider l\'historique des emails envoyés ?')) {
      localEmailService.clearSentEmails();
      handleRefresh();
    }
  };

  const handleViewEmail = (email: any) => {
    setSelectedEmail(email);
    setShowEmailDetails(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRecipients = (recipients: string | string[]) => {
    if (Array.isArray(recipients)) {
      return recipients.join(', ');
    }
    return recipients;
  };

  if (loading && queue.length === 0 && sentEmails.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">File d'attente des emails</h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleProcessQueue}
            disabled={processing || queue.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {processing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            <span>Traiter la file d'attente</span>
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-3xl font-bold text-blue-600">{queue.length}</p>
            </div>
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Envoyés</p>
              <p className="text-3xl font-bold text-green-600">
                {sentEmails.filter(email => email.success).length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Échecs</p>
              <p className="text-3xl font-bold text-red-600">
                {sentEmails.filter(email => !email.success).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Email Queue */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">File d'attente ({queue.length})</h3>
          {queue.length > 0 && (
            <button
              onClick={handleClearQueue}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Vider la file</span>
            </button>
          )}
        </div>
        
        {queue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Destinataire</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Sujet</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Créé le</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tentatives</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {queue.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-mono">{email.id.substring(0, 8)}...</td>
                    <td className="py-3 px-4 text-sm">{formatRecipients(email.options.to)}</td>
                    <td className="py-3 px-4 text-sm">{email.options.subject}</td>
                    <td className="py-3 px-4 text-sm">{formatDate(email.createdAt)}</td>
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <span>{email.attempts}</span>
                        {email.lastAttempt && (
                          <span className="text-xs text-gray-500">
                            ({formatDate(email.lastAttempt)})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewEmail(email)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">La file d'attente est vide</p>
          </div>
        )}
      </div>

      {/* Sent Emails */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Emails envoyés ({sentEmails.length})</h3>
          {sentEmails.length > 0 && (
            <button
              onClick={handleClearSentEmails}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Vider l'historique</span>
            </button>
          )}
        </div>
        
        {sentEmails.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Destinataire</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Sujet</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Envoyé le</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sentEmails.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-mono">{email.id.substring(0, 8)}...</td>
                    <td className="py-3 px-4 text-sm">{formatRecipients(email.to)}</td>
                    <td className="py-3 px-4 text-sm">{email.subject}</td>
                    <td className="py-3 px-4 text-sm">{formatDate(email.sentAt)}</td>
                    <td className="py-3 px-4">
                      {email.success ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Succès
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Échec
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewEmail(email)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun email envoyé</p>
          </div>
        )}
      </div>

      {/* Email Details Modal */}
      {showEmailDetails && selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Détails de l'email</h2>
              </div>
              <button
                onClick={() => setShowEmailDetails(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Informations générales</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="text-gray-900 font-mono">{selectedEmail.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destinataire:</span>
                      <span className="text-gray-900">
                        {formatRecipients(selectedEmail.options?.to || selectedEmail.to)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sujet:</span>
                      <span className="text-gray-900">
                        {selectedEmail.options?.subject || selectedEmail.subject}
                      </span>
                    </div>
                    {selectedEmail.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Créé le:</span>
                        <span className="text-gray-900">{formatDate(selectedEmail.createdAt)}</span>
                      </div>
                    )}
                    {selectedEmail.sentAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Envoyé le:</span>
                        <span className="text-gray-900">{formatDate(selectedEmail.sentAt)}</span>
                      </div>
                    )}
                    {selectedEmail.attempts !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tentatives:</span>
                        <span className="text-gray-900">{selectedEmail.attempts}</span>
                      </div>
                    )}
                    {selectedEmail.lastAttempt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dernière tentative:</span>
                        <span className="text-gray-900">{formatDate(selectedEmail.lastAttempt)}</span>
                      </div>
                    )}
                    {selectedEmail.success !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Statut:</span>
                        {selectedEmail.success ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Succès
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Échec
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedEmail.error && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Erreur</h3>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-red-700">{selectedEmail.error}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedEmail.options?.html && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Contenu HTML</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-64 overflow-auto">
                    <iframe
                      srcDoc={selectedEmail.options.html}
                      title="Aperçu de l'email"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}
              
              {selectedEmail.options?.attachments && selectedEmail.options.attachments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Pièces jointes</h3>
                  <div className="space-y-2">
                    {selectedEmail.options.attachments.map((attachment: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{attachment.filename}</span>
                        </div>
                        <button
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowEmailDetails(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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

export default EmailQueue;
