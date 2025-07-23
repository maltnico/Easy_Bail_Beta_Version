import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, Zap, Crown, Rocket } from 'lucide-react';

interface PricingProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

const Pricing: React.FC<PricingProps> = ({ onLoginClick, onSignupClick }) => {
  const plans = [
    {
      icon: Zap,
      name: "Starter",
      price: "19",
      originalPrice: "29",
      period: "/mois",
      description: "Idéal pour commencer",
      features: [
        "Jusqu'à 3 biens",
        "50+ modèles de documents",
        "Signature électronique",
        "Automatisations de base",
        "Support email",
        "App mobile incluse"
      ],
      popular: false,
      cta: "Commencer l'essai",
      color: "border-gray-200"
    },
    {
      icon: Crown,
      name: "Professionnel",
      price: "49",
      originalPrice: "79",
      period: "/mois",
      description: "Le plus populaire",
      features: [
        "Jusqu'à 15 biens",
        "Tous les documents",
        "Automatisations avancées",
        "Support prioritaire",
        "Analytics avancés",
        "API & intégrations",
        "Formation personnalisée"
      ],
      popular: true,
      cta: "Choisir Professionnel",
      color: "border-blue-500"
    },
    {
      icon: Rocket,
      name: "Expert",
      price: "99",
      originalPrice: "149",
      period: "/mois",
      description: "Pour les pros de l'immobilier",
      features: [
        "Biens illimités",
        "Automatisations personnalisées",
        "Support dédié 24/7",
        "Onboarding VIP",
        "Développements sur mesure",
        "Account manager dédié",
        "SLA garantie 99.9%"
      ],
      popular: false,
      cta: "Contacter l'équipe",
      color: "border-gray-300"
    }
  ];

  return (
    <section id="tarifs" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-semibold mb-6">
            <Star className="h-4 w-4 mr-2 fill-current" />
            Offre de lancement - 50% de réduction
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Tarifs transparents,
            <span className="text-blue-600 block">résultats garantis</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Essai gratuit de 30 jours, puis choisissez la formule qui correspond 
            à la taille de votre patrimoine. Changement possible à tout moment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-xl shadow-sm border-2 p-6 ${
                plan.popular 
                  ? 'border-blue-500 shadow-md ring-2 ring-blue-100' 
                  : plan.color
              } transition-all duration-200 hover:shadow-md`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    Le plus choisi
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 rounded-lg flex items-center justify-center">
                  <plan.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="flex items-baseline justify-center mb-2">
                  {plan.originalPrice && (
                    <span className="text-2xl text-gray-400 line-through mr-2">{plan.originalPrice}€</span>
                  )}
                  <span className="text-4xl font-bold text-gray-900">{plan.price}€</span>
                  <span className="text-xl text-gray-500 ml-1">{plan.period}</span>
                </div>
                {plan.originalPrice && (
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
                    Économisez {parseInt(plan.originalPrice) - parseInt(plan.price)}€/mois
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <Link 
                  to={plan.cta.includes('Commencer') || plan.cta.includes('Choisir') ? '/login?mode=signup' : '/login'}
                  className="block w-full h-full"
                >
                  {plan.cta}
                </Link>
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Garantie satisfait ou remboursé 30 jours
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Essayez EasyBail sans risque. Si vous n'êtes pas entièrement satisfait, 
            nous vous remboursons intégralement.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium">Sans engagement</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium">Migration gratuite</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium">Formation incluse</span>
            </div>
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium">Support expert 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
