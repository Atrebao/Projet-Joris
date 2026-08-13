import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Wallet,
  ArrowUpRight,
  History,
  Search,
  CheckCircle2,
  Clock,
  Percent,
  Radio,
  Filter,
  DollarSign,
  Store,
  Layers,
  FileText,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'
import { reversementsAPI, souscriptionsAPI } from '../../lib/api'
import { onSocketEvent } from '../../lib/socket'
import toast from 'react-hot-toast'
import {
  Badge,
  Button,
  Card,
  DataTable,
  Input,
  KpiCard,
  LoadingState,
  PageHeader,
  Select,
  ServiceLogo,
  StatusBadge,
  formatFCFA,
} from '../../components/saas/SaasPrimitives'

const MODES_PAIEMENT = [
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'WAVE', label: 'Wave' },
  { value: 'ORANGE_MONEY', label: 'Orange Money' },
  { value: 'MTN_MOMO', label: 'MTN MoMo' },
  { value: 'MOOV_MONEY', label: 'Moov Money' },
  { value: 'VIREMENT_BANCAIRE', label: 'Virement bancaire' },
  { value: 'ESPECES', label: 'Espèces' },
  { value: 'AUTRE', label: 'Autre' },
]

export default function ReversementsPage() {
  const [activeTab, setActiveTab] = useState('commandes') // 'commandes' | 'partenaires' | 'historique'
  const [loading, setLoading] = useState(true)

  // Statistiques globales
  const [stats, setStats] = useState({
    totalCA: 0,
    totalCommissions: 0,
    totalEligible: 0,
    totalEnAttente: 0,
    totalReverse: 0,
    totalSoldeDu: 0,
  })

  // Onglet 1: Souscriptions livrées éligibles (ligne par ligne)
  const [commandesEligibles, setCommandesEligibles] = useState([])
  const [selectedCmdIds, setSelectedCmdIds] = useState([])
  const [searchCmd, setSearchCmd] = useState('')
  const [pageCmd, setPageCmd] = useState(1)
  const [totalPagesCmd, setTotalPagesCmd] = useState(1)

  // Onglet 2: Balances par Partenaire
  const [balances, setBalances] = useState([])
  const [searchPartenaire, setSearchPartenaire] = useState('')

  // Onglet 3: Historique des Reversements
  const [historyList, setHistoryList] = useState([])
  const [pageHist, setPageHist] = useState(1)
  const [totalPagesHist, setTotalPagesHist] = useState(1)
  const [searchHist, setSearchHist] = useState('')

  // Modal Effectuer un Reversement
  const [payoutModalOpen, setPayoutModalOpen] = useState(false)
  const [targetPartner, setTargetPartner] = useState(null)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutMode, setPayoutMode] = useState('MOBILE_MONEY')
  const [payoutRef, setPayoutRef] = useState('')
  const [payoutNotes, setPayoutNotes] = useState('')
  const [submittingPayout, setSubmittingPayout] = useState(false)

  // Chargement des données selon l'onglet actif
  const loadData = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true)
      try {
        const [balancesRes, cmdsRes, historyRes] = await Promise.allSettled([
          reversementsAPI.getAllBalances({ search: searchPartenaire || undefined }),
          souscriptionsAPI.getAll({
            activeFilter: 'LIVREES',
            statutPaiement: 'SUCCES',
            search: searchCmd || undefined,
            page: pageCmd,
            limit: 12,
          }),
          reversementsAPI.getAll({
            search: searchHist || undefined,
            page: pageHist,
            limit: 12,
          }),
        ])

        if (balancesRes.status === 'fulfilled') {
          const bData = balancesRes.value?.data || {}
          setBalances(bData.data || [])
          if (bData.stats) setStats(bData.stats)
        }

        if (cmdsRes.status === 'fulfilled') {
          const cData = cmdsRes.value?.data || {}
          const list = Array.isArray(cData) ? cData : cData.data || []
          setCommandesEligibles(list)
          setTotalPagesCmd(cData.totalPages || 1)
        }

        if (historyRes.status === 'fulfilled') {
          const hData = historyRes.value?.data || {}
          const list = Array.isArray(hData) ? hData : hData.data || []
          setHistoryList(list)
          setTotalPagesHist(hData.totalPages || 1)
        }
      } catch (error) {
        console.error('Erreur chargement reversements:', error)
        if (!isBackground) toast.error('Impossible de charger les données financières')
      } finally {
        if (!isBackground) setLoading(false)
      }
    },
    [searchPartenaire, searchCmd, pageCmd, searchHist, pageHist]
  )

  useEffect(() => {
    loadData()
  }, [loadData])

  // Écoute des événements WebSocket en temps réel
  useEffect(() => {
    const unsubOrder = onSocketEvent('nouvelle_commande', () => loadData(true))
    const unsubDelivery = onSocketEvent('commande_livree', () => loadData(true))
    const unsubPayout = onSocketEvent('nouveau_reversement', () => loadData(true))
    const unsubStats = onSocketEvent('stats_updated', () => loadData(true))

    return () => {
      unsubOrder()
      unsubDelivery()
      unsubPayout()
      unsubStats()
    }
  }, [loadData])

  // Actions de reversement unitaire (ligne par ligne)
  const openSingleOrderPayout = (commande) => {
    const part = commande.offrePartenaire?.partenaire || commande.partenaire || {}
    const montantNet = Number(commande.montantPartenaire ?? commande.montantTotal ?? commande.montant ?? 0)

    setTargetPartner(part)
    setPayoutAmount(String(montantNet))
    setPayoutMode('MOBILE_MONEY')
    setPayoutRef(`CMD-${commande.reference || commande.id}`)
    setPayoutNotes(`Versement unitaire pour la commande #${commande.reference || commande.id} (${commande.abonnement?.nom || 'Abonnement'})`)
    setPayoutModalOpen(true)
  }

  // Actions de reversement groupé (sélection multiple)
  const openBatchOrdersPayout = () => {
    if (selectedCmdIds.length === 0) return

    const selectedCmds = commandesEligibles.filter((c) => selectedCmdIds.includes(c.id))
    const firstPartnerId = selectedCmds[0]?.offrePartenaire?.partenaire?.id || selectedCmds[0]?.partenaire?.id
    const allSamePartner = selectedCmds.every(
      (c) => (c.offrePartenaire?.partenaire?.id || c.partenaire?.id) === firstPartnerId
    )

    if (!allSamePartner) {
      toast.error('Veuillez sélectionner des commandes appartenant au même partenaire pour un versement groupé')
      return
    }

    const totalNet = selectedCmds.reduce(
      (sum, c) => sum + Number(c.montantPartenaire ?? c.montantTotal ?? c.montant ?? 0),
      0
    )
    const part = selectedCmds[0]?.offrePartenaire?.partenaire || selectedCmds[0]?.partenaire || {}
    const refs = selectedCmds.map((c) => c.reference || c.id).join(', ')

    setTargetPartner(part)
    setPayoutAmount(String(totalNet))
    setPayoutMode('MOBILE_MONEY')
    setPayoutRef(`GRP-${selectedCmds.length}CMDS`)
    setPayoutNotes(`Versement groupé pour ${selectedCmds.length} commande(s) livrée(s) : [${refs}]`)
    setPayoutModalOpen(true)
  }

  // Action de reversement global pour un partenaire
  const openPartnerGlobalPayout = (partnerBalance) => {
    setTargetPartner({
      id: partnerBalance.partenaireId,
      nomBoutique: partnerBalance.nomBoutique,
      nom: partnerBalance.nomComplet,
    })
    setPayoutAmount(String(partnerBalance.soldeRestantAReverser || 0))
    setPayoutMode('MOBILE_MONEY')
    setPayoutRef('')
    setPayoutNotes(`Solde complet des souscriptions livrées pour la boutique ${partnerBalance.nomBoutique}`)
    setPayoutModalOpen(true)
  }

  // Soumission du reversement
  const handleSubmitPayout = async (e) => {
    e.preventDefault()
    if (!targetPartner?.id) {
      toast.error('Partenaire non spécifié')
      return
    }

    const montant = Number(payoutAmount)
    if (isNaN(montant) || montant <= 0) {
      toast.error('Veuillez entrer un montant valide supérieur à 0')
      return
    }

    setSubmittingPayout(true)
    try {
      await reversementsAPI.create(targetPartner.id, {
        montant,
        modePaiement: payoutMode,
        referenceTransaction: payoutRef || undefined,
        notes: payoutNotes || undefined,
      })

      toast.success(`Reversement de ${formatFCFA(montant)} validé avec succès !`)
      setPayoutModalOpen(false)
      setSelectedCmdIds([])
      loadData()
    } catch (error) {
      console.error('Erreur reversement:', error)
      toast.error(error.response?.data?.message || 'Erreur lors du versement')
    } finally {
      setSubmittingPayout(false)
    }
  }

  const handleCancelReversement = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce reversement ?')) return
    try {
      await reversementsAPI.cancel(id)
      toast.success('Reversement annulé')
      loadData()
    } catch {
      toast.error('Impossible d’annuler ce reversement')
    }
  }

  const toggleSelectAll = () => {
    if (selectedCmdIds.length === commandesEligibles.length) {
      setSelectedCmdIds([])
    } else {
      setSelectedCmdIds(commandesEligibles.map((c) => c.id))
    }
  }

  const toggleSelectOne = (id) => {
    setSelectedCmdIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  if (loading && balances.length === 0 && commandesEligibles.length === 0) {
    return <LoadingState label="Chargement des données financières et versements..." />
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Versements & Reversements"
          description="Reversement des souscriptions payées et identifiants effectivement livrés aux clients."
        />
        <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold shadow-2xs">
          <Radio className="h-3.5 w-3.5 animate-pulse text-purple-600" />
          Temps réel connecté
        </div>
      </div>

      {/* Cartes KPI Financières Globales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Solde Dû aux Partenaires (Livrées)"
          value={formatFCFA(stats.totalSoldeDu)}
          icon={Wallet}
          accent="primary"
          trend="Éligible au versement"
        />
        <KpiCard
          label="Total Déjà Reversé"
          value={formatFCFA(stats.totalReverse)}
          icon={CheckCircle2}
          accent="chart3"
        />
        <KpiCard
          label="Commissions Plateforme"
          value={formatFCFA(stats.totalCommissions)}
          icon={Percent}
          accent="accent"
        />
        <KpiCard
          label="En Séquestre (Non Livrées)"
          value={formatFCFA(stats.totalEnAttente)}
          icon={Clock}
          accent="chart4"
          trend="À livrer par partenaire"
        />
      </div>

      {/* Barre de navigation par onglets */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setActiveTab('commandes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'commandes'
                ? 'bg-card text-purple-700 shadow-xs border border-purple-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="h-4 w-4" />
            Ligne par ligne (Souscriptions livrées)
          </button>
          <button
            onClick={() => setActiveTab('partenaires')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'partenaires'
                ? 'bg-card text-purple-700 shadow-xs border border-purple-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="h-4 w-4" />
            Global par Partenaire
          </button>
          <button
            onClick={() => setActiveTab('historique')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'historique'
                ? 'bg-card text-purple-700 shadow-xs border border-purple-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="h-4 w-4" />
            Historique des Versements
          </button>
        </div>

        {activeTab === 'commandes' && selectedCmdIds.length > 0 && (
          <Button
            onClick={openBatchOrdersPayout}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-2 rounded-xl shadow-xs animate-in fade-in"
          >
            <Wallet className="h-4 w-4" />
            Reverser la sélection ({selectedCmdIds.length} commandes)
          </Button>
        )}
      </div>

      {/* ================= ONGLET 1 : LIGNE PAR LIGNE (COMMANDES LIVRÉES) ================= */}
      {activeTab === 'commandes' && (
        <div className="space-y-4">
          <Card className="p-4 border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9 bg-card border-input rounded-xl"
                  placeholder="Rechercher une commande livrée par référence, client ou offre..."
                  value={searchCmd}
                  onChange={(e) => {
                    setSearchCmd(e.target.value)
                    setPageCmd(1)
                  }}
                />
              </label>
              <div className="text-xs text-muted-foreground font-semibold">
                Seules les souscriptions payées et <span className="font-bold text-emerald-700">effectivement livrées</span> apparaissent ici.
              </div>
            </div>
          </Card>

          <Card className="p-1 border border-border overflow-hidden">
            <DataTable
              data={commandesEligibles}
              emptyLabel="Aucune souscription livrée trouvée."
              columns={[
                {
                  key: 'select',
                  label: (
                    <input
                      type="checkbox"
                      checked={commandesEligibles.length > 0 && selectedCmdIds.length === commandesEligibles.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded accent-purple-600 cursor-pointer"
                    />
                  ),
                  render: (c) => (
                    <input
                      type="checkbox"
                      checked={selectedCmdIds.includes(c.id)}
                      onChange={() => toggleSelectOne(c.id)}
                      className="h-4 w-4 rounded accent-purple-600 cursor-pointer"
                    />
                  ),
                },
                {
                  key: 'ref',
                  label: 'Commande',
                  render: (c) => (
                    <div>
                      <span className="font-mono font-bold text-xs text-foreground">{c.reference || `CMD-${c.id}`}</span>
                      <div className="text-[11px] text-muted-foreground">
                        {c.dateCreation ? new Date(c.dateCreation).toLocaleDateString('fr-FR') : '-'}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'partenaire',
                  label: 'Partenaire',
                  render: (c) => (
                    <div className="font-bold text-sm text-slate-900">
                      {c.offrePartenaire?.partenaire?.nomBoutique || c.offrePartenaire?.partenaire?.nom || c.partenaire || '-'}
                    </div>
                  ),
                },
                {
                  key: 'offre',
                  label: 'Offre & Client',
                  render: (c) => (
                    <div>
                      <div className="font-semibold text-xs text-foreground">{c.abonnement?.nom || c.offrePartenaire?.nomService || 'Abonnement'}</div>
                      <div className="text-[11px] text-muted-foreground">{c.client?.nom || c.emailClient || 'Client'}</div>
                    </div>
                  ),
                },
                {
                  key: 'montantTotal',
                  label: 'Total Payé',
                  render: (c) => <span className="text-xs font-semibold">{formatFCFA(c.montantTotal || c.montant || 0)}</span>,
                },
                {
                  key: 'commission',
                  label: 'Commission',
                  render: (c) => (
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {formatFCFA(c.montantPlateforme || 0)}
                    </span>
                  ),
                },
                {
                  key: 'montantPartenaire',
                  label: 'Net à Reverser',
                  render: (c) => (
                    <span className="font-mono font-extrabold text-sm text-purple-700">
                      {formatFCFA(c.montantPartenaire ?? c.montantTotal ?? c.montant ?? 0)}
                    </span>
                  ),
                },
                {
                  key: 'livraison',
                  label: 'État',
                  render: (c) => <StatusBadge status={c.isLivred ? 'LIVRE' : 'A_LIVRER'} />,
                },
                {
                  key: 'actions',
                  label: '',
                  className: 'text-right',
                  cellClassName: 'text-right',
                  render: (c) => (
                    <Button
                      size="sm"
                      onClick={() => openSingleOrderPayout(c)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-7 px-2.5 rounded-lg gap-1 shadow-2xs"
                      title="Reverser pour cette commande"
                    >
                      <Wallet className="h-3 w-3" />
                      Reverser
                    </Button>
                  ),
                },
              ]}
            />

            {totalPagesCmd > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-500 font-medium">
                  Page <span className="font-bold text-slate-700">{pageCmd}</span> sur <span className="font-bold text-slate-700">{totalPagesCmd}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageCmd((p) => Math.max(1, p - 1))}
                    disabled={pageCmd === 1}
                    className="h-8 px-2 text-xs border-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageCmd((p) => Math.min(totalPagesCmd, p + 1))}
                    disabled={pageCmd === totalPagesCmd}
                    className="h-8 px-2 text-xs border-slate-200"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ================= ONGLET 2 : GLOBAL PAR PARTENAIRE ================= */}
      {activeTab === 'partenaires' && (
        <div className="space-y-4">
          <Card className="p-4 border border-border">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9 bg-card border-input rounded-xl"
                placeholder="Rechercher par nom de boutique ou nom du partenaire..."
                value={searchPartenaire}
                onChange={(e) => setSearchPartenaire(e.target.value)}
              />
            </label>
          </Card>

          <Card className="p-1 border border-border overflow-hidden">
            <DataTable
              data={balances}
              emptyLabel="Aucun partenaire trouvé"
              columns={[
                {
                  key: 'partenaire',
                  label: 'Partenaire / Boutique',
                  render: (b) => (
                    <div className="flex items-center gap-3">
                      <ServiceLogo name={b.nomBoutique || b.nomComplet} size="sm" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{b.nomBoutique}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{b.nomComplet} • {b.telephone || b.email || '-'}</div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'caTotalPaye',
                  label: 'CA Brut Total',
                  render: (b) => <span className="font-bold text-sm text-slate-900">{formatFCFA(b.caTotalPaye)}</span>,
                },
                {
                  key: 'commission',
                  label: 'Commission',
                  render: (b) => (
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                        {b.commissionActive === false ? '0%' : `${b.tauxCommission}%`}
                      </span>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{formatFCFA(b.commissionTotale)}</div>
                    </div>
                  ),
                },
                {
                  key: 'montantEligible',
                  label: 'Éligible (Livrées)',
                  render: (b) => (
                    <div>
                      <span className="font-extrabold text-sm text-emerald-700">{formatFCFA(b.montantEligible)}</span>
                      {b.montantEnAttenteLivraison > 0 && (
                        <div className="text-[10px] text-amber-600 font-bold mt-0.5" title="En attente de livraison des identifiants">
                          +{formatFCFA(b.montantEnAttenteLivraison)} séquestre
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'totalDejaReverse',
                  label: 'Déjà Reversé',
                  render: (b) => <span className="font-mono text-xs text-slate-700 font-semibold">{formatFCFA(b.totalDejaReverse)}</span>,
                },
                {
                  key: 'soldeRestantAReverser',
                  label: 'Solde Dû',
                  render: (b) => (
                    <span className={`font-mono font-extrabold text-sm ${b.soldeRestantAReverser > 0 ? 'text-purple-700' : 'text-slate-400'}`}>
                      {formatFCFA(b.soldeRestantAReverser)}
                    </span>
                  ),
                },
                {
                  key: 'actions',
                  label: '',
                  className: 'text-right',
                  cellClassName: 'text-right',
                  render: (b) => (
                    <Button
                      size="sm"
                      onClick={() => openPartnerGlobalPayout(b)}
                      disabled={b.soldeRestantAReverser <= 0}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-7 px-3 rounded-lg gap-1.5 shadow-2xs disabled:opacity-40"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      Reverser le solde
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      )}

      {/* ================= ONGLET 3 : HISTORIQUE DES VERSEMENTS ================= */}
      {activeTab === 'historique' && (
        <div className="space-y-4">
          <Card className="p-4 border border-border">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9 bg-card border-input rounded-xl"
                placeholder="Rechercher par référence, partenaire ou transaction..."
                value={searchHist}
                onChange={(e) => {
                  setSearchHist(e.target.value)
                  setPageHist(1)
                }}
              />
            </label>
          </Card>

          <Card className="p-1 border border-border overflow-hidden">
            <DataTable
              data={historyList}
              emptyLabel="Aucun versement enregistré."
              columns={[
                {
                  key: 'ref',
                  label: 'Référence Versement',
                  render: (r) => (
                    <div>
                      <span className="font-mono font-bold text-xs text-foreground">{r.reference}</span>
                      <div className="text-[11px] text-muted-foreground">
                        {r.dateCreation ? new Date(r.dateCreation).toLocaleDateString('fr-FR') : '-'}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'partenaire',
                  label: 'Partenaire',
                  render: (r) => (
                    <div className="font-bold text-sm text-foreground">
                      {r.partenaire?.nomBoutique || r.partenaire?.nom || 'Partenaire'}
                    </div>
                  ),
                },
                {
                  key: 'montant',
                  label: 'Montant Reversé',
                  render: (r) => <span className="font-mono font-extrabold text-sm text-purple-700">{formatFCFA(r.montant)}</span>,
                },
                {
                  key: 'mode',
                  label: 'Mode & Transaction',
                  render: (r) => (
                    <div>
                      <span className="text-xs font-semibold text-slate-800">{r.modePaiement || 'MOBILE_MONEY'}</span>
                      {r.referenceTransaction && (
                        <div className="font-mono text-[10px] text-slate-400">Réf: {r.referenceTransaction}</div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'notes',
                  label: 'Notes',
                  render: (r) => <span className="text-xs text-muted-foreground line-clamp-1">{r.notes || '-'}</span>,
                },
                {
                  key: 'statut',
                  label: 'Statut',
                  render: (r) => <StatusBadge status={r.statut} />,
                },
                {
                  key: 'actions',
                  label: '',
                  className: 'text-right',
                  cellClassName: 'text-right',
                  render: (r) =>
                    r.statut === 'VALIDE' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCancelReversement(r.id)}
                        className="text-destructive hover:bg-destructive/10 text-xs font-bold h-7 px-2"
                      >
                        Annuler
                      </Button>
                    ) : null,
                },
              ]}
            />

            {totalPagesHist > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-500 font-medium">
                  Page <span className="font-bold text-slate-700">{pageHist}</span> sur <span className="font-bold text-slate-700">{totalPagesHist}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageHist((p) => Math.max(1, p - 1))}
                    disabled={pageHist === 1}
                    className="h-8 px-2 text-xs border-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageHist((p) => Math.min(totalPagesHist, p + 1))}
                    disabled={pageHist === totalPagesHist}
                    className="h-8 px-2 text-xs border-slate-200"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ================= MODAL EFFECTUER UN REVERSEMENT ================= */}
      {payoutModalOpen && targetPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border p-4 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">Effectuer un versement</h3>
                  <p className="text-xs text-muted-foreground">{targetPartner.nomBoutique || targetPartner.nom}</p>
                </div>
              </div>
              <button
                onClick={() => setPayoutModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayout} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Montant à reverser (FCFA) *
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  placeholder="Ex: 50000"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="font-mono font-bold text-base"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Mode de paiement *
                  </label>
                  <Select value={payoutMode} onChange={(e) => setPayoutMode(e.target.value)}>
                    {MODES_PAIEMENT.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    Référence transaction
                  </label>
                  <Input
                    placeholder="Ex: TXN-WAVE-8921"
                    value={payoutRef}
                    onChange={(e) => setPayoutRef(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Notes / Justificatif
                </label>
                <Input
                  placeholder="Ex: Paiement commande #CMD-123..."
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setPayoutModalOpen(false)}>
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={submittingPayout}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5"
                >
                  {submittingPayout ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                  Valider le versement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
