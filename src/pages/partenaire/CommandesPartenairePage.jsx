import { useEffect, useMemo, useState } from 'react'
import { Truck, Search, ShoppingBag, Wallet, Clock, CheckCircle2, PackageCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPartenaireId } from '../../Utils/Utils'
import { souscriptionsAPI } from '../../lib/api'
import {
  Badge,
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

  const loadCommandes = async () => {
    if (!partenaireId) return
    setLoading(true)
    try {
      const { data } = await souscriptionsAPI.getSouscriptionsByPartenaire(partenaireId)
      setCommandes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erreur chargement commandes partenaire :', error)
      toast.error('Impossible de charger les commandes')
      setCommandes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCommandes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partenaireId])

  const stats = useMemo(() => {
    const payees = commandes.filter((c) => c.statutPaiement === 'SUCCES')
    const aLivrer = payees.filter((c) => !c.isLivred && c.etatSouscription !== 'LIVRE')
    const livrees = payees.filter((c) => c.isLivred || c.etatSouscription === 'LIVRE')
    const revenu = payees.reduce((sum, c) => sum + Number(c.montantPartenaire || c.montant || 0), 0)
    return { total: commandes.length, payees: payees.length, aLivrer: aLivrer.length, livrees: livrees.length, revenu }
  }, [commandes])

  const filteredCommandes = useMemo(() => {
    const value = query.trim().toLowerCase()
    return commandes.filter((commande) => {
      const delivered = commande.isLivred || commande.etatSouscription === 'LIVRE'
      const paid = commande.statutPaiement === 'SUCCES'
      const filterMatch =
        activeFilter === 'TOUT' ||
        (activeFilter === 'A_LIVRER' && paid && !delivered) ||
        (activeFilter === 'LIVREES' && delivered) ||
        (activeFilter === 'PAYEES' && paid)
      const textMatch = [
        commande.reference,
        commande.emailClient,
        commande.client?.email,
        commande.user?.email,
        commande.abonnement?.nom,
        commande.offrePartenaire?.nom,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(value)
      return filterMatch && (!value || textMatch)
    })
  }, [commandes, query, activeFilter])

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

  if (loading) return <LoadingState label="Chargement des ventes partenaire..." />

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
              onChange={(event) => setQuery(event.target.value)}
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
                onClick={() => setActiveFilter(value)}
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
        <DataTable
          data={filteredCommandes}
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
            { key: 'montant', label: 'Montant', render: (commande) => <span className="font-semibold">{formatFCFA(commande.montantPartenaire || commande.montant)}</span> },
            { key: 'paiement', label: 'Paiement', render: (commande) => <StatusBadge status={commande.statutPaiement} /> },
           {
              key: 'livraison',
              label: 'Livraison',
              render: (commande) => { 
                let message = 'EN ATTENTE';
                let statusLivraison = 'warning';

                
                if (commande.isLivred || commande.etatSouscription === 'ACTIF' || commande.etatSouscription === 'LIVRE') {
                  message = 'LIVRÉE';
                  statusLivraison = 'success';
                } 
               
                else if (commande.statutPaiement === 'ECHEC') {
                  message = 'ANNULÉE';
                  statusLivraison = 'danger';
                }
                
                else {
                  message = 'EN ATTENTE';
                  statusLivraison = 'warning';
                }

                return <StatusBadge status={message} tone={statusLivraison} />;
              }, 
            },

            {
              key: 'date',
              label: 'Date',
              render: (commande) => commande.dateCreation ? new Date(commande.dateCreation).toLocaleDateString('fr-FR') : '-',
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
              <Button
                size="sm"
                variant="primary"
                onClick={() => openDelivery(commande)}
              >
                <Truck className="h-4 w-4" />
                Livrer
              </Button>
            );
          }
          
          // Si l'état est ACTIF -> On affiche le bouton pour Voir les détails
          if (commande.etatSouscription === 'ACTIF' || commande.isLivred) {
            return (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => openDelivery(commande)}
              >
                <Truck className="h-4 w-4" />
                Voir
              </Button>
            );
          }
        }

      
        return null;
      },
    }

          ]}
        />
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
