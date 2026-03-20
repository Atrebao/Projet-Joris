import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Zap, Shield, TrendingUp, ChevronRight, Star } from 'lucide-react'

export default function HomeNouvelle() {
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState(null)

  const features = [
    {
      icon: Zap,
      title: "Instantané",
      description: "Recevez vos identifiants en quelques minutes seulement",
      color: "from-amber-400 to-orange-500"
    },
    {
      icon: Shield,
      title: "100% Sécurisé",
      description: "Paiements protégés et données cryptées",
      color: "from-emerald-400 to-teal-500"
    },
    {
      icon: TrendingUp,
      title: "Économique",
      description: "Les meilleurs prix du marché garantis",
      color: "from-blue-400 to-indigo-500"
    }
  ]

  const offresPopulaires = [
    {
      nom: "Netflix Premium",
      prix: "7 500 FCFA",
      duree: "1 mois",
      badge: "Populaire",
      gradient: "from-red-500 via-pink-500 to-purple-600"
    },
    {
      nom: "Spotify Premium",
      prix: "4 500 FCFA",
      duree: "1 mois",
      badge: "Tendance",
      gradient: "from-green-400 via-emerald-500 to-teal-500"
    },
    {
      nom: "YouTube Premium",
      prix: "6 000 FCFA",
      duree: "1 mois",
      badge: "Nouveau",
      gradient: "from-red-600 via-orange-500 to-yellow-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-sm font-medium mb-6 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-105">
              <Sparkles className="h-4 w-4" />
              <span>Plateforme #1 en Côte d'Ivoire</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              Vos abonnements
              <br />
              en un clic
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Accédez à vos plateformes préférées sans carte bancaire.
              <span className="font-semibold text-indigo-600"> Simple, rapide et sécurisé.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/catalogue')}
                className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                Parcourir les offres
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/conditions')}
                className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg border-2 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Comment ça marche ?
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 border-2 border-white"></div>
                  ))}
                </div>
                <span className="font-medium">+2,500 utilisateurs</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">4.9/5 sur les avis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Pourquoi nous choisir ?
              </h2>
              <p className="text-xl text-gray-600">Une expérience pensée pour vous</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>

                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>

                  {hoveredCard === index && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Offres Populaires */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100 to-transparent rounded-full filter blur-3xl opacity-30"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Offres populaires
              </h2>
              <p className="text-xl text-gray-600">Nos abonnements les plus demandés</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {offresPopulaires.map((offre, index) => (
                <div
                  key={index}
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-transparent hover:border-indigo-200"
                >
                  {/* Gradient Header */}
                  <div className={`h-2 bg-gradient-to-r ${offre.gradient}`}></div>

                  <div className="p-8">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full mb-4">
                      <Sparkles className="h-3 w-3" />
                      {offre.badge}
                    </div>

                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{offre.nom}</h3>
                    <p className="text-gray-500 text-sm mb-6">{offre.duree}</p>

                    <div className="flex items-end gap-2 mb-6">
                      <span className={`text-4xl font-extrabold bg-gradient-to-r ${offre.gradient} bg-clip-text text-transparent`}>
                        {offre.prix}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate('/catalogue')}
                      className={`w-full py-3 bg-gradient-to-r ${offre.gradient} text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 group`}
                    >
                      Souscrire
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Hover Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${offre.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`}></div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/catalogue')}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 inline-flex items-center gap-2"
              >
                Voir toutes les offres
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              Prêt à commencer ?
            </h2>
            <p className="text-xl mb-10 text-indigo-100">
              Rejoignez des milliers d'utilisateurs satisfaits et profitez de vos plateformes préférées dès aujourd'hui
            </p>
            <button
              onClick={() => navigate('/catalogue')}
              className="px-10 py-5 bg-white text-indigo-600 rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 inline-flex items-center gap-3"
            >
              <Sparkles className="h-6 w-6" />
              Découvrir les offres
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
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
    </div>
  )
}
