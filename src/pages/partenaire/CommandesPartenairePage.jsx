import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Truck,
  Search,
  ShoppingBag,
  Wallet,
  Clock,
  CheckCircle2,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  KeyRound,
  ExternalLink,
  Copy,
  Boxes,
  X,
  Send,
  Loader2,
  DollarSign,
  Percent,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getPartenaireId } from '../../Utils/Utils'
import { souscriptionsAPI, identifiantsStockAPI } from '../../lib/api'
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

const OPERATOR_BADGES = {
  WAVE: 'bg-sky-50 text-sky-700 border border-sky-200',
  ORANGE: 'bg-orange-50 text-orange-700 border border-orange-200',
  MTN: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  MOOV: 'bg-blue-50 text-blue-700 border border-blue-200',
}

const emptyDelivery = { login: '', password: '', instructions: '' }

export default function CommandesPartenairePage() {
  const partenaireId = getPartenaireId()
  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('TOUT')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState({ total: 0, payees: 0, aLivrer: 0, livrees: 0, revenu: 0 })

  // Modal de Livraison
  const [selectedCommande, setSelectedCommande] = useState(null)
  const [delivery, setDelivery] = useState(emptyDelivery)
  const [submitting, setSubmitting] = useState(false)
  const [availableStock, setAvailableStock] = useState([])
  const [loadingStock, setLoadingStock] = useState(false)

  const loadCommandes = useCallback(
    async (isBackground = false) => {
      if (!partenaireId) return
      if (!isBackground) setLoading(true)
      try {
        const res = await souscriptionsAPI.getSouscriptionsByPartenaire(partenaireId, {
          search: query.trim() || undefined,
          activeFilter: activeFilter !== 'TOUT' ? activeFilter : undefined,
          page,
          limit: 12,
        })
        const data = res?.data
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setCommandes(data.data || [])
          setTotalPages(data.totalPages || 1)
          setTotal(data.total || 0)
          if (data.stats) setStats(data.stats)
        } else {
          const list = Array.isArray(data) ? data : []
          setCommandes(list)
          setTotal(list.length)
        }
      } catch (error) {
        console.error('Erreur chargement commandes partenaire :', error)
        if (!isBackground) toast.error('Impossible de charger les commandes')
        setCommandes([])
      } finally {
        if (!isBackground) setLoading(false)
      }
    },
    [partenaireId, query, activeFilter, page]
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCommandes()
    }, 200)
    return () => clearTimeout(timer)
  }, [loadCommandes])

  useEffect(() => {
    const unsubOrder = onSocketEvent('nouvelle_commande', () => {
      toast.success('Nouvelle commande reçue !')
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
  }, [loadCommandes])

  // Ouvrir modal de livraison et charger le stock disponible
  const openDeliveryModal = async (commande) => {
    setSelectedCommande(commande)
    setDelivery({
      login: commande.login || '',
      password: commande.password || '',
      instructions: commande.instructions || '',
    })

    const offreId = commande.offrePartenaire?.id || commande.abonnement?.id
    if (offreId) {
      setLoadingStock(true)
      try {
        const { data } = await identifiantsStockAPI.listByOffre(offreId)
        const items = Array.isArray(data) ? data : []
        setAvailableStock(items.filter((item) => !item.isUsed))
      } catch {
        setAvailableStock([])
      } finally {
        setLoadingStock(false)
      }
    } else {
      setAvailableStock([])
    }
  }

  const handleSelectFromStock = (item) => {
    setDelivery({
      login: item.login,
      password: item.password,
      instructions: item.instructions || '',
    })
    toast.success('Compte du stock inséré !')
  }

  const submitDelivery = async (e) => {
    e.preventDefault()
    if (!selectedCommande) return

    if (!delivery.login.trim() || !delivery.password.trim()) {
      toast.error('Veuillez renseigner le login et le mot de passe du compte.')
      return
    }

    setSubmitting(true)
    try {
      await souscriptionsAPI.livrer(selectedCommande.id, delivery)
      toast.success('Commande livrée avec succès au client !')
      setSelectedCommande(null)
      setDelivery(emptyDelivery)
      await loadCommandes()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Impossible de livrer la commande')
    } finally {
      setSubmitting(false)
    }
  }

  const generateWhatsAppLink = (cmd, del) => {
    const phone = cmd.telephoneClient || cmd.client?.telephone
    if (!phone) return null
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const serviceName = cmd.offrePartenaire?.titreOffre || cmd.offrePartenaire?.nomService || 'Abonnement'
    const msg = `Bonjour ! Voici vos identifiants pour votre abonnement ${serviceName} :\n\n📧 Identifiant : ${del.login || cmd.login || '-'}\n🔑 Mot de passe : ${del.password || cmd.password || '-'}\n${del.instructions || cmd.instructions ? `📝 Note : ${del.instructions || cmd.instructions}\n` : ''}\nMerci de votre confiance !`
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
  }

  const normalizeOp = (op = '') => {
    const u = String(op).toUpperCase()
    if (u.includes('ORANGE')) return 'ORANGE'
    if (u.includes('MTN')) return 'MTN'
    if (u.includes('MOOV')) return 'MOOV'
    if (u.includes('WAVE')) return 'WAVE'
    return 'WAVE'
  }

  if (loading && commandes.length === 0) {
    return <LoadingState label="Chargement du journal des ventes partenaire..." />
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <PageHeader
        title="Journal des Ventes & Livraisons"
        description="Consultez les commandes de streaming de vos clients, suivez vos gains nets par vente et livrez les identifiants en 1 clic."
      />

      {/* Cartes KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Votre Revenu Net Encaissé"
          value={formatFCFA(stats.revenu)}
          subtext="Gains réels après commission"
          icon={Wallet}
        />
        <KpiCard
          title="Commandes Payées"
          value={stats.payees}
          subtext="Total souscriptions réglées"
          icon={ShoppingBag}
        />
        <KpiCard
          title="À Livrer d'Urgence"
          value={stats.aLivrer}
          subtext="Identifiants en attente"
          icon={Clock}
        />
        <KpiCard
          title="Livrées avec Succès"
          value={stats.livrees}
          subtext="Clients servis"
          icon={CheckCircle2}
        />
      </div>

      {/* Barre d'outils et Filtres */}
      <Card className="p-4 border border-slate-200 bg-white shadow-2xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Onglets Filtres */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            {[
              { id: 'TOUT', label: `Toutes (${stats.total})`, icon: ShoppingBag },
              { id: 'A_LIVRER', label: `À livrer (${stats.aLivrer})`, icon: Clock },
              { id: 'LIVREES', label: `Livrées (${stats.livrees})`, icon: CheckCircle2 },
            ].map((tab) => {
              const isActive = activeFilter === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveFilter(tab.id)
                    setPage(1)
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Recherche */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Rechercher réf, client, tel..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              className="pl-9 text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Tableau des Commandes avec Décomposition Financière */}
      <Card className="p-0 border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {commandes.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Aucune commande ne correspond aux filtres sélectionnés.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Réf & Date</th>
                  <th className="px-4 py-3.5">Service & Forfait</th>
                  <th className="px-4 py-3.5">Client Bénéficiaire</th>
                  <th className="px-4 py-3.5">Opérateur</th>
                  <th className="px-4 py-3.5">Décomposition Financière</th>
                  <th className="px-4 py-3.5">Statut Livraison</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commandes.map((c) => {
                  const serviceName =
                    c.offrePartenaire?.titreOffre ||
                    c.offrePartenaire?.nomService ||
                    c.abonnement?.nom ||
                    'Abonnement'
                  const client = c.client || c.user
                  const opKey = normalizeOp(c.operateur || c.modePaiement)
                  const isDelivered = c.isLivred || c.estLivre || c.statutLivraison === 'LIVRE'

                  // Calculs financiers transparents
                  const totalClient = Number(c.montantTotal || c.montant || 0)
                  const tauxCom = Number(c.tauxCommissionPlateforme || 10)
                  const comPlateforme = Number(c.montantPlateforme || (totalClient * tauxCom) / 100)
                  const netPartenaire = Number(c.montantPartenaire || Math.max(0, totalClient - comPlateforme))

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-slate-900 block">
                          {c.reference || `#${c.id}`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.dateCreation || c.createdAt).toLocaleDateString('fr-FR')} {new Date(c.dateCreation || c.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 text-xs">{serviceName}</p>
                        <p className="text-[10px] text-slate-500">
                          {c.duree || 1} {c.periode ? c.periode.toLowerCase() : 'mois'}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">
                          {client ? `${client.nom || ''} ${client.prenoms || ''}`.trim() : 'Client'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {c.telephoneClient || client?.telephone || c.emailClient || '-'}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${OPERATOR_BADGES[opKey] || 'bg-slate-100 text-slate-700'}`}>
                          {opKey}
                        </span>
                      </td>

                      {/* Décomposition financière */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center justify-between gap-2 text-slate-500">
                            <span>Prix client :</span>
                            <span className="font-mono">{formatFCFA(totalClient)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 text-indigo-700 font-medium">
                            <span>Com. ({tauxCom}%) :</span>
                            <span className="font-mono">- {formatFCFA(comPlateforme)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 font-bold text-emerald-700 border-t border-slate-200/60 pt-0.5">
                            <span>Votre gain net :</span>
                            <span className="font-mono">{formatFCFA(netPartenaire)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isDelivered
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          }`}
                        >
                          {isDelivered ? 'LIVRÉE' : 'À LIVRER'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <Button
                          size="sm"
                          onClick={() => openDeliveryModal(c)}
                          className={`text-xs font-bold rounded-lg h-8 px-3 gap-1.5 shadow-2xs ${
                            isDelivered
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          {isDelivered ? 'Voir Identifiants' : 'Livrer'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500 font-medium">
            Page {page} sur {totalPages} ({total} commandes)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs font-semibold rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" /> Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs font-semibold rounded-lg"
            >
              Suivant <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Livraison 1-Clic */}
      {selectedCommande && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4 relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedCommande(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Livraison de la Commande #{selectedCommande.reference || selectedCommande.id}
              </h3>
              <p className="text-xs text-slate-500">
                Service : <strong>{selectedCommande.offrePartenaire?.titreOffre || selectedCommande.offrePartenaire?.nomService || 'Abonnement'}</strong> • Client : {selectedCommande.telephoneClient || selectedCommande.client?.telephone}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Comptes Disponibles en Stock */}
              {availableStock.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Boxes className="h-3.5 w-3.5 text-indigo-600" />
                      Comptes en stock disponibles ({availableStock.length})
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">Cliquez pour insérer</span>
                  </div>

                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {availableStock.map((stk) => (
                      <div
                        key={stk.id}
                        onClick={() => handleSelectFromStock(stk)}
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between text-xs font-mono"
                      >
                        <span className="truncate font-semibold text-slate-800">{stk.login}</span>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-0">
                          Utiliser ce compte
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulaire des Identifiants */}
              <form onSubmit={submitDelivery} id="delivery-form" className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Identifiant / Email de connexion *
                  </label>
                  <Input
                    required
                    placeholder="Ex: client.netflix@gmail.com"
                    value={delivery.login}
                    onChange={(e) => setDelivery((s) => ({ ...s, login: e.target.value }))}
                    className="text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Mot de passe *
                  </label>
                  <Input
                    required
                    placeholder="Ex: MonMotDePasse123"
                    value={delivery.password}
                    onChange={(e) => setDelivery((s) => ({ ...s, password: e.target.value }))}
                    className="text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">
                    Instructions particulières (profil, code PIN, etc.)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Connectez-vous sur le Profil 2 avec le PIN 1234."
                    value={delivery.instructions}
                    onChange={(e) => setDelivery((s) => ({ ...s, instructions: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-800 outline-none leading-relaxed"
                  />
                </div>
              </form>
            </div>

            {/* Actions & Raccourci WhatsApp */}
            <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                {generateWhatsAppLink(selectedCommande, delivery) && (
                  <a
                    href={generateWhatsAppLink(selectedCommande, delivery)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                    Envoyer sur WhatsApp
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedCommande(null)}
                  className="text-xs font-semibold rounded-lg"
                >
                  Fermer
                </Button>
                <Button
                  type="submit"
                  form="delivery-form"
                  disabled={submitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg px-4 h-9 gap-1.5 shadow-2xs"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  {submitting ? 'Validation...' : 'Valider la Livraison'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
