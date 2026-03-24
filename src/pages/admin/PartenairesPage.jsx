import { useState, useEffect } from 'react'
import { Users, CheckCircle, XCircle, Eye, Edit, Trash2, Search, Filter } from 'lucide-react'
import { partenairesAPI } from '../../lib/api'
import toast from 'react-hot-toast'
import ModalDetail from '../../components/ModalDetail'

export default function PartenairesPage() {
  const [partenaires, setPartenaires] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [recherche, setRecherche] = useState('')
  const [detailPartenaire, setDetailPartenaire] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    loadPartenaires()
  }, [])

  const loadPartenaires = async () => {
    setLoading(true)
    try {
      const { data } = await partenairesAPI.getAll()
      const formatted = (data || []).map(p => ({
        ...p,
        dateInscription: p.dateCreation,
        statut: !p.isValidated ? 'EN_ATTENTE' : p.isActive ? 'ACTIF' : 'SUSPENDU',
        nbOffres: p.offres?.length ?? 0,
        totalVentes: 0,
        revenu: 0,
        note: 0
      }))
      setPartenaires(formatted)
    } catch (error) {
      console.error('Erreur chargement partenaires:', error)
      toast.error('Impossible de charger les partenaires')
      setPartenaires([])
    } finally {
      setLoading(false)
    }
  }

  const handleValider = async (id) => {
    try {
      await partenairesAPI.validate(id)
      toast.success('Partenaire validé')
      loadPartenaires()
    } catch (error) {
      toast.error('Erreur lors de la validation')
    }
  }

  const handleRejeter = (id) => {
    toast.info('Fonctionnalité de rejet à implémenter')
  }

  const handleVoirPartenaire = async (id) => {
    setDetailPartenaire(null)
    setDetailLoading(true)
    try {
      const { data } = await partenairesAPI.getOne(id)
      setDetailPartenaire(data)
    } catch {
      toast.error('Impossible de charger les détails')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSuspendre = async (id) => {
    try {
      await partenairesAPI.toggleActive(id)
      toast.success('Statut du partenaire modifié')
      loadPartenaires()
    } catch (error) {
      toast.error('Erreur lors de la suspension')
    }
  }

  const partenairesFiltres = partenaires.filter(p => {
    const matchStatut = filtreStatut === 'TOUS' || p.statut === filtreStatut
    const matchRecherche = p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
                          p.email.toLowerCase().includes(recherche.toLowerCase())
    return matchStatut && matchRecherche
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement des partenaires...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestion des Partenaires</h1>
          <p className="text-gray-600">{partenaires.length} partenaires au total</p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-slate-500"
              >
                <option value="TOUS">Tous les statuts</option>
                <option value="ACTIF">Actifs</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="SUSPENDU">Suspendus</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Partenaire</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Ville</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Offres</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Ventes</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Revenu</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Note</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">Statut</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partenairesFiltres.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold">{p.nom}</div>
                        <div className="text-xs text-gray-500">Inscrit le {new Date(p.dateInscription).toLocaleDateString('fr-FR')}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div>{p.email}</div>
                        <div className="text-gray-500">{p.telephone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm">{p.ville}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold">{p.nbOffres}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold">{p.totalVentes}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-green-600">{(p.revenu / 1000).toFixed(0)}K</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold">{p.note > 0 ? `⭐ ${p.note}` : '-'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.statut === 'ACTIF' ? 'bg-green-100 text-green-700' :
                        p.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.statut === 'ACTIF' ? 'Actif' : p.statut === 'EN_ATTENTE' ? 'En attente' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {p.statut === 'EN_ATTENTE' && (
                          <>
                            <button
                              onClick={() => handleValider(p.id)}
                              className="p-2 hover:bg-green-50 rounded-lg transition-all"
                              title="Valider"
                            >
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </button>
                            <button
                              onClick={() => handleRejeter(p.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-all"
                              title="Rejeter"
                            >
                              <XCircle className="h-5 w-5 text-red-600" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleVoirPartenaire(p.id)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-all"
                          title="Voir"
                        >
                          <Eye className="h-5 w-5 text-blue-600" />
                        </button>
                        {p.statut === 'ACTIF' && (
                          <button
                            onClick={() => handleSuspendre(p.id)}
                            className="p-2 hover:bg-orange-50 rounded-lg transition-all"
                            title="Suspendre"
                          >
                            <XCircle className="h-5 w-5 text-orange-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ModalDetail
          open={!!detailPartenaire || detailLoading}
          onClose={() => { setDetailPartenaire(null); setDetailLoading(false) }}
          title="Détails du partenaire"
          loading={detailLoading}
        >
          {detailPartenaire && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Nom</label>
                  <p className="font-medium">{[detailPartenaire.prenoms, detailPartenaire.nom].filter(Boolean).join(' ')}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                  <p className="font-medium">{detailPartenaire.email}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Téléphone</label>
                  <p className="font-medium">{detailPartenaire.telephone}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Boutique</label>
                  <p className="font-medium">{detailPartenaire.nomBoutique}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Ville</label>
                  <p className="font-medium">{detailPartenaire.ville}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Pays</label>
                  <p className="font-medium">{detailPartenaire.pays || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Adresse</label>
                  <p className="font-medium">{detailPartenaire.adresse || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Statut</label>
                  <p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${!detailPartenaire.isValidated ? 'bg-yellow-100 text-yellow-700' : detailPartenaire.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {!detailPartenaire.isValidated ? 'En attente' : detailPartenaire.isActive ? 'Actif' : 'Suspendu'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Date inscription</label>
                  <p className="font-medium">{detailPartenaire.dateCreation ? new Date(detailPartenaire.dateCreation).toLocaleDateString('fr-FR') : '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Nombre d'offres</label>
                  <p className="font-medium">{detailPartenaire.offres?.length ?? 0}</p>
                </div>
                {detailPartenaire.description && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                    <p className="text-sm mt-1">{detailPartenaire.description}</p>
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
