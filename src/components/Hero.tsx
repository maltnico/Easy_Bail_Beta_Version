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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-5"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-400 rounded-full mix-blend-multiply filter blur-xl opacity-5"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative text-center">
          {/* Main Heading */}
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
            Simplifiez votre
            <span className="text-blue-600 dark:text-blue-400 block">
              gestion locative
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            La solution complète pour gérer vos biens immobiliers, 
            automatiser vos tâches et optimiser votre rentabilité.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link
              to="/login?mode=signup"
              className="bg-blue-600 dark:bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 font-semibold flex items-center group"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 font-semibold flex items-center group">
              <Play className="mr-2 h-5 w-5" />
              Voir la démo
            </button>
          </div>

          {/* Social Proof */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">PLUS DE 50 000 PROPRIÉTAIRES NOUS FONT CONFIANCE</p>
            <div className="flex items-center justify-center space-x-8">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div key={index} className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                </div>
              ))}
              <span className="text-2xl font-bold text-gray-900 dark:text-white ml-4">4.9/5</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">(523 avis)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
