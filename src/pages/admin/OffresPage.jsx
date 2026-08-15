import { useEffect, useState, useMemo } from 'react'
import {
  Eye,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  Boxes,
  Zap,
  Store,
  Sparkles,
  Layers,
  X,
  TrendingUp,
  Tag,
} from 'lucide-react'
import { abonnementsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
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
import { getServiceMeta } from '../../Utils/Utils'

export default function AdminOffresPage() {
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [recherche, setRecherche] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [detailOffre, setDetailOffre] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadOffres = async () => {
    setLoading(true)
    try {
      const res = await abonnementsAPI.getAll({
        search: recherche.trim() || undefined,
        statut: filtreStatut !== 'TOUS' ? filtreStatut : undefined,
        categorie: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        page,
        limit: 12,
      })
      const data = res?.data
      const rawList = Array.isArray(data) ? data : data?.data || []

      const mapped = rawList.map((offre) => {
        const meta = getServiceMeta(offre.service || offre.nomService || offre.nom)
        const forfaits = Array.isArray(offre.forfaits) ? offre.forfaits : []
        const firstForfait = forfaits[0] || {}

        return {
          id: offre.id,
          nom: offre.titreOffre || offre.nom || offre.nomService,
          service: offre.service || offre.nomService || offre.nom,
          partenaire: offre.partenaire?.nomBoutique || offre.partenaire?.nom || 'DigiStore',
          partenaireId: offre.partenaire?.id,
          categorie: offre.categorie || meta.category || 'streaming',
          image: offre.image || offre.imageService,
          prix: Number(offre.prixVente ?? offre.prixOriginal ?? offre.prix ?? 0),
          prixOriginal: Number(offre.prixOriginal ?? offre.prixVente ?? 0),
          duree: Number(firstForfait.duree || offre.duree || 1),
          periode: firstForfait.periode || 'MOIS',
          forfaitNom: firstForfait.plan || 'Forfait Standard',
          stock: Number(offre.stock ?? offre.quantiteDisponible ?? 0),
          ventes: Number(offre.ventes || 0),
          revenu: Number(offre.revenu || 0),
          statut: offre.isDeleted || offre.isActive === false ? 'SUSPENDU' : 'ACTIF',
          promotionDirecte: offre.promotionDirecte || null,
        }
      })

      setOffres(mapped)
      setTotalPages(data?.totalPages || 1)
      setTotal(data?.total || mapped.length)
    } catch (error) {
      console.error('Erreur chargement offres:', error)
      toast.error('Impossible de charger le catalogue')
      setOffres([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOffres()
    }, 200)
    return () => clearTimeout(timer)
  }, [recherche, filtreStatut, categoryFilter, page])

  const handleVoirOffre = async (id) => {
    setDetailOffre(null)
    setDetailLoading(true)
    try {
      const { data } = await abonnementsAPI.getDetails(id)
      setDetailOffre(data)
    } catch {
      toast.error('Impossible de charger les détails')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDelete = async (id, nom) => {
    if (!window.confirm(`Supprimer définitivement l'offre "${nom}" ?`)) return
    try {
      await abonnementsAPI.delete(id)
      toast.success('Offre supprimée')
      loadOffres()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  // Statistiques
  const stats = useMemo(() => {
    const actives = offres.filter((o) => o.statut === 'ACTIF').length
    const totalStock = offres.reduce((acc, o) => acc + o.stock, 0)
    const totalVentes = offres.reduce((acc, o) => acc + o.ventes, 0)
    return { total: total || offres.length, actives, totalStock, totalVentes }
  }, [offres, total])

  if (loading && offres.length === 0) {
    return <LoadingState label="Chargement du catalogue des offres..." />
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <PageHeader
        title="Catalogue des Offres de Streaming"
        description="Supervisez les abonnements publiés par l'ensemble des partenaires, vérifiez les stocks disponibles et les tarifs."
      />

      {/* Cartes KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Offres Catalogue"
          value={stats.total}
          subtext={`${stats.actives} active(s)`}
          icon={Package}
        />
        <KpiCard
          title="Offres en Ligne"
          value={stats.actives}
          subtext="Visibles par les clients"
          icon={Zap}
        />
        <KpiCard
          title="Stock d'Identifiants"
          value={`${stats.totalStock} dispo.`}
          subtext="Comptes en réserve"
          icon={Boxes}
        />
        <KpiCard
          title="Ventes Totales"
          value={`${stats.totalVentes} vente(s)`}
          subtext="Commandes réalisées"
          icon={TrendingUp}
        />
      </div>

      {/* Barre d'outils et Filtres */}
      <Card className="p-4 border border-border shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Recherche */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher une offre, un service, une boutique..."
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value)
                setPage(1)
              }}
              className="pl-9 text-xs"
            />
          </div>

          {/* Filtres déroulants */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setPage(1)
              }}
              className="h-10 rounded-xl border border-input bg-card px-3 text-xs font-bold outline-none shadow-2xs"
            >
              <option value="ALL">Toutes les catégories</option>
              <option value="streaming">Streaming Vidéo</option>
              <option value="musique">Musique</option>
              <option value="gaming">Gaming</option>
              <option value="cartes">Cartes & Paiement</option>
              <option value="productivite">Productivité</option>
            </select>

            <select
              value={filtreStatut}
              onChange={(e) => {
                setFiltreStatut(e.target.value)
                setPage(1)
              }}
              className="h-10 rounded-xl border border-input bg-card px-3 text-xs font-bold outline-none shadow-2xs"
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="ACTIF">Actives uniquement</option>
              <option value="SUSPENDU">Inactives / Pause</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Grille de Cartes d'Offres */}
      {offres.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={Package}
            title="Aucune offre trouvée"
            description="Aucun abonnement ne correspond à vos filtres de recherche."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {offres.map((o) => {
            const isOutOfStock = o.stock === 0
            const isLowStock = o.stock > 0 && o.stock <= 5

            return (
              <Card
                key={o.id}
                className={`flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:shadow-md ${
                  o.statut === 'SUSPENDU'
                    ? 'border-slate-300 bg-muted/20 opacity-75'
                    : 'border-border bg-card'
                }`}
              >
                {/* En-tête de la Carte */}
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <ServiceLogo name={o.service || o.nom} image={o.image} size="md" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                          {o.categorie}
                        </span>
                        <h3 className="font-extrabold text-foreground text-base leading-snug truncate">
                          {o.nom}
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                          <Store className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{o.partenaire}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black shrink-0 ${
                        o.statut === 'ACTIF'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                          : 'bg-slate-100 border border-slate-300 text-slate-600'
                      }`}
                    >
                      {o.statut}
                    </span>
                  </div>

                  {/* Forfait lié & Prix */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-secondary/80 px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                      <Zap className="h-3.5 w-3.5 text-primary" />
                      {o.forfaitNom} ({o.duree} {o.periode.toLowerCase()})
                    </span>

                    <span className="text-base font-black text-foreground">
                      {formatFCFA(o.prix)}
                    </span>
                  </div>

                  {/* Stock & Ventes */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/80 text-xs">
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                        Stock restant
                      </span>
                      <span
                        className={`text-xs font-black ${
                          isOutOfStock
                            ? 'text-rose-600'
                            : isLowStock
                            ? 'text-amber-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {isOutOfStock ? '0 (Rupture)' : `${o.stock} disponible(s)`}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                        Ventes réalisées
                      </span>
                      <span className="text-xs font-black text-foreground">
                        {o.ventes} vente{o.ventes > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bas de Carte */}
                <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVoirOffre(o.id)}
                    className="text-xs font-bold rounded-xl gap-1.5"
                  >
                    <Eye className="h-3.5 w-3.5" /> Inspecter l&apos;offre
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(o.id, o.nom)}
                    className="text-xs font-bold text-destructive hover:bg-destructive/10 rounded-xl p-2 h-8 w-8"
                    title="Supprimer l'offre"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-xs text-muted-foreground font-semibold">
            Page {page} sur {totalPages} ({total} offres répertoriées)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs font-bold rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs font-bold rounded-xl"
            >
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal Détails Offre */}
      {detailOffre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setDetailOffre(null)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-border pb-4">
              <ServiceLogo
                name={detailOffre.service || detailOffre.nomService || detailOffre.nom}
                image={detailOffre.image || detailOffre.imageService}
                size="lg"
              />
              <div>
                <h3 className="font-extrabold text-foreground text-lg">
                  {detailOffre.titreOffre || detailOffre.nom}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Boutique : <strong>{detailOffre.partenaire?.nomBoutique || 'Partenaire'}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-semibold">Prix de Vente :</span>
                <span className="font-black text-foreground">
                  {formatFCFA(detailOffre.prixVente || detailOffre.prixOriginal || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-semibold">Catégorie :</span>
                <span className="font-bold text-foreground uppercase">{detailOffre.categorie}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-semibold">Stock d&apos;identifiants :</span>
                <span className="font-black text-emerald-600">
                  {detailOffre.stock ?? detailOffre.quantiteDisponible ?? 0} compte(s)
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/60">
                <span className="text-muted-foreground font-semibold">Description :</span>
                <span className="font-medium text-foreground text-right max-w-[280px]">
                  {detailOffre.description || 'Aucune description.'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailOffre(null)}
                className="text-xs font-bold rounded-xl"
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
