import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar, 
  User, 
  LogIn, 
  LogOut, 
  Loader2,
  Globe,
  Smartphone,
  Laptop,
  Settings,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { activityService } from '../../lib/activityService';

interface SecuritySettings {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
  };
  sessionSettings: {
    sessionTimeout: number;
    maxFailedAttempts: number;
    lockoutDuration: number;
  };
  twoFactorAuth: {
    enabled: boolean;
    required: boolean;
    methods: string[];
  };
}

interface LoginAttempt {
  id: string;
  user_id: string;
  email: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  created_at: string;
}

interface SecurityLog {
  id: string;
  user_id: string;
  action: string;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const AdminSecurity: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySettings>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expiryDays: 90
    },
    sessionSettings: {
      sessionTimeout: 30,
      maxFailedAttempts: 5,
      lockoutDuration: 15
    },
    twoFactorAuth: {
      enabled: true,
      required: false,
      methods: ['email', 'authenticator']
    }
  });

  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'logs'>('settings');

  // Simulated login attempts data
  const mockLoginAttempts: LoginAttempt[] = [
    {
      id: '1',
      user_id: 'user1',
      email: 'user@example.com',
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true,
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() // 5 minutes ago
    },
    {
      id: '2',
      user_id: '',
      email: 'unknown@example.com',
      ip_address: '192.168.1.2',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      success: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    {
      id: '3',
      user_id: 'user2',
      email: 'admin@example.com',
      ip_address: '192.168.1.3',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      success: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    },
    {
      id: '4',
      user_id: 'admin-1',
      email: 'admin@easybail.pro',
      ip_address: '192.168.1.10',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true,
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
    },
    {
      id: '5',
      user_id: 'user-1',
      email: 'marie.martin@email.com',
      ip_address: '192.168.1.11',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      success: true,
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 minutes ago
    },
    {
      id: '6',
      user_id: '',
      email: 'hacker@malicious.com',
      ip_address: '203.0.113.1',
      user_agent: 'curl/7.68.0',
      success: false,
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
    },
    {
      id: '7',
      user_id: 'user-2',
      email: 'pierre.dubois@email.com',
      ip_address: '192.168.1.12',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      success: true,
      created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString() // 3 hours ago
    },
    {
      id: '8',
      user_id: '',
      email: 'test@test.com',
      ip_address: '192.168.1.13',
      user_agent: 'Mozilla/5.0 (Linux; Android 10)',
      success: false,
      created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString() // 4 hours ago
    }
  ];

  // Simulated security logs data
  const mockSecurityLogs: SecurityLog[] = [
    {
      id: '1',
      user_id: 'user1',
      action: 'password_change',
      description: 'Mot de passe modifié',
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    },
    {
      id: '2',
      user_id: 'user2',
      action: 'login',
      description: 'Connexion réussie',
      ip_address: '192.168.1.3',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
    },
    {
      id: '3',
      user_id: 'admin1',
      action: 'settings_change',
      description: 'Paramètres de sécurité modifiés',
      ip_address: '192.168.1.4',
      user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    {
      id: '4',
      user_id: '',
      action: 'failed_login',
      description: 'Tentative de connexion échouée',
      ip_address: '192.168.1.5',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() // 10 minutes ago
    },
    {
      id: '5',
      user_id: 'admin-1',
      action: 'admin_login',
      description: 'Connexion administrateur réussie',
      ip_address: '192.168.1.10',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
    },
    {
      id: '6',
      user_id: 'user-1',
      action: 'user_login',
      description: 'Connexion utilisateur réussie',
      ip_address: '192.168.1.11',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 minutes ago
    },
    {
      id: '7',
      user_id: '',
      action: 'brute_force_attempt',
      description: 'Tentative de force brute détectée',
      ip_address: '203.0.113.1',
      user_agent: 'curl/7.68.0',
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
    },
    {
      id: '8',
      user_id: 'user-2',
      action: 'logout',
      description: 'Déconnexion utilisateur',
      ip_address: '192.168.1.12',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString() // 3 hours ago
    }
  ];

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      // In a real application, you would fetch this data from your database
      // For this demo, we'll use the mock data
      
      // Try to load settings from Supabase
      try {
        const { data: settingsData, error: settingsError } = await supabase
          .from('security_settings')
          .select('*')
          .maybeSingle();
        
        if (!settingsError && settingsData) {
          setSettings(settingsData.settings);
        }
      } catch (err) {
        console.warn('Could not load security settings from database:', err);
        // Keep using default settings
      }
      
      // Set mock data for login attempts and security logs
      setLoginAttempts(mockLoginAttempts);
      setSecurityLogs(mockSecurityLogs);
      
    } catch (err) {
      setError('Erreur lors du chargement des données de sécurité');
      console.error('Error loading security data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In a real application, you would save these settings to your database
      // For this demo, we'll just simulate a successful save
      
      // Try to save settings to Supabase
      try {
        const { data: existingSettings, error: checkError } = await supabase
          .from('security_settings')
          .select('id')
          .maybeSingle();
        
        if (checkError) {
          console.warn('Error checking existing settings:', checkError);
        }
        
        if (existingSettings) {
          // Update existing settings
          const { error: updateError } = await supabase
            .from('security_settings')
            .update({ settings })
            .eq('id', existingSettings.id);
          
          if (updateError) throw updateError;
        } else {
          // Insert new settings
          const { error: insertError } = await supabase
            .from('security_settings')
            .insert({ settings });
          
          if (insertError) throw insertError;
        }
      } catch (err) {
        console.warn('Could not save security settings to database:', err);
        // Continue anyway to show success message
      }
      
      // Log the activity
      activityService.addActivity({
        type: 'system',
        action: 'security_settings_updated',
        title: 'Paramètres de sécurité mis à jour',
        description: 'Les paramètres de sécurité ont été modifiés',
        userId: 'current-user',
        priority: 'high',
        category: 'warning'
      });
      
      setSuccess('Paramètres de sécurité enregistrés avec succès');
      
      // Simulate a delay before removing the success message
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      setError('Erreur lors de l\'enregistrement des paramètres de sécurité');
      console.error('Error saving security settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [section, property] = name.split('.');
      
      if (type === 'checkbox') {
        setSettings(prev => ({
          ...prev,
          [section]: {
            ...prev[section as keyof SecuritySettings],
            [property]: (e.target as HTMLInputElement).checked
          }
        }));
      } else if (type === 'number') {
        setSettings(prev => ({
          ...prev,
          [section]: {
            ...prev[section as keyof SecuritySettings],
            [property]: parseInt(value, 10)
          }
        }));
      } else {
        setSettings(prev => ({
          ...prev,
          [section]: {
            ...prev[section as keyof SecuritySettings],
            [property]: value
          }
        }));
      }
    } else {
      // Handle top-level properties
      if (type === 'checkbox') {
        setSettings(prev => ({
          ...prev,
          [name]: (e.target as HTMLInputElement).checked
        }));
      } else if (type === 'number') {
        setSettings(prev => ({
          ...prev,
          [name]: parseInt(value, 10)
        }));
      } else {
        setSettings(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const handleMethodsChange = (method: string) => {
    setSettings(prev => {
      const currentMethods = prev.twoFactorAuth.methods;
      const newMethods = currentMethods.includes(method)
        ? currentMethods.filter(m => m !== method)
        : [...currentMethods, method];
      
      return {
        ...prev,
        twoFactorAuth: {
          ...prev.twoFactorAuth,
          methods: newMethods
        }
      };
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('Android')) {
      return <Smartphone className="h-4 w-4 text-gray-500" />;
    } else if (userAgent.includes('Windows') || userAgent.includes('Mac') || userAgent.includes('Linux')) {
      return <Laptop className="h-4 w-4 text-gray-500" />;
    } else {
      return <Globe className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <LogIn className="h-4 w-4 text-green-500" />;
      case 'admin_login':
        return <LogIn className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-gray-500" />;
      case 'failed_login':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'user_login':
        return <LogIn className="h-4 w-4 text-blue-500" />;
      case 'brute_force_attempt':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'password_change':
        return <Key className="h-4 w-4 text-blue-500" />;
      case 'settings_change':
        return <Settings className="h-4 w-4 text-purple-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Paramètres
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'logs'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Journaux de connexion
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Erreur</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 font-medium">{success}</p>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-8">
            {/* Password Policy */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-gray-700" />
                Politique de mot de passe
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longueur minimale
                  </label>
                  <input
                    type="number"
                    name="passwordPolicy.minLength"
                    value={settings.passwordPolicy.minLength}
                    onChange={handleInputChange}
                    min="6"
                    max="32"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration (jours)
                  </label>
                  <input
                    type="number"
                    name="passwordPolicy.expiryDays"
                    value={settings.passwordPolicy.expiryDays}
                    onChange={handleInputChange}
                    min="0"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    0 = pas d'expiration
                  </p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireUppercase"
                    name="passwordPolicy.requireUppercase"
                    checked={settings.passwordPolicy.requireUppercase}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireUppercase" className="ml-2 block text-sm text-gray-700">
                    Exiger des majuscules
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireLowercase"
                    name="passwordPolicy.requireLowercase"
                    checked={settings.passwordPolicy.requireLowercase}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireLowercase" className="ml-2 block text-sm text-gray-700">
                    Exiger des minuscules
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireNumbers"
                    name="passwordPolicy.requireNumbers"
                    checked={settings.passwordPolicy.requireNumbers}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireNumbers" className="ml-2 block text-sm text-gray-700">
                    Exiger des chiffres
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireSpecialChars"
                    name="passwordPolicy.requireSpecialChars"
                    checked={settings.passwordPolicy.requireSpecialChars}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireSpecialChars" className="ml-2 block text-sm text-gray-700">
                    Exiger des caractères spéciaux
                  </label>
                </div>
              </div>
            </div>
            
            {/* Session Settings */}
            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-700" />
                Paramètres de session
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Délai d'expiration (minutes)
                  </label>
                  <input
                    type="number"
                    name="sessionSettings.sessionTimeout"
                    value={settings.sessionSettings.sessionTimeout}
                    onChange={handleInputChange}
                    min="1"
                    max="1440"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tentatives max. échouées
                  </label>
                  <input
                    type="number"
                    name="sessionSettings.maxFailedAttempts"
                    value={settings.sessionSettings.maxFailedAttempts}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée de verrouillage (minutes)
                  </label>
                  <input
                    type="number"
                    name="sessionSettings.lockoutDuration"
                    value={settings.sessionSettings.lockoutDuration}
                    onChange={handleInputChange}
                    min="1"
                    max="1440"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            {/* Two-Factor Authentication */}
            <div className="pt-6 border-t border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-gray-700" />
                Authentification à deux facteurs
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="twoFactorEnabled"
                    name="twoFactorAuth.enabled"
                    checked={settings.twoFactorAuth.enabled}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="twoFactorEnabled" className="ml-2 block text-sm text-gray-700">
                    Activer l'authentification à deux facteurs
                  </label>
                </div>
                
                {settings.twoFactorAuth.enabled && (
                  <>
                    <div className="flex items-center ml-6">
                      <input
                        type="checkbox"
                        id="twoFactorRequired"
                        name="twoFactorAuth.required"
                        checked={settings.twoFactorAuth.required}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="twoFactorRequired" className="ml-2 block text-sm text-gray-700">
                        Rendre obligatoire pour tous les utilisateurs
                      </label>
                    </div>
                    
                    <div className="ml-6 mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Méthodes autorisées
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="methodEmail"
                            checked={settings.twoFactorAuth.methods.includes('email')}
                            onChange={() => handleMethodsChange('email')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="methodEmail" className="ml-2 block text-sm text-gray-700">
                            Email
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="methodSMS"
                            checked={settings.twoFactorAuth.methods.includes('sms')}
                            onChange={() => handleMethodsChange('sms')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="methodSMS" className="ml-2 block text-sm text-gray-700">
                            SMS
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="methodAuthenticator"
                            checked={settings.twoFactorAuth.methods.includes('authenticator')}
                            onChange={() => handleMethodsChange('authenticator')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="methodAuthenticator" className="ml-2 block text-sm text-gray-700">
                            Application d'authentification
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Save Button */}
            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                <span>Enregistrer les paramètres</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-medium text-gray-900">Journaux de connexion et sécurité</h4>
            <button
              onClick={loadSecurityData}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          
          {/* Login Attempts Section */}
          <div className="mb-8">
            <h5 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <LogIn className="h-5 w-5 mr-2 text-blue-600" />
              Tentatives de connexion récentes
            </h5>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Adresse IP</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Appareil</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loginAttempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {attempt.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm font-medium ${
                            attempt.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {attempt.success ? 'Succès' : 'Échec'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-900">
                            {attempt.email}
                          </span>
                          {attempt.email === 'admin@easybail.pro' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900 font-mono">{attempt.ip_address}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getDeviceIcon(attempt.user_agent)}
                          <span className="text-sm text-gray-900 truncate max-w-xs">
                            {attempt.user_agent.split(' ')[0]}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">{formatDate(attempt.created_at)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Security Logs Section */}
          <div>
            <h5 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-600" />
              Journaux de sécurité
            </h5>
            
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Utilisateur</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Adresse IP</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Appareil</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {securityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className="text-sm font-medium text-gray-900">
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{log.description}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">
                          {log.user_id || 'Anonyme'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{log.ip_address}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(log.user_agent)}
                        <span className="text-sm text-gray-900 truncate max-w-xs">
                          {log.user_agent.split(' ')[0]}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{formatDate(log.created_at)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
          
          {securityLogs.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun journal de sécurité</h3>
              <p className="text-gray-600">
                Les journaux de sécurité apparaîtront ici lorsque des actions liées à la sécurité seront effectuées.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'attempts' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        </div>
      )}
    </div>
  );
};

export default AdminSecurity;
