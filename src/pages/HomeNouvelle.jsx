import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Loader, Search, ShieldCheck, Sparkles, Store, Zap 
} from 'lucide-react'
import { abonnementsAPI } from '../lib/api'
import toast from 'react-hot-toast'
import { CATEGORIES, OPERATOR_BADGES, getServiceMeta, normalizeOffer, getClientUser } from '@/Utils/Utils'
import ClientAuthModal from '../components/ClientAuthModal'

const formatFCFA = (value) => `${new Intl.NumberFormat('fr-FR').format(Number(value) || 0)} FCFA`

export default function HomeNouvelle() {
  const navigate = useNavigate()
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  
  // Modal d'Authentification Client Unifié
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [selectedOfferId, setSelectedOfferId] = useState(null)

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
        toast.error('Impossible de charger les offres')
        setOffres([])
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      load()
    }, 200)

    return () => clearTimeout(timer)
  }, [query, category])

  // Vérification au clic sur Acheter
  const handleBuyClick = (offerId) => {
    const client = getClientUser()
    
    if (client) {
      navigate(`/offre/${offerId}`)
    } else {
      setSelectedOfferId(offerId)
      setIsAuthModalOpen(true)
    }
  }

  const filtered = offres

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* SECTION BANNIÈRE DE RECHERCHE */}
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
                    title={operator.label}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border shadow-sm transition-transform hover:scale-110"
                  >
                    <img 
                      src={operator.logoUrl} 
                      alt={operator.label} 
                      className="h-full w-full object-contain rounded"
                    />
                  </div>
                ))}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION DES OFFRES */}
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
                <OfferCard 
                  key={offer.id} 
                  offer={offer} 
                  onBuy={() => handleBuyClick(offer.id)} 
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODAL D'AUTHENTIFICATION CLIENT UNIFIÉ */}
      <ClientAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          if (selectedOfferId) navigate(`/offre/${selectedOfferId}`)
        }}
      />
    </div>
  )
}

// ================= COMPOSANTS EXPORTÉS =================

export function OfferCard({ offer, onBuy }) {
  const lowStock = Number(offer.stock) <= 5
  const hasDirectPromo = Boolean(offer.promotionDirecte)
  const isMultiDur = Array.isArray(offer.distinctDurations) && offer.distinctDurations.length > 1

  return (
    <article className="group flex min-h-[230px] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-0 transition-all duration-200 hover:shadow-lg hover:border-primary/40 relative">
      <div>
        <div className="flex items-start gap-3.5 p-4 pb-2">
          <ServiceLogo offer={offer} size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-extrabold text-slate-900 leading-tight tracking-tight group-hover:text-primary transition-colors">
              {offer.nom}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {isMultiDur ? (
                <div className="flex flex-wrap items-center gap-1">
                  {offer.distinctDurations.map((badge, bIdx) => (
                    <span
                      key={bIdx}
                      className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200/60"
                    >
                      {badge}
                    </span>
                  ))}
                  <span className="text-[10px] font-bold text-slate-500 ml-0.5">
                    Multi-durées
                  </span>
                </div>
              ) : (
                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-700 border border-emerald-200/60 w-fit">
                  {offer.duree} {offer.periode || 'mois'}
                </span>
              )}

              {hasDirectPromo && (
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-black text-rose-600 animate-pulse">
                  <Sparkles className="h-3 w-3" />
                  -{offer.promotionDirecte.valeur}
                  {offer.promotionDirecte.type === 'POURCENTAGE' ? '%' : ' FCFA'}
                </span>
              )}
            </div>
            <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Store className="h-3.5 w-3.5 text-slate-400" />
              {offer.partenaire}
            </p>
          </div>
          {lowStock && (
            <span className="flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive whitespace-nowrap">
              <Zap className="h-3 w-3 fill-current" />
              Stock bas
            </span>
          )}
        </div>

        <div className="px-4 py-1">
          <p className="line-clamp-2 text-xs text-slate-500 leading-relaxed whitespace-pre-line font-medium">
            {offer.description || `${offer.nom} - Forfait ${offer.duree} ${offer.periode || 'mois'}. Livraison instantanée.`}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-4">
        <div>
          {hasDirectPromo ? (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {offer.isMultiTarifs ? 'Dès' : 'Prix Promo'}
              </span>
              <span className="text-base font-black text-rose-600 tracking-tight">
                {formatFCFA(offer.promotionDirecte.prixReduit)}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 line-through">
                {formatFCFA(offer.prix)}
              </span>
            </div>
          ) : (
            <div>
              {offer.isMultiTarifs && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                  À partir de
                </span>
              )}
              <p className="text-base font-black text-slate-950 tracking-tight">
                {formatFCFA(offer.prix)}
              </p>
            </div>
          )}
          <p className="text-[10px] font-medium text-slate-400 mt-0.5">
            {offer.stock > 0 ? `${offer.stock} en stock` : 'Sur commande'}
          </p>
        </div>
        <button 
          onClick={onBuy} 
          className="h-9 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 cursor-pointer"
        >
          Acheter
        </button>
      </div>
    </article>
  )
}

export function ServiceLogo({ offer, size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs rounded-lg',
    md: 'h-11 w-11 text-sm rounded-xl',
    lg: 'h-14 w-14 text-base rounded-2xl'
  }

  const meta = getServiceMeta(offer?.service || offer?.nom || '')

  if (offer?.image) {
    return <img src={offer.image} alt={offer?.nom || 'Logo'} className={`${sizes[size]} shrink-0 object-cover shadow-sm`} />
  }

  return (
    <span
      className={`${sizes[size]} inline-flex shrink-0 items-center justify-center font-bold text-white shadow-sm`}
      style={{ backgroundColor: meta.color || '#0ea5e9' }}
    >
      {meta.initials || getInitials(offer?.nom || '')}
    </span>
  )
}

// ================= FONCTIONS UTILITAIRES =================

function getInitials(value = '') {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase() || 'A'
}
