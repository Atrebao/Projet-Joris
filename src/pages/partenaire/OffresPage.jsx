import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Eye, Package, Plus, Search, Trash2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPartenaireId, getServiceMeta } from '../../Utils/Utils'
import { offresAPI } from '../../lib/api'
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Input,
  LoadingState,
  PageHeader,
  ServiceLogo,
  StatusBadge,
  formatFCFA,
} from '../../components/saas/SaasPrimitives'

export default function OffresPage() {
  const navigate = useNavigate()
  const partenaireId = getPartenaireId()
  const [loading, setLoading] = useState(true)
  const [mesOffres, setMesOffres] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

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
        const firstForfait = Array.isArray(o.forfaits) ? o.forfaits[0] : o.forfaitOffres?.[0]?.forfait
        const meta = getServiceMeta(o.service || o.nomService)

        return {
          id: o.id,
          nom: o.titreOffre || o.nom || o.nomService,
          service: o.service || o.nomService,
          categorie: o.categorie || meta.category,
          image: o.imageService || o.image,
          prix: Number(o.prixVente ?? o.prixOriginal ?? o.prix ?? 0),
          duree: Number(firstForfait?.duree || o.duree || 1),
          periode: firstForfait?.periode || 'MOIS',
          forfaitNom: firstForfait?.plan || 'Forfait Standard',
          stock: Number(o.quantiteDisponible ?? o.stock ?? 0),
          ventes: Number(o.ventes || 0),
          revenu: Number(o.revenu || 0),
          actif: o.isActive !== false,
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

  const handleToggleActif = async (offreId, currentActif) => {
    try {
      await offresAPI.toggleActive(offreId)
      toast.success(currentActif ? 'Offre désactivée' : 'Offre activée')
      setMesOffres((prev) =>
        prev.map((o) => (o.id === offreId ? { ...o, actif: !currentActif } : o))
      )
    } catch {
      toast.error('Erreur lors de la modification du statut')
    }
  }

  const handleSupprimerOffre = async (offreId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette offre ?')) return
    try {
      await offresAPI.delete(offreId)
      toast.success('Offre supprimée avec succès')
      setMesOffres((prev) => prev.filter((o) => o.id !== offreId))
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading && mesOffres.length === 0) return <LoadingState label="Chargement de vos offres..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Offres"
        description="Visualisez, modifiez et gérez vos offres d'abonnements en ligne et leurs stocks."
        action={
          <Button onClick={() => navigate('/partenaire/offres/nouvelle')}>
            <Plus className="h-4 w-4" /> Nouvelle offre
          </Button>
        }
      />

      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Mes offres publiées</h2>
            <p className="text-xs text-muted-foreground">{mesOffres.length} offre(s) répertoriée(s)</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher une offre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded-lg border border-input bg-card px-3 text-xs font-medium outline-none"
            >
              <option value="ALL">Toutes les catégories</option>
              <option value="streaming">Streaming</option>
              <option value="musique">Musique</option>
              <option value="gaming">Gaming</option>
              <option value="cartes">Cartes & Paiement</option>
              <option value="productivite">Productivité</option>
            </select>
          </div>
        </div>

        {mesOffres.length === 0 ? (
          <EmptyState
            icon={Package}
            title={searchQuery ? 'Aucun résultat' : "Vous n'avez pas encore d'offres"}
            description={
              searchQuery
                ? 'Aucune offre ne correspond à vos critères de recherche.'
                : 'Créez votre première offre en liant un service à un forfait.'
            }
            action={
              !searchQuery && (
                <Button onClick={() => navigate('/partenaire/offres/nouvelle')}>
                  <Plus className="h-4 w-4" /> Créer une offre
                </Button>
              )
            }
          />
        ) : (
          <DataTable
            data={mesOffres}
            columns={[
              {
                key: 'offre',
                label: 'Offre & Service',
                render: (o) => (
                  <div className="flex items-center gap-3">
                    <ServiceLogo name={o.service || o.nom} image={o.image} size="sm" />
                    <div>
                      <p className="font-bold text-foreground">{o.nom}</p>
                      <span className="text-[11px] font-medium text-muted-foreground uppercase">{o.categorie}</span>
                    </div>
                  </div>
                ),
              },
              {
                key: 'forfait',
                label: 'Forfait & Durée',
                render: (o) => (
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                      <Zap className="h-3 w-3 text-primary" />
                      {o.forfaitNom}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {o.duree} {o.periode?.toLowerCase()}
                    </p>
                  </div>
                ),
              },
              {
                key: 'prix',
                label: 'Prix Vente',
                render: (o) => (
                  <span className="font-bold text-foreground text-sm">
                    {formatFCFA(o.prix)}
                  </span>
                ),
              },
              {
                key: 'stock',
                label: 'Stock',
                render: (o) => (
                  <Badge tone={o.stock > 5 ? 'success' : o.stock > 0 ? 'warning' : 'danger'}>
                    {o.stock} disponible{o.stock > 1 ? 's' : ''}
                  </Badge>
                ),
              },
              {
                key: 'ventes',
                label: 'Ventes & Revenus',
                render: (o) => (
                  <div>
                    <p className="font-semibold text-foreground">{o.ventes} vente{o.ventes > 1 ? 's' : ''}</p>
                    <p className="text-xs text-primary font-medium">{formatFCFA(o.revenu)}</p>
                  </div>
                ),
              },
              {
                key: 'statut',
                label: 'Statut',
                render: (o) => (
                  <button
                    onClick={() => handleToggleActif(o.id, o.actif)}
                    className="cursor-pointer transition hover:opacity-80"
                    title="Cliquer pour changer le statut"
                  >
                    <StatusBadge status={o.actif ? 'ACTIF' : 'INACTIF'} />
                  </button>
                ),
              },
              {
                key: 'actions',
                label: '',
                className: 'text-right',
                cellClassName: 'text-right',
                render: (o) => (
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(`/offre/${o.id}`)}
                      title="Voir sur le marketplace"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(`/partenaire/offres/editer/${o.id}`)}
                      title="Modifier l'offre"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleSupprimerOffre(o.id)}
                      className="text-destructive hover:bg-destructive/10"
                      title="Supprimer l'offre"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  )
}
