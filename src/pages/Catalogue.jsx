import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader, Search, Sparkles } from 'lucide-react'
import { abonnementsAPI } from '../lib/api'
import toast from 'react-hot-toast'
import { CATEGORIES, getServiceMeta, normalizeOffer } from '../Utils/Utils'
import { OfferCard } from './HomeNouvelle'

export default function Catalogue() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('categorie') || '')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await abonnementsAPI.getAll({
          search: query.trim() || undefined,
          categorie: category || undefined,
          statut: 'ACTIF',
        })
        const items = Array.isArray(data) ? data : (data?.data || [])
        setOffres(items.map(normalizeOffer))
      } catch (error) {
        console.error(error)
        toast.error('Impossible de charger le catalogue')
        setOffres([])
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      load()
    }, 200)

    return () => clearTimeout(timer)
  }, [category, query])

  const filtered = offres

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-[1400px] px-4 py-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Catalogue Complet
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
              Explorer tous les abonnements
            </h1>
            <div className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm">
              <Search className="ml-2 h-5 w-5 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Netflix, Spotify, Game Pass, Carte Visa..."
                className="min-w-0 flex-1 border-0 bg-transparent px-1 text-sm outline-none"
              />
              <button
                onClick={() => {}}
                className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const active = category === cat.value
            return (
              <button
                key={cat.label}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            )
          })}
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {filtered.length} offre{filtered.length > 1 ? 's' : ''} trouvée{filtered.length > 1 ? 's' : ''}
            </h2>
          </div>

          {loading ? (
            <div className="flex min-h-56 items-center justify-center rounded-xl border border-border bg-card">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              Aucune offre ne correspond à votre recherche.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onBuy={() => navigate(`/offre/${offer.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
