import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OffreCard } from '@/components/client/OffreCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { offresAPI } from '@/lib/api'
import { CATEGORIES } from '@/lib/utils'
import {
  ArrowRight,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Shield,
} from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadOffres()
  }, [])

  const loadOffres = async () => {
    try {
      const response = await offresAPI.getAll()
      setOffres(response.data.slice(0, 6)) // Afficher 6 offres sur la page d'accueil
    } catch (error) {
      console.error('Erreur chargement offres:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${searchQuery}`)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section avec gradient moderne */}
      <section className="relative bg-gradient-to-br from-primary/5 via-purple-50 to-pink-50 py-20 lg:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-80 h-80 bg-gradient-to-tr from-pink-300/20 to-primary/20 rounded-full blur-3xl" />

        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                +500 offres de streaming disponibles
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Vos abonnements streaming
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                {' '}
                au meilleur prix
              </span>
            </h1>

            <p className="mb-8 text-xl text-muted-foreground">
              Découvrez Netflix, Spotify, Disney+ et plus encore à des prix
              imbattables. Comparez les offres de nos partenaires en un clin
              d'œil.
            </p>

            {/* Barre de recherche hero */}
            <div className="mx-auto flex max-w-lg gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Netflix, Spotify, Disney+..."
                  className="h-14 pl-12 text-lg shadow-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button size="lg" className="h-14 px-8 shadow-xl" onClick={handleSearch}>
                Rechercher
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-muted-foreground">Offres</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm text-muted-foreground">Partenaires</div>
              </div>
              <div>
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm text-muted-foreground">Clients satisfaits</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Explorez par catégorie
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => navigate(`/catalogue?categorie=${category.value}`)}
                className="group flex flex-col items-center gap-3 rounded-2xl border-2 border-transparent bg-gradient-to-br from-gray-50 to-gray-100 p-6 transition-all hover:border-primary hover:shadow-lg"
              >
                <span className="text-4xl transition-transform group-hover:scale-110">
                  {category.icon}
                </span>
                <span className="font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Offres populaires */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Offres populaires 🔥</h2>
              <p className="text-muted-foreground">
                Les plus demandées par nos clients
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/catalogue')}
              className="hidden md:flex"
            >
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <LoadingSpinner text="Chargement des offres..." />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {offres.map((offre) => (
                  <OffreCard key={offre.id} offre={offre} />
                ))}
              </div>
              <div className="mt-8 text-center md:hidden">
                <Button onClick={() => navigate('/catalogue')}>
                  Voir toutes les offres
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Pourquoi nous choisir */}
      <section className="py-16 bg-white">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Pourquoi Joris Streaming ?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Meilleurs prix</h3>
              <p className="text-muted-foreground">
                Comparez et trouvez les offres les plus avantageuses du marché
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Paiement sécurisé</h3>
              <p className="text-muted-foreground">
                Transactions 100% sécurisées avec CinetPay
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Support 24/7</h3>
              <p className="text-muted-foreground">
                Notre équipe est là pour vous accompagner à tout moment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-primary to-purple-600 py-16 text-white">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Prêt à économiser sur vos abonnements ?
          </h2>
          <p className="mb-8 text-xl opacity-90">
            Rejoignez des milliers de clients satisfaits
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/catalogue')}
            className="shadow-xl"
          >
            Découvrir les offres
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  )
}
