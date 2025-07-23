import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Save, 
  Play,
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Send, 
  Lock, 
  User, 
  Server, 
  Globe, 
  Key,
  Loader2,
  Eye
} from 'lucide-react';
import { mailService, MailConfig } from '../../lib/mailService';
import { localEmailService } from '../../lib/localEmailService';

const MailServerConfig: React.FC = () => {
  const [config, setConfig] = useState<MailConfig>({
    host: 'ssl0.ovh.net',
    port: 465,
    secure: true,
    username: '',
    password: '',
    from: '',
    replyTo: '',
    enabled: false,
    provider: 'ovh'
  });
  
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{success: boolean, message: string, details?: string} | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [emailQueue, setEmailQueue] = useState<any[]>([]);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Charger la configuration depuis le service mail
  useEffect(() => {
    const savedConfig = mailService.getConfig();
    if (savedConfig) {
      setConfig(savedConfig);
    }
    
    // Charger la file d'attente
    try {
      const queue = localEmailService.getEmailQueue();
      setEmailQueue(queue);
    } catch (error) {
      console.error('Erreur lors du chargement de la file d\'attente:', error);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setConfig(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (name === 'port') {
      setConfig(prev => ({
        ...prev,
        [name]: parseInt(value, 10) || 0
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleProviderChange = (provider: 'ovh' | 'other') => {
    if (provider === 'ovh') {
      setConfig(prev => ({
        ...prev,
        provider,
        host: 'ssl0.ovh.net',
        port: 465,
        secure: true
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        provider,
        host: '',
        port: 587,
        secure: false
      }));
    }
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      // Sauvegarder la configuration via le service mail
      const success = mailService.saveConfig(config);
      
      if (success) {
        setMessage({
          type: 'success',
          text: 'Configuration du serveur mail enregistrée avec succès'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Erreur lors de l\'enregistrement de la configuration'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'enregistrement de la configuration'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessQueue = async () => {
    setProcessingQueue(true);
    try {
      const processedCount = await localEmailService.processEmailQueue();
      alert(`${processedCount} email(s) traité(s) avec succès`);
      
      // Rafraîchir la file d'attente
      const queue = localEmailService.getEmailQueue();
      setEmailQueue(queue);
    } catch (error) {
      console.error('Erreur lors du traitement de la file d\'attente:', error);
      alert('Erreur lors du traitement de la file d\'attente');
    } finally {
      setProcessingQueue(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      setTestResult({
        success: false,
        message: 'Veuillez saisir une adresse email de test',
        details: 'Une adresse email valide est requise pour effectuer le test'
      });
      return;
    }
    
    if (!config.enabled) {
      setTestResult({
        success: false,
        message: 'L\'envoi d\'emails n\'est pas activé',
        details: 'Veuillez activer l\'envoi d\'emails dans les paramètres'
      });
      return;
    }
    
    setTestLoading(true);
    setTestResult(null);
    setDebugInfo('');
    
    try {
      // Sauvegarder d'abord la configuration actuelle
      mailService.saveConfig(config);
      
      // Vérifier la connexion au serveur SMTP
      const verifyResult = await mailService.verifyConnection();
      
      if (!verifyResult.success) {
        setTestResult({
          success: false,
          message: 'Erreur de connexion au serveur SMTP',
          details: `Impossible de se connecter au serveur SMTP: ${verifyResult.error || 'Erreur inconnue'}`
        });
        if (verifyResult.error) {
          setDebugInfo(verifyResult.error);
        }
        setTestLoading(false);
        return;
      }
      
      // Envoyer l'email de test
      const result = await mailService.sendTestEmail(testEmail);
      
      if (result.success) {
        setTestResult({
          success: true,
          message: `Email de test envoyé avec succès à ${testEmail}`,
          details: result.messageId 
            ? `ID du message: ${result.messageId}. Vérifiez votre boîte de réception (et dossier spam) pour confirmer la réception.`
            : 'Vérifiez votre boîte de réception (et dossier spam) pour confirmer la réception.'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Échec de l\'envoi de l\'email de test',
          details: `Erreur: ${result.error || 'Erreur inconnue'}`
        });
        if (result.error) {
          setDebugInfo(result.error);
        }
      }
    } catch (error) {
      console.error('Exception lors de l\'envoi de l\'email de test:', error);
      setTestResult({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email de test',
        details: `Exception: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
      setDebugInfo(error instanceof Error ? `${error.message}\n${error.stack}` : JSON.stringify(error));
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Provider Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Fournisseur de service mail</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => handleProviderChange('ovh')}
            className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
              config.provider === 'ovh'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-left">
              <p className={`font-medium ${config.provider === 'ovh' ? 'text-blue-900' : 'text-gray-900'}`}>
                OVH Cloud
              </p>
              <p className={`text-sm ${config.provider === 'ovh' ? 'text-blue-700' : 'text-gray-500'}`}>
                Configuration automatique pour OVH
              </p>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => handleProviderChange('other')}
            className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
              config.provider === 'other'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Server className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-left">
              <p className={`font-medium ${config.provider === 'other' ? 'text-blue-900' : 'text-gray-900'}`}>
                Autre fournisseur
              </p>
              <p className={`text-sm ${config.provider === 'other' ? 'text-blue-700' : 'text-gray-500'}`}>
                Configuration manuelle
              </p>
            </div>
          </button>
        </div>
        
        {config.provider === 'ovh' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-800 font-medium">Configuration OVH Cloud</p>
                <p className="text-blue-700 text-sm mt-1">
                  Les paramètres du serveur SMTP sont pré-configurés pour OVH Cloud. 
                  Vous devez uniquement renseigner vos identifiants et adresses email.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      

      {/* Server Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Configuration du serveur SMTP</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serveur SMTP (host) *
            </label>
            <div className="relative">
              <Server className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="host"
                value={config.host}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ssl0.ovh.net"
                disabled={config.provider === 'ovh'}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Port *
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                name="port"
                value={config.port}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="465"
                disabled={config.provider === 'ovh'}
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="secure"
              name="secure"
              checked={config.secure}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={config.provider === 'ovh'}
            />
            <label htmlFor="secure" className="ml-2 block text-sm text-gray-700">
              Connexion sécurisée (SSL/TLS)
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Activez cette option si votre serveur SMTP nécessite une connexion sécurisée (recommandé).
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="username"
                value={config.username}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votre-email@ovh.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={config.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Eye className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              <strong>Note importante</strong>: Pour les comptes OVH, utilisez le mot de passe de votre adresse email. 
              Dans certains cas, vous devrez générer un mot de passe d'application spécifique dans votre espace client OVH.
            </p>
            <div className="mt-3 text-blue-700 text-sm">
              <p className="font-medium">Paramètres SMTP OVH :</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li><strong>Nom d'utilisateur</strong>: Votre adresse e-mail complète</li>
                <li><strong>Mot de passe</strong>: Le mot de passe de votre adresse e-mail</li>
                <li><strong>Serveur EUROPE</strong>: smtp.mail.ovh.net ou ssl0.ovh.net</li>
                <li><strong>Serveur AMERIQUE / ASIE-PACIFIQUE</strong>: smtp.mail.ovh.ca</li>
                <li><strong>Port</strong>: 465</li>
                <li><strong>Type de sécurité</strong>: SSL/TLS</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Email Queue */}
      {emailQueue.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-900">File d'attente des emails</h4>
            </div>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              {emailQueue.length} email(s) en attente
            </span>
          </div>
          <p className="text-yellow-700 mb-4">
            Des emails sont en attente d'envoi. Vous pouvez les traiter maintenant ou configurer le serveur mail pour les envoyer automatiquement.
          </p>
          <button
            onClick={handleProcessQueue}
            disabled={processingQueue}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {processingQueue ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            <span>Traiter la file d'attente</span>
          </button>
        </div>
      )}

      {/* Email Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Configuration des emails</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse d'expédition (From) *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="from"
                value={config.from}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votre-email@votre-domaine.fr"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cette adresse apparaîtra comme expéditeur des emails.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse de réponse (Reply-To)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="replyTo"
                value={config.replyTo}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="support@votre-domaine.fr"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Laissez vide pour utiliser l'adresse d'expédition.
            </p>
          </div>
        </div>
        
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="enabled"
            name="enabled"
            checked={config.enabled}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
            Activer l'envoi d'emails
          </label>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Key className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-800 font-medium">Sécurité des identifiants</p>
              <p className="text-yellow-700 text-sm mt-1">
                Vos identifiants sont stockés de manière sécurisée et ne sont utilisés que pour l'envoi d'emails.
                Pour plus de sécurité, nous vous recommandons de créer un compte email dédié à cette application.
              </p>
            </div>
          </div>
        </div>
        
        {/* Test Email */}
        <div className="border-t border-gray-200 pt-6">
          <h5 className="font-medium text-gray-900 mb-4">Tester la configuration</h5>
          
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email de test
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre-email@example.com"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testLoading || !config.enabled}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {testLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span>Envoyer un email de test</span>
            </button>
          </div>
          
          {testResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start space-x-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResult.message}
                  </p>
                  {testResult.details && (
                    <p className={`text-xs mt-1 ${
                      testResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {testResult.details}
                    </p>
                  )}
                  
                  {!testResult.success && (
                    <div className="mt-3 text-xs text-red-700">
                      <p className="font-medium">Suggestions de dépannage :</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Vérifiez que le serveur SMTP est correctement configuré</li>
                        <li>Assurez-vous que le mot de passe est correct</li>
                        <li>Vérifiez que le port 465 n'est pas bloqué par votre réseau</li>
                        <li>Pour OVH, vérifiez que votre adresse email est bien activée</li>
                        <li>Essayez de désactiver temporairement votre antivirus ou pare-feu</li>
                        <li>Vérifiez que l'adresse d'expédition correspond à votre compte OVH</li>
                        <li>Assurez-vous que votre compte OVH autorise l'envoi d'emails via SMTP</li>
                        <li>Vérifiez que vous n'avez pas atteint votre limite d'envoi d'emails</li>
                        <li>Essayez avec une autre adresse email de test</li>
                      </ul>
                    </div>
                  )}
                  
                  {!testResult.success && debugInfo && (
                    <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                      <p className="font-medium mb-1">Informations de débogage:</p>
                      <pre>{debugInfo}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={loading}
          onClick={handleSaveConfig}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          <span>Enregistrer la configuration</span>
        </button>
      </div>
    </div>
  );
};

export default MailServerConfig;
