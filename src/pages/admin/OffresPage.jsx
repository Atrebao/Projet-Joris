import { useEffect, useState } from 'react'
import { Eye, Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { abonnementsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import ModalDetail from '../../components/ModalDetail'
import { Button, Card, DataTable, Input, LoadingState, PageHeader, Select, ServiceLogo, StatusBadge, formatFCFA } from '../../components/saas/SaasPrimitives'

export default function OffresPage() {
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
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
        page,
        limit: 10,
      })
      const data = res?.data
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const rawList = data.data || []
        setOffres(
          rawList.map((offre) => ({
            id: offre.id,
            nom: offre.titreOffre || offre.nom,
            partenaire: offre.partenaire?.nomBoutique || offre.partenaire?.nom || 'N/A',
            categorie: offre.categorie,
            image: offre.image || offre.imageService,
            prix: offre.prixVente ?? offre.prixOriginal ?? offre.prix ?? 0,
            duree: offre.forfaits?.[0]?.duree || offre.duree || 1,
            forfaits: offre.forfaits || [],
            stock: offre.stock ?? offre.quantiteDisponible ?? 0,
            statut: offre.isDeleted || offre.isActive === false ? 'SUSPENDU' : 'ACTIF',
          }))
        )
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || rawList.length)
      } else {
        const rawList = Array.isArray(data) ? data : []
        setOffres(
          rawList.map((offre) => ({
            id: offre.id,
            nom: offre.titreOffre || offre.nom,
            partenaire: offre.partenaire?.nomBoutique || offre.partenaire?.nom || 'N/A',
            categorie: offre.categorie,
            image: offre.image || offre.imageService,
            prix: offre.prixVente ?? offre.prixOriginal ?? offre.prix ?? 0,
            duree: offre.forfaits?.[0]?.duree || offre.duree || 1,
            forfaits: offre.forfaits || [],
            stock: offre.stock ?? offre.quantiteDisponible ?? 0,
            statut: offre.isDeleted || offre.isActive === false ? 'SUSPENDU' : 'ACTIF',
          }))
        )
        setTotal(rawList.length)
      }
    } catch (error) {
      console.error('Erreur chargement offres:', error)
      toast.error('Impossible de charger les offres')
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
  }, [recherche, filtreStatut, page])

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

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return
    try {
      await abonnementsAPI.delete(id)
      toast.success('Offre supprimée')
      loadOffres()
    } catch (error) {
      console.error('Erreur suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading && offres.length === 0) return <LoadingState label="Chargement des offres..." />

  return (
    <>
      <PageHeader title="Offres" description={`${total} offre(s) publiées par les partenaires.`} />

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Rechercher une offre ou un partenaire..."
              value={recherche}
              onChange={(e) => {
                setRecherche(e.target.value)
                setPage(1)
              }}
            />
          </label>
          <Select
            value={filtreStatut}
            onChange={(e) => {
              setFiltreStatut(e.target.value)
              setPage(1)
            }}
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="ACTIF">Actives</option>
            <option value="SUSPENDU">Suspendues</option>
          </Select>
        </div>
      </Card>

      <DataTable
        data={offres}
        emptyLabel="Aucune offre trouvée"
        columns={[
          {
            key: 'offre',
            label: 'Offre',
            render: (o) => (
              <div className="flex items-center gap-3">
                <ServiceLogo name={o.nom} image={o.image} size="sm" />
                <div>
                  <div className="font-medium text-foreground">{o.nom}</div>
                  <div className="text-xs text-muted-foreground">{o.categorie || '-'} / {o.duree} mois</div>
                </div>
              </div>
            )
          },
          { key: 'partenaire', label: 'Partenaire' },
          { key: 'prix', label: 'Prix', render: (o) => <span className="font-medium">{formatFCFA(o.prix)}</span> },
          { key: 'stock', label: 'Stock', render: (o) => o.stock },
          { key: 'statut', label: 'Statut', render: (o) => <StatusBadge status={o.statut} /> },
          {
            key: 'actions',
            label: '',
            className: 'text-right',
            cellClassName: 'text-right',
            render: (o) => (
              <div className="flex justify-end gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleVoirOffre(o.id)}><Eye className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(o.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            )
          }
        ]}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
          <span className="text-xs text-slate-500 font-medium">
            Page <span className="font-bold text-slate-700">{page}</span> sur <span className="font-bold text-slate-700">{totalPages}</span>
          </span>
          
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 px-2 text-xs border-slate-200"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-8 px-2 text-xs border-slate-200"
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <ModalDetail
        open={!!detailOffre || detailLoading}
        onClose={() => { setDetailOffre(null); setDetailLoading(false) }}
        title="Détails de l'offre"
        loading={detailLoading}
      >
        {detailOffre && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <ServiceLogo name={detailOffre.nom} image={detailOffre.image} />
              <div>
                <p className="font-semibold">{detailOffre.nom}</p>
                <p className="text-sm text-muted-foreground">{detailOffre.categorie || '-'}</p>
              </div>
            </div>
            {detailOffre.description && <p className="text-sm text-muted-foreground">{detailOffre.description}</p>}
            {detailOffre.forfaits?.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Forfaits</label>
                {detailOffre.forfaits.map((f, index) => (
                  <div key={index} className="flex justify-between rounded-lg border border-border bg-card p-3 text-sm">
                    <span>{f.plan || `${f.duree} ${f.periode || 'mois'}`}</span>
                    <span className="font-semibold">{f.duree} {f.periode || 'MOIS'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </ModalDetail>
    </>
  )
}
