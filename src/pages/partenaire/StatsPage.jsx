import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, DollarSign, Package, ShoppingCart, Calendar, BarChart3 } from 'lucide-react'
import { getPartenaireId } from '../../Utils/Utils'
import { statsAPI, offresAPI, souscriptionsAPI } from '../../lib/api'
import toast from 'react-hot-toast'

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
    categorieTop: '-'
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
          days.push({
            jour: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
            ventes: dayCount,
          })
        }
        setVentesParJour(days)

        const byOffre = new Map()
        subs.forEach((sub) => {
          const nom = sub?.abonnement?.nom || 'Offre'
          const current = byOffre.get(nom) || { nom, ventes: 0, revenu: 0 }
          current.ventes += 1
          current.revenu += Number(sub?.montantPartenaire || sub?.montant || 0)
          byOffre.set(nom, current)
        })
        const top = Array.from(byOffre.values())
          .sort((a, b) => b.ventes - a.ventes)
          .slice(0, 5)
        setOffreTop(top)

        setStats({
          ventesMois: subs.length,
          revenuMois: s.revenusMois ?? 0,
          offresMois: s.offresActives ?? 0,
          clientsMois: s.clientsUniques ?? 0,
          tendance: `${(s.croissance ?? 0) >= 0 ? '+' : ''}${Number(s.croissance ?? 0).toFixed(1)}%`,
          meilleurOffre: offresRes?.data?.[0]?.nomService || '-',
          categorieTop: offresRes?.data?.[0]?.categorie || '-'
        })
      } catch (error) {
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
  const offreTopAffichage = offreTop.length > 0 ? offreTop : []
  const maxVentes = Math.max(1, ...ventesParJourAffichage.map(v => v.ventes))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-slate-600" />
              Statistiques & Performance
            </h1>
            <p className="text-gray-600">Analysez vos performances</p>
          </div>
          
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500 font-semibold"
          >
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>
        </div>

        {/* KPIs Principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="h-10 w-10 text-blue-100" />
              <span className="text-blue-100 text-sm font-semibold">{stats.tendance}</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.ventesMois}</div>
            <div className="text-blue-100 text-sm">Ventes ce mois</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-10 w-10 text-green-100" />
              <TrendingUp className="h-6 w-6 text-green-100" />
            </div>
            <div className="text-3xl font-bold mb-1">{(stats.revenuMois / 1000).toFixed(0)}K F</div>
            <div className="text-green-100 text-sm">Revenu ce mois</div>
          </div>

          <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <Package className="h-10 w-10 text-slate-100" />
              <Calendar className="h-6 w-6 text-slate-100" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.offresMois}</div>
            <div className="text-slate-100 text-sm">Offres actives</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-10 w-10 text-orange-100" />
              <span className="text-orange-100 text-sm font-semibold">{stats.tendance}</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.clientsMois}</div>
            <div className="text-orange-100 text-sm">Clients actifs</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique Ventes par jour */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-slate-600" />
              Ventes par jour (7 derniers jours)
            </h2>
            <div className="space-y-3">
              {ventesParJourAffichage.map((jour, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-semibold text-gray-600">{jour.jour}</div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-full h-8 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-slate-500 to-slate-500 h-full flex items-center justify-end pr-3 text-white text-sm font-semibold transition-all"
                        style={{ width: `${(jour.ventes / maxVentes) * 100}%` }}
                      >
                        {jour.ventes > 0 && jour.ventes}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Offres */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              Top 5 Offres
            </h2>
            <div className="space-y-4">
              {offreTopAffichage.map((offre, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-slate-50 transition-all">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{offre.nom}</div>
                    <div className="text-sm text-gray-500">{offre.ventes} ventes</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{(offre.revenu / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-gray-500">FCFA</div>
                  </div>
                </div>
              ))}
              {offreTopAffichage.length === 0 && (
                <div className="text-sm text-gray-500">Aucune vente disponible</div>
              )}
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-2">🏆 Meilleure Offre</h3>
            <p className="text-2xl font-bold mb-1">{stats.meilleurOffre}</p>
            <p className="text-slate-100 text-sm">Top ventes du partenaire</p>
          </div>

          <div className="bg-gradient-to-br from-slate-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-2">📊 Catégorie Leader</h3>
            <p className="text-2xl font-bold mb-1">{stats.categorieTop}</p>
            <p className="text-slate-100 text-sm">Categorie la plus representee</p>
          </div>
        </div>
      </div>
    </div>
  )
}

