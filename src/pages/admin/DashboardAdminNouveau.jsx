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
import { statsAPI, partenairesAPI } from '../../lib/api'
import toast from 'react-hot-toast'

export default function DashboardAdminNouveau() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [partenairesEnAttente, setPartenairesEnAttente] = useState([])
  const [offreRecentes, setOffreRecentes] = useState([])
  const [loading, setLoading] = useState(true)

  // Charger les données réelles depuis l'API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)

      try {
        // Charger les stats dashboard
        const { data: statsData } = await statsAPI.adminDashboard()

        setStats({
          totalPartenaires: statsData.totalPartenaires || 0,
          totalOffres: 0, // TODO: Ajouter dans l'API
          totalRevenu: statsData.revenusTotal || 0,
          totalClients: statsData.totalClients || 0,
          partenairesActifs: statsData.partenairesActifs || 0,
          offresActives: 0, // TODO
          ventesAujourdhui: statsData.souscriptionsMois || 0,
          croissance: statsData.evolutionRevenus || 0,
          souscriptionsActives: statsData.souscriptionsActives || 0,
          revenusMois: statsData.revenusMois || 0,
          nouveauxClientsMois: statsData.nouveauxClientsMois || 0,
          enAttenteLivraison: statsData.enAttenteLivraison || 0,
          tauxConversion: statsData.tauxConversion || 0
        })

        console.log("DATA  AMIN"+ stats)
        // Charger les partenaires (on filtrera en attente côté frontend pour l'instant)
        try {
          const { data: partenairesData } = await partenairesAPI.getAll()
          // Filtrer les partenaires en attente de validation
          const enAttente = partenairesData.filter(p => !p.isValide)
          setPartenairesEnAttente(enAttente.slice(0, 3)) // Top 3
        } catch (error) {
          console.error('Erreur chargement partenaires:', error)
        }

        try {
          const { data: topOffresData } = await statsAPI.topOffres()
          setOffreRecentes(Array.isArray(topOffresData) ? topOffresData : [])
        } catch {
          setOffreRecentes([])
        }

      } catch (error) {
        console.error('Erreur chargement dashboard:', error)
        toast.error('Impossible de charger les statistiques')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleValiderPartenaire = async (partenaireId) => {
    try {
      await partenairesAPI.validate(partenaireId)
      toast.success('Partenaire validé avec succès')
      // Retirer de la liste locale
      setPartenairesEnAttente(prev => prev.filter(p => p.id !== partenaireId))
    } catch (error) {
      console.error('Erreur validation partenaire:', error)
      toast.error('Erreur lors de la validation')
    }
  }

  const handleRejeterPartenaire = async (partenaireId) => {
    try {
      // TODO: Ajouter endpoint /rejeter dans l'API si nécessaire
      // Pour l'instant on peut utiliser delete ou toggle
      toast.info('Fonctionnalité de rejet à implémenter')
      // await partenairesAPI.delete(partenaireId)
    } catch (error) {
      console.error('Erreur rejet partenaire:', error)
      toast.error('Erreur lors du rejet')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-slate-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Super Admin</h1>
              <p className="text-slate-200">Vue d'ensemble de la plateforme</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-200">Aujourd'hui</div>
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
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-slate-700" />
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded-full">
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
                      className="border-2 border-gray-200 rounded-xl p-4 hover:border-slate-300 transition-all"
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
                          className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold hover:border-slate-500 transition-all flex items-center justify-center gap-2"
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
                <BarChart3 className="h-6 w-6 text-slate-700" />
              </div>

              <div className="space-y-4">
                {offreRecentes.map((offre, index) => (
                  <div
                    key={offre.id}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate">{offre.nom}</h3>
                        <p className="text-xs text-gray-600 truncate">{offre.partenaire}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-sm">
                            <div className="text-xs text-gray-500">Ventes</div>
                            <div className="font-bold text-slate-700">{offre.ventes}</div>
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
                onClick={() => navigate('/backoffice/stats')}
                className="w-full mt-6 px-4 py-3 bg-slate-50 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-all"
              >
                Voir tous les rapports →
              </button>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/backoffice/partenaires')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-slate-500 hover:shadow-lg transition-all text-left"
          >
            <Users className="h-8 w-8 text-slate-700 mb-3" />
            <div className="font-bold mb-1">Gérer partenaires</div>
            <div className="text-sm text-gray-600">Voir tous les partenaires</div>
          </button>

          <button
            onClick={() => navigate('/backoffice/offres')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-slate-600 hover:shadow-lg transition-all text-left"
          >
            <Package className="h-8 w-8 text-slate-700 mb-3" />
            <div className="font-bold mb-1">Gérer offres</div>
            <div className="text-sm text-gray-600">Modérer les offres</div>
          </button>

          <button
            onClick={() => navigate('/backoffice/clients')}
            className="p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all text-left"
          >
            <ShoppingBag className="h-8 w-8 text-green-600 mb-3" />
            <div className="font-bold mb-1">Clients</div>
            <div className="text-sm text-gray-600">Gérer les clients</div>
          </button>

          <button
            onClick={() => navigate('/backoffice/stats')}
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
