import { useEffect, useState } from 'react'
import { Truck, Search, ShoppingBag, Wallet, Clock, CheckCircle2, PackageCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPartenaireId } from '../../Utils/Utils'
import { souscriptionsAPI } from '../../lib/api'
import { onSocketEvent } from '../../lib/socket'
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  Input,
  KpiCard,
  LoadingState,
  PageHeader,
  ServiceLogo,
  StatusBadge,
  formatFCFA,
} from '../../components/saas/SaasPrimitives'

const emptyDelivery = { login: '', password: '', instructions: '' }

export default function CommandesPartenairePage() {
  const partenaireId = getPartenaireId()
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('TOUT')
  const [selected, setSelected] = useState(null)
  const [delivery, setDelivery] = useState(emptyDelivery)
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({ total: 0, payees: 0, aLivrer: 0, livrees: 0, revenu: 0 })

  const loadCommandes = async (isBackground = false) => {
    if (!partenaireId) return
    if (!isBackground) setLoading(true)
    try {
      const res = await souscriptionsAPI.getSouscriptionsByPartenaire(partenaireId, {
        search: query.trim() || undefined,
        activeFilter: activeFilter !== 'TOUT' ? activeFilter : undefined,
        page,
        limit: 10,
      })
      const data = res?.data
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setCommandes(data.data || [])
        setTotalPages(data.totalPages || 1)
        if (data.stats) setStats(data.stats)
      } else {
        setCommandes(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Erreur chargement commandes partenaire :', error)
      if (!isBackground) toast.error('Impossible de charger les commandes')
      setCommandes([])
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCommandes()
    }, 200)
    return () => clearTimeout(timer)
  }, [partenaireId, query, activeFilter, page])

  useEffect(() => {
    const unsubOrder = onSocketEvent('nouvelle_commande', () => {
      loadCommandes(true)
    })
    const unsubDelivery = onSocketEvent('commande_livree', () => {
      loadCommandes(true)
    })
    const unsubStats = onSocketEvent('stats_updated', () => {
      loadCommandes(true)
    })

    return () => {
      unsubOrder()
      unsubDelivery()
      unsubStats()
    }
  }, [partenaireId, query, activeFilter, page])

  const openDelivery = (commande) => {
    setSelected(commande)
    setDelivery({
      login: commande.login || '',
      password: commande.password || '',
      instructions: commande.instructions || '',
    })
  }

  const submitDelivery = async (event) => {
    event.preventDefault()
    if (!selected) return
    setSubmitting(true)
    try {
      await souscriptionsAPI.livrer(selected.id, delivery)
      toast.success('Commande livree')
      setSelected(null)
      setDelivery(emptyDelivery)
      await loadCommandes()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Impossible de livrer la commande')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && commandes.length === 0) return <LoadingState label="Chargement des ventes partenaire..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suivi des ventes"
        description="Commandes payees, livraisons et references client."
        action={<Button variant="secondary" onClick={loadCommandes}>Actualiser</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Chiffre d'affaires" value={formatFCFA(stats.revenu)} icon={Wallet} />
        <KpiCard label="Commandes payees" value={String(stats.payees)} icon={ShoppingBag} accent="chart3" />
        <KpiCard label="A livrer" value={String(stats.aLivrer)} icon={Clock} accent="chart4" />
        <KpiCard label="Livrees" value={String(stats.livrees)} icon={CheckCircle2} accent="accent" />
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder="Rechercher reference, client, offre..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['TOUT', 'Tout'],
              ['PAYEES', 'Payees'],
              ['A_LIVRER', 'A livrer'],
              ['LIVREES', 'Livrees'],
            ].map(([value, label]) => (
              <Button
                key={value}
                type="button"
                variant={activeFilter === value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => {
                  setActiveFilter(value)
                  setPage(1)
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {commandes.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Aucune commande pour le moment"
          description="Les ventes de vos offres apparaitront ici des qu'un client paie une souscription."
        />
      ) : (
        <>
          <DataTable
            data={commandes}
            emptyLabel="Aucune commande ne correspond au filtre."
            columns={[
              {
                key: 'offre',
                label: 'Offre',
                render: (commande) => (
                  <div className="flex items-center gap-3">
                    <ServiceLogo name={commande.abonnement?.nom || 'Offre'} image={commande.abonnement?.image} size="sm" />
                    <div>
                      <p className="font-medium text-foreground">{commande.abonnement?.nom || 'Offre'}</p>
                      <p className="text-xs text-muted-foreground">{commande.reference || '-'}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'client',
                label: 'Client',
                render: (commande) => (
                  <div>
                    <p className="font-medium text-foreground">{commande.client?.nom || commande.user?.nom || 'Client'}</p>
                    <p className="text-xs text-muted-foreground">{commande.emailClient || commande.client?.email || commande.user?.email || '-'}</p>
                  </div>
                ),
              },
              {
                key: 'montant',
                label: 'Montant',
                render: (commande) => (
                  <span className="font-semibold">
                    {formatFCFA(commande.montantPartenaire ?? commande.montantTotal ?? commande.montant)}
                  </span>
                ),
              },
              {
                key: 'paiement',
                label: 'Paiement',
                render: (commande) => <StatusBadge status={commande.statutPaiement} />,
              },
              {
                key: 'livraison',
                label: 'Livraison',
                render: (commande) => {
                  if (commande.isLivred || commande.etatSouscription === 'ACTIF' || commande.etatSouscription === 'LIVRE') {
                    return <StatusBadge status="LIVRE" />
                  } else if (commande.statutPaiement === 'ECHEC') {
                    return <StatusBadge status="ECHEC" />
                  } else {
                    return <StatusBadge status="EN_ATTENTE" />
                  }
                },
              },
              {
                key: 'date',
                label: 'Date',
                render: (commande) => (commande.dateCreation ? new Date(commande.dateCreation).toLocaleDateString('fr-FR') : '-'),
              },
              {
                key: 'actions',
                label: '',
                className: 'text-right',
                cellClassName: 'text-right',
                render: (commande) => {
                  if (commande.statutPaiement === 'SUCCES') {
                    if (commande.etatSouscription === 'INACTIF' || !commande.isLivred) {
                      return (
                        <Button size="sm" variant="primary" onClick={() => openDelivery(commande)}>
                          <Truck className="h-4 w-4" />
                          Livrer
                        </Button>
                      )
                    }
                    if (commande.etatSouscription === 'ACTIF' || commande.isLivred) {
                      return (
                        <Button size="sm" variant="secondary" onClick={() => openDelivery(commande)}>
                          <Truck className="h-4 w-4" />
                          Voir
                        </Button>
                      )
                    }
                  }
                  return null
                },
              },
            ]}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">
                Page {page} sur {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <Card className="w-full max-w-lg p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Livraison de la commande</h2>
                <p className="text-sm text-muted-foreground">{selected.reference || selected.abonnement?.nom}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Fermer</Button>
            </div>
            <form onSubmit={submitDelivery} className="space-y-3">
              <Input
                value={delivery.login}
                onChange={(event) => setDelivery((state) => ({ ...state, login: event.target.value }))}
                placeholder="Login / email du compte"
                required
              />
              <Input
                value={delivery.password}
                onChange={(event) => setDelivery((state) => ({ ...state, password: event.target.value }))}
                placeholder="Mot de passe"
                required
              />
              <textarea
                value={delivery.instructions}
                onChange={(event) => setDelivery((state) => ({ ...state, instructions: event.target.value }))}
                placeholder="Instructions pour le client"
                rows={4}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring/20"
              />
              <Button className="w-full" disabled={submitting}>
                <PackageCheck className="h-4 w-4" />
                {submitting ? 'Livraison...' : 'Confirmer la livraison'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
