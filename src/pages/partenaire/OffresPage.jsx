import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Boxes,
  CheckCircle2,
  Edit3,
  Layers,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getPartenaireId, getServiceMeta } from '../../Utils/Utils'
import { offresAPI } from '../../lib/api'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  KpiCard,
  LoadingState,
  PageHeader,
  ServiceLogo,
  StatusBadge,
  formatFCFA,
} from '../../components/saas/SaasPrimitives'

export default function OffresPartenairePage() {
  const navigate = useNavigate()
  const partenaireId = getPartenaireId()
  const [loading, setLoading] = useState(true)
  const [mesOffres, setMesOffres] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [stockFilter, setStockFilter] = useState('ALL') // ALL, IN_STOCK, OUT_OF_STOCK
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, ACTIVE, INACTIVE

  const loadData = async () => {
    if (!partenaireId) {
      navigate('/backoffice/login')
      return
    }

    setLoading(true)
    try {
      const res = await offresAPI.getByPartenaire(partenaireId, {
        search: searchQuery.trim() || undefined,
        categorie: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        withStats: true,
      })

      const rawOffres = Array.isArray(res?.data) ? res.data : (res?.data?.data || [])

      const offresMapped = rawOffres.map((o) => {
        const meta = getServiceMeta(o.service || o.nomService)

        // Extraire tous les forfaits et tarifs associés
        let forfaits = []
        if (Array.isArray(o.forfaitOffres) && o.forfaitOffres.length > 0) {
          forfaits = o.forfaitOffres.map((fo) => ({
            id: fo.forfait?.id || fo.id,
            plan: fo.forfait?.plan || `${fo.forfait?.duree || 1} Mois`,
            duree: Number(fo.forfait?.duree || 1),
            periode: fo.forfait?.periode || 'MOIS',
            prixPartage: Number(fo.prixPartage || o.prixVente || 0),
            prixPrive: Number(fo.prixPrive || o.prixVente || 0),
            isPartageActive: fo.isPartageActive !== false,
            isPriveActive: fo.isPriveActive !== false,
          }))
        } else if (Array.isArray(o.forfaits) && o.forfaits.length > 0) {
          forfaits = o.forfaits.map((f) => ({
            ...f,
            duree: Number(f.duree || 1),
            periode: f.periode || 'MOIS',
            prixPartage: Number(f.prix || o.prixVente || 0),
            prixPrive: Number(f.prix || o.prixVente || 0),
            isPartageActive: true,
            isPriveActive: true,
          }))
        } else {
          forfaits = [
            {
              id: o.id,
              plan: o.typeCompte || 'Standard',
              duree: Number(o.duree || 1),
              periode: 'MOIS',
              prixPartage: Number(o.prixVente || 0),
              prixPrive: Number(o.prixVente || 0),
              isPartageActive: true,
              isPriveActive: true,
            },
          ]
        }

        const allPrices = []
        forfaits.forEach((f) => {
          if (f.isPartageActive && f.prixPartage > 0) allPrices.push(f.prixPartage)
          if (f.isPriveActive && f.prixPrive > 0) allPrices.push(f.prixPrive)
        })
        if (allPrices.length === 0) allPrices.push(Number(o.prixVente || o.prixOriginal || 0))

        const minPrice = Math.min(...allPrices)
        const maxPrice = Math.max(...allPrices)
        const isMultiTarifs = minPrice !== maxPrice || forfaits.length > 1

        const distinctDurations = Array.from(
          new Set(
            forfaits.map((f) => {
              const d = Number(f.duree || 1)
              const p = (f.periode || 'MOIS').toUpperCase()
              if (p.startsWith('AN')) return `${d}A`
              if (p.startsWith('JOUR')) return `${d}J`
              return `${d}M`
            })
          )
        )

        const firstForfait = forfaits[0] || {}

        return {
          id: o.id,
          nom: o.titreOffre || o.nom || o.nomService,
          service: o.service || o.nomService,
          categorie: o.categorie || meta.category || 'streaming',
          image: o.imageService || o.image,
          prix: minPrice,
          prixMax: maxPrice,
          isMultiTarifs,
          forfaits,
          distinctDurations,
          duree: Number(firstForfait?.duree || o.duree || 1),
          periode: firstForfait?.periode || 'MOIS',
          forfaitNom: firstForfait?.plan || 'Forfait Standard',
          stock: Number(o.quantiteDisponible ?? o.stock ?? 0),
          ventes: Number(o.ventes || 0),
          revenu: Number(o.revenu || 0),
          actif: o.isActive !== false,
          description: o.description || '',
          promotionDirecte: o.promotionDirecte || null,
        }
      })

      setMesOffres(offresMapped)
    } catch (error) {
      console.error('Erreur chargement offres partenaire:', error)
      toast.error('Impossible de charger vos offres')
      setMesOffres([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData()
    }, 200)
    return () => clearTimeout(timer)
  }, [partenaireId, searchQuery, categoryFilter])

  // KPIs globaux
  const stats = useMemo(() => {
    const total = mesOffres.length
    const actives = mesOffres.filter((o) => o.actif).length
    const totalVentes = mesOffres.reduce((acc, o) => acc + o.ventes, 0)
    const totalStock = mesOffres.reduce((acc, o) => acc + o.stock, 0)
    const totalRevenu = mesOffres.reduce((acc, o) => acc + o.revenu, 0)

    return { total, actives, totalVentes, totalStock, totalRevenu }
  }, [mesOffres])

  // Filtrage local pour le stock et le statut
  const filteredOffres = useMemo(() => {
    return mesOffres.filter((o) => {
      if (stockFilter === 'IN_STOCK' && o.stock <= 0) return false
      if (stockFilter === 'OUT_OF_STOCK' && o.stock > 0) return false
      if (statusFilter === 'ACTIVE' && !o.actif) return false
      if (statusFilter === 'INACTIVE' && o.actif) return false
      return true
    })
  }, [mesOffres, stockFilter, statusFilter])

  const handleToggleActif = async (offreId, currentActif) => {
    try {
      await offresAPI.toggleActive(offreId)
      toast.success(currentActif ? 'Offre mise en pause' : 'Offre activée et visible')
      setMesOffres((prev) =>
        prev.map((o) => (o.id === offreId ? { ...o, actif: !currentActif } : o))
      )
    } catch {
      toast.error('Erreur lors du changement de statut')
    }
  }

  const handleSupprimerOffre = async (offreId, offreNom) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l'offre "${offreNom}" ?`)) return
    try {
      await offresAPI.delete(offreId)
      toast.success('Offre supprimée avec succès')
      setMesOffres((prev) => prev.filter((o) => o.id !== offreId))
    } catch {
      toast.error('Erreur lors de la suppression de l’offre')
    }
  }

  if (loading && mesOffres.length === 0) return <LoadingState label="Chargement de vos offres..." />

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <PageHeader
        title="Mes Offres de Streaming & Services"
        description="Gérez votre catalogue d'abonnements, suivez les ventes réalisées et surveillez vos stocks d'identifiants en direct."
        action={
          <Button
            onClick={() => navigate('/partenaire/offres/nouvelle')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm gap-2"
          >
            <Plus className="h-4 w-4" /> Nouvelle offre
          </Button>
        }
      />

      {/* Cartes KPI Synthèse */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Offres"
          value={stats.total}
          subtext={`${stats.actives} active(s)`}
          icon={Package}
        />
        <KpiCard
          title="Ventes Réalisées"
          value={`${stats.totalVentes} vente(s)`}
          subtext="Souscriptions payées"
          icon={ShoppingCart}
        />
        <KpiCard
          title="Stock Total Restant"
          value={`${stats.totalStock} compte(s)`}
          subtext="Identifiants disponibles"
          icon={Boxes}
        />
        <KpiCard
          title="Revenu Généré"
          value={formatFCFA(stats.totalRevenu)}
          subtext="Chiffre d'affaires de vos offres"
          icon={TrendingUp}
        />
      </div>

      {/* Barre d'outils et Filtres */}
      <Card className="p-4 border border-border shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Recherche */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher une offre, un service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {/* Filtres déroulants */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Catégorie */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold outline-none shadow-2xs"
            >
              <option value="ALL">Toutes les catégories</option>
              <option value="streaming">Streaming Vidéo</option>
              <option value="musique">Musique</option>
              <option value="gaming">Gaming</option>
              <option value="cartes">Cartes & Paiement</option>
              <option value="productivite">Productivité</option>
            </select>

            {/* Stock */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold outline-none shadow-2xs"
            >
              <option value="ALL">Tous les stocks</option>
              <option value="IN_STOCK">En stock (&gt; 0)</option>
              <option value="OUT_OF_STOCK">En rupture (0)</option>
            </select>

            {/* Statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold outline-none shadow-2xs"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIVE">Actives uniquement</option>
              <option value="INACTIVE">Inactives / Pause</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Grille de Cartes d'Offres */}
      {filteredOffres.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Package}
            title={searchQuery || categoryFilter !== 'ALL' ? 'Aucune offre trouvée' : "Vous n'avez pas encore d'offres"}
            description={
              searchQuery || categoryFilter !== 'ALL'
                ? 'Aucune offre ne correspond à vos filtres de recherche actuels.'
                : 'Créez votre première offre de streaming pour commencer à vendre dès aujourd’hui.'
            }
            action={
              <Button onClick={() => navigate('/partenaire/offres/nouvelle')} className="gap-2">
                <Plus className="h-4 w-4" /> Créer une offre
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOffres.map((offre) => {
            const isOutOfStock = offre.stock === 0
            const isLowStock = offre.stock > 0 && offre.stock <= 5

            return (
              <Card
                key={offre.id}
                className={`flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:shadow-md ${
                  !offre.actif
                    ? 'opacity-70 bg-muted/30 border-dashed border-slate-300'
                    : 'border-border bg-card'
                }`}
              >
                {/* Haut de la Carte : Service + Statut Toggle */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <ServiceLogo
                        name={offre.service || offre.nom}
                        image={offre.image}
                        size="md"
                        className="shadow-2xs rounded-2xl shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                          {offre.categorie}
                        </span>
                        <h3 className="font-extrabold text-foreground text-base leading-snug truncate" title={offre.nom}>
                          {offre.nom}
                        </h3>
                      </div>
                    </div>

                    {/* Switch Statut Actif */}
                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <button
                        onClick={() => handleToggleActif(offre.id, offre.actif)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          offre.actif ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                        title={offre.actif ? 'Désactiver l’offre' : 'Activer l’offre'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            offre.actif ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-[10px] font-bold mt-1 text-muted-foreground whitespace-nowrap">
                        {offre.actif ? 'En ligne' : 'En pause'}
                      </span>
                    </div>
                  </div>

                  {/* Forfaits liés & Durées */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {offre.forfaits && offre.forfaits.length > 1 ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <div className="flex items-center gap-1">
                          {offre.distinctDurations?.map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className="inline-flex items-center rounded-lg bg-secondary/80 px-2 py-0.5 text-[10px] font-black text-secondary-foreground"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-extrabold text-primary">
                          <Zap className="h-3 w-3" />
                          {offre.forfaits.length} forfaits actifs
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/80 px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                        <Zap className="h-3.5 w-3.5 text-primary" />
                        {offre.forfaitNom} ({offre.duree} {offre.periode?.toLowerCase()})
                      </span>
                    )}

                    {offre.promotionDirecte && (
                      <span className="inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-extrabold text-rose-600 animate-pulse">
                        <Sparkles className="h-3 w-3" />
                        -{offre.promotionDirecte.valeur}
                        {offre.promotionDirecte.type === 'POURCENTAGE' ? '%' : ' FCFA'}
                      </span>
                    )}
                  </div>

                  {/* Prix & Remise */}
                  <div className="pt-2">
                    {offre.promotionDirecte ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-rose-600">
                          {formatFCFA(offre.promotionDirecte.prixReduit)}
                        </span>
                        <span className="text-xs text-muted-foreground line-through font-semibold">
                          {formatFCFA(offre.prix)}
                        </span>
                      </div>
                    ) : offre.isMultiTarifs ? (
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase block leading-none mb-0.5">
                          À partir de
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-foreground">
                            {formatFCFA(offre.prix)}
                          </span>
                          {offre.prixMax > offre.prix && (
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              jusqu'à {formatFCFA(offre.prixMax)}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xl font-black text-foreground">
                        {formatFCFA(offre.prix)}
                      </div>
                    )}
                  </div>

                  {/* Description de l'offre */}
                  {offre.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed whitespace-pre-line font-medium pt-1">
                      {offre.description}
                    </p>
                  )}

                  {/* Section Métriques : Stock Restant & Ventes */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/80">
                    {/* Stock */}
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Stock restant</span>
                        <Boxes className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isOutOfStock
                              ? 'bg-rose-500'
                              : isLowStock
                              ? 'bg-amber-500 animate-ping'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <span
                          className={`text-xs font-black ${
                            isOutOfStock
                              ? 'text-rose-600'
                              : isLowStock
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {isOutOfStock ? '0 (Rupture)' : `${offre.stock} dispo.`}
                        </span>
                      </div>
                    </div>

                    {/* Ventes */}
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">Ventes totales</span>
                        <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span className="text-xs font-black text-foreground">
                        {offre.ventes} vente{offre.ventes > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bas de la Carte : Actions Rapides */}
                <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/partenaire/identifiants')}
                    className="text-xs font-bold gap-1.5 rounded-xl text-muted-foreground hover:text-foreground"
                    title="Gérer les identifiants en stock"
                  >
                    <Boxes className="h-3.5 w-3.5" /> Stock
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/partenaire/offres/editer/${offre.id}`)}
                      className="text-xs font-bold gap-1.5 rounded-xl text-primary border-primary/20 hover:bg-primary/10"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Modifier
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSupprimerOffre(offre.id, offre.nom)}
                      className="text-xs font-bold text-destructive hover:bg-destructive/10 rounded-xl p-2 h-8 w-8"
                      title="Supprimer cette offre"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
