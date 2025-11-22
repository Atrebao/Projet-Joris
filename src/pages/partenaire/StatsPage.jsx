import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Package, ShoppingCart, Calendar, BarChart3 } from 'lucide-react'

export default function StatsPage() {
  const [periode, setPeriode] = useState('mois')
  const [stats, setStats] = useState({
    ventesMois: 287,
    revenuMois: 2450000,
    offresMois: 15,
    clientsMois: 142,
    tendance: '+23%',
    meilleurOffre: 'Netflix Premium',
    categorieTop: 'Films & Séries'
  })

  const ventesParJour = [
    { jour: 'Lun', ventes: 42 },
    { jour: 'Mar', ventes: 38 },
    { jour: 'Mer', ventes: 51 },
    { jour: 'Jeu', ventes: 45 },
    { jour: 'Ven', ventes: 62 },
    { jour: 'Sam', ventes: 28 },
    { jour: 'Dim', ventes: 21 }
  ]

  const offreTop = [
    { nom: 'Netflix Premium', ventes: 45, revenu: 315000 },
    { nom: 'Spotify Family', ventes: 38, revenu: 190000 },
    { nom: 'PlayStation Plus', ventes: 28, revenu: 224000 },
    { nom: 'Apple Music', ventes: 24, revenu: 120000 },
    { nom: 'Disney+', ventes: 18, revenu: 126000 }
  ]

  const maxVentes = Math.max(...ventesParJour.map(v => v.ventes))

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              Statistiques & Performance
            </h1>
            <p className="text-gray-600">Analysez vos performances</p>
          </div>
          
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 font-semibold"
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

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <Package className="h-10 w-10 text-purple-100" />
              <Calendar className="h-6 w-6 text-purple-100" />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.offresMois}</div>
            <div className="text-purple-100 text-sm">Offres actives</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-10 w-10 text-orange-100" />
              <span className="text-orange-100 text-sm font-semibold">+15%</span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.clientsMois}</div>
            <div className="text-orange-100 text-sm">Clients actifs</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Graphique Ventes par jour */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              Ventes par jour (7 derniers jours)
            </h2>
            <div className="space-y-3">
              {ventesParJour.map((jour, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-semibold text-gray-600">{jour.jour}</div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-full h-8 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full flex items-center justify-end pr-3 text-white text-sm font-semibold transition-all"
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
              {offreTop.map((offre, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-all">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
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
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-2">🏆 Meilleure Offre</h3>
            <p className="text-2xl font-bold mb-1">{stats.meilleurOffre}</p>
            <p className="text-indigo-100 text-sm">45 ventes ce mois</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-2">📊 Catégorie Leader</h3>
            <p className="text-2xl font-bold mb-1">{stats.categorieTop}</p>
            <p className="text-pink-100 text-sm">127 ventes ce mois</p>
          </div>
        </div>
      </div>
    </div>
  )
}
