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
        {/* Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg text-sm font-semibold mb-8">
          <CheckCircle className="h-4 w-4 mr-2" />
          Plus de 50 000 propriétaires nous font confiance
        </div>
        
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Transformez votre gestion locative
          <span className="block text-blue-100">
            dès aujourd'hui
          </span>
        </h2>
        <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
          Rejoignez les milliers de propriétaires qui ont choisi EasyBail pour 
          <span className="font-semibold text-white"> simplifier leur gestion</span> et 
          <span className="font-semibold text-white"> optimiser leur rentabilité</span>.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Link
            to="/login?mode=signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg flex items-center group"
          >
            <span>Démarrer gratuitement</span>
            <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="border border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold text-lg"
          >
            Se connecter
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">30 jours gratuits</h3>
            <p className="text-blue-100 text-sm">Essai complet sans engagement</p>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Migration gratuite</h3>
            <p className="text-blue-100 text-sm">Nous importons vos données</p>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-6">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Sécurité garantie</h3>
            <p className="text-blue-100 text-sm">Certification ISO 27001</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
