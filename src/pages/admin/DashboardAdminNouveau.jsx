import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeftRight,
  DollarSign,
  Store,
  Users,
  Percent,
  Wallet,
  CheckCircle2,
  Clock,
  Radio,
  TrendingUp,
  Package,
  ShoppingCart,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  Building2,
} from 'lucide-react'
import { souscriptionsAPI, statsAPI } from '../../lib/api'
import { onSocketEvent } from '../../lib/socket'
import toast from 'react-hot-toast'
import { Card, KpiCard, LoadingState, PageHeader, formatFCFA } from '../../components/saas/SaasPrimitives'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
const OPERATORS = [
  { key: 'WAVE', label: 'Wave Money', color: '#0ea5e9', badge: 'bg-sky-50 text-sky-700 border border-sky-200' },
  { key: 'ORANGE', label: 'Orange Money', color: '#ea580c', badge: 'bg-orange-50 text-orange-700 border border-orange-200' },
  { key: 'MTN', label: 'MTN MoMo', color: '#ca8a04', badge: 'bg-yellow-50 text-yellow-800 border border-yellow-200' },
  { key: 'MOOV', label: 'Moov Money', color: '#2563eb', badge: 'bg-blue-50 text-blue-700 border border-blue-200' },
]

export default function DashboardAdminNouveau() {
  const navigate = useNavigate()
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
      setRecent(rawTransactions.slice(0, 8))
    } catch (error) {
      console.error('Erreur chargement dashboard admin:', error)
      if (!isBackground) toast.error('Impossible de charger les statistiques')
    } finally {
      if (!isBackground) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()

    const unsubOrder = onSocketEvent('nouvelle_commande', (data) => {
      toast.success(`Nouvelle commande : ${formatFCFA(data?.montant || 0)} (${data?.nomOffre || 'Abonnement'})`, {
        duration: 4000,
      })
      loadData(true)
    })

    const unsubDelivery = onSocketEvent('commande_livree', (data) => {
      toast.success(`Commande #${data?.reference || ''} livrée`, {
        duration: 3500,
      })
      loadData(true)
    })

    const unsubPayout = onSocketEvent('nouveau_reversement', (data) => {
      toast.success(`Reversement de ${formatFCFA(data?.montant || 0)} validé.`, {
        duration: 3500,
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

  if (loading || !stats) return <LoadingState label="Chargement de la console d'administration..." />

  return (
    <div className="space-y-6">
      {/* Panneau Supérieur Sobre & Professionnel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-500">Monitoring Plateforme Actif</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Tableau de Bord Général
            </h1>
            <p className="text-xs text-slate-500">
              Supervision des encaissements Mobile Money, des commissions et des reversements aux boutiques partenaires.
            </p>
          </div>

          {/* Raccourcis Administratifs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/backoffice/reversements')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            >
              <Wallet className="h-3.5 w-3.5 text-slate-300" />
              Versements
            </button>
            <button
              onClick={() => navigate('/backoffice/partenaires')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Store className="h-3.5 w-3.5 text-slate-500" />
              Partenaires ({stats.partners})
            </button>
            <button
              onClick={() => navigate('/backoffice/whatsapp')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
              WhatsApp Bot
            </button>
          </div>
        </div>
      </div>

      {/* Bloc 1 : Indicateurs Financiers Clés */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Volume Brut */}
        <Card className="p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Volume Brut Encaissé
            </span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
            {formatFCFA(stats.totalRevenue)}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-700 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+{stats.evolution}% ce mois</span>
          </div>
        </Card>

        {/* Commissions Plateforme */}
        <Card className="p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              Commissions Plateforme
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-indigo-700 tracking-tight">
            {formatFCFA(stats.platformRevenue)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Revenu net de l&apos;application
          </p>
        </Card>

        {/* Volume Partenaires */}
        <Card className="p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Volume Partenaires
            </span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
            {formatFCFA(stats.partnersRevenue)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Chiffre d&apos;affaires boutiques
          </p>
        </Card>

        {/* Solde Prêt à Reverser */}
        <Card className="p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Solde Éligible (Livrées)
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-700 tracking-tight">
            {formatFCFA(stats.soldeRestantAReverser)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Prêt pour virement bancaire / mobile
          </p>
        </Card>
      </div>

      {/* Bloc 2 : Métriques Secondaires */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 flex items-center gap-3.5 border border-slate-200">
          <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Total Déjà Reversé
            </span>
            <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {formatFCFA(stats.totalReverse)}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border border-slate-200">
          <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              En Attente Livraison
            </span>
            <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {formatFCFA(stats.montantEnAttente)}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border border-slate-200">
          <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Users className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Clients Inscrits
            </span>
            <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {stats.clients} client(s)
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5 border border-slate-200">
          <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <ShoppingCart className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Commandes ce mois
            </span>
            <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
              {stats.transactions} commande(s)
            </p>
          </div>
        </Card>
      </div>

      {/* Bloc 3 : Graphique Financier & Répartition par Opérateur */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Graphique Mensuel */}
        <Card className="lg:col-span-8 p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Flux Financiers Mensuels
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chiffre d&apos;affaires encaissé sur l&apos;année {new Date().getFullYear()}
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              Année {new Date().getFullYear()}
            </span>
          </div>
          <SimpleBarChart data={monthlyData} />
        </Card>

        {/* Répartition Opérateurs */}
        <Card className="lg:col-span-4 p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Paiements par Opérateur
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Volumes traités par passerelle Mobile Money
              </p>
            </div>

            <div className="space-y-4">
              {operatorData.map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.label}</span>
                    <span className="font-mono font-bold text-slate-700">{item.percent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {OPERATORS.map((operator) => (
              <span key={operator.key} className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${operator.badge}`}>
                {operator.label}
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Bloc 4 : Flux des Dernières Commandes */}
      <Card className="p-6 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Dernières Commandes Validées
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Historique des règlements récents
            </p>
          </div>
          <button
            onClick={() => navigate('/backoffice/commandes')}
            className="text-xs text-slate-700 font-semibold hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            Voir tout <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recent.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-xs text-slate-500">
              Aucune transaction récente.
            </div>
          ) : (
            recent.map((transaction) => {
              const operator = normalizeOperator(transaction.operateur || transaction.modePaiement)
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3 text-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 font-mono font-semibold text-[11px] text-slate-600">
                      #{transaction.id}
                    </div>
                    <div className="min-w-0 truncate">
                      <p className="font-bold text-slate-900 truncate">
                        {transaction?.abonnement?.nom || transaction?.offrePartenaire?.nomService || 'Abonnement'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {transaction?.client?.nom || transaction?.emailClient || 'Client'} • {transaction.reference || 'REF'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <OperatorBadge operator={operator} />
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      {formatFCFA(transaction.montantTotal || transaction.montant || 0)}
                    </span>
                  </div>
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
    <div className="mt-4 flex h-56 items-end gap-2 sm:gap-4 px-2">
      {data.map((item) => {
        const height = Math.max(6, (item.value / max) * 170)
        return (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end justify-center">
              <div
                className="w-full max-w-8 rounded-t-lg bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
                style={{ height }}
                title={`${item.label}: ${formatFCFA(item.value)}`}
              />
            </div>
            <span className="text-[11px] font-medium text-slate-500">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function OperatorBadge({ operator }) {
  const config = OPERATORS.find((item) => item.key === operator) || OPERATORS[0]
  return (
    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${config.badge}`}>
      {config.label}
    </span>
  )
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
      { ...OPERATORS[3], percent: 10 },
    ]
  }

  return totals.map((item) => ({
    ...item,
    percent: Math.round((item.value / total) * 100),
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
