import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Package,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Users,
  Star,
  ShoppingBag,
  BarChart3,
  AlertCircle
} from 'lucide-react'

export default function DashboardPartenaireNouveau() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [mesOffres, setMesOffres] = useState([])
  const [loading, setLoading] = useState(true)

  // Charger les données (simulation)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      // Simulation données
      await new Promise(resolve => setTimeout(resolve, 500))

      setStats({
        totalOffres: 15,
        offresActives: 12,
        totalVentes: 287,
        revenuTotal: 2450000,
        ventesAujourdhui: 12,
        revenuMois: 1850000,
        croissance: 18.5,
        notePartenaire: 4.8
      })

      setMesOffres([
        {
          id: 1,
          nom: 'Netflix Premium',
          categorie: 'FILMS_SERIES',
          prix: 7000,
          duree: 1,
          stock: 15,
          ventes: 45,
          revenu: 315000,
          actif: true,
          note: 4.8
        },
        {
          id: 2,
          nom: 'Netflix Standard',
          categorie: 'FILMS_SERIES',
          prix: 5000,
          duree: 1,
          stock: 20,
          ventes: 32,
          revenu: 160000,
          actif: true,
          note: 4.7
        },
        {
          id: 3,
          nom: 'Disney+ Family',
          categorie: 'FILMS_SERIES',
          prix: 6500,
          duree: 1,
          stock: 10,
          ventes: 28,
          revenu: 182000,
          actif: true,
          note: 4.9
        },
        {
          id: 4,
          nom: 'Prime Video',
          categorie: 'FILMS_SERIES',
          prix: 4500,
          duree: 1,
          stock: 0,
          ventes: 18,
          revenu: 81000,
          actif: false,
          note: 4.5
        },
      ])

      setLoading(false)
    }

    loadData()
  }, [])

  const handleNouvelleOffre = () => {
    navigate('/partenaire/offres/nouvelle')
  }

  const handleEditerOffre = (offreId) => {
    navigate(`/partenaire/offres/editer/${offreId}`)
  }

  const handleSupprimerOffre = async (offreId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      // TODO: Appel API pour supprimer
      alert(`Supprimer offre ${offreId}`)
    }
  }

  const handleToggleActif = async (offreId, actif) => {
    // TODO: Appel API pour activer/désactiver
    alert(`${actif ? 'Désactiver' : 'Activer'} offre ${offreId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Partenaire</h1>
              <p className="text-purple-100">Gérez vos offres et suivez vos performances</p>
            </div>
            <button
              onClick={handleNouvelleOffre}
              className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-lg flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Nouvelle offre
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Offres */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-600 rounded-full">
                {stats.offresActives} actives
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalOffres}</div>
            <div className="text-sm text-gray-600">Mes offres</div>
          </div>

          {/* Total Ventes */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                +{stats.ventesAujourdhui}
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalVentes}</div>
            <div className="text-sm text-gray-600">Ventes totales</div>
            <div className="text-xs text-gray-500 mt-2">
              Aujourd'hui: {stats.ventesAujourdhui}
            </div>
          </div>

          {/* Revenu Total */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold mb-1">{(stats.revenuTotal / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-gray-600">Revenu total (FCFA)</div>
            <div className="text-xs text-gray-500 mt-2">
              Ce mois: {(stats.revenuMois / 1000).toFixed(0)}K
            </div>
          </div>

          {/* Note */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full">
                +{stats.croissance}%
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.notePartenaire}</div>
            <div className="text-sm text-gray-600">Note moyenne</div>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.floor(stats.notePartenaire)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mes Offres */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Mes offres</h2>
              <p className="text-sm text-gray-600">{mesOffres.length} offres au total</p>
            </div>
            <button
              onClick={handleNouvelleOffre}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </button>
          </div>

          {mesOffres.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="mb-4">Vous n'avez pas encore d'offres</p>
              <button
                onClick={handleNouvelleOffre}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
              >
                Créer ma première offre
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Offre</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Prix</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ventes</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Revenu</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Note</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mesOffres.map((offre) => (
                    <tr key={offre.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-semibold">{offre.nom}</div>
                          <div className="text-xs text-gray-500">{offre.duree} mois</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-indigo-600">{offre.prix.toLocaleString()} F</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className={offre.stock === 0 ? 'text-red-500 font-semibold' : ''}>
                            {offre.stock}
                          </span>
                          {offre.stock === 0 && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold">{offre.ventes}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-green-600">{(offre.revenu / 1000).toFixed(0)}K</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{offre.note}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleActif(offre.id, offre.actif)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            offre.actif
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {offre.actif ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/offre/${offre.id}`)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-all"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleEditerOffre(offre.id)}
                            className="p-2 hover:bg-purple-50 rounded-lg transition-all"
                            title="Éditer"
                          >
                            <Edit className="h-4 w-4 text-purple-600" />
                          </button>
                          <button
                            onClick={() => handleSupprimerOffre(offre.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/partenaire/offres/nouvelle')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all text-left"
          >
            <Plus className="h-8 w-8 text-purple-600 mb-3" />
            <div className="font-bold mb-1">Créer une offre</div>
            <div className="text-sm text-gray-600">Ajouter une nouvelle offre</div>
          </button>

          <button
            onClick={() => navigate('/partenaire/clients')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left"
          >
            <Users className="h-8 w-8 text-blue-600 mb-3" />
            <div className="font-bold mb-1">Mes clients</div>
            <div className="text-sm text-gray-600">Voir mes clients</div>
          </button>

          <button
            onClick={() => navigate('/partenaire/stats')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all text-left"
          >
            <BarChart3 className="h-8 w-8 text-green-600 mb-3" />
            <div className="font-bold mb-1">Statistiques</div>
            <div className="text-sm text-gray-600">Rapports détaillés</div>
          </button>
        </div>
      </div>
    </div>
  )
}
