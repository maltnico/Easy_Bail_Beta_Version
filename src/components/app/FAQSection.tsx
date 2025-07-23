import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: "Comment EasyBail utilise-t-il l'intelligence artificielle ?",
      answer: "Notre IA analyse vos données pour prédire les tendances, optimiser vos revenus, automatiser les tâches répétitives et vous alerter sur les risques potentiels. Elle apprend de vos habitudes pour personnaliser votre expérience et maximiser votre rentabilité."
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Absolument. Nous utilisons un chiffrement AES-256 de niveau bancaire, nos serveurs sont hébergés en France (OVH), et nous sommes certifiés ISO 27001. Vos données ne sont jamais partagées et nous respectons strictement le RGPD."
    },
    {
      question: "Puis-je migrer depuis mon ancien logiciel ?",
      answer: "Oui, notre équipe gère gratuitement la migration de vos données depuis n'importe quel logiciel (Excel, Word, autres solutions). Le processus prend généralement 24-48h et nous nous occupons de tout."
    },
    {
      question: "Combien de temps faut-il pour maîtriser EasyBail ?",
      answer: "La plupart de nos utilisateurs sont opérationnels en moins d'une heure grâce à notre interface intuitive. Nous proposons également un onboarding personnalisé et des formations gratuites pour vous accompagner."
    },
    {
      question: "EasyBail fonctionne-t-il sur mobile ?",
      answer: "Oui ! Nous proposons des applications natives iOS et Android avec toutes les fonctionnalités. Vous pouvez gérer vos biens, signer des documents et communiquer avec vos locataires depuis votre smartphone."
    },
    {
      question: "Quels types de biens puis-je gérer ?",
      answer: "EasyBail gère tous types de biens : appartements, maisons, studios, locaux commerciaux, parkings, meublés, non-meublés, colocation, etc. Notre solution s'adapte à tous les profils d'investisseurs."
    },
    {
      question: "Y a-t-il des frais cachés ?",
      answer: "Aucun frais caché. Le prix affiché inclut toutes les fonctionnalités, le support, les mises à jour et la formation. Pas de frais de setup, de migration ou de résiliation."
    },
    {
      question: "Que se passe-t-il si je ne suis pas satisfait ?",
      answer: "Nous offrons une garantie satisfait ou remboursé de 30 jours. Si EasyBail ne répond pas à vos attentes, nous vous remboursons intégralement, sans question."
    },
    {
      question: "Comment fonctionne le support client ?",
      answer: "Notre support expert est disponible 24/7 par chat, email et téléphone. Temps de réponse moyen : 2 minutes en chat, 1h par email. Nous proposons aussi des formations personnalisées et un accompagnement dédié."
    },
    {
      question: "Puis-je essayer EasyBail gratuitement ?",
      answer: "Oui ! Nous proposons un essai gratuit de 30 jours avec accès à toutes les fonctionnalités. Aucune carte bancaire requise pour commencer. Vous pouvez également demander une démo personnalisée."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-semibold mb-6">
            <HelpCircle className="h-4 w-4 mr-2" />
            Questions fréquentes
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Tout ce que vous devez savoir
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Retrouvez les réponses aux questions les plus fréquentes sur EasyBail
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-all duration-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                {openFAQ === index ? (
                  <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {openFAQ === index && (
                <div className="px-6 pb-4">
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="bg-blue-600 rounded-xl p-6 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">
            Vous ne trouvez pas la réponse à votre question ?
          </h3>
          <p className="text-blue-100 mb-6">
            Notre équipe d'experts est là pour vous aider
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Chat en direct
            </button>
            <button className="border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold flex items-center justify-center">
              <Phone className="h-5 w-5 mr-2" />
              01 80 91 42 82
            </button>
            <button className="border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold flex items-center justify-center">
              <Mail className="h-5 w-5 mr-2" />
              contact@easybail.fr
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
