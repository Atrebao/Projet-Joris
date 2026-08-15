import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Calendar,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
  Percent,
  DollarSign,
  Zap,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getPartenaireId } from '../../Utils/Utils'
import { statsAPI, reversementsAPI } from '../../lib/api'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  KpiCard,
  LoadingState,
  PageHeader,
  Select,
  ServiceLogo,
  formatFCFA,
} from '../../components/saas/SaasPrimitives'

export default function StatsPage() {
  const navigate = useNavigate()
  const partenaireId = getPartenaireId()
  const [periode, setPeriode] = useState('mois')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    ventesMois: 0,
    revenuMois: 0,
    revenuBrut: 0,
    commissionsPayees: 0,
    offresMois: 0,
    clientsMois: 0,
    tendance: '+0%',
    meilleurOffre: '-',
    categorieTop: '-',
  })
  const [ventesParJour, setVentesParJour] = useState([])
  const [offreTop, setOffreTop] = useState([])
  const [balance, setBalance] = useState(null)

  useEffect(() => {
    if (!partenaireId) {
      navigate('/backoffice/login')
      return
    }

    const loadStats = async () => {
      setLoading(true)
      try {
        const [statsRes, balanceRes] = await Promise.allSettled([
          statsAPI.partenaireDetailedStats(partenaireId),
          reversementsAPI.getBalance(partenaireId),
        ])

        if (statsRes.status === 'fulfilled') {
          const s = statsRes.value?.data || {}
          setStats({
            ventesMois: s.ventesMois ?? s.totalVentes ?? 0,
            revenuMois: s.revenusMois ?? 0,
            revenuBrut: s.chiffreAffairesBrut ?? s.revenusMois ?? 0,
            commissionsPayees: s.commissionsPayees ?? 0,
            offresMois: s.offresActives ?? 0,
            clientsMois: s.clientsUniques ?? 0,
            tendance: s.tendance || '+0%',
            meilleurOffre: s.meilleurOffre || '-',
            categorieTop: s.categorieTop || '-',
          })
          setVentesParJour(s.ventesParJour || [])
          setOffreTop(s.offreTop || [])
        }

        if (balanceRes.status === 'fulfilled') {
          setBalance(balanceRes.value?.data || null)
        }
      } catch (error) {
        console.error(error)
        toast.error('Impossible de charger les statistiques')
        setVentesParJour([])
        setOffreTop([])
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [partenaireId, navigate, periode])

  const ventesParJourAffichage = ventesParJour.length > 0 ? ventesParJour : [
    { jour: 'Lun', ventes: 0 },
    { jour: 'Mar', ventes: 0 },
    { jour: 'Mer', ventes: 0 },
    { jour: 'Jeu', ventes: 0 },
    { jour: 'Ven', ventes: 0 },
    { jour: 'Sam', ventes: 0 },
    { jour: 'Dim', ventes: 0 },
  ]

  const maxVentes = Math.max(1, ...ventesParJourAffichage.map((v) => v.ventes))
  const totalTopRevenue = offreTop.reduce((sum, offre) => sum + Number(offre.revenu || 0), 0)

  if (loading) return <LoadingState label="Chargement des statistiques partenaires..." />

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Performances & Analyses des Ventes"
          description="Suivi de vos volumes de vente, revenus nets réels et performance de vos forfaits de streaming."
        />

        <select
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none shadow-2xs self-start sm:self-center"
        >
          <option value="semaine">Cette semaine</option>
          <option value="mois">Ce mois-ci</option>
          <option value="trimestre">Ce trimestre</option>
          <option value="annee">Cette année</option>
        </select>
      </div>

      {/* Cartes KPI Financières */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenu Net Partenaire */}
        <Card className="p-5 border border-slate-200 shadow-2xs bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Votre Gain Net
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {formatFCFA(stats.revenuMois)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Revenu après déduction commission
          </p>
        </Card>

        {/* Volume Brut */}
        <Card className="p-5 border border-slate-200 shadow-2xs bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Ventes Réalisées
            </span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
            {stats.ventesMois} commande{stats.ventesMois > 1 ? 's' : ''}
          </p>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-700 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{stats.tendance} vs période préc.</span>
          </div>
        </Card>

        {/* Offres Actives */}
        <Card className="p-5 border border-slate-200 shadow-2xs bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Offres en Ligne
            </span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
            {stats.offresMois} offre{stats.offresMois > 1 ? 's' : ''}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Visibles sur la marketplace
          </p>
        </Card>

        {/* Clients Uniques */}
        <Card className="p-5 border border-slate-200 shadow-2xs bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Clients Uniques
            </span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">
            {stats.clientsMois} client{stats.clientsMois > 1 ? 's' : ''}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Abonnés ayant souscrit
          </p>
        </Card>
      </div>

      {/* Graphique Ventes & Top Offres */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Évolution Journalière (7 colonnes) */}
        <Card className="lg:col-span-7 p-6 border border-slate-200 shadow-2xs bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Rythme des Ventes (7 Derniers Jours)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nombre de commandes quotidiennes enregistrées
              </p>
            </div>
            <BarChart3 className="h-4 w-4 text-slate-400" />
          </div>

          <div className="mt-4 flex h-56 items-end gap-3 sm:gap-6 px-2">
            {ventesParJourAffichage.map((item) => {
              const height = Math.max(8, (item.ventes / maxVentes) * 170)
              return (
                <div key={item.date || item.jour} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-44 w-full items-end justify-center">
                    <div
                      className="w-full max-w-8 rounded-t-lg bg-slate-900 hover:bg-slate-800 transition-colors cursor-pointer"
                      style={{ height }}
                      title={`${item.jour}: ${item.ventes} vente(s)`}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600">{item.jour}</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Top Offres Performantes (5 colonnes) */}
        <Card className="lg:col-span-5 p-6 border border-slate-200 shadow-2xs bg-white flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Vos Offres les Plus Prisées
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Classement par chiffre d&apos;affaires généré
              </p>
            </div>

            <div className="space-y-3.5">
              {offreTop.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Aucune vente enregistrée sur cette période.
                </div>
              ) : (
                offreTop.slice(0, 4).map((offre, index) => {
                  const percent = totalTopRevenue > 0 ? Math.round((Number(offre.revenu || 0) / totalTopRevenue) * 100) : 0
                  return (
                    <div key={offre.nom} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="h-5 w-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            #{index + 1}
                          </span>
                          <span className="font-bold text-slate-900 truncate">{offre.nom}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 shrink-0">
                          {formatFCFA(offre.revenu)}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-slate-900 transition-all duration-500"
                          style={{ width: `${Math.max(5, percent)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>{offre.ventes || 0} vente(s)</span>
                        <span>{percent}% du revenu</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="font-bold text-slate-800 block mb-0.5">
              💡 Conseil de Croissance
            </span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Consultez régulièrement vos stocks d&apos;identifiants pour éviter toute rupture sur vos offres les plus vendues.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
