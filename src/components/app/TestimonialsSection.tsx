import React from 'react';
import { Star, Quote, ArrowLeft, ArrowRight } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Marie Dubois",
      role: "Propriétaire de 12 biens",
      company: "Paris 11ème",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      rating: 5,
      text: "EasyBail a révolutionné ma gestion locative. L'IA prédit les problèmes avant qu'ils n'arrivent et j'ai économisé 15h par semaine. Mon ROI a augmenté de 23% en 6 mois !",
      metrics: {
        timesSaved: "15h/semaine",
        roiIncrease: "+23%"
      }
    },
    {
      id: 2,
      name: "Pierre Martin",
      role: "Gestionnaire immobilier",
      company: "Lyon Patrimoine",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      rating: 5,
      text: "Avec 45 biens à gérer, EasyBail est devenu indispensable. Les automatisations IA gèrent 90% de mes tâches répétitives. Mes clients sont ravis de la réactivité !",
      metrics: {
        properties: "45 biens",
        automation: "90%"
      }
    },
    {
      id: 3,
      name: "Sophie Bernard",
      role: "Investisseuse immobilière",
      company: "SCI Bernard & Associés",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      rating: 5,
      text: "L'analyse prédictive d'EasyBail m'a permis d'identifier les meilleurs investissements. J'ai doublé mon portefeuille en 18 mois grâce aux insights IA !",
      metrics: {
        growth: "x2 en 18 mois",
        accuracy: "94%"
      }
    },
    {
      id: 4,
      name: "Thomas Leroy",
      role: "Propriétaire débutant",
      company: "Marseille",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      rating: 5,
      text: "En tant que débutant, EasyBail m'a guidé pas à pas. L'assistant IA répond à toutes mes questions et la conformité légale est garantie. Je me sens en sécurité !",
      metrics: {
        experience: "Débutant",
        confidence: "100%"
      }
    },
    {
      id: 5,
      name: "Isabelle Moreau",
      role: "Gestionnaire de patrimoine",
      company: "Bordeaux Gestion",
      avatar: "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      rating: 5,
      text: "La migration depuis mon ancien logiciel s'est faite en 24h. L'équipe EasyBail a tout géré et maintenant je gagne 3h par jour. Le ROI est immédiat !",
      metrics: {
        migration: "24h",
        dailySavings: "3h/jour"
      }
    },
    {
      id: 6,
      name: "Jean-Claude Petit",
      role: "Propriétaire retraité",
      company: "Nice",
      avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2",
      rating: 5,
      text: "À 68 ans, je pensais que la technologie n'était pas pour moi. EasyBail est si simple que même ma petite-fille est impressionnée ! Tout est automatisé.",
      metrics: {
        age: "68 ans",
        satisfaction: "100%"
      }
    }
  ];

  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ils ont transformé leur
            <span className="block text-blue-600">
              gestion locative
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Découvrez comment nos clients ont révolutionné leur activité 
            et multiplié leur rentabilité grâce à EasyBail.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {getVisibleTestimonials().map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200 transition-all duration-200 ${
                  index === 1 ? 'ring-2 ring-blue-200' : ''
                }`}
              >
                {/* Quote Icon */}
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Quote className="h-6 w-6 text-white" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  {Object.entries(testimonial.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-xl font-bold text-blue-600">{value}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center mt-12 space-x-4">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextTestimonial}
              className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <ArrowRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Rejoignez plus de 50 000 propriétaires satisfaits
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez votre transformation dès aujourd'hui avec un essai gratuit de 30 jours
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              Démarrer mon essai gratuit
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
