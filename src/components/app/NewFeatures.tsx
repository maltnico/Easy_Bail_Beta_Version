import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  Smartphone, 
  Globe, 
  Zap, 
  Shield,
  TrendingUp,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  X,
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react';

const NewFeatures = () => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features = [
    {
      id: 'ai-assistant',
      icon: Brain,
      title: 'Assistant Intelligent',
      description: 'Assistant qui apprend de vos habitudes pour optimiser votre gestion',
      status: 'new',
      color: 'from-blue-500 to-blue-600',
      details: [
        'Prédictions de rentabilité en temps réel',
        'Suggestions d\'optimisation automatiques',
        'Analyse des risques locataires',
        'Recommandations personnalisées'
      ]
    },
    {
      id: 'mobile-app',
      icon: Smartphone,
      title: 'Applications Mobiles Natives',
      description: 'Apps iOS et Android pour gérer votre patrimoine en déplacement',
      status: 'new',
      color: 'from-green-500 to-green-600',
      details: [
        'Interface native optimisée',
        'Synchronisation temps réel',
        'Mode hors ligne',
        'Notifications push'
      ]
    },
    {
      id: 'marketplace',
      icon: Globe,
      title: 'Marketplace Partenaires',
      description: 'Écosystème d\'artisans, experts et services pour vos biens',
      status: 'beta',
      color: 'from-orange-500 to-orange-600',
      details: [
        'Réseau d\'artisans certifiés',
        'Devis automatiques',
        'Suivi des interventions',
        'Garantie qualité'
      ]
    },
    {
      id: 'automation-2',
      icon: Zap,
      title: 'Automatisations Avancées',
      description: 'Workflows pour automatiser 95% de vos tâches',
      status: 'improved',
      color: 'from-purple-500 to-purple-600',
      details: [
        'Workflows visuels drag & drop',
        'Conditions complexes',
        'Intégrations tierces',
        'Déclencheurs automatiques'
      ]
    },
    {
      id: 'security-plus',
      icon: Shield,
      title: 'Sécurité Renforcée',
      description: 'Certification ISO 27001 et chiffrement de niveau bancaire',
      status: 'improved',
      color: 'from-gray-500 to-gray-600',
      details: [
        'Chiffrement AES-256',
        'Authentification biométrique',
        'Audit de sécurité continu',
        'Conformité RGPD+'
      ]
    },
    {
      id: 'analytics-pro',
      icon: BarChart3,
      title: 'Analytics Professionnels',
      description: 'Tableaux de bord avancés avec analyses prédictives',
      status: 'new',
      color: 'from-teal-500 to-teal-600',
      details: [
        'Prévisions de cash-flow',
        'Analyse de marché automatique',
        'Benchmarking automatique',
        'Rapports personnalisables'
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">Nouveau</span>;
      case 'beta':
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">Bêta</span>;
      case 'improved':
        return <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">Amélioré</span>;
      default:
        return null;
    }
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Nouvelles fonctionnalités 2025
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            L'avenir de la gestion locative
            <span className="block text-blue-600">
              est déjà là
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez les innovations révolutionnaires qui transforment 
            la façon dont vous gérez votre patrimoine immobilier.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300"
                onClick={() => setSelectedFeature(feature.id)}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  {getStatusBadge(feature.status)}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                  <span>En savoir plus</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Accédez en avant-première à ces fonctionnalités
          </h3>
          <p className="text-lg mb-6 text-blue-100 max-w-2xl mx-auto">
            Rejoignez notre programme bêta et découvrez l'avenir de la gestion locative
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center">
              Rejoindre la bêta
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold flex items-center justify-center">
              Voir la démo
            </button>
          </div>
        </div>

        {/* Feature Detail Modal */}
        {selectedFeature && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative">
              <button
                onClick={() => setSelectedFeature(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              {(() => {
                const feature = features.find(f => f.id === selectedFeature);
                if (!feature) return null;
                
                const Icon = feature.icon;
                return (
                  <>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                        {getStatusBadge(feature.status)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-3">
                      {feature.details.map((detail, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{detail}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 flex space-x-4">
                      <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold">
                        Essayer maintenant
                      </button>
                      <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold">
                        En savoir plus
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewFeatures;
