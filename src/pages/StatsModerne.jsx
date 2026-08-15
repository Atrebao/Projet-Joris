import { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Store,
  Wallet,
  Zap,
} from 'lucide-react'
import { statsAPI, souscriptionsAPI } from '../lib/api'
import toast from 'react-hot-toast'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  KpiCard,
  LoadingState,
  PageHeader,
  formatFCFA,
} from '../components/saas/SaasPrimitives'

const OPERATOR_BADGES = [
  { key: 'WAVE', label: 'Wave Money', color: '#1dc8ff' },
  { key: 'ORANGE', label: 'Orange Money', color: '#ff7900' },
  { key: 'MTN', label: 'MTN MoMo', color: '#ffcc00' },
  { key: 'MOOV', label: 'Moov Money', color: '#0066b3' },
]

export default function StatsModerne() {
  const [periode, setPeriode] = useState('annee')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    revenuTotal: 0,
    platformRevenue: 0,
    partnersRevenue: 0,
    revenueEvolution: 0,
    totalPartenaires: 0,
    totalOffres: 0,
    totalClients: 0,
    totalSouscriptions: 0,
  })
  const [revenusParMois, setRevenusParMois] = useState([])
  const [topOffres, setTopOffres] = useState([])
  const [transactionsRecentes, setTransactionsRecentes] = useState([])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [dashRes, grapheRes, topOffresRes, souscriptionsRes] = await Promise.allSettled([
        statsAPI.adminDashboard(),
        statsAPI.grapheCA({ periode }),
        statsAPI.topOffres(5),
        souscriptionsAPI.getAll({ limit: 8, statutPaiement: 'SUCCES' }),
      ])

      if (dashRes.status === 'fulfilled') {
        const d = dashRes.value.data || {}
        setStats({
          revenuTotal: d.revenusTotal || 0,
          platformRevenue: d.revenusPlateforme || 0,
          partnersRevenue: d.revenusPartenaires || 0,
          revenueEvolution: d.evolutionRevenus || 0,
          totalPartenaires: d.totalPartenaires || 0,
          totalOffres: d.totalOffres || 0,
          totalClients: d.totalClients || 0,
          totalSouscriptions: d.souscriptionsMois || 0,
        })
      }

      if (grapheRes.status === 'fulfilled') {
        const g = grapheRes.value.data || {}
        const labels = g.labels || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
        const dataArr = g.data || []
        setRevenusParMois(
          labels.map((mois, i) => ({
            mois: mois.substring(0, 3),
            revenu: Number(dataArr[i] || 0),
          }))
        )
      }

      if (topOffresRes.status === 'fulfilled') {
        const rawTop = topOffresRes.value.data || []
        const totalV = rawTop.reduce((acc, o) => acc + Number(o.ventes || 0), 0) || 1
        setTopOffres(
          rawTop.map((o) => ({
            nom: o.nom || 'Offre',
            ventes: Number(o.ventes || 0),
            pourcentage: Math.round((Number(o.ventes || 0) / totalV) * 100),
          }))
        )
      }

      if (souscriptionsRes.status === 'fulfilled') {
        const rawSub = souscriptionsRes.value.data
        const list = Array.isArray(rawSub) ? rawSub : rawSub?.data || []
        setTransactionsRecentes(list)
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error)
      toast.error('Impossible de charger les statistiques')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [periode])

  const maxMonthly = Math.max(1, ...revenusParMois.map((r) => r.revenu))

  if (loading) {
    return <LoadingState label="Génération des statistiques et analyses financières..." />
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Analyses & Performance Globale"
          description="Indicateurs financiers avancés, croissance des ventes et classement des services."
        />

        <select
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          className="h-10 rounded-xl border border-input bg-card px-4 text-xs font-bold outline-none shadow-2xs self-start sm:self-center"
        >
          <option value="mois">Ce mois</option>
          <option value="trimestre">Ce trimestre</option>
          <option value="annee">Cette année</option>
        </select>
      </div>

      {/* Cartes KPI Financières & Métriques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Chiffre d'Affaires Global"
          value={formatFCFA(stats.revenuTotal)}
          subtext={`+${stats.revenueEvolution}% ce mois`}
          icon={DollarSign}
        />
        <KpiCard
          title="Commissions Plateforme"
          value={formatFCFA(stats.platformRevenue)}
          subtext="Revenus nets encaissés"
          icon={TrendingUp}
        />
        <KpiCard
          title="Boutiques Partenaires"
          value={stats.totalPartenaires}
          subtext="Marchands connectés"
          icon={Store}
        />
        <KpiCard
          title="Clients & Abonnés"
          value={stats.totalClients}
          subtext="Utilisateurs enregistrés"
          icon={Users}
        />
      </div>

      {/* Graphiques Principaux */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Évolution Mensuelle (8 colonnes) */}
        <Card className="lg:col-span-8 p-6 border border-border shadow-2xs">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                Volume d&apos;Encaissements ({new Date().getFullYear()})
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Chiffre d&apos;affaires mensuel brut en FCFA
              </p>
            </div>
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              Période {periode}
            </span>
          </div>

          <div className="mt-4 flex h-64 items-end gap-2 sm:gap-4 px-2">
            {revenusParMois.map((item) => {
              const height = Math.max(8, (item.revenu / maxMonthly) * 200)
              return (
                <div key={item.mois} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-52 w-full items-end justify-center">
                    <div
                      className="w-full max-w-10 rounded-t-xl bg-gradient-to-t from-indigo-600 to-indigo-400 hover:from-indigo-700 hover:to-indigo-500 transition-all cursor-pointer shadow-xs"
                      style={{ height }}
                      title={`${item.mois}: ${formatFCFA(item.revenu)}`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground">{item.mois}</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Top Services Vendus (4 colonnes) */}
        <Card className="lg:col-span-4 p-6 border border-border shadow-2xs flex flex-col justify-between">
          <div>
            <div className="border-b border-border pb-4 mb-4">
              <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
                Top Services Prisés
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Abonnements les plus achetés
              </p>
            </div>

            <div className="space-y-4">
              {topOffres.length === 0 ? (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  Aucune vente enregistrée.
                </p>
              ) : (
                topOffres.map((o) => (
                  <div key={o.nom} className="p-3 rounded-2xl bg-muted/30 border border-border/60">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-foreground">{o.nom}</span>
                      <span className="font-mono font-black text-indigo-600">
                        {o.ventes} vente{o.ventes > 1 ? 's' : ''} ({o.pourcentage}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${o.pourcentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs">
            <span className="font-extrabold text-indigo-950 block mb-1">
              💡 Recommandation Stratégique
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Les abonnements streaming vidéo et musique représentent le principal moteur de croissance. Encouragez les partenaires à maintenir des stocks suffisants.
            </p>
          </div>
        </Card>
      </div>

      {/* Tableau des Dernières Transactions */}
      <Card className="p-6 border border-border shadow-2xs">
        <div className="border-b border-border pb-4 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider">
              Derniers Flux de Souscriptions Validées
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historique récent des encaissements sur la plateforme
            </p>
          </div>
        </div>

        {transactionsRecentes.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Aucun flux de transaction récent.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <tr>
                  <th className="px-4 py-3">Réf</th>
                  <th className="px-4 py-3">Offre</th>
                  <th className="px-4 py-3">Partenaire</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Montant</th>
                  <th className="px-4 py-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {transactionsRecentes.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-foreground">
                      {t.reference || `#${t.id}`}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-foreground">
                      {t.offrePartenaire?.titreOffre || t.abonnement?.nom || 'Abonnement'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.offrePartenaire?.partenaire?.nomBoutique || t.abonnement?.partenaire?.nom || 'DigiStore'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.client?.nom || t.emailClient || 'Client'}
                    </td>
                    <td className="px-4 py-3 font-black text-foreground font-mono">
                      {formatFCFA(t.montantTotal || t.montant || 0)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        SUCCÈS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
