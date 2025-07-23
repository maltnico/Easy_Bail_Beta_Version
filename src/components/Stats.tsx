import React from 'react';
import { Users, FileText, Clock, Shield, TrendingUp, Award, Globe, Zap } from 'lucide-react';

const Stats = () => {
  const stats = [
    {
      icon: Users,
      number: "50,000+",
      label: "Propriétaires actifs",
      description: "Nous font confiance",
      color: "text-blue-600"
    },
    {
      icon: TrendingUp,
      number: "€2.5Md",
      label: "Patrimoine géré",
      description: "Sur la plateforme",
      color: "text-green-600"
    },
    {
      icon: FileText,
      number: "5M+",
      label: "Documents générés",
      description: "Chaque année",
      color: "text-orange-600"
    },
    {
      icon: Zap,
      number: "95%",
      label: "Temps économisé",
      description: "Vs gestion manuelle",
      color: "text-purple-600"
    },
    {
      icon: Shield,
      number: "99.9%",
      label: "Disponibilité",
      description: "Garantie SLA",
      color: "text-gray-600"
    },
    {
      icon: Award,
      number: "4.9/5",
      label: "Satisfaction client",
      description: "Note moyenne",
      color: "text-yellow-600"
    },
    {
      icon: Globe,
      number: "24/7",
      label: "Support expert",
      description: "Disponible",
      color: "text-teal-600"
    },
    {
      icon: Clock,
      number: "< 2min",
      label: "Temps de réponse",
      description: "Support moyen",
      color: "text-red-600"
    }
  ];

  return (
    <section className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            L'impact EasyBail en chiffres
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Découvrez pourquoi nous sommes la référence de la gestion locative digitale
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white bg-opacity-10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-6">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="text-4xl font-bold text-white mb-3">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-gray-300 mb-2">
                {stat.label}
              </div>
              <div className="text-gray-400 text-sm">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional Stats Row */}
        <div className="bg-white bg-opacity-10 rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">€127M</div>
              <div className="text-gray-300">Économies générées pour nos clients</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">15 pays</div>
              <div className="text-gray-300">Présence internationale</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">2019</div>
              <div className="text-gray-300">Année de création</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
