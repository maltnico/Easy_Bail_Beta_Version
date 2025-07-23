import React, { useState, useEffect } from 'react';
import { checkSupabaseConnection } from '../utils/checkSupabaseConnection';
import { AlertTriangle, CheckCircle, Database, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const SupabaseConnectionCheck: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [internetStatus, setInternetStatus] = useState(navigator.onLine);

  const checkConnection = async () => {
    setLoading(true);
    try {
      // Vérifier d'abord la connexion internet
      if (!navigator.onLine) {
        setStatus({
          connected: false,
          error: "Pas de connexion internet. Veuillez vérifier votre connexion réseau."
        });
        setLoading(false);
        return;
      }
      
      const result = await checkSupabaseConnection();
      setStatus(result);
    } catch (error) {
      setStatus({
        connected: false,
        error: `Erreur inattendue: ${(error as Error).message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Surveiller les changements de connexion internet
  useEffect(() => {
    const handleOnline = () => setInternetStatus(true);
    const handleOffline = () => setInternetStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    checkConnection();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-center">
        <div className="text-center">
          <Database className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Vérification de la connexion...</h3>
          <p className="text-gray-600">Nous vérifions la connexion à Supabase</p>
        </div>
      </div>
    );
  }

  if (!internetStatus) {
    return (
      <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <WifiOff className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-red-900">Pas de connexion internet</h3>
        </div>
        <p className="text-red-700">Veuillez vérifier votre connexion réseau et réessayer.</p>
      </div>
    );
  }

  if (!status.connected) {
    return (
      <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-red-900">Erreur de connexion à Supabase</h3>
            <p className="text-red-700">{status.error}</p>
          </div>
        </div>
        <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-red-900 mb-2">Solutions possibles :</h4>
          <ul className="list-disc list-inside text-red-700 space-y-1">
            <li>Vérifiez que vous avez cliqué sur "Connect to Supabase" dans la barre d'outils</li>
            <li>Vérifiez votre connexion internet et assurez-vous qu'elle est stable</li>
            <li>Si le problème persiste, le service Supabase peut être temporairement indisponible</li>
            <li>Vérifiez que votre projet Supabase est actif et accessible</li>
          </ul>
        </div>
        <button
          onClick={checkConnection}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Réessayer</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-medium text-green-900">Connexion à Supabase établie</h3>
          <p className="text-green-700">
            {status.authenticated 
              ? 'Authentification réussie' 
              : 'Connexion établie mais non authentifié'}
          </p>
        </div>
        <Wifi className="h-5 w-5 text-green-600 ml-2" />
      </div>

      <div className="bg-white bg-opacity-50 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-green-900 mb-2">État des tables :</h4>
        <div className="space-y-2">
          {status.tables && Object.entries(status.tables).map(([table, exists]) => (
            <div key={table} className="flex items-center space-x-2">
              {exists ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <span className={exists ? 'text-green-700' : 'text-red-700'}>
                Table <code className="font-mono">{table}</code>: {exists ? 'OK' : 'Non trouvée'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className={`text-sm font-medium ${status.allTablesExist ? 'text-green-700' : 'text-red-700'}`}>
          {status.allTablesExist 
            ? 'Toutes les tables sont correctement configurées' 
            : 'Certaines tables sont manquantes'}
        </div>
        <button
          onClick={checkConnection}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Rafraîchir</span>
        </button>
      </div>
    </div>
  );
};

export default SupabaseConnectionCheck;
