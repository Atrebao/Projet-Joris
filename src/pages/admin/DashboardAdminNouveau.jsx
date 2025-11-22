import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Package,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Star,
  BarChart3,
  ShoppingBag,
  UserCheck
} from 'lucide-react'

export default function DashboardAdminNouveau() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [partenairesEnAttente, setPartenairesEnAttente] = useState([])
  const [offreRecentes, setOffreRecentes] = useState([])
  const [loading, setLoading] = useState(true)

  // Charger les données (simulation)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      // Simulation données
      await new Promise(resolve => setTimeout(resolve, 500))

      setStats({
        totalPartenaires: 45,
        totalOffres: 287,
        totalRevenu: 12450000,
        totalClients: 1842,
        partenairesActifs: 38,
        offresActives: 245,
        ventesAujourdhui: 34,
        croissance: 12.5
      })

      setPartenairesEnAttente([
        {
          id: 1,
          nom: 'Digital Services Pro',
          email: 'contact@digitalpro.ci',
          ville: 'Abidjan',
          dateInscription: '2025-11-15',
          offresProposees: 15,
          status: 'EN_ATTENTE'
        },
        {
          id: 2,
          nom: 'Stream Masters',
          email: 'info@streammasters.ci',
          ville: 'Cocody',
          dateInscription: '2025-11-16',
          offresProposees: 8,
          status: 'EN_ATTENTE'
        },
        {
          id: 3,
          nom: 'Media Plus CI',
          email: 'media@mediaplus.ci',
          ville: 'Yopougon',
          dateInscription: '2025-11-17',
          offresProposees: 12,
          status: 'EN_ATTENTE'
        },
      ])

      setOffreRecentes([
        { id: 1, nom: 'Netflix Premium', partenaire: 'StreamPro', ventes: 45, revenu: 315000 },
        { id: 2, nom: 'Spotify Family', partenaire: 'MusicHub', ventes: 38, revenu: 190000 },
        { id: 3, nom: 'Disney+ Premium', partenaire: 'StreamPro', ventes: 32, revenu: 208000 },
        { id: 4, nom: 'PS Plus', partenaire: 'GameStore', ventes: 28, revenu: 224000 },
      ])

      setLoading(false)
    }

    loadData()
  }, [])

  const handleValiderPartenaire = async (partenaireId) => {
    // TODO: Appel API pour valider
    alert(`Valider partenaire ${partenaireId}`)
  }

  const handleRejeterPartenaire = async (partenaireId) => {
    // TODO: Appel API pour rejeter
    alert(`Rejeter partenaire ${partenaireId}`)
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Super Admin</h1>
              <p className="text-indigo-100">Vue d'ensemble de la plateforme</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-indigo-100">Aujourd'hui</div>
              <div className="text-2xl font-bold">{new Date().toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Partenaires */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                +{stats.croissance}%
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalPartenaires}</div>
            <div className="text-sm text-gray-600">Partenaires inscrits</div>
            <div className="text-xs text-gray-500 mt-2">
              {stats.partenairesActifs} actifs
            </div>
          </div>

          {/* Total Offres */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                {stats.offresActives} actives
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalOffres}</div>
            <div className="text-sm text-gray-600">Offres disponibles</div>
          </div>

          {/* Revenu Total */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold mb-1">{(stats.totalRevenu / 1000000).toFixed(1)}M</div>
            <div className="text-sm text-gray-600">Revenu total (FCFA)</div>
            <div className="text-xs text-gray-500 mt-2">
              Ce mois
            </div>
          </div>

          {/* Clients */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-orange-100 text-orange-600 rounded-full">
                +{stats.ventesAujourdhui}
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalClients.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Clients actifs</div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Partenaires en attente */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Partenaires en attente</h2>
                  <p className="text-sm text-gray-600">{partenairesEnAttente.length} demandes à traiter</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>

              {partenairesEnAttente.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Aucun partenaire en attente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {partenairesEnAttente.map((partenaire) => (
                    <div
                      key={partenaire.id}
                      className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{partenaire.nom}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span>📧 {partenaire.email}</span>
                            <span>•</span>
                            <span>📍 {partenaire.ville}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                          En attente
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm mb-4">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Package className="h-4 w-4" />
                          <span>{partenaire.offresProposees} offres</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Inscrit le {new Date(partenaire.dateInscription).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleValiderPartenaire(partenaire.id)}
                          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Valider
                        </button>
                        <button
                          onClick={() => handleRejeterPartenaire(partenaire.id)}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Rejeter
                        </button>
                        <button
                          className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:border-indigo-500 transition-all flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite - Meilleures offres */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Top Offres</h2>
                  <p className="text-sm text-gray-600">Ce mois</p>
                </div>
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>

              <div className="space-y-4">
                {offreRecentes.map((offre, index) => (
                  <div
                    key={offre.id}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate">{offre.nom}</h3>
                        <p className="text-xs text-gray-600 truncate">{offre.partenaire}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-sm">
                            <div className="text-xs text-gray-500">Ventes</div>
                            <div className="font-bold text-indigo-600">{offre.ventes}</div>
                          </div>
                          <div className="text-sm text-right">
                            <div className="text-xs text-gray-500">Revenu</div>
                            <div className="font-bold text-green-600">{(offre.revenu / 1000).toFixed(0)}K</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/admin/rapports')}
                className="w-full mt-6 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 transition-all"
              >
                Voir tous les rapports →
              </button>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/partenaires')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all text-left"
          >
            <Users className="h-8 w-8 text-indigo-600 mb-3" />
            <div className="font-bold mb-1">Gérer partenaires</div>
            <div className="text-sm text-gray-600">Voir tous les partenaires</div>
          </button>

          <button
            onClick={() => navigate('/admin/offres')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all text-left"
          >
            <Package className="h-8 w-8 text-purple-600 mb-3" />
            <div className="font-bold mb-1">Gérer offres</div>
            <div className="text-sm text-gray-600">Modérer les offres</div>
          </button>

          <button
            onClick={() => navigate('/admin/clients')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all text-left"
          >
            <ShoppingBag className="h-8 w-8 text-green-600 mb-3" />
            <div className="font-bold mb-1">Clients</div>
            <div className="text-sm text-gray-600">Gérer les clients</div>
          </button>

          <button
            onClick={() => navigate('/admin/stats')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all text-left"
          >
            <BarChart3 className="h-8 w-8 text-orange-600 mb-3" />
            <div className="font-bold mb-1">Statistiques</div>
            <div className="text-sm text-gray-600">Rapports détaillés</div>
          </button>
        </div>
      </div>
    </div>
  )
}
