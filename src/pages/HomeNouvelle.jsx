import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Play, Star, TrendingUp, Shield, Users, Sparkles } from 'lucide-react'

export default function HomeNouvelle() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [popularOffres, setPopularOffres] = useState([])
  const [loading, setLoading] = useState(false)

  // Catégories avec emojis
  const categories = [
    { value: 'FILMS_SERIES', label: 'Films & Séries', icon: '🎬', color: 'bg-red-500' },
    { value: 'MUSIQUE', label: 'Musique', icon: '🎵', color: 'bg-purple-500' },
    { value: 'GAMING', label: 'Gaming', icon: '🎮', color: 'bg-green-500' },
    { value: 'EBOOKS', label: 'Ebooks', icon: '📚', color: 'bg-yellow-500' },
    { value: 'SPORT', label: 'Sport', icon: '⚽', color: 'bg-blue-500' },
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleCategoryClick = (category) => {
    navigate(`/catalogue?categorie=${category}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section avec gradient moderne */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white overflow-hidden">
        {/* Éléments décoratifs */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">+500 offres de streaming disponibles</span>
            </div>
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center mb-6 leading-tight">
            VOS ABONNEMENTS STREAMING<br />
            <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              AU MEILLEUR PRIX 💜
            </span>
          </h1>

          {/* Sous-titre */}
          <p className="text-xl md:text-2xl text-center mb-12 text-white/90 max-w-3xl mx-auto">
            Découvrez Netflix, Spotify, Disney+ et plus encore à des prix imbattables. 
            Comparez les offres en un clin d'œil.
          </p>

          {/* Barre de recherche géante */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher Netflix, Spotify, Disney+..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-5 pr-32 text-lg rounded-2xl border-0 shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/30 text-gray-900"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2"
              >
                <Search className="h-5 w-5" />
                Rechercher
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-white/80">Offres disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-white/80">Partenaires</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-white/80">Clients satisfaits</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Catégories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Explorez par catégorie
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className="group p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-5xl mb-3">{cat.icon}</div>
                <div className="font-semibold text-gray-900">{cat.label}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section Offres Populaires */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">🔥 Offres populaires</h2>
              <p className="text-gray-600">Les plus demandées par nos clients</p>
            </div>
            <button
              onClick={() => navigate('/catalogue')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg"
            >
              Voir tout →
            </button>
          </div>

          {/* Placeholder pour les cartes d'offres */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-white/30">
                    🎬 Films & Séries
                  </div>
                  <div className="absolute top-3 right-3">
                    <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Service Premium</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      👤 <span>Partenaire</span>
                    </div>
                    <span>•</span>
                    <span>Abidjan</span>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-600">⏰ 1 mois</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-indigo-600">7,000 F</div>
                      <div className="text-xs text-gray-500">(7,000 F/mois)</div>
                    </div>
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all">
                      Souscrire
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Pourquoi nous choisir */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Pourquoi Joris Streaming ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl border-2 border-green-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Meilleurs prix</h3>
              <p className="text-gray-600">
                Comparez et trouvez les offres les plus avantageuses du marché
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Paiement sécurisé</h3>
              <p className="text-gray-600">
                Transactions 100% sécurisées avec CinetPay Mobile Money
              </p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl border-2 border-purple-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-2xl mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Support 24/7</h3>
              <p className="text-gray-600">
                Notre équipe est là pour vous accompagner à tout moment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à économiser sur vos abonnements ? 🎉
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Rejoignez des milliers de clients satisfaits
          </p>
          <button
            onClick={() => navigate('/catalogue')}
            className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl transform hover:scale-105"
          >
            Découvrir les offres →
          </button>
        </div>
      </section>
    </div>
  )
}
