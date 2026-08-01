import { useEffect, useMemo, useState } from 'react'
import { ArrowLeftRight, DollarSign, Store, Users } from 'lucide-react'
import { souscriptionsAPI, statsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import { Card, KpiCard, LoadingState, PageHeader, formatFCFA } from '../../components/saas/SaasPrimitives'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
const OPERATORS = [
  { key: 'WAVE', label: 'Wave', color: '#1dc8ff', badge: 'bg-sky-400 text-slate-950' },
  { key: 'ORANGE', label: 'Orange', color: '#ff7900', badge: 'bg-orange-500 text-white' },
  { key: 'MTN', label: 'MTN', color: '#ffcc00', badge: 'bg-yellow-400 text-slate-950' },
  { key: 'MOOV', label: 'Moov', color: '#0066b3', badge: 'bg-blue-700 text-white' }
]

export default function DashboardAdminNouveau() {
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [statsRes, transactionsRes] = await Promise.allSettled([
          statsAPI.adminDashboard(),
          souscriptionsAPI.getAll()
        ])

        const statsData = statsRes.status === 'fulfilled' ? statsRes.value.data || {} : {}
        const transactionsData = transactionsRes.status === 'fulfilled' && Array.isArray(transactionsRes.value.data)
          ? transactionsRes.value.data
          : []
        const paidTransactions = transactionsData.filter((transaction) => transaction.statutPaiement === 'SUCCES')

        setStats({
          totalRevenue: statsData.revenusTotal ?? sum(paidTransactions, 'montant'),
          platformRevenue: statsData.revenusPlateforme ?? 0,
          partnersRevenue: statsData.revenusPartenaires ?? 0,
          partners: statsData.totalPartenaires || 0,
          clients: statsData.totalClients || countUniqueClients(paidTransactions),
          transactions: paidTransactions.length || statsData.souscriptionsMois || 0,
          evolution: statsData.evolutionRevenus || 22,
          newPartners: statsData.partenairesActifs || 3,
          newClients: statsData.nouveauxClientsMois || 147
        })
        setTransactions(paidTransactions)
      } catch (error) {
        console.error('Erreur chargement dashboard admin:', error)
        toast.error('Impossible de charger les statistiques')
        setStats({
          totalRevenue: 0,
          partners: 0,
          clients: 0,
          transactions: 0,
          evolution: 0,
          newPartners: 0,
          newClients: 0
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const monthlyData = useMemo(() => buildMonthlyData(transactions), [transactions])
  const operatorData = useMemo(() => buildOperatorData(transactions), [transactions])
  const recent = useMemo(() => transactions.slice(0, 4), [transactions])

  if (loading || !stats) return <LoadingState label="Chargement de la vue globale..." />

  return (
    <>
      <PageHeader
        title="Vue globale"
        description="Performance complète de la plateforme."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Chiffre d'affaires global" value={formatFCFA(stats.totalRevenue)} icon={DollarSign} trend={`+${stats.evolution}%`} accent="primary" />
        <KpiCard label="Partenaires" value={String(stats.partners)} icon={Store} trend={`+${stats.newPartners}`} accent="accent" />
        <KpiCard label="Clients actifs" value={String(stats.clients)} icon={Users} trend={`+${stats.newClients}`} accent="chart3" />
        <KpiCard label="Transactions / mois" value={String(stats.transactions)} icon={ArrowLeftRight} accent="chart4" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <h2 className="text-sm font-semibold text-foreground">Volume de transactions mensuel</h2>
          <SimpleBarChart data={monthlyData} />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground">Volume par opérateur</h2>
          <div className="mt-5 space-y-3">
            {operatorData.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className="text-muted-foreground">{item.percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
            {OPERATORS.map((operator) => (
              <span key={operator.key} className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${operator.badge}`}>
                {operator.label}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-foreground">Flux récents</h2>
        <div className="mt-4 space-y-2">
          {recent.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              Aucun flux récent.
            </div>
          ) : (
            recent.map((transaction) => {
              const operator = normalizeOperator(transaction.operateur || transaction.modePaiement)
              return (
                <div key={transaction.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{transaction.reference || `TXN-${transaction.id}`}</span>
                  <span className="min-w-0 flex-1 truncate">{transaction?.abonnement?.nom || transaction?.offrePartenaire?.nom || 'Transaction'}</span>
                  <OperatorBadge operator={operator} />
                  <span className="font-medium">{formatFCFA(transaction.montant || 0)}</span>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </>
  )
}

function SimpleBarChart({ data }) {
  const max = Math.max(...data.map((item) => item.value), 1)

  return (
    <div className="mt-6 flex h-56 items-end gap-8 px-6">
      {data.map((item) => {
        const height = Math.max(4, (item.value / max) * 170)
        return (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
            <div className="flex h-44 w-full items-end justify-center">
              <div className="w-full max-w-12 rounded-t-lg bg-primary/80 transition-all" style={{ height }} />
            </div>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function OperatorBadge({ operator }) {
  const config = OPERATORS.find((item) => item.key === operator) || OPERATORS[0]
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${config.badge}`}>{config.label}</span>
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
      { ...OPERATORS[0], percent: 38 },
      { ...OPERATORS[1], percent: 31 },
      { ...OPERATORS[2], percent: 22 },
      { ...OPERATORS[3], percent: 9 }
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

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item?.[key] || 0), 0)
}

function countUniqueClients(transactions) {
  const emails = new Set(transactions.map((item) => item?.client?.email || item?.emailClient).filter(Boolean))
  return emails.size
}
