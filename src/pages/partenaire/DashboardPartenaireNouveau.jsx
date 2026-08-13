import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Edit, Eye, Package, Plus, RefreshCw, ShoppingBag, Trash2, Users, Wallet, CheckCircle2, Clock, Radio } from 'lucide-react'
import { getPartenaireId } from '../../Utils/Utils'
import { offresAPI, souscriptionsAPI, statsAPI, reversementsAPI } from '../../lib/api'
import { onSocketEvent } from '../../lib/socket'
import toast from 'react-hot-toast'
import { Badge, Button, Card, DataTable, EmptyState, KpiCard, LoadingState, PageHeader, ServiceLogo, StatusBadge, formatFCFA } from '../../components/saas/SaasPrimitives'

export default function DashboardPartenaireNouveau() {
  const navigate = useNavigate()
  const partenaireId = getPartenaireId()
  const [stats, setStats] = useState(null)
  const [balance, setBalance] = useState(null)
  const [mesOffres, setMesOffres] = useState([])
  const [ventesRecentes, setVentesRecentes] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async (isBackground = false) => {
    if (!partenaireId) return
    if (!isBackground) setLoading(true)
    try {
      const [statsRes, souscriptionsRes, balanceRes] = await Promise.allSettled([
        statsAPI.partenaireDashboard(partenaireId),
        souscriptionsAPI.getSouscriptionsByPartenaire(partenaireId, { limit: 6, statutPaiement: 'SUCCES' }),
        reversementsAPI.getPartenaireBalance(partenaireId),
      ])

      const s = statsRes.status === 'fulfilled' ? statsRes.value?.data || {} : {}
      const b = balanceRes.status === 'fulfilled' ? balanceRes.value?.data || {} : {}

      setStats({
        totalOffres: s.totalOffres ?? 0,
        offresActives: s.offresActives ?? 0,
        totalVentes: s.offres?.reduce((acc, o) => acc + (o.ventes || 0), 0) ?? 0,
        revenuTotal: s.revenusTotal ?? 0,
        ventesAujourdhui: s.ventesAujourdhui ?? 0,
        revenuMois: s.revenusMois ?? 0,
        croissance: s.croissance ?? 0,
        enAttenteLivraison: s.enAttenteLivraison ?? 0,
        clientsUniques: s.clientsUniques ?? 0,
      })

      setBalance(b)
      setMesOffres(s.offres || [])

      const recentList =
        souscriptionsRes.status === 'fulfilled'
          ? Array.isArray(souscriptionsRes.value?.data)
            ? souscriptionsRes.value.data
            : souscriptionsRes.value?.data?.data || []
          : []
      setVentesRecentes(recentList)
    } catch (error) {
      console.error('Erreur chargement dashboard partenaire:', error)
      if (!isBackground) toast.error('Impossible de charger les données')
    } finally {
      if (!isBackground) setLoading(false)
    }
  }, [partenaireId])

  useEffect(() => {
    if (!partenaireId) {
      navigate('/backoffice/login')
      return
    }
    loadData()

    // Écoute des événements WebSocket en temps réel
    const unsubOrder = onSocketEvent('nouvelle_commande', (data) => {
      toast.success(`🛒 Nouvelle commande reçue : ${data?.nomOffre || 'Abonnement'} ! Pensez à livrer les identifiants.`, {
        duration: 5000,
      })
      loadData(true)
    })

    const unsubDelivery = onSocketEvent('commande_livree', () => {
      loadData(true)
    })

    const unsubPayout = onSocketEvent('nouveau_reversement', (data) => {
      toast.success(`🎉 Un versement de ${formatFCFA(data?.montant || 0)} a été effectué sur votre compte !`, {
        duration: 6000,
        icon: '💳',
      })
      loadData(true)
    })

    const unsubStats = onSocketEvent('stats_updated', () => {
      loadData(true)
    })

    return () => {
      unsubOrder()
      unsubDelivery()
      unsubPayout()
      unsubStats()
    }
  }, [partenaireId, navigate, loadData])

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Tableau de bord"
          description="Aperçu de vos ventes, solde dû et commandes en direct."
          action={
            <Button onClick={() => navigate('/partenaire/offres/nouvelle')} className="gap-1.5 font-bold">
              <Plus className="h-4 w-4" /> Nouvelle offre
            </Button>
          }
        />
        <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-xs">
          <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-600" />
          Temps réel actif
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Alerte stock bas</p>
            <p className="text-sm text-muted-foreground">
              {lowStock.slice(0, 3).map((o) => o.nom).join(', ')} : pensez à réapprovisionner vos identifiants.
            </p>
          </div>
        </div>
      )}

      {/* Bloc KPI Financier Partenaire */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Solde à percevoir (Livrées)"
          value={formatFCFA(balance?.soldeRestantAReverser ?? 0)}
          icon={Wallet}
          trend={balance?.commissionActive === false ? '0% com.' : `${balance?.tauxCommission ?? 10}% com.`}
          accent="primary"
        />
        <KpiCard
          label="Total déjà reçu"
          value={formatFCFA(balance?.totalDejaReverse ?? 0)}
          icon={CheckCircle2}
          accent="chart3"
        />
        <KpiCard
          label="En attente de livraison"
          value={formatFCFA(balance?.montantEnAttenteLivraison ?? 0)}
          icon={Clock}
          accent="chart4"
        />
        <KpiCard
          label="Commandes à livrer"
          value={String(balance?.nbVentesALivrer ?? stats.enAttenteLivraison)}
          icon={RefreshCw}
          accent="accent"
        />
      </div>

      {/* Mes Offres & Ventes Récentes */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Mes offres</h2>
              <p className="text-sm text-muted-foreground">{mesOffres.length} offre(s) au catalogue</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/partenaire/offres')}>
              Voir tout
            </Button>
          </div>
          {mesOffres.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Vous n'avez pas encore d'offres"
              description="Créez une première offre pour commencer à vendre."
              action={
                <Button onClick={() => navigate('/partenaire/offres/nouvelle')}>
                  <Plus className="h-4 w-4" /> Créer une offre
                </Button>
              }
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
                        <div className="text-xs text-muted-foreground">{offre.categorie || '-'}</div>
                      </div>
                    </div>
                  ),
                },
                { key: 'prix', label: 'Prix', render: (offre) => <span className="font-medium">{formatFCFA(offre.prix)}</span> },
                { key: 'stock', label: 'Stock', render: (offre) => <Badge tone={offre.stock <= 5 ? 'danger' : 'muted'}>{offre.stock}</Badge> },
                { key: 'ventes', label: 'Ventes', render: (offre) => <span className="font-medium">{offre.ventes}</span> },
                { key: 'revenu', label: 'Revenu', render: (offre) => formatFCFA(offre.revenu) },
                {
                  key: 'statut',
                  label: 'Statut',
                  render: (offre) => (
                    <button onClick={() => handleToggleActif(offre.id, offre.actif)}>
                      <StatusBadge status={offre.actif ? 'ACTIF' : 'INACTIF'} />
                    </button>
                  ),
                },
                {
                  key: 'actions',
                  label: '',
                  className: 'text-right',
                  cellClassName: 'text-right',
                  render: (offre) => (
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/partenaire/offres/editer/${offre.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/partenaire/offres/editer/${offre.id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleSupprimerOffre(offre.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4">
            <h2 className="font-semibold text-foreground">Ventes récentes</h2>
            <p className="text-sm text-muted-foreground">Dernières commandes clients</p>
          </div>
          <div className="space-y-3">
            {ventesRecentes.map((vente) => (
              <div key={vente.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <ServiceLogo name={vente?.abonnement?.nom || 'Offre'} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{vente?.client?.nom || vente?.emailClient || 'Client'}</p>
                  <p className="truncate text-xs text-muted-foreground">{vente?.abonnement?.nom || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-foreground font-mono">
                    {formatFCFA(vente?.montantPartenaire ?? vente?.montantTotal ?? vente?.montant ?? 0)}
                  </p>
                  <StatusBadge status={vente?.isLivred ? 'LIVRE' : 'EN ATTENTE LIVRAISON'} />
                </div>
              </div>
            ))}
            {ventesRecentes.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Aucune vente récente.</p>}
          </div>
          <Button className="mt-5 w-full font-bold" variant="secondary" onClick={() => navigate('/partenaire/commandes')}>
            <ShoppingBag className="h-4 w-4 mr-1.5" /> Gérer et livrer les commandes
          </Button>
        </Card>
      </div>
    </div>
  )
}
