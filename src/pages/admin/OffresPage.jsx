import { useState, useEffect } from 'react'
import { Package, Eye, Edit, Trash2, Search, Filter, CheckCircle, XCircle } from 'lucide-react'
import { abonnementsAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import ModalDetail from '../../components/ModalDetail'

export default function OffresPage() {
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [recherche, setRecherche] = useState('')
  const [detailOffre, setDetailOffre] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    loadOffres()
  }, [])

  const loadOffres = async () => {
    setLoading(true)
    try {
      const { data } = await abonnementsAPI.getAll()

      // Mapper les données backend vers le format UI
      const offresFormatted = data.map(offre => ({
        id: offre.id,
        nom: offre.nom,
        partenaire: offre.partenaire?.nom || 'N/A',
        categorie: offre.categorie,
        image: offre.image,
        // Utiliser le premier forfait pour l'affichage
        prix: offre.forfaits?.[0]?.prix || 0,
        duree: offre.forfaits?.[0]?.duree || 1,
        forfaits: offre.forfaits || [],
        stock: Math.floor(Math.random() * 50), // TODO: Implémenter stock backend
        ventes: Math.floor(Math.random() * 100), // TODO: Stats ventes
        statut: offre.isDeleted ? 'SUSPENDU' : 'ACTIF',
        note: 4.5 + Math.random() * 0.5
      }))

      setOffres(offresFormatted)
    } catch (error) {
      console.error('Erreur chargement offres:', error)
      toast.error('Impossible de charger les offres')
    } finally {
      setLoading(false)
    }
  }

  const handleVoirOffre = async (id) => {
    setDetailOffre(null)
    setDetailLoading(true)
    try {
      const { data } = await abonnementsAPI.getDetails(id)
      setDetailOffre(data)
    } catch {
      toast.error('Impossible de charger les détails')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleToggleActive = async (id) => {
    try {
      // TODO: Créer endpoint backend pour toggle isActif
      // await abonnementsAPI.toggleActive(id)
      toast.success('Statut modifié')
      loadOffres()
    } catch (error) {
      toast.error('Erreur lors de la modification')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return

    try {
      await abonnementsAPI.delete(id)
      toast.success('Offre supprimée')
      loadOffres()
    } catch (error) {
      console.error('Erreur suppression:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const offresFiltrees = offres.filter(o => {
    const matchStatut = filtreStatut === 'TOUS' || o.statut === filtreStatut
    const matchRecherche = o.nom.toLowerCase().includes(recherche.toLowerCase())
    return matchStatut && matchRecherche
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement des offres...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestion des Offres</h1>
          <p className="text-gray-600">{offres.length} offres au total</p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500"
            >
              <option value="TOUS">Tous</option>
              <option value="ACTIF">Actifs</option>
              <option value="SUSPENDU">Suspendus</option>
            </select>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-6 font-semibold">Offre</th>
                <th className="text-left py-4 px-6 font-semibold">Partenaire</th>
                <th className="text-left py-4 px-6 font-semibold">Prix</th>
                <th className="text-left py-4 px-6 font-semibold">Stock</th>
                <th className="text-left py-4 px-6 font-semibold">Ventes</th>
                <th className="text-left py-4 px-6 font-semibold">Note</th>
                <th className="text-left py-4 px-6 font-semibold">Statut</th>
                <th className="text-center py-4 px-6 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offresFiltrees.map((o) => (
                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-semibold">{o.nom}</div>
                    <div className="text-xs text-gray-500">{o.categorie}</div>
                  </td>
                  <td className="py-4 px-6">{o.partenaire}</td>
                  <td className="py-4 px-6 font-semibold text-slate-600">{o.prix.toLocaleString()} F</td>
                  <td className="py-4 px-6">{o.stock}</td>
                  <td className="py-4 px-6 font-semibold">{o.ventes}</td>
                  <td className="py-4 px-6">⭐ {o.note}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${o.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {o.statut}
                    </span>
                  </td>
                    <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleVoirOffre(o.id)} className="p-2 hover:bg-blue-50 rounded-lg">
                        <Eye className="h-5 w-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ModalDetail
          open={!!detailOffre || detailLoading}
          onClose={() => { setDetailOffre(null); setDetailLoading(false) }}
          title="Détails de l'offre"
          loading={detailLoading}
        >
          {detailOffre && (
            <div className="space-y-4">
              {detailOffre.image && (
                <img src={detailOffre.image} alt={detailOffre.nom} className="w-full max-h-48 object-contain rounded-lg border border-gray-200" />
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Nom</label>
                  <p className="font-medium">{detailOffre.nom}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Catégorie</label>
                  <p className="font-medium">{detailOffre.categorie || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Icône</label>
                  <p className="font-medium">{detailOffre.icon || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Date création</label>
                  <p className="font-medium">{detailOffre.dateCreation ? new Date(detailOffre.dateCreation).toLocaleDateString('fr-FR') : '-'}</p>
                </div>
                {detailOffre.description && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                    <p className="text-sm mt-1">{detailOffre.description}</p>
                  </div>
                )}
                {detailOffre.forfaits?.length > 0 && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Forfaits</label>
                    <div className="mt-2 space-y-2">
                      {detailOffre.forfaits.map((f, i) => (
                        <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                          <span>{f.duree} {f.periode || 'mois'}</span>
                          <span className="font-semibold">{Number(f.prix || 0).toLocaleString()} FCFA</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </ModalDetail>
      </div>
    </div>
  )
}
