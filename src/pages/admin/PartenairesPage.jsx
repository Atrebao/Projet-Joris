import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, CheckCircle, XCircle, Eye, Edit, Trash2, Search, Filter } from 'lucide-react'

export default function PartenairesPage() {
  const navigate = useNavigate()
  const [partenaires, setPartenaires] = useState([])
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [recherche, setRecherche] = useState('')

  useEffect(() => {
    // Données mockées
    setPartenaires([
      {
        id: 1,
        nom: 'StreamPro',
        email: 'contact@streampro.ci',
        ville: 'Abidjan',
        telephone: '+225 07 12 34 56 78',
        dateInscription: '2025-01-15',
        statut: 'ACTIF',
        nbOffres: 15,
        totalVentes: 287,
        revenu: 2450000,
        note: 4.8
      },
      {
        id: 2,
        nom: 'MusicHub CI',
        email: 'info@musichub.ci',
        ville: 'Cocody',
        telephone: '+225 05 23 45 67 89',
        dateInscription: '2025-02-10',
        statut: 'ACTIF',
        nbOffres: 8,
        totalVentes: 156,
        revenu: 890000,
        note: 4.6
      },
      {
        id: 3,
        nom: 'Digital Services Pro',
        email: 'contact@digitalpro.ci',
        ville: 'Yopougon',
        telephone: '+225 01 98 76 54 32',
        dateInscription: '2025-11-15',
        statut: 'EN_ATTENTE',
        nbOffres: 12,
        totalVentes: 0,
        revenu: 0,
        note: 0
      },
      {
        id: 4,
        nom: 'GameStore Plus',
        email: 'support@gamestore.ci',
        ville: 'Marcory',
        telephone: '+225 07 45 67 89 01',
        dateInscription: '2024-12-20',
        statut: 'SUSPENDU',
        nbOffres: 5,
        totalVentes: 45,
        revenu: 340000,
        note: 3.8
      },
    ])
  }, [])

  const handleValider = (id) => {
    // TODO: Appel API
    alert(`Valider partenaire ${id}`)
  }

  const handleRejeter = (id) => {
    // TODO: Appel API
    alert(`Rejeter partenaire ${id}`)
  }

  const handleSuspendre = (id) => {
    // TODO: Appel API
    alert(`Suspendre partenaire ${id}`)
  }

  const partenairesFiltres = partenaires.filter(p => {
    const matchStatut = filtreStatut === 'TOUS' || p.statut === filtreStatut
    const matchRecherche = p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
                          p.email.toLowerCase().includes(recherche.toLowerCase())
    return matchStatut && matchRecherche
  })

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
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
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
                          onClick={() => navigate(`/backoffice/partenaire/${p.id}`)}
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
      </div>
    </div>
  )
}
