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
  AlertTriangle,
  Sparkles,
  PhoneCall,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getPartenaireId } from '../../Utils/Utils'
import { souscriptionsAPI, identifiantsStockAPI } from '../../lib/api'
import { onSocketEvent } from '../../lib/socket'
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
import { useCurrency } from '../../context/CurrencyContext'

const OPERATOR_BADGES = {
  WAVE: 'bg-sky-50 text-sky-700 border border-sky-200',
  ORANGE: 'bg-orange-50 text-orange-700 border border-orange-200',
  MTN: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
  MOOV: 'bg-blue-50 text-blue-700 border border-blue-200',
}

const emptyDelivery = { login: '', password: '', instructions: '' }

export default function CommandesPartenairePage() {
  const partenaireId = getPartenaireId()
  const { formatPrice } = useCurrency()

  const [commandes, setCommandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('TOUT') // 'TOUT' | 'A_LIVRER' | 'LIVREES' | 'PRIVE' | 'ECHOUE'
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
          limit: 15,
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

  // Ouvrir modal de livraison
  const openDeliveryModal = async (commande) => {
    setSelectedCommande(commande)
    setDelivery({
      login: commande.login || '',
      password: commande.password || '',
      instructions: commande.instructions || (commande.nomProfilSouhaite ? `Profil: ${commande.nomProfilSouhaite} (PIN: ${commande.codePinSouhaite || 'Non défini'})` : ''),
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
      instructions: item.nomProfil ? `Profil: ${item.nomProfil} ${item.codePin ? `(PIN: ${item.codePin})` : ''} - ${item.instructions || ''}` : item.instructions || '',
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
      toast.success('Commande livrée avec succès au client ! 🎉')
      setSelectedCommande(null)
      setDelivery(emptyDelivery)
      await loadCommandes()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Impossible de livrer la commande')
    } finally {
      setSubmitting(false)
    }
  }

  const generateRelanceWhatsAppLink = (cmd) => {
    const phone = cmd.client?.numeroWhatsapp || cmd.client?.telephone || cmd.telephoneClient || cmd.numeroClient
    if (!phone) return null
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    const serviceName = cmd.offrePartenaire?.titreOffre || cmd.offrePartenaire?.nomService || 'Abonnement'
    const clientNom = cmd.client?.pseudo || cmd.client?.prenoms || 'Bonjour'
    const msg = `Bonjour ${clientNom} ! Nous avons remarqué que votre tentative de paiement pour l'offre *${serviceName}* (${formatPrice(cmd.montant || 0)}) n'a pas pu aboutir. Avez-vous besoin d'assistance pour valider votre abonnement ? 😊`
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Journal des Ventes & Commandes"
        description="Consultez l'historique en temps réel de vos ventes, effectuez les livraisons manuelles ou privées et relancez les paiements non aboutis."
        badge="Ventes"
        action={
          <Button
            variant="outline"
            onClick={() => loadCommandes()}
            className="text-xs font-semibold rounded-lg gap-2"
          >
            <Clock className="h-3.5 w-3.5" /> Actualiser
          </Button>
        }
      />

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Chiffre d'Affaires Reçu"
          value={formatPrice(stats.revenu || 0)}
          icon={Wallet}
          color="emerald"
        />
        <KpiCard
          title="Commandes Payées"
          value={stats.payees || 0}
          icon={CheckCircle2}
          color="primary"
        />
        <KpiCard
          title="En Attente de Livraison"
          value={stats.aLivrer || 0}
          icon={Truck}
          color="amber"
        />
        <KpiCard
          title="Livrées avec Succès"
          value={stats.livrees || 0}
          icon={PackageCheck}
          color="slate"
        />
      </div>

      {/* Barre d'Outils et Filtres (Points 4/5, 7) */}
      <Card className="p-4 border border-border bg-card shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'TOUT', label: 'Toutes les Commandes' },
              { id: 'A_LIVRER', label: `À Livrer (${stats.aLivrer || 0})` },
              { id: 'LIVREES', label: 'Livrées' },
              { id: 'PRIVE', label: '👑 Profils Privés' },
              { id: 'ECHOUE', label: '⚠️ Échecs / En Attente' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveFilter(tab.id)
                  setPage(1)
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Rechercher client, réf..."
              className="pl-9 h-9 text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Tableau des Commandes */}
      <Card className="p-6 border border-border bg-card shadow-xs space-y-4">
        {loading ? (
          <LoadingState message="Chargement des commandes..." />
        ) : commandes.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Aucune commande trouvée"
            description="Aucune transaction ne correspond à vos filtres actuels."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-black uppercase text-[10px]">
                  <th className="py-3 px-3">Service & Forfait</th>
                  <th className="py-3 px-3">Client (Pseudo / N°)</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Montant</th>
                  <th className="py-3 px-3">Paiement</th>
                  <th className="py-3 px-3">Livraison</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {commandes.map((cmd) => {
                  const isPaid = cmd.statutPaiement === 'SUCCES' || cmd.statutPaiement === 'PAYE'
                  const isDelivered = cmd.isLivred || cmd.etatSouscription === 'ACTIF'
                  const isPrive = cmd.typeAbonnement === 'PRIVE' || Boolean(cmd.nomProfilSouhaite)
                  const op = normalizeOp(cmd.modePaiement || cmd.operateur)
                  const relanceLink = generateRelanceWhatsAppLink(cmd)

                  return (
                    <tr key={cmd.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <ServiceLogo
                            name={cmd.offrePartenaire?.titreOffre || cmd.offrePartenaire?.nomService || 'Offre'}
                            image={cmd.offrePartenaire?.imageService}
                            size="sm"
                          />
                          <div>
                            <p className="font-extrabold text-foreground truncate max-w-[150px]">
                              {cmd.offrePartenaire?.titreOffre || cmd.offrePartenaire?.nomService || 'Abonnement'}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {cmd.duree || 1} {cmd.periode || 'mois'} · Réf: {cmd.reference?.slice(-6) || cmd.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-foreground">
                          {cmd.client?.pseudo || cmd.client?.prenoms || 'Client'}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <span>{cmd.client?.numeroWhatsapp || cmd.client?.telephone || cmd.numeroClient || '-'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {isPrive ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px]">
                              <Sparkles className="w-3 h-3" /> Privé
                            </span>
                            {cmd.nomProfilSouhaite && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">👤 {cmd.nomProfilSouhaite}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-semibold">👥 Partagé</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-black text-foreground">
                        {formatPrice(cmd.montant || 0)}
                      </td>

                      <td className="py-3 px-3">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-black text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Payé ({op})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-black text-[10px]">
                            <AlertTriangle className="w-3 h-3" /> Échec / En attente
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {isDelivered ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 font-extrabold text-[10px]">
                            Livré
                          </span>
                        ) : isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-extrabold text-[10px] animate-pulse">
                            À livrer
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Bouton Relance WhatsApp si paiement échoué */}
                          {!isPaid && relanceLink && (
                            <a
                              href={relanceLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black hover:bg-emerald-500/20 transition"
                              title="Relancer le client sur WhatsApp"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              Relancer
                            </a>
                          )}

                          {/* Bouton Livraison Manuelle ou Privée */}
                          {isPaid && !isDelivered && (
                            <Button size="sm" onClick={() => openDeliveryModal(cmd)} className="text-xs font-black">
                              <Truck className="h-3.5 w-3.5" /> Livrer
                            </Button>
                          )}

                          {isDelivered && (
                            <button
                              type="button"
                              onClick={() => openDeliveryModal(cmd)}
                              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted"
                              title="Voir ou modifier les identifiants livrés"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border pt-4 text-xs font-bold text-muted-foreground">
            <span>
              Page {page} sur {totalPages} ({total} commandes)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de Livraison */}
      {selectedCommande && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCommande(null)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">Livraison de commande</span>
              <h3 className="text-lg font-black text-foreground">
                {selectedCommande.offrePartenaire?.titreOffre || selectedCommande.offrePartenaire?.nomService || 'Abonnement'}
              </h3>
              <p className="text-xs text-muted-foreground">
                Client : <strong>{selectedCommande.client?.pseudo || selectedCommande.client?.prenoms || 'Client'}</strong> (WhatsApp : {selectedCommande.client?.numeroWhatsapp || selectedCommande.client?.telephone || selectedCommande.numeroClient})
              </p>
            </div>

            {/* Si c'est une commande privée */}
            {(selectedCommande.typeAbonnement === 'PRIVE' || selectedCommande.nomProfilSouhaite) && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1">
                <p className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Profil Privé Demandé par le Client :
                </p>
                <p className="text-xs text-foreground font-bold">
                  Nom du Profil : <strong>{selectedCommande.nomProfilSouhaite || 'Au choix'}</strong>
                  {selectedCommande.codePinSouhaite && ` · Code PIN : ${selectedCommande.codePinSouhaite}`}
                </p>
              </div>
            )}

            {/* Stock disponible pour insertion en 1 clic */}
            {availableStock.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground block">
                  Insérer depuis le stock disponible ({availableStock.length}) :
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                  {availableStock.map((stk) => (
                    <button
                      key={stk.id}
                      type="button"
                      onClick={() => handleSelectFromStock(stk)}
                      className="px-2.5 py-1 rounded-xl bg-muted/60 hover:bg-primary/10 hover:text-primary text-[11px] font-bold border border-border transition cursor-pointer"
                    >
                      {stk.nomProfil ? `${stk.nomProfil} (C#${stk.numeroCompte})` : stk.login}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={submitDelivery} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">Login / Email du compte</label>
                <Input
                  required
                  placeholder="ex: netflix.compte@gmail.com"
                  value={delivery.login}
                  onChange={(e) => setDelivery({ ...delivery, login: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">Mot de passe</label>
                <Input
                  required
                  placeholder="ex: Pass1234!"
                  value={delivery.password}
                  onChange={(e) => setDelivery({ ...delivery, password: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground block">Instructions / Profil (optionnel)</label>
                <textarea
                  rows={2}
                  placeholder="ex: Profil 2 (PIN 1234) - Ne pas changer le mot de passe."
                  value={delivery.instructions}
                  onChange={(e) => setDelivery({ ...delivery, instructions: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-input bg-card text-xs font-medium outline-none"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full py-2.5 text-xs font-black">
                {submitting ? 'Validation...' : 'Valider la Livraison & Notifier le Client'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
