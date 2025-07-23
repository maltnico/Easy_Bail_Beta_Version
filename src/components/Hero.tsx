import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Play, Zap, Shield } from 'lucide-react';

interface HeroProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onLoginClick, onSignupClick }) => {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 py-20 lg:py-32 overflow-hidden">
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
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Simplifiez votre
            <span className="text-blue-600 block">
              gestion locative
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Plateforme complète de gestion locative pour 
            <span className="font-semibold text-gray-900"> gérer vos biens</span>, 
            <span className="font-semibold text-gray-900"> automatiser vos tâches</span> et 
            <span className="font-semibold text-gray-900"> optimiser votre rentabilité</span>.
          </p>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-900">Automatisation</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-semibold text-gray-900">Conformité garantie</span>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-gray-600" />
              </div>
              <span className="font-semibold text-gray-900">Sécurité maximale</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link
              to="/login?mode=signup"
              className="bg-blue-600 text-white px-10 py-4 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold text-lg shadow-sm hover:shadow-md flex items-center group"
            >
              <span>Démarrer gratuitement</span>
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              className="border border-gray-300 text-gray-700 px-10 py-4 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all duration-200 font-semibold text-lg flex items-center group"
            >
              <Play className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Voir la démo</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-6 font-medium">Rejoignez plus de 50 000 propriétaires qui nous font confiance</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-70">
              <div className="text-gray-500 font-bold text-lg">ORPI</div>
              <div className="text-gray-500 font-bold text-lg">CENTURY 21</div>
              <div className="text-gray-500 font-bold text-lg">FONCIA</div>
              <div className="text-gray-500 font-bold text-lg">NEXITY</div>
            </div>
            <div className="mt-6 flex justify-center items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                <span className="font-semibold">4.9/5</span>
                <span className="ml-1">sur Trustpilot</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span>99.9% de disponibilité</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-blue-500 mr-1" />
                <span>Certifié ISO 27001</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default Hero;
