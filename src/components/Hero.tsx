import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Play, Zap, Shield } from 'lucide-react';

interface HeroProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

const Hero: React.FC<HeroProps> = () => {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 lg:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold mb-8 shadow-sm">
            <Star className="h-4 w-4 mr-2 fill-current" />
            🚀 Nouvelle version 2.0 disponible
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
            Simplifiez votre
            <span className="text-blue-600 dark:text-blue-400 block">
              gestion locative
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Plateforme complète de gestion locative pour 
            <span className="font-semibold text-gray-900 dark:text-white"> gérer vos biens</span>, 
            <span className="font-semibold text-gray-900 dark:text-white"> automatiser vos tâches</span> et 
            <span className="font-semibold text-gray-900 dark:text-white"> optimiser votre rentabilité</span>.
          </p>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Automatisation</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Conformité garantie</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">Sécurité maximale</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link
              to="/login?mode=signup"
              className="bg-blue-600 dark:bg-blue-500 text-white px-10 py-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 font-semibold text-lg shadow-sm hover:shadow-md flex items-center group"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-10 py-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-semibold text-lg flex items-center group">
              <Play className="mr-2 h-5 w-5" />
              Voir la démo
            </button>
          </div>

          {/* Social Proof */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">PLUS DE 2 000 PROPRIÉTAIRES NOUS FONT CONFIANCE</p>
            <div className="flex items-center justify-center space-x-8">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div key={index} className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                </div>
              ))}
              <span className="text-2xl font-bold text-gray-900 dark:text-white ml-4">4.9/5</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">(523 avis)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-8 items-center opacity-60">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">+50%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Gain de temps</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">99.9%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Disponibilité</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">2k+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
