import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Gamepad2, Gift, Headphones, Loader, Search, ShieldCheck, Sparkles, Tv, Zap } from 'lucide-react'
import { abonnementsAPI } from '../lib/api'
import { Store, ShoppingBag, Tag } from 'lucide-react'; // Vérifiez que 'Store' est présent

import toast from 'react-hot-toast'
import { CATEGORIES, OPERATOR_BADGES } from '@/Utils/Utils';




const formatFCFA = (value) => `${new Intl.NumberFormat('fr-FR').format(Number(value) || 0)} FCFA`

export default function HomeNouvelle() {
  const navigate = useNavigate()
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await abonnementsAPI.getAll()
        setOffres((Array.isArray(data) ? data : []).map(normalizeOffer))
      } catch (error) {
        console.error(error)
        toast.error('Impossible de charger les offres')
        setOffres([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const filtered = useMemo(() => {
    return offres.filter((offre) => {
      const inCategory = !category || offre.categorie === category
      const text = `${offre.nom} ${offre.description}`.toLowerCase()
      const matchQuery = !query.trim() || text.includes(query.toLowerCase())
      return inCategory && matchQuery
    })
  }, [offres, category, query])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Plus de 200 partenaires vérifiés
            </span>

            <h1 className="mt-5 text-balance text-4xl font-black leading-[0.98] tracking-tight sm:text-6xl">
              Tous vos abonnements numériques,{' '}
              <span className="text-primary">payés en Mobile Money</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-muted-foreground sm:text-lg">
              Streaming, musique, gaming et cartes cadeaux au meilleur prix.
              <br className="hidden sm:block" />
              Livraison instantanée par e-mail.
            </p>

            <div className="mx-auto mt-7 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm">
              <Search className="ml-2 h-5 w-5 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher Netflix, Spotify, Game Pass..."
                className="min-w-0 flex-1 border-0 bg-transparent px-1 text-sm outline-none"
              />
              <button
                onClick={() => query.trim() && navigate(`/catalogue?search=${encodeURIComponent(query.trim())}`)}
                className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Rechercher
              </button>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-primary" />
                Livraison instantanée
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Paiement sécurisé
              </span>
              <span className="flex items-center gap-2">
                {OPERATOR_BADGES.map((operator) => (
                  <div 
                    key={operator.label} 
                    title={operator.label} // Affiche le nom du réseau au survol
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border shadow-sm transition-transform hover:scale-110 `}
                  >
                    <img 
                      src={operator.logoUrl} 
                      alt={operator.label} 
                      className="h-full w-full object-contain  rounded"
                    />
                  </div>
                ))}
              </span>

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
              {filtered.length} offre{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
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
                <OfferCard key={offer.id} offer={offer} onBuy={() => navigate(`/offre/${offer.id}`)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export function OfferCard({ offer, onBuy }) {
  const lowStock = Number(offer.stock) <= 5


return (
  <article className="group flex min-h-[220px] flex-col overflow-hidden rounded-xl border border-border bg-card p-0 transition-all duration-200 hover:shadow-md hover:border-slate-300">
    
    {/* En-tête de la carte */}
    <div className="flex items-start gap-3.5 p-4 pb-2">
      <ServiceLogo offer={offer} size="lg" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-bold text-slate-900 leading-tight tracking-tight group-hover:text-primary transition-colors">
          {offer.nom}
        </h3>
       
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-700 border border-emerald-200/60 mt-1.5 w-fit">
          {offer.duree} {offer.periode || 'mois'}
        </span>

        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 font-medium">
          {/* Correction du plantage : l'icône a maintenant une taille harmonieuse */}
          <Store className="h-3.5 w-3.5 text-slate-400" />
          {offer.partenaire}
        </p>
      </div>
      
      {/* Badge Alerte Stock */}
      {lowStock && (
        <span className="flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive whitespace-nowrap">
          <Zap className="h-3 w-3 fill-current" />
          Stock bas
        </span>
      )}
    </div>

    {/* Description du produit */}
    <p className="line-clamp-2 px-4 py-1 text-xs text-slate-500 leading-relaxed">
      {offer.description}
    </p>

    {/* Badges Opérateurs mobiles (Orange, MTN, Wave...) réactivés et épurés */}
    {/* <div className="mt-2 flex flex-wrap items-center gap-1 px-4">
      {(offer.operators || ['Orange', 'MTN', 'Wave']).map((operator, idx) => (
        <span 
          key={idx} 
          className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 tracking-wider uppercase"
        >
          {operator}
        </span>
      ))}
    </div> */}

    {/* Pied de carte : Prix et Action */}
    <div className="mt-auto flex items-center justify-between border-t border-slate-100 bg-slate-50/30 p-4">
      <div>
        <p className="text-base font-extrabold text-slate-950 tracking-tight">
          {formatFCFA(offer.prix)}
        </p>
        <p className="text-[10px] font-medium text-slate-400 mt-0.5">
          {offer.stock} en stock
        </p>
      </div>
      
      <button 
        onClick={onBuy} 
        className="h-9 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95"
      >
        Acheter
      </button>
    </div>
  </article>
);

}

export function ServiceLogo({ offer, size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs rounded-lg',
    md: 'h-11 w-11 text-sm rounded-xl',
    lg: 'h-14 w-14 text-base rounded-2xl'
  }

  if (offer.image) {
    return <img src={offer.image} alt={offer.nom} className={`${sizes[size]} shrink-0 object-cover shadow-sm`} />
  }

  return (
    <span className={`${sizes[size]} inline-flex shrink-0 items-center justify-center bg-primary font-bold text-primary-foreground shadow-sm`}>
      {getInitials(offer.nom)}
    </span>
  )
}

function normalizeOffer(offre = {}) {
  const firstPlan = offre.forfaits?.[0] || {}
  return {
    id: offre.id,
    nom: offre.nom || offre.nomService || 'Offre',
    description: offre.description || `Profitez de ${offre.nom || offre.nomService}`,
    categorie: offre.categorie || '',
    image: offre.image || offre.imageService || '',
    prix: Number(firstPlan.prix || offre.prixMensuel || 0),
    duree: Number(firstPlan.duree || offre.duree || 1),
    stock: Number(offre.stock ?? offre.quantiteDisponible ?? 0),
    partenaire: offre.partenaire?.nomBoutique || offre.partenaire?.nom || 'DigiStore CI',
    forfaits: offre.forfaits || []
  }
}

function getInitials(value = '') {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || 'A'
}
