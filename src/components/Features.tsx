import React from 'react';
import { 
  FileText, 
  Play, 
  Zap, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Shield,
  BookOpen,
  Smartphone,
  Globe,
  Clock,
  Award
} from 'lucide-react';
import FeatureCard from './FeatureCard';

const Features = () => {
  const features = [
    {
      icon: FileText,
      title: "Documents locatifs",
      description: "Plus de 50 modèles de documents conformes à la législation française",
      color: "bg-blue-600",
      features: [
        "Contrats de bail conformes loi ALUR",
        "États des lieux numériques",
        "Quittances automatisées",
        "Signature électronique certifiée",
        "Archivage sécurisé"
      ]
    },
    {
      icon: Zap,
      title: "Automatisations",
      description: "Automatisez vos tâches répétitives et gagnez du temps",
      color: "bg-orange-600",
      features: [
        "Génération automatique des quittances",
        "Révision des loyers selon l'IRL",
        "Rappels de paiement intelligents",
        "Alertes de fin de bail"
      ]
    },
    {
      icon: TrendingUp,
      title: "Suivi financier",
      description: "Tableau de bord financier complet et rapports détaillés",
      color: "bg-purple-600",
      features: [
        "Dashboard temps réel",
        "Prévisions de rentabilité",
        "Optimisation fiscale",
        "Rapports personnalisables"
      ]
    },
    {
      icon: Users,
      title: "Espace locataire",
      description: "Application mobile dédiée pour vos locataires",
      color: "bg-blue-500",
      features: [
        "App mobile iOS et Android",
        "Paiement en ligne sécurisé",
        "Signalement d'incidents",
        "Messagerie intégrée"
      ]
    }
  ];

  const additionalFeatures = [
    {
      icon: Shield,
      title: "Sécurité & Conformité",
      description: "Sécurité bancaire et conformité réglementaire garanties",
      color: "bg-gray-600",
      features: [
        "Chiffrement AES-256",
        "Hébergement France (OVH)",
        "Certification ISO 27001",
        "Conformité RGPD"
      ]
    },
    {
      icon: BookOpen,
      title: "Accompagnement Expert",
      description: "Formation et support par des experts de l'immobilier",
      color: "bg-green-600",
      features: [
        "Onboarding personnalisé",
        "Webinaires mensuels",
        "Support juridique inclus",
        "Veille réglementaire"
      ]
    },
    {
      icon: Smartphone,
      title: "Applications mobiles",
      description: "Gérez votre patrimoine depuis votre smartphone",
      color: "bg-indigo-600",
      features: [
        "App iOS et Android natives",
        "Synchronisation temps réel",
        "Mode hors ligne",
        "Notifications push"
      ]
    },
    {
      icon: Globe,
      title: "API & Intégrations",
      description: "Connectez EasyBail à vos outils existants",
      color: "bg-teal-600",
      features: [
        "API REST complète",
        "Webhooks en temps réel",
        "Intégration comptable",
        "Connecteurs bancaires"
      ]
    }
  ];

  return (
    <section id="fonctionnalites" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Toutes les fonctionnalités pour
            <span className="text-blue-600 block">gérer vos biens</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Plateforme complète pour simplifier votre gestion locative 
            et optimiser votre rentabilité immobilière.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              features={feature.features}
              color={feature.color}
            />
          ))}
        </div>

        {/* Additional Features - Simplified */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Et bien plus encore...
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-blue-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Prêt à révolutionner votre gestion locative ?
            </h3>
            <p className="text-lg mb-6 text-blue-100">
              Rejoignez plus de 50 000 propriétaires qui ont choisi EasyBail
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                Démarrer l'essai gratuit
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold">
                Voir la démo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
    {
      icon: Users,
      title: "Espace locataire",
      description: "Application mobile dédiée pour vos locataires",
      color: "bg-blue-500",
      features: [
        "App mobile iOS et Android",
        "Paiement en ligne sécurisé",
        "Signalement d'incidents",
        "Messagerie intégrée",
        "Historique complet"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Résolution d'incidents",
      description: "Plateforme complète de gestion des problèmes locatifs",
      color: "bg-yellow-600",
      features: [
        "Ticketing intelligent",
        "Réseau d'artisans partenaires",
        "Suivi en temps réel",
        "Procédures juridiques guidées",
        "Médiation automatisée"
      ]
    },
    {
      icon: Shield,
      title: "Sécurité & Conformité",
      description: "Sécurité bancaire et conformité réglementaire garanties",
      color: "bg-gray-600",
      features: [
        "Chiffrement AES-256",
        "Hébergement France (OVH)",
        "Certification ISO 27001",
        "Conformité RGPD",
        "Sauvegarde quotidienne"
      ]
    },
    {
      icon: BookOpen,
      title: "Accompagnement Expert",
      description: "Formation et support par des experts de l'immobilier",
      color: "bg-green-500",
      features: [
        "Onboarding personnalisé",
        "Webinaires mensuels",
        "Support juridique inclus",
        "Veille réglementaire",
        "Communauté d'experts"
      ]
    },
    {
      icon: Smartphone,
      title: "Applications mobiles",
      description: "Gérez votre patrimoine depuis votre smartphone",
      color: "bg-indigo-600",
      features: [
        "App iOS et Android natives",
        "Synchronisation temps réel",
        "Mode hors ligne",
        "Notifications push",
        "Interface optimisée mobile"
      ]
    },
    {
      icon: Globe,
      title: "API & Intégrations",
      description: "Connectez EasyBail à vos outils existants",
      color: "bg-teal-600",
      features: [
        "API REST complète",
        "Webhooks en temps réel",
        "Intégration comptable",
        "Connecteurs bancaires",
        "Marketplace d'extensions"
      ]
    },
    {
      icon: Clock,
      title: "Gestion du temps",
      description: "Optimisez votre temps avec la planification intelligente",
      color: "bg-red-600",
      features: [
        "Planification intelligente",
        "Priorisation automatique",
        "Calendrier unifié",
        "Rappels contextuels",
        "Optimisation des déplacements"
      ]
    },
    {
      icon: Award,
      title: "Certification & Audit",
      description: "Outils professionnels pour la certification",
      color: "bg-pink-600",
      features: [
        "Audit de conformité",
        "Certification qualité",
        "Rapports d'expertise",
        "Validation juridique",
        "Accompagnement certification"
      ]
    }
  ];

  return (
    <section id="fonctionnalites" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Toutes les fonctionnalités pour
            <span className="text-blue-600 block">gérer vos biens</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Plateforme complète pour simplifier votre gestion locative 
            et optimiser votre rentabilité immobilière.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              features={feature.features}
              color={feature.color}
            />
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-blue-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Prêt à révolutionner votre gestion locative ?
            </h3>
            <p className="text-lg mb-6 text-blue-100">
              Rejoignez plus de 50 000 propriétaires qui ont choisi EasyBail
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
                Démarrer l'essai gratuit
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold">
                Voir la démo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
