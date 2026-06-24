import { useEffect, useMemo, useState } from 'react'
import { Eye, Search, Trash2 } from 'lucide-react'
import { abonnementsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import ModalDetail from '../../components/ModalDetail'
import { Button, Card, DataTable, Input, LoadingState, PageHeader, Select, ServiceLogo, StatusBadge, formatFCFA } from '../../components/saas/SaasPrimitives'

export default function OffresPage() {
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [recherche, setRecherche] = useState('')
  const [detailOffre, setDetailOffre] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    loadOffres()
  }, [])

  const loadOffres = async () => {
    setLoading(true)
    try {
      const { data } = await abonnementsAPI.getAll()
      setOffres((data || []).map((offre) => ({
        id: offre.id,
        nom: offre.nom,
        partenaire: offre.partenaire?.nom || offre.partenaire?.nomBoutique || 'N/A',
        categorie: offre.categorie,
        image: offre.image,
        prix: offre.forfaits?.[0]?.prix || 0,
        duree: offre.forfaits?.[0]?.duree || 1,
        forfaits: offre.forfaits || [],
        stock: offre.stock ?? offre.quantiteDisponible ?? 0,
        statut: offre.isDeleted ? 'SUSPENDU' : 'ACTIF'
      })))
    } catch (error) {
      console.error('Erreur chargement offres:', error)
      toast.error('Impossible de charger les offres')
      setOffres([])
    } finally {
      setLoading(false)
    }
  }

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

  const offresFiltrees = useMemo(
    () =>
      offres.filter((o) => {
        const matchStatut = filtreStatut === 'TOUS' || o.statut === filtreStatut
        const matchRecherche = `${o.nom || ''} ${o.partenaire || ''}`.toLowerCase().includes(recherche.toLowerCase())
        return matchStatut && matchRecherche
      }),
    [offres, filtreStatut, recherche]
  )

  if (loading) return <LoadingState label="Chargement des offres..." />

  return (
    <>
      <PageHeader title="Offres" description={`${offres.length} offre(s) publiées par les partenaires.`} />

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Rechercher une offre ou un partenaire..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </label>
          <Select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
            <option value="TOUS">Tous les statuts</option>
            <option value="ACTIF">Actives</option>
            <option value="SUSPENDU">Suspendues</option>
          </Select>
        </div>
      </Card>

      <DataTable
        data={offresFiltrees}
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
                    <span className="font-semibold">{formatFCFA(f.prix)}</span>
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
