import React from 'react';
import { FileText, Mail, Phone, MapPin, Shield, BookOpen, Twitter, Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold">EasyBail</span>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              La plateforme complète de gestion locative qui simplifie 
              votre quotidien de propriétaire.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            
            {/* Certifications */}
            <div className="pt-6 border-t border-gray-800">
              <p className="text-sm text-gray-400 mb-3">Certifications & Partenaires</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="bg-gray-800 px-3 py-1 rounded-full">ISO 27001</span>
                <span className="bg-gray-800 px-3 py-1 rounded-full">RGPD</span>
                <span className="bg-gray-800 px-3 py-1 rounded-full">HDS</span>
              </div>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Produit</h3>
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Fonctionnalités</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tarifs</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">API</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Intégrations</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Sécurité</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Roadmap</a></li>
            </ul>
          </div>

          {/* Ressources */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Ressources</h3>
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Guides</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Webinaires</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Cas clients</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Livre blanc</a></li>
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Entreprise</h3>
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-blue-400 transition-colors">À propos</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Équipe</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Carrières</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Presse</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Investisseurs</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 bg-opacity-20 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Email</p>
                <a href="mailto:contact@easybail.fr" className="text-gray-300 hover:text-blue-400 transition-colors">
                  contact@easybail.fr
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 bg-opacity-20 rounded-lg flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Téléphone</p>
                <a href="tel:0180914282" className="text-gray-300 hover:text-green-400 transition-colors">
                  01 80 91 42 82
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 bg-opacity-20 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">Adresse</p>
                <span className="text-gray-300">Paris, France</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 EasyBail SAS. Tous droits réservés. | RCS Paris 123 456 789
          </div>
          <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">CGU</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
            <a href="#" className="hover:text-white transition-colors">Plan du site</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
