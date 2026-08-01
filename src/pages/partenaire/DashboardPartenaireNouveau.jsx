import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Edit, Eye, Package, Plus, RefreshCw, ShoppingBag, Trash2, Users, Wallet } from 'lucide-react'
import { getPartenaireId } from '../../Utils/Utils'
import { offresAPI, souscriptionsAPI, statsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import { Badge, Button, Card, DataTable, EmptyState, KpiCard, LoadingState, PageHeader, ServiceLogo, StatusBadge, formatFCFA } from '../../components/saas/SaasPrimitives'

export default function DashboardPartenaireNouveau() {
  const navigate = useNavigate()
  const partenaireId = getPartenaireId()
  const [stats, setStats] = useState(null)
  const [mesOffres, setMesOffres] = useState([])
  const [ventesRecentes, setVentesRecentes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!partenaireId) {
      navigate('/backoffice/login')
      return
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partenaireId, navigate])

  const loadData = async () => {
    if (!partenaireId) return
    setLoading(true)
    try {
      const [statsRes, offresRes, souscriptionsRes] = await Promise.all([
        statsAPI.partenaireDashboard(partenaireId),
        offresAPI.getByPartenaire(partenaireId),
        souscriptionsAPI.getByPartenaire(partenaireId)
      ])

      const paidSubs = (souscriptionsRes?.data || []).filter((x) => x?.statutPaiement === 'SUCCES')
      const s = statsRes?.data || {}
      setStats({
        totalOffres: s.totalOffres ?? 0,
        offresActives: s.offresActives ?? 0,
        totalVentes: paidSubs.length,
        revenuTotal: s.revenusTotal ?? 0,
        ventesAujourdhui: s.ventesAujourdhui ?? 0,
        revenuMois: s.revenusMois ?? 0,
        croissance: s.croissance ?? 0,
        enAttenteLivraison: s.enAttenteLivraison ?? 0,
        clientsUniques: s.clientsUniques ?? 0
      })

      const byOffre = new Map()
      paidSubs.forEach((sub) => {
        const id = sub?.abonnement?.id || sub?.offrePartenaire?.id
        if (!id) return
        const current = byOffre.get(id) || { ventes: 0, revenu: 0 }
        current.ventes += 1
        current.revenu += Number(sub?.montantPartenaire ?? sub?.montantTotal ?? sub?.montant ?? 0)
        byOffre.set(id, current)
      })

      const offresMapped = (offresRes?.data || []).map((o) => {
        const firstForfait = Array.isArray(o.forfaits) ? o.forfaits[0] : null
        const metrics = byOffre.get(o.id) || { ventes: 0, revenu: 0 }
        return {
          id: o.id,
          nom: o.nomService || o.nom,
          categorie: o.categorie,
          image: o.imageService || o.image,
          prix: Number(firstForfait?.prix || 0),
          duree: Number(firstForfait?.duree || o.duree || 1),
          stock: o.quantiteDisponible ?? o.stock ?? 0,
          ventes: metrics.ventes,
          revenu: metrics.revenu,
          actif: o.isActive !== false
        }
      })

      setMesOffres(offresMapped)
      setVentesRecentes(paidSubs.slice(0, 6))
    } catch (error) {
      console.error('Erreur chargement dashboard partenaire:', error)
      toast.error('Impossible de charger les données')
      setStats({
        totalOffres: 0,
        offresActives: 0,
        totalVentes: 0,
        revenuTotal: 0,
        ventesAujourdhui: 0,
        revenuMois: 0,
        croissance: 0,
        enAttenteLivraison: 0,
        clientsUniques: 0
      })
      setMesOffres([])
      setVentesRecentes([])
    } finally {
      setLoading(false)
    }
  }

  const handleSupprimerOffre = async (offreId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return
    try {
      await offresAPI.delete(offreId)
      toast.success('Offre supprimée')
      loadData()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleToggleActif = async (offreId, actif) => {
    try {
      await offresAPI.toggleActive(offreId)
      toast.success(actif ? 'Offre désactivée' : 'Offre activée')
      loadData()
    } catch {
      toast.error('Erreur lors de la modification')
    }
  }

  if (loading || !stats) return <LoadingState label="Chargement de votre espace partenaire..." />

  const lowStock = mesOffres.filter((offre) => Number(offre.stock) <= 5)

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="Aperçu de vos performances de vente."
        action={<Button onClick={() => navigate('/partenaire/offres/nouvelle')}><Plus className="h-4 w-4" /> Nouvelle offre</Button>}
      />

      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Alerte stock bas</p>
            <p className="text-sm text-muted-foreground">
              {lowStock.slice(0, 3).map((o) => o.nom).join(', ')}: pensez à réapprovisionner vos identifiants.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Gains totaux" value={formatFCFA(stats.revenuTotal)} icon={Wallet} trend={`+${stats.croissance}%`} />
        <KpiCard label="Clients uniques" value={String(stats.clientsUniques)} icon={Users} accent="chart3" />
        <KpiCard label="Offres en ligne" value={String(stats.totalOffres)} icon={Package} accent="accent" trend={`${stats.offresActives} actives`} />
        <KpiCard label="Commandes à livrer" value={String(stats.enAttenteLivraison)} icon={RefreshCw} accent="chart4" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <div className="mb-4">
            <h2 className="font-semibold text-foreground">Mes offres</h2>
            <p className="text-sm text-muted-foreground">{mesOffres.length} offre(s) au total</p>
          </div>
          {mesOffres.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Vous n'avez pas encore d'offres"
              description="Créez une première offre pour commencer à vendre."
              action={<Button onClick={() => navigate('/partenaire/offres/nouvelle')}><Plus className="h-4 w-4" /> Créer une offre</Button>}
            />
          ) : (
            <DataTable
              data={mesOffres}
              columns={[
                {
                  key: 'offre',
                  label: 'Offre',
                  render: (offre) => (
                    <div className="flex items-center gap-3">
                      <ServiceLogo name={offre.nom} image={offre.image} size="sm" />
                      <div>
                        <div className="font-medium text-foreground">{offre.nom}</div>
                        <div className="text-xs text-muted-foreground">{offre.categorie || '-'} / {offre.duree} mois</div>
                      </div>
                    </div>
                  )
                },
                { key: 'prix', label: 'Prix', render: (offre) => <span className="font-medium">{formatFCFA(offre.prix)}</span> },
                { key: 'stock', label: 'Stock', render: (offre) => <Badge tone={offre.stock <= 5 ? 'danger' : 'muted'}>{offre.stock}</Badge> },
                { key: 'ventes', label: 'Ventes', render: (offre) => <span className="font-medium">{offre.ventes}</span> },
                { key: 'revenu', label: 'Revenu', render: (offre) => formatFCFA(offre.revenu) },
                { key: 'statut', label: 'Statut', render: (offre) => <button onClick={() => handleToggleActif(offre.id, offre.actif)}><StatusBadge status={offre.actif ? 'ACTIF' : 'INACTIF'} /></button> },
                {
                  key: 'actions',
                  label: '',
                  className: 'text-right',
                  cellClassName: 'text-right',
                  render: (offre) => (
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/partenaire/offres/editer/${offre.id}`)}><Eye className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/partenaire/offres/editer/${offre.id}`)}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleSupprimerOffre(offre.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  )
                }
              ]}
            />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h2 className="font-semibold text-foreground">Ventes récentes</h2>
            <p className="text-sm text-muted-foreground">Dernières commandes payées</p>
          </div>
          <div className="space-y-3">
            {ventesRecentes.map((vente) => (
              <div key={vente.id} className="flex items-center gap-3">
                <ServiceLogo name={vente?.abonnement?.nom || 'Offre'} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{vente?.client?.nom || vente?.emailClient || 'Client'}</p>
                  <p className="truncate text-xs text-muted-foreground">{vente?.abonnement?.nom || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatFCFA(vente?.montantPartenaire ?? vente?.montantTotal ?? vente?.montant ?? 0)}</p>
                  <StatusBadge status={vente?.isLivred ? 'LIVRE' : 'EN ATTENTE LIVRAISON'} />
                </div>
              </div>
            ))}
            {ventesRecentes.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Aucune vente récente.</p>}
          </div>
          <Button className="mt-5 w-full" variant="secondary" onClick={() => navigate('/partenaire/commandes')}><ShoppingBag className="h-4 w-4" /> Suivre les ventes</Button>
        </Card>
      </div>
    </>
  )
}
