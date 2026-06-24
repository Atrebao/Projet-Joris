import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, Eye, Search, Store, XCircle } from 'lucide-react'
import { partenairesAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import ModalDetail from '../../components/ModalDetail'
import { Button, Card, DataTable, Input, LoadingState, PageHeader, Select, ServiceLogo, StatusBadge } from '../../components/saas/SaasPrimitives'

export default function PartenairesPage() {
  const [partenaires, setPartenaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [recherche, setRecherche] = useState('')
  const [detailPartenaire, setDetailPartenaire] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    loadPartenaires()
  }, [])

  const loadPartenaires = async () => {
    setLoading(true)
    try {
      const { data } = await partenairesAPI.getAll()
      setPartenaires((data || []).map((p) => ({
        ...p,
        dateInscription: p.dateCreation,
        statut: !p.isValidated ? 'EN_ATTENTE' : p.isActive ? 'ACTIF' : 'SUSPENDU',
        nbOffres: p.offres?.length ?? 0,
        totalVentes: 0,
        revenu: 0,
        note: 0
      })))
    } catch (error) {
      console.error('Erreur chargement partenaires:', error)
      toast.error('Impossible de charger les partenaires')
      setPartenaires([])
    } finally {
      setLoading(false)
    }
  }

  const handleValider = async (id) => {
    try {
      await partenairesAPI.validate(id)
      toast.success('Partenaire validé')
      loadPartenaires()
    } catch {
      toast.error('Erreur lors de la validation')
    }
  }

  const handleVoirPartenaire = async (id) => {
    setDetailPartenaire(null)
    setDetailLoading(true)
    try {
      const { data } = await partenairesAPI.getOne(id)
      setDetailPartenaire(data)
    } catch {
      toast.error('Impossible de charger les détails')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSuspendre = async (id) => {
    try {
      await partenairesAPI.toggleActive(id)
      toast.success('Statut du partenaire modifié')
      loadPartenaires()
    } catch {
      toast.error('Erreur lors de la suspension')
    }
  }

  const partenairesFiltres = useMemo(
    () =>
      partenaires.filter((p) => {
        const matchStatut = filtreStatut === 'TOUS' || p.statut === filtreStatut
        const query = recherche.toLowerCase()
        const matchRecherche = `${p.nom || ''} ${p.nomBoutique || ''} ${p.email || ''}`.toLowerCase().includes(query)
        return matchStatut && matchRecherche
      }),
    [partenaires, filtreStatut, recherche]
  )

  if (loading) return <LoadingState label="Chargement des partenaires..." />

  return (
    <>
      <PageHeader
        title="Partenaires"
        description={`${partenaires.length} partenaire(s) au total.`}
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Rechercher par nom, boutique ou email..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </label>
          <Select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}>
            <option value="TOUS">Tous les statuts</option>
            <option value="ACTIF">Actifs</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="SUSPENDU">Suspendus</option>
          </Select>
        </div>
      </Card>

      <DataTable
        data={partenairesFiltres}
        emptyLabel="Aucun partenaire trouvé"
        columns={[
          {
            key: 'partenaire',
            label: 'Partenaire',
            render: (p) => (
              <div className="flex items-center gap-3">
                <ServiceLogo name={p.nomBoutique || p.nom} size="sm" />
                <div>
                  <div className="font-medium text-foreground">{p.nomBoutique || p.nom}</div>
                  <div className="text-xs text-muted-foreground">Inscrit le {p.dateInscription ? new Date(p.dateInscription).toLocaleDateString('fr-FR') : '-'}</div>
                </div>
              </div>
            )
          },
          { key: 'contact', label: 'Contact', render: (p) => <div><div>{p.email}</div><div className="text-xs text-muted-foreground">{p.telephone || '-'}</div></div> },
          { key: 'ville', label: 'Ville', render: (p) => p.ville || '-' },
          { key: 'offres', label: 'Offres', render: (p) => <span className="font-medium">{p.nbOffres}</span> },
          { key: 'ventes', label: 'Ventes', render: (p) => <span className="font-medium">{p.totalVentes}</span> },
          { key: 'statut', label: 'Statut', render: (p) => <StatusBadge status={p.statut} /> },
          {
            key: 'actions',
            label: '',
            className: 'text-right',
            cellClassName: 'text-right',
            render: (p) => (
              <div className="flex justify-end gap-1">
                {p.statut === 'EN_ATTENTE' && <Button size="icon" variant="ghost" onClick={() => handleValider(p.id)}><CheckCircle className="h-4 w-4 text-primary" /></Button>}
                <Button size="icon" variant="ghost" onClick={() => handleVoirPartenaire(p.id)}><Eye className="h-4 w-4" /></Button>
                {p.statut === 'ACTIF' && <Button size="icon" variant="ghost" onClick={() => handleSuspendre(p.id)}><XCircle className="h-4 w-4 text-destructive" /></Button>}
              </div>
            )
          }
        ]}
      />

      <ModalDetail
        open={!!detailPartenaire || detailLoading}
        onClose={() => { setDetailPartenaire(null); setDetailLoading(false) }}
        title="Détails du partenaire"
        loading={detailLoading}
      >
        {detailPartenaire && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <ServiceLogo name={detailPartenaire.nomBoutique || detailPartenaire.nom} />
              <div>
                <p className="font-semibold">{[detailPartenaire.prenoms, detailPartenaire.nom].filter(Boolean).join(' ')}</p>
                <p className="text-sm text-muted-foreground">{detailPartenaire.nomBoutique || 'Boutique non renseignée'}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Email', detailPartenaire.email],
                ['Téléphone', detailPartenaire.telephone],
                ['Ville', detailPartenaire.ville],
                ['Pays', detailPartenaire.pays || '-'],
                ['Adresse', detailPartenaire.adresse || '-'],
                ['Nombre d’offres', detailPartenaire.offres?.length ?? 0]
              ].map(([label, value]) => (
                <div key={label}>
                  <label className="text-xs font-semibold uppercase text-muted-foreground">{label}</label>
                  <p className="font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </ModalDetail>
    </>
  )
}
