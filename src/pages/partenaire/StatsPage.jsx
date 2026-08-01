import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Calendar, Package, ShoppingCart, TrendingUp, Users, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPartenaireId } from '../../Utils/Utils'
import { statsAPI, offresAPI, souscriptionsAPI } from '../../lib/api'
import { Badge, Card, DataTable, KpiCard, LoadingState, PageHeader, Select, formatFCFA } from '../../components/saas/SaasPrimitives'

export default function StatsPage() {
  const navigate = useNavigate()
  const partenaireId = getPartenaireId()
  const [periode, setPeriode] = useState('mois')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    ventesMois: 0,
    revenuMois: 0,
    offresMois: 0,
    clientsMois: 0,
    tendance: '+0%',
    meilleurOffre: '-',
    categorieTop: '-',
  })
  const [ventesParJour, setVentesParJour] = useState([])
  const [offreTop, setOffreTop] = useState([])

  useEffect(() => {
    if (!partenaireId) {
      navigate('/backoffice/login')
      return
    }
    const loadStats = async () => {
      setLoading(true)
      try {
        const [statsRes, offresRes, souscriptionsRes] = await Promise.all([
          statsAPI.partenaireDashboard(partenaireId),
          offresAPI.getByPartenaire(partenaireId),
          souscriptionsAPI.getByPartenaire(partenaireId),
        ])
        const s = statsRes?.data || {}
        const subs = (souscriptionsRes?.data || []).filter((x) => x?.statutPaiement === 'SUCCES')

        const now = new Date()
        const days = []
        for (let i = 6; i >= 0; i -= 1) {
          const d = new Date(now)
          d.setDate(now.getDate() - i)
          d.setHours(0, 0, 0, 0)
          const dayCount = subs.filter((sub) => {
            const c = new Date(sub.dateCreation)
            c.setHours(0, 0, 0, 0)
            return c.getTime() === d.getTime()
          }).length
          days.push({ jour: d.toLocaleDateString('fr-FR', { weekday: 'short' }), ventes: dayCount })
        }
        setVentesParJour(days)

        const byOffre = new Map()
        subs.forEach((sub) => {
          const nom = sub?.abonnement?.nom || 'Offre'
          const current = byOffre.get(nom) || { nom, ventes: 0, revenu: 0 }
          current.ventes += 1
          current.revenu += Number(sub?.montantPartenaire ?? sub?.montantTotal ?? sub?.montant ?? 0)
          byOffre.set(nom, current)
        })
        setOffreTop(Array.from(byOffre.values()).sort((a, b) => b.ventes - a.ventes).slice(0, 5))

        setStats({
          ventesMois: subs.length,
          revenuMois: s.revenusMois ?? 0,
          offresMois: s.offresActives ?? 0,
          clientsMois: s.clientsUniques ?? 0,
          tendance: `${(s.croissance ?? 0) >= 0 ? '+' : ''}${Number(s.croissance ?? 0).toFixed(1)}%`,
          meilleurOffre: offresRes?.data?.[0]?.nomService || offresRes?.data?.[0]?.nom || '-',
          categorieTop: offresRes?.data?.[0]?.categorie || '-',
        })
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
  const totalTopRevenue = useMemo(() => offreTop.reduce((sum, offre) => sum + Number(offre.revenu || 0), 0), [offreTop])

  if (loading) return <LoadingState label="Chargement des statistiques..." />

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiques"
        description="Analyse de vos ventes, revenus et offres les plus performantes."
        action={
          <Select value={periode} onChange={(e) => setPeriode(e.target.value)}>
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette annee</option>
          </Select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Ventes ce mois" value={String(stats.ventesMois)} icon={ShoppingCart} trend={stats.tendance} />
        <KpiCard label="Revenu ce mois" value={formatFCFA(stats.revenuMois)} icon={Wallet} accent="chart3" />
        <KpiCard label="Offres actives" value={String(stats.offresMois)} icon={Package} accent="accent" />
        <KpiCard label="Clients actifs" value={String(stats.clientsMois)} icon={Users} accent="chart4" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">Ventes par jour</h2>
              <p className="text-sm text-muted-foreground">Les 7 derniers jours.</p>
            </div>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            {ventesParJourAffichage.map((jour) => (
              <div key={jour.jour} className="grid grid-cols-[3rem_1fr_2rem] items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">{jour.jour}</span>
                <div className="h-8 overflow-hidden rounded-full bg-muted">
                  <div
                    className="flex h-full items-center justify-end rounded-full bg-primary pr-3 text-xs font-semibold text-primary-foreground"
                    style={{ width: `${Math.max(8, (jour.ventes / maxVentes) * 100)}%` }}
                  >
                    {jour.ventes > 0 ? jour.ventes : ''}
                  </div>
                </div>
                <span className="text-right text-sm font-semibold">{jour.ventes}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-foreground">Top offres</h2>
              <p className="text-sm text-muted-foreground">{formatFCFA(totalTopRevenue)} sur les meilleures offres.</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <DataTable
            data={offreTop}
            emptyLabel="Aucune vente disponible"
            columns={[
              { key: 'nom', label: 'Offre', render: (offre) => <span className="font-medium text-foreground">{offre.nom}</span> },
              { key: 'ventes', label: 'Ventes', render: (offre) => <Badge tone="muted">{offre.ventes}</Badge> },
              { key: 'revenu', label: 'Revenu', render: (offre) => <span className="font-semibold">{formatFCFA(offre.revenu)}</span> },
            ]}
          />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">Meilleure offre</p>
          <p className="mt-1 text-xl font-bold text-foreground">{stats.meilleurOffre}</p>
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Calendar className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">Categorie leader</p>
          <p className="mt-1 text-xl font-bold text-foreground">{stats.categorieTop}</p>
        </Card>
      </div>
    </div>
  )
}
