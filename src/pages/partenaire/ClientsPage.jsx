import { useState, useEffect } from 'react'
import { Users, Search, Eye, Mail, Phone } from 'lucide-react'

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [recherche, setRecherche] = useState('')

  useEffect(() => {
    // Données mockées
    setClients([
      {
        id: 1,
        nom: 'Kouassi Jean',
        email: 'jean.kouassi@example.ci',
        telephone: '+225 07 12 34 56 78',
        nbAchats: 8,
        totalDepense: 56000,
        derniereCommande: '2025-11-18',
        statut: 'ACTIF'
      },
      {
        id: 2,
        nom: 'Diabate Marie',
        email: 'marie.diabate@example.ci',
        telephone: '+225 05 23 45 67 89',
        nbAchats: 5,
        totalDepense: 35000,
        derniereCommande: '2025-11-15',
        statut: 'ACTIF'
      },
      {
        id: 3,
        nom: 'Toure Ibrahim',
        email: 'ibrahim.toure@example.ci',
        telephone: '+225 01 98 76 54 32',
        nbAchats: 12,
        totalDepense: 84000,
        derniereCommande: '2025-11-19',
        statut: 'VIP'
      },
      {
        id: 4,
        nom: 'Kone Aminata',
        email: 'aminata.kone@example.ci',
        telephone: '+225 07 45 67 89 01',
        nbAchats: 3,
        totalDepense: 21000,
        derniereCommande: '2025-10-28',
        statut: 'INACTIF'
      },
    ])
  }, [])

  const clientsFiltres = clients.filter(c => 
    c.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    c.email.toLowerCase().includes(recherche.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-600" />
            Mes Clients
          </h1>
          <p className="text-gray-600">{clients.length} clients au total</p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{clients.length}</div>
            <div className="text-blue-100 text-sm">Total Clients</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">
              {clients.filter(c => c.statut === 'ACTIF').length}
            </div>
            <div className="text-green-100 text-sm">Clients Actifs</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">
              {clients.filter(c => c.statut === 'VIP').length}
            </div>
            <div className="text-purple-100 text-sm">Clients VIP</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">
              {clients.reduce((sum, c) => sum + c.totalDepense, 0).toLocaleString()}F
            </div>
            <div className="text-orange-100 text-sm">Revenu Total</div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-6 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Tableau des clients */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold">Client</th>
                  <th className="text-left py-4 px-6 font-semibold">Contact</th>
                  <th className="text-left py-4 px-6 font-semibold">Achats</th>
                  <th className="text-left py-4 px-6 font-semibold">Total Dépensé</th>
                  <th className="text-left py-4 px-6 font-semibold">Dernière Commande</th>
                  <th className="text-left py-4 px-6 font-semibold">Statut</th>
                  <th className="text-center py-4 px-6 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clientsFiltres.map((client) => (
                  <tr key={client.id} className="border-b border-gray-100 hover:bg-purple-50 transition-all">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                          {client.nom.charAt(0)}
                        </div>
                        <div className="font-semibold">{client.nom}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-700">{client.telephone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-purple-600">{client.nbAchats}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-green-600">{client.totalDepense.toLocaleString()} F</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">
                        {new Date(client.derniereCommande).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        client.statut === 'VIP' ? 'bg-yellow-100 text-yellow-700' :
                        client.statut === 'ACTIF' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {client.statut}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 hover:bg-purple-50 rounded-lg transition-all"
                          title="Voir le profil"
                        >
                          <Eye className="h-5 w-5 text-purple-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clientsFiltres.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun client trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
