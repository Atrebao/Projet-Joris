import { useState, useEffect } from 'react'
import { Package, Eye, Edit, Trash2, Search, Filter, CheckCircle, XCircle } from 'lucide-react'

export default function OffresPage() {
  const [offres, setOffres] = useState([])
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [recherche, setRecherche] = useState('')

  useEffect(() => {
    // Données mockées
    setOffres([
      {
        id: 1,
        nom: 'Netflix Premium',
        partenaire: 'StreamPro',
        categorie: 'FILMS_SERIES',
        prix: 7000,
        duree: 1,
        stock: 15,
        ventes: 45,
        statut: 'ACTIF',
        note: 4.8
      },
      {
        id: 2,
        nom: 'Spotify Family',
        partenaire: 'MusicHub CI',
        categorie: 'MUSIQUE',
        prix: 5000,
        duree: 1,
        stock: 20,
        ventes: 38,
        statut: 'ACTIF',
        note: 4.7
      },
      {
        id: 3,
        nom: 'PlayStation Plus',
        partenaire: 'GameStore Plus',
        categorie: 'GAMING',
        prix: 8000,
        duree: 1,
        stock: 0,
        ventes: 28,
        statut: 'SUSPENDU',
        note: 4.5
      },
    ])
  }, [])

  const handleValider = (id) => alert(`Valider offre ${id}`)
  const handleRejeter = (id) => alert(`Rejeter offre ${id}`)

  const offresFiltrees = offres.filter(o => {
    const matchStatut = filtreStatut === 'TOUS' || o.statut === filtreStatut
    const matchRecherche = o.nom.toLowerCase().includes(recherche.toLowerCase())
    return matchStatut && matchRecherche
  })

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
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
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
                  <td className="py-4 px-6 font-semibold text-indigo-600">{o.prix.toLocaleString()} F</td>
                  <td className="py-4 px-6">{o.stock}</td>
                  <td className="py-4 px-6 font-semibold">{o.ventes}</td>
                  <td className="py-4 px-6">⭐ {o.note}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      o.statut === 'ACTIF' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {o.statut}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-blue-50 rounded-lg">
                        <Eye className="h-5 w-5 text-blue-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
