import React from 'react';
import { Database, Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useDatabase } from '../hooks/useDatabase';

const DatabaseStatus: React.FC = () => {
  const { 
    isOnline, 
    isConnected, 
    isConfigured, 
    connectionAttempts, 
    lastCheck, 
    checkConnection,
    status 
  } = useDatabase();

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-100 text-red-800 border-red-200';
    if (!isConfigured) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (isConnected) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (!isConfigured) return <AlertTriangle className="h-4 w-4" />;
    if (isConnected) return <CheckCircle className="h-4 w-4" />;
    return <Database className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Hors ligne';
    if (!isConfigured) return 'Non configuré';
    if (isConnected) return 'Connecté';
    return 'Déconnecté';
  };

  const getStatusDescription = () => {
    if (!isOnline) return 'Pas de connexion internet';
    if (!isConfigured) return 'Configuration Supabase requise';
    if (isConnected) return 'Base de données accessible';
    if (connectionAttempts > 0) return `Reconnexion en cours (${connectionAttempts}/3)`;
    return 'Base de données inaccessible';
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="font-medium">{getStatusText()}</span>
      <span className="text-xs opacity-75">•</span>
      <span className="text-xs">{getStatusDescription()}</span>
      
      {!isConnected && isOnline && (
        <button
          onClick={checkConnection}
          className="ml-2 p-1 hover:bg-black hover:bg-opacity-10 rounded"
          title="Vérifier la connexion"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
      
      {lastCheck && (
        <span className="text-xs opacity-60">
          • {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default DatabaseStatus;