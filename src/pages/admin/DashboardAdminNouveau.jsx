import { useEffect, useState, useCallback } from 'react'
import { ArrowLeftRight, DollarSign, Store, Users, Percent, Wallet, CheckCircle2, Clock, Radio } from 'lucide-react'
import { souscriptionsAPI, statsAPI } from '../../lib/api'
import { onSocketEvent } from '../../lib/socket'
import toast from 'react-hot-toast'
import { Card, KpiCard, LoadingState, PageHeader, formatFCFA } from '../../components/saas/SaasPrimitives'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
const OPERATORS = [
  { key: 'WAVE', label: 'Wave', color: '#1dc8ff', badge: 'bg-sky-400 text-slate-950' },
  { key: 'ORANGE', label: 'Orange', color: '#ff7900', badge: 'bg-orange-500 text-white' },
  { key: 'MTN', label: 'MTN', color: '#ffcc00', badge: 'bg-yellow-400 text-slate-950' },
  { key: 'MOOV', label: 'Moov', color: '#0066b3', badge: 'bg-blue-700 text-white' }
]

export default function DashboardAdminNouveau() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState([])
  const [operatorData, setOperatorData] = useState([])
  const [recent, setRecent] = useState([])

  const loadData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true)
    try {
      const [statsRes, graphRes, transactionsRes] = await Promise.allSettled([
        statsAPI.adminDashboard(),
        statsAPI.grapheCA({ periode: 'ANNEE' }),
        souscriptionsAPI.getAll({ limit: 10, statutPaiement: 'SUCCES' }),
      ])

      const statsData = statsRes.status === 'fulfilled' ? statsRes.value.data || {} : {}
      const graphData = graphRes.status === 'fulfilled' ? graphRes.value.data || {} : {}
      const rawTransactions =
        transactionsRes.status === 'fulfilled'
          ? Array.isArray(transactionsRes.value.data)
            ? transactionsRes.value.data
            : transactionsRes.value.data?.data || []
          : []

      setStats({
        totalRevenue: statsData.revenusTotal || 0,
        platformRevenue: statsData.revenusPlateforme || 0,
        partnersRevenue: statsData.revenusPartenaires || 0,
        montantEligible: statsData.montantEligibleReversement || 0,
        montantEnAttente: statsData.montantEnAttenteLivraison || 0,
        totalReverse: statsData.totalReversePartenaires || 0,
        soldeRestantAReverser: statsData.soldeRestantAReverser || 0,
        partners: statsData.totalPartenaires || 0,
        clients: statsData.totalClients || 0,
        transactions: statsData.souscriptionsMois || 0,
        evolution: statsData.evolutionRevenus || 0,
        newPartners: statsData.partenairesActifs || 0,
        newClients: statsData.nouveauxClientsMois || 0,
      })

      if (graphData.labels && graphData.data) {
        setMonthlyData(
          graphData.labels.map((label, index) => ({
            label: label.substring(0, 3),
            value: Number(graphData.data[index] || 0),
          }))
        )
      } else {
        setMonthlyData(buildMonthlyData(rawTransactions))
      }

      setOperatorData(buildOperatorData(rawTransactions))
      setRecent(rawTransactions.slice(0, 6))
    } catch (error) {
      console.error('Erreur chargement dashboard admin:', error)
      if (!isBackground) toast.error('Impossible de charger les statistiques')
    } finally {
      if (!isBackground) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()

    // Écoute des événements WebSocket en temps réel
    const unsubOrder = onSocketEvent('nouvelle_commande', (data) => {
      toast.success(`⚡ Nouvelle commande reçue : ${formatFCFA(data?.montant || 0)} (${data?.nomOffre || 'Abonnement'})`, {
        duration: 5000,
        icon: '🛒',
      })
      loadData(true)
    })

    const unsubDelivery = onSocketEvent('commande_livree', (data) => {
      toast.success(`✅ Commande #${data?.reference || ''} livrée au client !`, {
        duration: 4000,
      })
      loadData(true)
    })

    const unsubPayout = onSocketEvent('nouveau_reversement', (data) => {
      toast.success(`💳 Reversement de ${formatFCFA(data?.montant || 0)} validé pour ${data?.nomBoutique || 'le partenaire'}.`, {
        duration: 4000,
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
  }, [loadData])

  if (loading || !stats) return <LoadingState label="Chargement de la vue globale..." />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Vue globale"
          description="Performance financière et activité en direct de la plateforme."
        />
        <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-xs">
          <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-600" />
          Temps réel connecté
        </div>
      </div>

      {/* Bloc 1: Indicateurs Financiers Clés (CA Global vs Commissions vs Partenaires) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Chiffre d'affaires global"
          value={formatFCFA(stats.totalRevenue)}
          icon={DollarSign}
          trend={`+${stats.evolution}%`}
          accent="primary"
        />
        <KpiCard
          label="Commissions Plateforme"
          value={formatFCFA(stats.platformRevenue)}
          icon={Percent}
          accent="chart3"
        />
        <KpiCard
          label="Volume Partenaires"
          value={formatFCFA(stats.partnersRevenue)}
          icon={Store}
          accent="accent"
        />
        <KpiCard
          label="Solde à reverser (Livrées)"
          value={formatFCFA(stats.soldeRestantAReverser)}
          icon={Wallet}
          accent="chart4"
        />
      </div>

      {/* Bloc 2: Métriques secondaires de reversement & d'audience */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 flex items-center gap-3.5 border border-border">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Déjà Reversé</span>
            <p className="text-base font-extrabold text-foreground mt-0.5">{formatFCFA(stats.totalReverse)}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border border-border">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">En attente de livraison</span>
            <p className="text-base font-extrabold text-foreground mt-0.5">{formatFCFA(stats.montantEnAttente)}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border border-border">
          <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Clients actifs</span>
            <p className="text-base font-extrabold text-foreground mt-0.5">{stats.clients}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border border-border">
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ventes ce mois</span>
            <p className="text-base font-extrabold text-foreground mt-0.5">{stats.transactions}</p>
          </div>
        </Card>
      </div>

      {/* Bloc 3: Graphiques de volume */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Volume des ventes mensuel</h2>
            <span className="text-xs font-semibold text-muted-foreground">Année {new Date().getFullYear()}</span>
          </div>
          <SimpleBarChart data={monthlyData} />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Volume par opérateur</h2>
          <div className="mt-5 space-y-3">
            {operatorData.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className="text-muted-foreground font-mono font-bold">{item.percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
            {OPERATORS.map((operator) => (
              <span key={operator.key} className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${operator.badge}`}>
                {operator.label}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Bloc 4: Flux de transactions récents */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Flux de transactions en direct</h2>
          <span className="text-xs text-muted-foreground">Dernières commandes confirmées</span>
        </div>
        <div className="space-y-2">
          {recent.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              Aucun flux récent.
            </div>
          ) : (
            recent.map((transaction) => {
              const operator = normalizeOperator(transaction.operateur || transaction.modePaiement)
              return (
                <div key={transaction.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm hover:border-primary/40 transition-colors">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">{transaction.reference || `TXN-${transaction.id}`}</span>
                  <div className="min-w-0 flex-1 truncate">
                    <p className="font-bold text-foreground truncate">{transaction?.abonnement?.nom || transaction?.offrePartenaire?.nomService || 'Abonnement'}</p>
                    <p className="text-xs text-muted-foreground">{transaction?.client?.nom || transaction?.emailClient || 'Client'}</p>
                  </div>
                  <OperatorBadge operator={operator} />
                  <span className="font-extrabold text-foreground font-mono">{formatFCFA(transaction.montantTotal || transaction.montant || 0)}</span>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}

function SimpleBarChart({ data }) {
  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="mt-6 flex h-56 items-end gap-3 sm:gap-6 px-2 sm:px-6">
      {data.map((item) => {
        const height = Math.max(4, (item.value / max) * 170)
        return (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end justify-center">
              <div className="w-full max-w-10 rounded-t-lg bg-primary/80 hover:bg-primary transition-all cursor-pointer" style={{ height }} title={`${item.label}: ${formatFCFA(item.value)}`} />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function OperatorBadge({ operator }) {
  const config = OPERATORS.find((item) => item.key === operator) || OPERATORS[0]
  return <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${config.badge}`}>{config.label}</span>
}

function buildMonthlyData(transactions) {
  const currentYear = new Date().getFullYear()
  return MONTHS.map((month, index) => {
    const value = transactions
      .filter((transaction) => {
        const date = transaction.dateCreation ? new Date(transaction.dateCreation) : null
        return date && date.getFullYear() === currentYear && date.getMonth() === index
      })
      .reduce((total, transaction) => total + Number(transaction.montantTotal ?? transaction.montant ?? 0), 0)
    return { label: month, value }
  })
}

function buildOperatorData(transactions) {
  const totals = OPERATORS.map((operator) => ({
    ...operator,
    value: transactions
      .filter((transaction) => normalizeOperator(transaction.operateur || transaction.modePaiement) === operator.key)
      .reduce((total, transaction) => total + Number(transaction.montantTotal ?? transaction.montant ?? 0), 0)
  }))
  const total = totals.reduce((acc, item) => acc + item.value, 0)

  if (total === 0) {
    return [
      { ...OPERATORS[0], percent: 40 },
      { ...OPERATORS[1], percent: 30 },
      { ...OPERATORS[2], percent: 20 },
      { ...OPERATORS[3], percent: 10 }
    ]
  }

  return totals.map((item) => ({
    ...item,
    percent: Math.round((item.value / total) * 100)
  }))
}

function normalizeOperator(value = '') {
  const upper = String(value).toUpperCase()
  if (upper.includes('ORANGE')) return 'ORANGE'
  if (upper.includes('MTN')) return 'MTN'
  if (upper.includes('MOOV')) return 'MOOV'
  if (upper.includes('WAVE')) return 'WAVE'
  return 'WAVE'
}
