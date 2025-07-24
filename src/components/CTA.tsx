import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Rocket, Star, Shield } from 'lucide-react';

interface CTAProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
}

const CTA: React.FC<CTAProps> = ({ onLoginClick, onSignupClick }) => {
  return (
    <section className="py-20 bg-blue-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-xl"></div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Transformez votre gestion locative
          <span className="block text-blue-100">
            dès aujourd'hui
          </span>
        </h2>
        <p className="text-lg text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
          Rejoignez plus de 50 000 propriétaires qui ont choisi EasyBail 
          pour simplifier leur gestion et optimiser leur rentabilité.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Link
            to="/login?mode=signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center group"
          >
            <span>Démarrer gratuitement</span>
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="border border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold"
          >
            Se connecter
          </Link>
        </div>

        {/* Simple Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 text-blue-100">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>30 jours gratuits</span>
          </div>
          <div className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            <span>Migration gratuite</span>
          </div>
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            <span>Sécurité garantie</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
